import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Briefcase, Building2, Calendar, ExternalLink, Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createApplication } from "@/lib/applications";
import { findJobs, type RemotiveJob } from "@/lib/jobs.functions";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function JobFinder({ onApplied }: { onApplied?: () => void }) {
  const [query, setQuery] = useState("");
  const search = useServerFn(findJobs);

  const mutation = useMutation({
    mutationFn: (keyword: string) => search({ data: { keyword } }),
  });

  const jobs: RemotiveJob[] | undefined = mutation.data?.jobs;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = query.trim();
    if (!keyword) {
      toast.error("Enter a job title and location to search.");
      return;
    }
    mutation.mutate(keyword);
  };

  const trackApplication = async (job: RemotiveJob) => {
    try {
      await createApplication({
        job_title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || null,
        job_url: job.url,
        date_applied: new Date().toISOString().slice(0, 10),
        status: "Applied",
      });
      toast.success("Added to My Applications");
      onApplied?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save application");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Search remote roles</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="React Developer Toronto"
                aria-label="Job title and location"
                className="h-12 pl-9"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <Briefcase />}
              Find 10 Jobs
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Example: <span className="font-medium">React Developer Toronto</span>
          </p>
        </CardContent>
      </Card>

      {mutation.isPending && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mutation.isError && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3 pt-6 text-sm">
            <AlertCircle className="mt-0.5 size-5 text-destructive" />
            <div>
              <p className="font-medium">We couldn't load jobs right now.</p>
              <p className="text-muted-foreground">
                {mutation.error instanceof Error ? mutation.error.message : "Unknown error"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => mutation.mutate(query.trim())}
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {jobs && jobs.length === 0 && !mutation.isPending && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-display text-lg">No matches found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a broader title, like &ldquo;React Developer&rdquo;.
            </p>
          </CardContent>
        </Card>
      )}

      {jobs && jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col justify-between shadow-[var(--shadow-card)]">
              <CardContent className="space-y-3 pt-6">
                <h3 className="font-display text-base leading-snug font-semibold">{job.title}</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    {job.company_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {job.candidate_required_location || "Remote"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    Posted {formatDate(job.publication_date)}
                  </p>
                </div>
                {job.job_type && <Badge variant="secondary">{job.job_type.replace("_", " ")}</Badge>}
              </CardContent>
              <CardContent className="flex flex-col gap-2 pb-6 sm:flex-row">
                <Button variant="accent" className="flex-1" asChild>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink />
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => trackApplication(job)}>
                  Track
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
