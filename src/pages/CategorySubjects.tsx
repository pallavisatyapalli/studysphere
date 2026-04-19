import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { 
  Calculator, 
  Atom, 
  Beaker, 
  Code, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Laptop, 
  Radio, 
  Zap, 
  Settings,
  ArrowLeft,
  FileText,
  Globe,
  History,
  Lightbulb,
  Building,
  Cpu,
  Brain,
  FlaskConical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconMap: { [key: string]: any } = {
  Calculator,
  Atom,
  Beaker,
  Code,
  BookOpen,
  GraduationCap,
  Award,
  Laptop,
  Radio,
  Zap,
  Settings,
  FileText,
  Globe,
  History,
  Lightbulb,
  Building,
  Cpu,
  Brain,
  FlaskConical
};

// Color schemes for different subjects
const colorSchemes: { [key: string]: { bg: string; text: string } } = {
  CSE: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  ECE: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  EEE: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  Mechanical: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400" },
  Civil: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  CAI: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  AIML: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  Mathematics: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  Physics: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  Chemistry: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  History: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  Geography: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  "General Studies": { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  "Research Aptitude": { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
  "Teaching Aptitude": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  "General Knowledge": { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
  Reasoning: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
};

const getColorScheme = (name: string) => {
  return colorSchemes[name] || { bg: "bg-primary/10", text: "text-primary" };
};

const CategorySubjects = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { toast } = useToast();

  const { data: category, isLoading } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      // First get the category
      const { data: categoryData, error: categoryError } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", categoryId)
        .single();
      if (categoryError) throw categoryError;

      // Then get its children
      const { data: children, error: childrenError } = await supabase
        .from("subjects")
        .select("*")
        .eq("parent_id", categoryId)
        .order("created_at");
      if (childrenError) throw childrenError;

      return { ...categoryData, children: children || [] };
    },
    enabled: !!categoryId,
  });

  const handleSubjectClick = (notionUrl: string | null, subjectName: string) => {
    if (notionUrl) {
      window.open(notionUrl, "_blank");
    } else {
      toast({
        title: "Coming Soon",
        description: `${subjectName} materials will be available soon!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back button */}
          <Link
            to="/materials"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors animate-fade-in"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '50ms' }}>
            {isLoading ? (
              <>
                <div className="h-12 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
                <div className="h-6 bg-muted rounded w-80 mx-auto animate-pulse" />
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-primary">{category?.name}</span>{" "}
                  <span className="text-foreground">Subjects</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Select a subject to access study materials
                </p>
              </>
            )}
          </div>

          {/* Subjects grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-14 w-14 bg-muted rounded-xl mb-6" />
                  <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category?.children?.map((child, index) => {
                const Icon = iconMap[child.icon || "BookOpen"] || BookOpen;
                const colors = getColorScheme(child.name);
                
                return (
                  <Card
                    key={child.id}
                    onClick={() => handleSubjectClick(child.notion_url, child.name)}
                    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${(index + 2) * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-6`}>
                      <Icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{child.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access comprehensive study materials
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to open in Notion
                    </p>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!category?.children || category.children.length === 0) && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No subjects available</h3>
              <p className="text-muted-foreground">
                Subjects for {category?.name} will be added soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySubjects;
