import { supabase } from "@/integrations/supabase/client";

export type AuthUser = {
  id: string;
  email: string | undefined;
};

const ADMIN_EMAIL = "MonIQdev1@gmail.com";

export function isAdminEmail(email: string | undefined): boolean {
  return email === ADMIN_EMAIL;
}

export async function getSession() {
  try {
    if (typeof window !== "undefined") {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }

    return null;
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
