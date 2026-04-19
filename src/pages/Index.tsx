import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, FileText, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Study Materials",
      description: "Access comprehensive study materials from top exams",
      color: "text-primary",
      bgColor: "bg-primary-light/20",
    },
    {
      icon: Trophy,
      title: "Interactive Quizzes",
      description: "Test your knowledge with adaptive quizzes and instant feedback",
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      icon: FileText,
      title: "Latest News",
      description: "Stay updated with exam notifications and educational updates",
      color: "text-pink-500",
      bgColor: "bg-pink-500/20",
    },
    {
      icon: Clock,
      title: "Flexible Learning",
      description: "Study at your own pace with 24/7 access",
      color: "text-green-500",
      bgColor: "bg-green-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              Study Sphere
            </span>
            <span className="text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              {" "}— Your eStudy Hub
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            No clutter. No distractions.
          </p>
          <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link to="/quizzes">
              <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                Start Quiz
              </Button>
            </Link>
            <Link to="/materials">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Explore Materials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You'll Get</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive resources for effective exam preparation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${index * 100 + 700}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Excel in Your Exams?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students preparing for JEE, GATE, and more competitive exams
            </p>
            <Link to="/study-materials">
              <Button size="lg" className="rounded-full px-8 shadow-lg">
                Start Learning Today
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
