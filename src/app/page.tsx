
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';
import AIChat from '@/components/ai-chat';
import { Icons } from '@/components/icons';
import TopicCreator from '@/components/topic-creator';
import QuizView from '@/components/quiz-view';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/lib/types';
import { MessageSquare, RefreshCw, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { saveTopic, getTopicByName, addQuestionsToTopic } from '@/services/topic-service';
import { saveQuizResult } from '@/services/quiz-result-service';
import Sidebar from '@/components/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type QuizState = 'topic' | 'loading' | 'active' | 'finished';

export default function Home() {
  const [quizState, setQuizState] = useState<QuizState>('topic');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isChatOpen, setChatOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarTopic, setSidebarTopic] = useState('');
  const [lastScore, setLastScore] = useState(0);

  const handleTopicSelect = (selectedTopic: string) => {
    setSidebarTopic(selectedTopic);
    // Note: We don't auto-start the quiz here anymore to allow number of questions selection.
    // The user will see the topic populated and can then click "Generate Quiz".
  };

  const handleTopicCreate = async (newTopic: string, numberOfQuestions: number) => {
    setQuizState('loading');
    setTopic(newTopic);
    try {
      let topicId: string | null = null;
      let previousQuestions: string[] = [];

      if (user) {
        try {
          const existingTopic = await getTopicByName(user.uid, newTopic);
          if (existingTopic) {
            topicId = existingTopic.id;
            // Get the last 20 questions to avoid repetition
            previousQuestions = (existingTopic.questions || []).slice(-20);
          } else {
            topicId = await saveTopic({ name: newTopic, userId: user.uid });
          }
        } catch (error) {
          console.error("Failed to save or get topic:", error);
           toast({
              title: "Could not save topic",
              description: "There was an error saving your topic. Please try again.",
              variant: "destructive"
            });
           setQuizState('topic');
           return;
        }
      }
      
      const result = await generateQuizQuestions({ topic: newTopic, numberOfQuestions, previousQuestions });
      
      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        if (user && topicId) {
          try {
            // Save newly generated questions to the topic history
            const newQuestionTexts = result.questions.map(q => q.question);
            await addQuestionsToTopic(topicId, newQuestionTexts);
          } catch (error) {
             console.error("Failed to save questions to topic:", error);
             // This is not a critical failure, so we just toast and continue
             toast({
              title: "Could not save question history",
              variant: "destructive"
            });
          }
        }
        setQuizState('active');
      } else {
        throw new Error('No questions were generated.');
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try a different topic.',
        variant: 'destructive',
      });
      setQuizState('topic');
    }
  };

  const handleQuizFinish = async (score: number) => {
    setLastScore(score);
    if (user) {
      try {
        await saveQuizResult({
          userId: user.uid,
          topicName: topic,
          score: score,
          totalQuestions: questions.length,
        });
      } catch (error) {
        console.error("Failed to save quiz result:", error);
        toast({
          title: "Could not save quiz result",
          variant: "destructive"
        });
      }
    }
    setQuizState('finished');
  };
  
  const handleRestart = () => {
    setQuizState('topic');
    setTopic('');
    setQuestions([]);
    setSidebarTopic('');
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleLogin = () => {
    router.push('/login');
  }

  const header = useMemo(() => (
    <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Icons.menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <Sidebar onTopicSelect={handleTopicSelect} />
                </SheetContent>
              </Sheet>
            )}
            <Icons.logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">QuizWise</h1>
          </div>
          <div className="flex items-center gap-2">
             {quizState !== 'topic' && (
               <Button variant="outline" size="icon" onClick={handleRestart} aria-label="Restart Quiz">
                 <RefreshCw className="h-4 w-4" />
               </Button>
             )}
            <Button variant="outline" size="icon" onClick={() => setChatOpen(true)} aria-label="Open AI Chat">
              <MessageSquare className="h-4 w-4" />
            </Button>
            {user ? (
              <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Log Out">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" onClick={handleLogin} aria-label="Log In">
                <LogIn className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  ), [quizState, user]);

  return (
    <div className="flex min-h-screen">
      {user && (
        <div className="hidden md:block md:w-80 border-r">
          <Sidebar onTopicSelect={handleTopicSelect} />
        </div>
      )}
      <main className="flex-1">
        <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4">
          {header}
          <div className="w-full max-w-2xl mx-auto">
            {quizState === 'topic' && <TopicCreator onTopicCreate={handleTopicCreate} loading={false} selectedTopic={sidebarTopic} />}
            {quizState === 'loading' && (
                <div className="text-center">
                  <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                  <p className="text-lg font-semibold font-headline">Generating your quiz on "{topic}"...</p>
                  <p className="text-muted-foreground">The AI is working its magic. Please wait a moment.</p>
                </div>
            )}
            {quizState === 'active' && (
              <QuizView
                topic={topic}
                questions={questions}
                onQuizFinish={handleQuizFinish}
                onOpenChat={() => setChatOpen(true)}
                onQuit={handleRestart}
              />
            )}
            {quizState === 'finished' && (
                <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                     <h2 className="text-3xl font-bold font-headline mb-4">Quiz Finished!</h2>
                     <p className="text-muted-foreground mb-2">You have completed the quiz on "{topic}".</p>
                     <p className="text-2xl font-bold mb-6">Your Score: {lastScore}/{questions.length}</p>
                     <Button onClick={handleRestart}>
                        Create Another Quiz
                     </Button>
                </div>
            )}
          </div>

          <AIChat
            topic={topic || 'general knowledge'}
            isOpen={isChatOpen}
            onOpenChange={setChatOpen}
          />
        </div>
      </main>
    </div>
  );
}
