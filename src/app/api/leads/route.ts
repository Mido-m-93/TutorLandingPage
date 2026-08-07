import { z } from "zod";
import { LEAD_TYPES, saveLead } from "@/lib/leadStore";
import { notifyNewLead } from "@/lib/notifyLead";

const leadSchema = z.object({
  type: z.enum(LEAD_TYPES),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  goal: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const lead = await saveLead(parsed.data);
  await notifyNewLead(lead);

  return Response.json({ lead }, { status: 201 });
}
