"use client";

import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import type { LeadType } from "@/lib/leadStore";

const CTAS: { type: LeadType; label: string }[] = [
  { type: "find-tutor", label: "Find a Tutor" },
  { type: "become-tutor", label: "Become a Tutor" },
  { type: "request-training", label: "Request Training" },
];

export default function Home() {
  const [activeLead, setActiveLead] = useState<LeadType | null>(null);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          StartRobos Tutor
        </h1>
        {activeLead ? (
          <LeadForm type={activeLead} />
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            {CTAS.map((cta) => (
              <button
                key={cta.type}
                type="button"
                className="rounded-full bg-foreground px-5 py-3 text-background"
                onClick={() => setActiveLead(cta.type)}
              >
                {cta.label}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
