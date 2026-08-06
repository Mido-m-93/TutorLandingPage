import { leadStore } from "@/lib/leadStore";

function validationError(body: Record<string, unknown>): string | null {
  if (!body.type || !body.name || !body.email || !body.goal) {
    return "type, name, email, and goal are all required";
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json();

  const error = validationError(body);
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const lead = await leadStore.saveLead({
    type: body.type,
    name: body.name,
    email: body.email,
    goal: body.goal,
  });

  return Response.json({ lead }, { status: 201 });
}
