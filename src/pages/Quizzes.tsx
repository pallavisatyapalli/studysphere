import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Question = {
  type: string;
  text: string;
  options: string[];
  answer: string;
};

type UserAnswer = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

const Quizzes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  // AI Quiz State
  const [difficulty, setDifficulty] = useState('medium');
  const [textInput, setTextInput] = useState('');
  const [mcqs, setMcqs] = useState(2);
  const [fibs, setFibs] = useState(2);
  const [tfs, setTfs] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [aiUserAnswers, setAiUserAnswers] = useState<UserAnswer[]>([]);
  const [aiQuizStarted, setAiQuizStarted] = useState(false);
  const [aiQuizFinished, setAiQuizFinished] = useState(false);
  const [aiSelectedAnswer, setAiSelectedAnswer] = useState('');
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [showAiResults, setShowAiResults] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: quizAttempts } = useQuery({
    queryKey: ["quiz-attempts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*, subjects(*)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveQuizMutation = useMutation({
    mutationFn: async ({ score, total, topic }: { 
      score: number; 
      total: number;
      topic?: string;
    }) => {
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user!.id,
        score,
        total_questions: total,
        quiz_type: 'ai_generated',
        topic: topic || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      toast({ title: "Quiz Saved!", description: "Your score has been recorded." });
    },
  });

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const fuzzyMatch = (selectedText: string, correctAnswer: string) => {
    const normalizedSelected = normalize(selectedText);
    const normalizedCorrect = normalize(correctAnswer);
    return normalizedSelected === normalizedCorrect || 
           normalizedCorrect.includes(normalizedSelected) || 
           normalizedSelected.includes(normalizedCorrect);
  };

  const parseQuestions = (text: string): Question[] => {
    const questions: Question[] = [];
    let category = '';
    
    text.split('\n').filter(l => l.trim()).forEach(line => {
      if (/^(MCQs|F-I-Bs|T or F):/.test(line)) {
        category = line.split(':')[0].trim();
      } else if (/^Q\d+:/.test(line)) {
        let qText = line.replace(/^Q\d+:\s*/, '');
        let answer = '';
        if (category === 'T or F') {
          const tfMatch = qText.match(/\s*Answer:\s*(True|False)\s*$/i);
          if (tfMatch) {
            answer = tfMatch[1].charAt(0).toUpperCase() + tfMatch[1].slice(1).toLowerCase();
            qText = qText.replace(/\s*Answer:\s*(True|False)\s*$/i, '').trim();
          }
        }
        questions.push({ type: category, text: qText, options: [], answer });
      } else if (/^[a-d]\)/.test(line) && questions.length) {
        questions[questions.length - 1].options.push(line.slice(3));
      } else if (/^Answer:/.test(line) && questions.length) {
        questions[questions.length - 1].answer = line.split(': ')[1].trim();
      }
    });
    
    return questions;
  };

  const handleGenerateQuiz = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to generate and take quizzes.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    try {
      setIsGenerating(true);
      setShowAiResults(false);
      setAiQuizStarted(false);
      setAiQuizFinished(false);
      setAiQuestionIndex(0);
      setAiScore(0);
      setAiUserAnswers([]);

      if (!textInput.trim()) {
        toast({ title: "Error", description: "Please provide text to generate quiz", variant: "destructive" });
        return;
      }

      const formData = new FormData();
      formData.append('text', textInput.trim());
      formData.append('difficulty', difficulty);
      formData.append('mcqs', mcqs.toString());
      formData.append('fibs', fibs.toString());
      formData.append('tfs', tfs.toString());

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate questions');
      }

      const data = await response.json();
      const questions = parseQuestions(data.questions || '');
      
      if (!questions.length) throw new Error('No questions were generated.');

      setAiQuestions(questions);
      setAiQuizStarted(true);
      toast({ title: "Success!", description: `Generated ${questions.length} questions` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : 'Failed to generate quiz', variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const recordAiAnswer = (ans: string) => {
    if (showAiFeedback) return;

    const q = aiQuestions[aiQuestionIndex];
    let isCorrect = false;
    let userAns = ans;

    if (q.type === 'MCQs') {
      const selectedOptionText = q.options[ans.charCodeAt(0) - 97];
      isCorrect = fuzzyMatch(selectedOptionText, q.answer);
      userAns = `${ans}) ${selectedOptionText}`;
    } else {
      isCorrect = fuzzyMatch(ans, q.answer);
    }

    const newScore = isCorrect ? aiScore + 1 : aiScore;
    if (isCorrect) setAiScore(prev => prev + 1);
    
    setAiUserAnswers(prev => [...prev, {
      question: q.text,
      userAnswer: userAns,
      correctAnswer: q.answer,
      isCorrect
    }]);

    setShowAiFeedback(true);

    setTimeout(() => {
      setShowAiFeedback(false);
      setAiSelectedAnswer('');
      
      if (aiQuestionIndex + 1 < aiQuestions.length) {
        setAiQuestionIndex(prev => prev + 1);
      } else {
        setAiQuizFinished(true);
        setAiQuizStarted(false);
        if (user) {
          saveQuizMutation.mutate({
            score: newScore,
            total: aiQuestions.length,
            topic: textInput.slice(0, 100) || 'AI Generated Quiz',
          });
        }
      }
    }, 800);
  };

  // AI Quiz In Progress
  if (aiQuizStarted && aiQuestions[aiQuestionIndex]) {
    const q = aiQuestions[aiQuestionIndex];
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <Card className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">AI Quiz</h2>
                  <span className="text-muted-foreground">
                    Question {aiQuestionIndex + 1} of {aiQuestions.length}
                  </span>
                </div>
                <Progress value={((aiQuestionIndex + 1) / aiQuestions.length) * 100} className="h-2" />
              </div>

              <div className="mb-8">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mb-2 inline-block">{q.type}</span>
                <h3 className="text-xl font-semibold mb-6">{q.text}</h3>

                {q.type === 'MCQs' && (
                  <div className="space-y-3">
                    {q.options.map((opt, i) => {
                      const optionLetter = String.fromCharCode(97 + i);
                      const isSelected = aiSelectedAnswer === optionLetter;
                      const isCorrect = showAiFeedback && fuzzyMatch(opt, q.answer);
                      const isIncorrect = showAiFeedback && isSelected && !fuzzyMatch(opt, q.answer);
                      
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (!showAiFeedback) {
                              setAiSelectedAnswer(optionLetter);
                              recordAiAnswer(optionLetter);
                            }
                          }}
                          disabled={showAiFeedback}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                            isCorrect ? 'border-green-500 bg-green-500/20' :
                            isIncorrect ? 'border-destructive bg-destructive/20' :
                            isSelected ? 'border-primary bg-primary/10' :
                            'border-border hover:border-primary/50'
                          }`}
                        >
                          {optionLetter}) {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'F-I-Bs' && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Type your answer..."
                      value={aiSelectedAnswer}
                      onChange={(e) => setAiSelectedAnswer(e.target.value)}
                      disabled={showAiFeedback}
                      className={showAiFeedback ? (fuzzyMatch(aiSelectedAnswer, q.answer) ? 'border-green-500' : 'border-destructive') : ''}
                    />
                    <Button onClick={() => recordAiAnswer(aiSelectedAnswer.trim())} disabled={!aiSelectedAnswer.trim() || showAiFeedback} className="w-full">
                      Submit Answer
                    </Button>
                    {showAiFeedback && !fuzzyMatch(aiSelectedAnswer, q.answer) && (
                      <p className="text-sm text-green-500">Correct answer: {q.answer}</p>
                    )}
                  </div>
                )}

                {q.type === 'T or F' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['True', 'False'].map((option) => {
                      const isSelected = aiSelectedAnswer === option;
                      const isCorrect = showAiFeedback && fuzzyMatch(option, q.answer);
                      const isIncorrect = showAiFeedback && isSelected && !fuzzyMatch(option, q.answer);
                      
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            if (!showAiFeedback) {
                              setAiSelectedAnswer(option);
                              recordAiAnswer(option);
                            }
                          }}
                          disabled={showAiFeedback}
                          className={`p-4 rounded-lg border-2 font-medium transition-all ${
                            isCorrect ? 'border-green-500 bg-green-500/20' :
                            isIncorrect ? 'border-destructive bg-destructive/20' :
                            isSelected ? 'border-primary bg-primary/10' :
                            'border-border hover:border-primary/50'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // AI Quiz Finished
  if (aiQuizFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-3xl space-y-6">
            <Card className="p-8 text-center bg-gradient-to-r from-primary/20 to-secondary/20">
              <h2 className="text-3xl font-bold mb-4">Quiz Complete! 🎉</h2>
              <div className="text-6xl font-bold text-primary mb-4">
                {Math.round((aiScore / aiQuestions.length) * 100)}%
              </div>
              <p className="text-xl text-muted-foreground mb-8">
                You scored {aiScore} out of {aiQuestions.length}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowAiResults(!showAiResults)}>
                  {showAiResults ? 'Hide Results' : 'Show Results'}
                </Button>
                <Button onClick={() => { setAiQuizFinished(false); setAiQuestions([]); }} variant="outline">
                  New Quiz
                </Button>
              </div>
            </Card>

            {showAiResults && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quiz Results</h3>
                <div className="space-y-4">
                  {aiUserAnswers.map((ua, idx) => (
                    <div key={idx} className="p-4 rounded-lg border space-y-2">
                      <p className="font-medium">Q{idx + 1}: {ua.question}</p>
                      <p className={`text-sm ${ua.isCorrect ? 'text-green-500' : 'text-destructive'}`}>
                        Your Answer: {ua.userAnswer}
                      </p>
                      {!ua.isCorrect && <p className="text-sm text-green-500">Correct Answer: {ua.correctAnswer}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Quiz Page - AI Only
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AI-Powered Quizzes</h1>
            <p className="text-lg text-muted-foreground">Generate custom quizzes from your study materials using AI</p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Create Your Quiz</CardTitle>
              <CardDescription>Enter text to generate personalized quiz questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Paste your study material here..."
                className="min-h-[200px]"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mcqs">MCQs</Label>
                  <Input id="mcqs" type="number" min="0" max="10" value={mcqs} onChange={(e) => setMcqs(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fibs">Fill in Blanks</Label>
                  <Input id="fibs" type="number" min="0" max="10" value={fibs} onChange={(e) => setFibs(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tfs">True/False</Label>
                  <Input id="tfs" type="number" min="0" max="10" value={tfs} onChange={(e) => setTfs(parseInt(e.target.value) || 0)} />
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleGenerateQuiz} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Quiz with AI'}
              </Button>
            </CardContent>
          </Card>

          {user && quizAttempts && quizAttempts.length > 0 && (
            <div className="mt-12 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Your Quiz History</h2>
              <div className="space-y-4">
                {quizAttempts.map((attempt) => (
                  <Card key={attempt.id} className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">AI Generated Quiz</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round((attempt.score / attempt.total_questions) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">{attempt.score}/{attempt.total_questions}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
