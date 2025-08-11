
"use client";

import { useState } from 'react';
import type { Question } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { CheckCircle2, Info, XCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizViewProps {
  topic: string;
  questions: Question[];
  onQuizFinish: (score: number) => void;
  onOpenChat: () => void;
  onQuit: () => void;
}

type Feedback = {
  isCorrect: boolean;
  feedback: string;
};

export default function QuizView({ topic, questions, onQuizFinish, onOpenChat, onQuit }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);
    
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setFeedback({
        isCorrect: isCorrect,
        feedback: currentQuestion.explanation,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      onQuizFinish(score);
    }
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setIsAnswered(false);
  };
  
  const getButtonClass = (option: string) => {
    if (!isAnswered) return 'justify-start';

    const isCorrectAnswer = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrectAnswer) return 'bg-green-500/80 hover:bg-green-500/90 border-green-700 text-white justify-start';
    if (isSelected) return 'bg-red-500/80 hover:bg-red-500/90 border-red-700 text-white justify-start';

    return 'justify-start';
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <p className="text-center text-sm font-medium text-muted-foreground">Quiz on: {topic}</p>
        <Progress value={progress} className="w-full h-2" />
        <p className="text-center text-xs text-muted-foreground">{`Question ${currentQuestionIndex + 1} of ${questions.length}`}</p>
      </div>
      <Card className="shadow-xl border-2 border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl leading-relaxed pr-4">{currentQuestion.question}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onQuit}>
              <LogOut className="mr-2 h-4 w-4" />
              Quit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className={cn('h-auto py-3 whitespace-normal', getButtonClass(option))}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                {option}
              </Button>
            ))}
          </div>

          {feedback && (
            <Card className={cn(
                "mt-4 p-4 animate-in fade-in-50 duration-500",
                feedback.isCorrect ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : 'bg-red-100 dark:bg-red-900/50 border-red-500'
            )}>
              <div className="flex items-start gap-3">
                {feedback.isCorrect 
                  ? <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                  : <XCircle className="h-6 w-6 text-red-600 mt-1" />
                }
                <div>
                  <h3 className="font-bold font-headline">
                    {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="text-sm">{feedback.feedback}</p>
                   <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary" onClick={onOpenChat}>
                      <Info className="h-4 w-4 mr-1"/> Need more info? Ask our AI assistant.
                   </Button>
                </div>
              </div>
            </Card>
          )}

          {isAnswered && (
            <div className="flex justify-between items-center mt-6">
              <Button onClick={onQuit} variant="destructive">
                Quit Quiz
              </Button>
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
