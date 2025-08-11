import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chat-support.ts';
import '@/ai/flows/evaluate-answer-and-provide-feedback.ts';
import '@/ai/flows/generate-quiz-questions.ts';