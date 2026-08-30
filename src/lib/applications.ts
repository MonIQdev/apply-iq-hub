import { supabase } from "@/integrations/supabase/client";

export const APPLICATION_STATUSES = ["Applied", "Interview", "Rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type Application = {
  id: string;
  job_title: string;
  company: string;
  location: string | null;
  job_url: string | null;
  date_applied: string;
  status: string;
};

const DEVICE_KEY = "applyiq-device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export async function listApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("id, job_title, company, location, job_url, date_applied, status")
    .eq("device_id", getDeviceId())
    .order("date_applied", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createApplication(input: {
  job_title: string;
  company: string;
  location?: string | null;
  job_url?: string | null;
  date_applied: string;
  status: ApplicationStatus;
}): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .insert({ ...input, device_id: getDeviceId() });
  if (error) throw new Error(error.message);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .eq("device_id", getDeviceId());
  if (error) throw new Error(error.message);
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("device_id", getDeviceId());
  if (error) throw new Error(error.message);
}
