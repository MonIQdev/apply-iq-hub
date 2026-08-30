import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  APPLICATION_STATUSES,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplicationStatus,
  type ApplicationStatus,
} from "@/lib/applications";

const statusStyles: Record<string, string> = {
  Applied: "bg-secondary text-secondary-foreground",
  Interview: "bg-accent text-accent-foreground",
  Rejected: "bg-muted text-muted-foreground",
};

export function ApplicationsTracker() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    job_title: "",
    company: "",
    date_applied: new Date().toISOString().slice(0, 10),
    status: "Applied" as ApplicationStatus,
  });

  const applications = useQuery({ queryKey: ["applications"], queryFn: listApplications });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["applications"] });

  const addMutation = useMutation({
    mutationFn: () => createApplication({ ...form, location: null, job_url: null }),
    onSuccess: () => {
      toast.success("Application saved");
      setForm({ ...form, job_title: "", company: "" });
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => {
      toast.success("Removed");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.job_title.trim() || !form.company.trim()) {
      toast.error("Job title and company are required.");
      return;
    }
    addMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Log an application</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="job_title">Job title</Label>
              <Input
                id="job_title"
                value={form.job_title}
                onChange={(event) => setForm({ ...form, job_title: event.target.value })}
                placeholder="React Developer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
                placeholder="Shopify"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_applied">Date applied</Label>
              <Input
                id="date_applied"
                type="date"
                value={form.date_applied}
                onChange={(event) => setForm({ ...form, date_applied: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value as ApplicationStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              variant="accent"
              className="sm:col-span-2 lg:col-span-5 lg:w-fit"
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              Add application
            </Button>
          </form>
        </CardContent>
      </Card>

      {applications.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      )}

      {applications.isError && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3 pt-6 text-sm">
            <AlertCircle className="mt-0.5 size-5 text-destructive" />
            <div>
              <p className="font-medium">Could not load your applications.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => applications.refetch()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {applications.data?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-display text-lg">No applications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Track roles from Job Finder or add one above.
            </p>
          </CardContent>
        </Card>
      )}

      {applications.data && applications.data.length > 0 && (
        <div className="space-y-3">
          {applications.data.map((application) => (
            <Card key={application.id} className="shadow-[var(--shadow-card)]">
              <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold">{application.job_title}</h3>
                    <Badge className={statusStyles[application.status] ?? ""}>
                      {application.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {application.company}
                    {application.location ? ` · ${application.location}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applied {new Date(application.date_applied).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={application.status}
                    onValueChange={(value) =>
                      statusMutation.mutate({
                        id: application.id,
                        status: value as ApplicationStatus,
                      })
                    }
                  >
                    <SelectTrigger className="w-36" aria-label="Update status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete application"
                    onClick={() => deleteMutation.mutate(application.id)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
