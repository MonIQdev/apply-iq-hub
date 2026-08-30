import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ApplicationsTracker } from "@/components/applications-tracker";
import { JobFinder } from "@/components/job-finder";
import { ResumeAI } from "@/components/resume-ai";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getSession, isAdminEmail } from "@/lib/auth";
import { useAuth } from "@/components/auth-provider";
import { LogOut, Shield } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "ApplyIQ Dashboard — Find Jobs, Tailor Resumes, Track Applications" },
      {
        name: "description",
        content:
          "Search live remote jobs, tailor your resume with AI, and track every application status inside the ApplyIQ dashboard.",
      },
      { property: "og:title", content: "ApplyIQ Dashboard" },
      {
        property: "og:description",
        content: "Find jobs, tailor resumes with AI, and track applications in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const [tab, setTab] = useState("jobs");
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            Apply<span className="text-accent">IQ</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.email}
            </span>
            {user?.email && isAdminEmail(user.email) && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <Shield className="mr-2 size-4" />
                  Admin
                </Link>
              </Button>
            )}
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 size-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Your job search command center</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find roles, tailor your resume, and keep the pipeline moving.
        </p>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Job Finder</TabsTrigger>
            <TabsTrigger value="resume">Resume AI</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs" className="mt-6">
            <JobFinder
              onApplied={() => queryClient.invalidateQueries({ queryKey: ["applications"] })}
            />
          </TabsContent>
          <TabsContent value="resume" className="mt-6">
            <ResumeAI />
          </TabsContent>
          <TabsContent value="applications" className="mt-6">
            <ApplicationsTracker />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
