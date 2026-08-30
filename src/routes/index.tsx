import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, LineChart, Search, Zap } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApplyIQ — Apply to 10 Jobs in 60 Seconds" },
      {
        name: "description",
        content:
          "ApplyIQ finds remote jobs, tailors your resume with AI, and tracks every application. Stop scrolling. Start getting interviews.",
      },
      { property: "og:title", content: "ApplyIQ — Apply to 10 Jobs in 60 Seconds" },
      {
        property: "og:description",
        content: "Find jobs, tailor your resume with AI, and track applications in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Search,
    title: "Job Finder",
    body: "Search live remote listings and pull up ten strong matches in one tap.",
  },
  {
    icon: FileText,
    title: "Resume AI",
    body: "Rewrite your resume against any job description, keyword-matched in seconds.",
  },
  {
    icon: LineChart,
    title: "Track Applications",
    body: "Keep every application, interview and rejection in one clear pipeline.",
  },
];

function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-lg font-bold tracking-tight">
            Apply<span className="text-accent">IQ</span>
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {user ? (
              <Button variant="accent" size="sm" asChild>
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="accent" size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-hero px-4 py-16 text-navy-foreground sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-current/20 bg-white/10 px-3 py-1 text-xs font-medium">
              <Zap className="size-3.5" />
              Built for fast movers
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight font-bold sm:text-6xl">
              Apply to 10 Jobs in 60 Seconds
            </h1>
            <p className="mt-4 text-base opacity-85 sm:text-lg">
              Stop scrolling. Start getting interviews.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {user ? (
                <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                  <Link to="/dashboard">
                    Open Dashboard
                    <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/signup">
                      Start Free
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                </>
              )}
              <p className="text-xs opacity-70">No credit card. No setup.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Everything you need between &ldquo;I should apply&rdquo; and &ldquo;offer signed&rdquo;
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-[var(--shadow-card)]">
                <CardContent className="space-y-3 pt-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
          <div>
            <span className="font-display text-lg font-bold">
              Apply<span className="text-accent">IQ</span>
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              The fastest way to go from job board to interview.
            </p>
          </div>
          <nav aria-label="Product" className="text-sm">
            <h3 className="font-display font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link to="/dashboard" className="hover:text-accent">
                  Job Finder
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-accent">
                  Resume AI
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-accent">
                  My Applications
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Support" className="text-sm">
            <h3 className="font-display font-semibold">Support</h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <a href="mailto:support@applyiq.app" className="hover:text-accent">
                  Contact support
                </a>
              </li>
              <li>
                <a href="https://remotive.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Job data source
                </a>
              </li>
              <li>
                <Link to="/" className="hover:text-accent">
                  Back to top
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ApplyIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
