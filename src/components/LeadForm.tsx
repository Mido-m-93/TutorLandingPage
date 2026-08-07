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

    try {
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
    } catch {
      setStatus("error");
    }
  }

  const inputClassName =
    "rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-black outline-none focus:border-black/30 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/40";
  const labelClassName = "flex flex-col gap-1 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300";

  if (status === "success") {
    return (
      <p className="text-lg font-medium text-black dark:text-zinc-50">
        Thanks! We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className={labelClassName}>
        Name
        <input name="name" required className={inputClassName} />
      </label>
      <label className={labelClassName}>
        Email
        <input name="email" type="email" required className={inputClassName} />
      </label>
      <label className={labelClassName}>
        Goal
        <textarea
          name="goal"
          placeholder={copy.goalLabel}
          required
          rows={3}
          className={inputClassName}
        />
      </label>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-foreground px-5 py-3 text-background transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 disabled:hover:bg-foreground dark:hover:bg-zinc-200"
      >
        {copy.submitLabel}
      </button>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
