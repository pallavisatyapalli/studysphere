import { Link, useLocation } from "react-router-dom";
import { BookOpen, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const navItems = [
    { path: "/materials", label: "Study Materials" },
    { path: "/quizzes", label: "Quizzes" },
    { path: "/news", label: "News", external: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BookOpen className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Study Sphere
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.path}
                    href="https://news-session-nine.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </Button>
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
