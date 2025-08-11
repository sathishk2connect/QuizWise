
"use client"

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { FileUp, Pilcrow, Lightbulb, ListChecks } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';


interface TopicCreatorProps {
  onTopicCreate: (topic: string, numQuestions: number) => void;
  loading: boolean;
  selectedTopic?: string;
}

export default function TopicCreator({ onTopicCreate, loading, selectedTopic }: TopicCreatorProps) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTopic) {
      setTopic(selectedTopic);
      setContext(''); // Clear context when a topic is selected from sidebar
    }
  }, [selectedTopic]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({ title: "File too large", description: "Please upload a file smaller than 1MB.", variant: "destructive" });
        return;
      }
      const fileText = await file.text();
      setContext(fileText);
      toast({ title: "File loaded", description: "The file content has been added as context." });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: "Topic is empty", description: "Please provide a topic to generate a quiz.", variant: "destructive" });
      return;
    }
    const fullTopic = topic + (context ? `\n\nContext:\n${context}` : '');
    onTopicCreate(fullTopic, numQuestions);
  };
  
  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">Create Your Quiz</CardTitle>
        <CardDescription>Start a new quiz by providing a topic below.</CardDescription>
      </CardHeader>
      <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic-input" className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5"/>Enter a topic</Label>
                  <Input
                    id="topic-input"
                    placeholder="e.g., 'The Renaissance'"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-lg flex items-center gap-2"><ListChecks className="h-5 w-5"/>Number of Questions</Label>
                   <RadioGroup
                      defaultValue="10"
                      onValueChange={(value) => setNumQuestions(parseInt(value))}
                      className="flex gap-4"
                      disabled={loading}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="q5" />
                        <Label htmlFor="q5">5</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10" id="q10" />
                        <Label htmlFor="q10">10</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="20" id="q20" />
                        <Label htmlFor="q20">20</Label>
                      </div>
                    </RadioGroup>
                </div>


                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <span className="text-sm font-medium">Optional: Provide Context</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                         <Label htmlFor="text-input" className="flex items-center gap-2"><Pilcrow className="h-4 w-4"/>Paste text</Label>
                         <Textarea
                           id="text-input"
                           placeholder="Paste any text here and we'll use it as context for your quiz."
                           className="min-h-[150px]"
                           value={context}
                           onChange={(e) => setContext(e.target.value)}
                           disabled={loading}
                         />
                      </div>
                      <div className="space-y-2 text-center">
                        <Label htmlFor="file-upload" className="text-sm font-medium cursor-pointer flex items-center justify-center gap-2"><FileUp className="h-4 w-4"/>Upload a .txt file</Label>
                         <Input
                           id="file-upload"
                           type="file"
                           accept=".txt"
                           onChange={handleFileChange}
                           className="file:text-primary file:font-semibold"
                           disabled={loading}
                         />
                         <p className="text-xs text-muted-foreground">Max file size: 1MB.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </div>
            </form>
      </CardContent>
    </Card>
  );
}
