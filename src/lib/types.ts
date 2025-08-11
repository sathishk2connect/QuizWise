import type { GenerateQuizQuestionsOutput } from "@/ai/flows/generate-quiz-questions";
import type { AIChatOutput } from "@/ai/flows/ai-chat-support";
import type { User } from "firebase/auth";

export type Question = GenerateQuizQuestionsOutput['questions'][0];

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: AIChatOutput['image'];
  audio?: AIChatOutput['audio'];
  isStreaming?: boolean;
};

export type AppUser = User;
