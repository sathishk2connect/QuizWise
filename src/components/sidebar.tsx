
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getTopicsForUser, updateTopicFavouriteStatus, Topic } from '@/services/topic-service';
import { getQuizResultsForUser, QuizResult } from '@/services/quiz-result-service';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Icons } from './icons';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Star, History, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


interface SidebarProps {
  onTopicSelect: (topic: string) => void;
}

export default function Sidebar({ onTopicSelect }: SidebarProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    if (user) {
      const [userTopics, userResults] = await Promise.all([
        getTopicsForUser(user.uid),
        getQuizResultsForUser(user.uid)
      ]);
      setTopics(userTopics);
      setQuizResults(userResults);
    }
  };

  useEffect(() => {
    if(user){
      fetchData();
    }
    // This effect should refetch data when the user logs in or out.
  }, [user]);

  const handleFavouriteToggle = async (topicId: string, currentStatus: boolean) => {
    try {
      await updateTopicFavouriteStatus(topicId, !currentStatus);
      toast({
        title: currentStatus ? 'Removed from Favourites' : 'Added to Favourites',
        duration: 2000,
      });
      // Refresh topics list
      fetchData();
    } catch (error) {
      console.error("Failed to update favourite status:", error);
      toast({
        title: "Error",
        description: "Could not update topic status.",
        variant: "destructive",
      });
    }
  };

  const favouriteTopics = topics.filter(t => t.isFavourite);

  return (
    <div className="h-full bg-muted/20 flex flex-col">
      <header className="p-4 border-b">
        <h2 className="text-xl font-bold font-headline text-foreground">My Topics</h2>
      </header>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          <div>
            <h3 className="text-lg font-semibold font-headline mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Favourites
            </h3>
            <div className="space-y-2">
              {favouriteTopics.length > 0 ? (
                favouriteTopics.map(topic => (
                  <div key={topic.id} className="flex items-center justify-between group">
                    <Button variant="ghost" className="flex-1 justify-start h-auto py-2 text-left" onClick={() => onTopicSelect(topic.name)}>
                      {topic.name}
                    </Button>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleFavouriteToggle(topic.id, topic.isFavourite)}>
                       <Icons.star className="h-4 w-4 text-accent fill-accent" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground px-2">Favourite topics will appear here.</p>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold font-headline mb-2 flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              All Topics
            </h3>
            <div className="space-y-2">
              {topics.length > 0 ? (
                topics.map(topic => (
                  <div key={topic.id} className="flex items-center justify-between group">
                    <Button variant="ghost" className="flex-1 justify-start h-auto py-2 text-left" onClick={() => onTopicSelect(topic.name)}>
                      {topic.name}
                    </Button>
                     <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleFavouriteToggle(topic.id, topic.isFavourite)}>
                       <Icons.star className={cn("h-4 w-4 text-gray-400", topic.isFavourite && "text-accent fill-accent")} />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground px-2">Your created topics will appear here.</p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold font-headline mb-2 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              History
            </h3>
            <div className="space-y-2">
              {quizResults.length > 0 ? (
                quizResults.map(result => (
                 <div key={result.id} className="group p-2 rounded-md hover:bg-background">
                    <button className="w-full text-left" onClick={() => onTopicSelect(result.topicName)}>
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{result.topicName}</span>
                            <span className="text-sm font-bold">{result.score}/{result.totalQuestions}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{format(result.createdAt, 'MMM d, yyyy - h:mm a')}</p>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground px-2">Your recent quizzes will appear here.</p>
              )}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
