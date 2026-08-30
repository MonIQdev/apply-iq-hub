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

        const aiGatewayUrl = process.env["AI_GATEWAY_URL"];
        if (!aiGatewayUrl) {
          return json({ error: "AI gateway URL is not configured on the server." }, 503);
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

        const response = await fetch(aiGatewayUrl, {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are ApplyIQ, an expert technical resume writer. Rewrite the candidate's resume so it targets the job description: mirror key terminology, quantify impact, keep every claim truthful, and never invent employers, dates or credentials. Return plain text with clear section headings and bullet points, then finish with a short 'Keywords added' line.",
              },
              {
                role: "user",
                content: `JOB DESCRIPTION:\n${parsed.jobDescription}\n\nCURRENT RESUME:\n${parsed.resume}`,
              },
            ],
          }),
        });

        if (response.status === 429) {
          return json({ error: "Rate limit reached. Please try again in a moment." }, 429);
        }
        if (response.status === 402) {
          return json({ error: "AI credits exhausted. Please top up to continue." }, 402);
        }
        if (!response.ok) {
          console.error("tailor: gateway error", response.status, await response.text());
          return json({ error: "The AI service could not tailor your resume." }, 502);
        }

        const payload = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const result = payload.choices?.[0]?.message?.content?.trim();
        if (!result) {
          return json({ error: "The AI service returned an empty result." }, 502);
        }

        return json({ result });
      },
    },
  },
});
