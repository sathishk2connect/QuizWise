'use server';

/**
 * @fileOverview A quiz question generation AI agent.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate quiz questions.'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
  previousQuestions: z.array(z.string()).optional().describe('A list of questions that have been asked previously on this topic, to avoid repetition.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The multiple choice options for the question.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
      explanation: z.string().describe('A brief explanation of why the correct answer is correct.'),
    })
  ).describe('The generated quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator. Generate a {{{numberOfQuestions}}}-question multiple choice quiz based on the given topic.

Topic: {{{topic}}}

Each question should have 4 options, one of which is the correct answer.
For each question, provide a brief explanation for why the correct answer is correct.

{{#if previousQuestions.length}}
Important: Avoid generating questions that are similar to the following previously asked questions:
{{#each previousQuestions}}
- {{{this}}}
{{/each}}
{{/if}}

Return the questions in JSON format.

Example:
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correctAnswer": "Paris",
      "explanation": "Paris is the capital of France and its largest city."
    }
  ]
}
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
