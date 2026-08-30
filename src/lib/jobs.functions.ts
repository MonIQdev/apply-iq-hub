import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type RemotiveJob = {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  publication_date: string;
  url: string;
  job_type?: string | undefined;
};

const searchSchema = z.object({
  keyword: z.string().min(1).max(120),
});

export const findJobs = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => searchSchema.parse(data))
  .handler(async ({ data }): Promise<{ jobs: RemotiveJob[] }> => {
    const endpoint = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(
      data.keyword,
    )}&limit=10`;

    const response = await fetch(endpoint, {
      headers: { accept: "application/json", "user-agent": "ApplyIQ/1.0" },
    });

    if (!response.ok) {
      throw new Error(`Job search failed (${response.status}). Please try again.`);
    }

    const payload = (await response.json()) as { jobs?: RemotiveJob[] };
    const jobs = (payload.jobs ?? []).slice(0, 10).map((job) => ({
      id: job.id,
      title: job.title,
      company_name: job.company_name,
      candidate_required_location: job.candidate_required_location,
      publication_date: job.publication_date,
      url: job.url,
      job_type: job.job_type,
    }));

    return { jobs };
  });
