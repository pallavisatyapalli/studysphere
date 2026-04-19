import { useNavigate } from "react-router-dom";
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

type SubjectWithChildren = Tables<"subjects"> & {
  children?: Tables<"subjects">[];
};

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

// Color schemes for main categories
const colorSchemes: { [key: string]: { bg: string; text: string } } = {
  GATE: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  JEE: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  UPSC: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  SET: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  NET: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
};

const getColorScheme = (name: string) => {
  return colorSchemes[name] || { bg: "bg-primary/10", text: "text-primary" };
};

const Materials = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: subjects, isLoading } = useQuery<SubjectWithChildren[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, children:subjects!parent_id(*)")
        .is("parent_id", null)
        .order("name");
      if (error) throw error;
      return data as unknown as SubjectWithChildren[];
    },
  });

  const handleCategoryClick = (subject: SubjectWithChildren) => {
    if (subject.children && subject.children.length > 0) {
      navigate(`/materials/${subject.id}`);
    } else if (subject.notion_url) {
      window.open(subject.notion_url, "_blank");
    } else {
      toast({
        title: "Coming Soon",
        description: `${subject.name} materials will be available soon!`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-primary">Study</span>{" "}
              <span className="text-foreground">Materials</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your exam category to access comprehensive study resources
            </p>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-14 w-14 bg-muted rounded-xl mb-6" />
                  <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : (
            /* Main categories grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects?.map((subject, index) => {
                const Icon = iconMap[subject.icon || "BookOpen"] || BookOpen;
                const colors = getColorScheme(subject.name);
                
                return (
                  <Card
                    key={subject.id}
                    onClick={() => handleCategoryClick(subject)}
                    className="p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/40 rounded-2xl animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-8`}>
                      <Icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {subject.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to explore subjects and materials
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Materials;
