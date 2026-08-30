import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  resume: z.string().min(20).max(20000),
  jobDescription: z.string().min(20).max(20000),
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function requireAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization token");
  }

  const token = authHeader.slice(7);
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("Invalid or expired token");
  }

  return data.user;
}

export const Route = createFileRoute("/api/tailor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAuth(request);
        } catch {
          return json({ error: "Unauthorized. Please log in to use this feature." }, 401);
        }

        const apiKey = process.env["AI_API_KEY"];
        if (!apiKey) {
          return json({ error: "AI is not configured on the server." }, 503);
        }

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return json(
            { error: "Please provide both a resume and a job description (20+ characters each)." },
            400,
          );
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `JOB DESCRIPTION:\n${parsed.jobDescription}\n\nCURRENT RESUME:\n${parsed.resume}`,
                    },
                  ],
                },
              ],
              systemInstruction: {
                parts: [
                  {
                    text: "You are ApplyIQ, an expert technical resume writer. Rewrite the candidate's resume so it targets the job description: mirror key terminology, quantify impact, keep every claim truthful, and never invent employers, dates or credentials. Return plain text with clear section headings and bullet points, then finish with a short 'Keywords added' line.",
                  },
                ],
              },
            }),
          },
        );

        if (response.status === 429) {
          return json({ error: "Rate limit reached. Please try again in a moment." }, 429);
        }
        if (response.status === 402 || response.status === 403) {
          return json({ error: "AI credits exhausted or invalid API key." }, 402);
        }
        if (!response.ok) {
          console.error("tailor: gemini error", response.status, await response.text());
          return json({ error: "The AI service could not tailor your resume." }, 502);
        }

        const payload = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const result = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!result) {
          return json({ error: "The AI service returned an empty result." }, 502);
        }

        return json({ result });
      },
    },
  },
});
