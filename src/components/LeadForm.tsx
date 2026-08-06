"use client";

import { useState } from "react";
import type { LeadType } from "@/lib/leadStore";

const COPY: Record<LeadType, { goalLabel: string; submitLabel: string }> = {
  "find-tutor": { goalLabel: "What do you want to learn?", submitLabel: "Find a Tutor" },
  "become-tutor": { goalLabel: "What can you teach?", submitLabel: "Apply to Tutor" },
  "request-training": { goalLabel: "What does your team need?", submitLabel: "Request Training" },
};

export function LeadForm({ type }: { type: LeadType }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const copy = COPY[type];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name: formData.get("name"),
        email: formData.get("email"),
        goal: formData.get("goal"),
      }),
    });

    setStatus(response.ok ? "success" : "error");
  }

  if (status === "success") {
    return <p>Thanks! We&apos;ll be in touch soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input name="name" required />
      </label>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Goal
        <textarea name="goal" placeholder={copy.goalLabel} required />
      </label>
      <button type="submit" disabled={status === "submitting"}>
        {copy.submitLabel}
      </button>
      {status === "error" && <p role="alert">Something went wrong. Please try again.</p>}
    </form>
  );
}
