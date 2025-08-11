'use server';

/**
 * @fileOverview Provides AI chat support for users to ask questions about the quiz topic.
 *
 * - aiChat - A function that handles the AI chat process.
 * - AIChatInput - The input type for the aiChat function.
 * - AIChatOutput - The return type for the aiChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AIChatInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  query: z.string().describe('The user query related to the topic.'),
  includeAudio: z
    .boolean()
    .optional()
    .describe('Whether to include audio explanation'),
});
export type AIChatInput = z.infer<typeof AIChatInputSchema>;

const AIChatOutputSchema = z.object({
  response: z.string().describe('The response from the AI.'),
  image:
    z.string().optional().describe('An optional image data URI to further explain the topic.'),
  audio:
    z.string().optional().describe('An optional audio data URI to further explain the topic.'),
});
export type AIChatOutput = z.infer<typeof AIChatOutputSchema>;

export async function aiChat(input: AIChatInput): Promise<AIChatOutput> {
  return aiChatFlow(input);
}

const TextResponseSchema = z.object({
    response: z.string().describe('The text-based answer to the user\'s query.'),
    imageRequired: z.boolean().describe('Set to true only if the user explicitly asks for an image or if an image is essential for the explanation.')
});

const textResponsePrompt = ai.definePrompt({
  name: 'aiChatTextResponsePrompt',
  input: {schema: AIChatInputSchema},
  output: {schema: TextResponseSchema},
  prompt: `You are an AI assistant helping users understand the topic: {{{topic}}}.

User Query: {{{query}}}

1.  First, provide a helpful and informative text answer to the user's query.
2.  Then, determine if an image is required. Only set imageRequired to true if the user explicitly asks for an image (e.g., "show me a picture of...", "can you generate an image of...") or if a visual aid is absolutely necessary to understand the answer. For most questions, this should be false.`,
});


const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AIChatInputSchema,
    outputSchema: AIChatOutputSchema,
  },
  async input => {
    const {includeAudio} = input;

    // First, get the text response and determine if an image is needed.
    const {output: textOutput} = await textResponsePrompt(input);
    const { response, imageRequired } = textOutput!;

    let image: string | undefined = undefined;

    // Only generate an image if the first model determined it was necessary.
    if (imageRequired) {
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: `Generate an image that visually explains the following query about "${input.topic}": ${input.query}`,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });
        image = media.url;
      } catch (error) {
        console.error('Error generating image:', error);
        // Handle image generation error gracefully, e.g., set image to undefined
        image = undefined;
      }
    }

    let audio: string | undefined = undefined;
    if (includeAudio) {
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.5-flash-preview-tts',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {voiceName: 'Algenib'},
              },
            },
          },
          prompt: response, // Generate audio from the response text
        });

        if (media) {
          const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
          );
          audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
        }
      } catch (error) {
        console.error('Error generating audio:', error);
        audio = undefined;
      }
    }
    
    return {response, image, audio};
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
