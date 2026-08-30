import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Check, Copy, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

async function tailorResume(input: { resume: string; jobDescription: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/tailor", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as { result?: string; error?: string };
  if (!response.ok || !payload.result) {
    throw new Error(payload.error ?? "Could not tailor your resume.");
  }
  return payload.result;
}

export function ResumeAI() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({ mutationFn: tailorResume });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (resume.trim().length < 20 || jobDescription.trim().length < 20) {
      toast.error("Paste both your resume and the job description first.");
      return;
    }
    mutation.mutate({ resume: resume.trim(), jobDescription: jobDescription.trim() });
  };

  const copyResult = async () => {
    if (!mutation.data) return;
    await navigator.clipboard.writeText(mutation.data);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Your resume</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="resume" className="sr-only">
                Resume
              </Label>
              <Textarea
                id="resume"
                value={resume}
                onChange={(event) => setResume(event.target.value)}
                placeholder="Paste your current resume text here..."
                className="min-h-52 resize-y"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Job description</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="jd" className="sr-only">
                Job description
              </Label>
              <Textarea
                id="jd"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job posting you're targeting..."
                className="min-h-52 resize-y"
              />
            </CardContent>
          </Card>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Tailor My Resume with AI
        </Button>
      </form>

      {mutation.isError && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3 pt-6 text-sm">
            <AlertCircle className="mt-0.5 size-5 text-destructive" />
            <p>{mutation.error instanceof Error ? mutation.error.message : "Something went wrong."}</p>
          </CardContent>
        </Card>
      )}

      {(mutation.isPending || mutation.data) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="font-display text-base">Tailored resume</CardTitle>
            {mutation.data && (
              <Button variant="outline" size="sm" onClick={copyResult}>
                {copied ? <Check /> : <Copy />}
                Copy
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {mutation.isPending ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Rewriting your resume for this role...
              </p>
            ) : (
              <pre className="max-h-[32rem] overflow-auto rounded-lg bg-secondary p-4 text-sm whitespace-pre-wrap">
                {mutation.data}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
