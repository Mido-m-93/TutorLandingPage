import { Resend } from "resend";
import type { Lead, LeadType } from "./leadStore";

const ADMIN_EMAIL = "Mohamada@roboco-op.org";
const SENDER = "onboarding@resend.dev";

const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  "find-tutor": "Find a Tutor",
  "become-tutor": "Become a Tutor",
  "request-training": "Request Training",
};

const SEND_TIMEOUT_MS = 5000;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Resend call timed out after ${ms}ms`)), ms);
  });
}

export async function notifyNewLead(lead: Lead): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await Promise.race([
      resend.emails.send({
        to: ADMIN_EMAIL,
        from: SENDER,
        subject: `New ${LEAD_TYPE_LABELS[lead.type]} lead`,
        text: `Name: ${lead.name}\nEmail: ${lead.email}\nGoal: ${lead.goal}\nType: ${lead.type}`,
      }),
      timeout(SEND_TIMEOUT_MS),
    ]);
    if (error) {
      console.error("Resend rejected lead notification email:", error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send lead notification email:", message);
  }
}
