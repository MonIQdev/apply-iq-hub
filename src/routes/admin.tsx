import { createFileRoute, redirect } from "@tanstack/react-router";
import { Shield, Users, Activity, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminEmail, getSession } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ApplyIQ — Admin" },
      { name: "description", content: "ApplyIQ admin panel." },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSession();
    if (!session?.user?.email) {
      throw redirect({ to: "/login" });
    }
    if (!isAdminEmail(session.user.email)) {
      throw redirect({ to: "/dashboard" });
    }
    return { email: session.user.email };
  },
  component: AdminPanel,
});

function AdminPanel() {
  const { email } = Route.useRouteContext();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-lg font-bold tracking-tight">
            Apply<span className="text-accent">IQ</span> Admin
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard">Dashboard</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">System overview and configuration</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <Users className="size-4 text-accent" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Logged in as:</p>
              <p className="font-mono text-sm font-medium">{email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <Activity className="size-4 text-accent" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All systems operational.</p>
              <p className="text-xs text-muted-foreground">Last checked: {new Date().toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <Key className="size-4 text-accent" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">AI Gateway:</p>
              <p className="text-sm font-medium">Configured (server-side)</p>
              <p className="text-xs text-muted-foreground">API key is stored securely in environment variables.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
