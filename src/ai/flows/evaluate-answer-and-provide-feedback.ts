'use server';
/**
 * @fileOverview Evaluates the user's answer to a quiz question and provides feedback.
 *
 * - evaluateAnswerAndProvideFeedback - A function that evaluates the answer and returns feedback.
 * - EvaluateAnswerAndProvideFeedbackInput - The input type for the evaluateAnswerAndProvideFeedback function.
 * - EvaluateAnswerAndProvideFeedbackOutput - The return type for the evaluateAnswerAndProvideFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateAnswerAndProvideFeedbackInputSchema = z.object({
  question: z.string().describe('The quiz question.'),
  answer: z.string().describe('The user selected answer.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  topic: z.string().describe('The topic of the quiz.'),
  image: z
    .string()
    .optional()
    .describe('An optional image data URI associated with the question.'),
  video: z
    .string()
    .optional()
    .describe('An optional video data URI associated with the question.'),
});
export type EvaluateAnswerAndProvideFeedbackInput = z.infer<typeof EvaluateAnswerAndProvideFeedbackInputSchema>;

const EvaluateAnswerAndProvideFeedbackOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user answer is correct or not.'),
  feedback: z.string().describe('Feedback for the user, explaining why the answer is correct or incorrect.'),
  image: z
    .string()
    .optional()
    .describe('An optional image data URI to further explain the feedback.'),
  video: z
    .string()
    .optional()
    .describe('An optional video data URI to further explain the feedback.'),
});
export type EvaluateAnswerAndProvideFeedbackOutput = z.infer<typeof EvaluateAnswerAndProvideFeedbackOutputSchema>;

export async function evaluateAnswerAndProvideFeedback(input: EvaluateAnswerAndProvideFeedbackInput): Promise<EvaluateAnswerAndProvideFeedbackOutput> {
  return evaluateAnswerAndProvideFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateAnswerAndProvideFeedbackPrompt',
  input: {schema: EvaluateAnswerAndProvideFeedbackInputSchema},
  output: {schema: EvaluateAnswerAndProvideFeedbackOutputSchema},
  prompt: `You are an expert quiz evaluator. You will be given a question, the user's answer, and the correct answer.
  Your task is to determine if the user's answer is correct or not, and provide feedback to the user explaining why their answer is correct or incorrect.
  The quiz is on the topic: {{{topic}}}.

  Question: {{{question}}}
  User's Answer: {{{answer}}}
  Correct Answer: {{{correctAnswer}}}

  First, determine if the User's Answer is the same as the Correct Answer. Set isCorrect to true if they are the same, and false if they are not the same.
  Then, provide detailed feedback to the user. If the answer is correct, congratulate them and provide additional information about the topic. If the answer is incorrect, explain why the correct answer is the correct answer, and where the user went wrong.

  {{#if image}}
  Here is an image associated with the question: {{media url=image}}
  {{/if}}
  {{#if video}}
  Here is a video associated with the question: {{media url=video}}
  {{/if}}
`,
});

const evaluateAnswerAndProvideFeedbackFlow = ai.defineFlow(
  {
    name: 'evaluateAnswerAndProvideFeedbackFlow',
    inputSchema: EvaluateAnswerAndProvideFeedbackInputSchema,
    outputSchema: EvaluateAnswerAndProvideFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

