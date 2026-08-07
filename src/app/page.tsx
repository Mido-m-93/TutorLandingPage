"use client";

import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import type { LeadType } from "@/lib/leadStore";
import { HOW_IT_WORKS, SAMPLE_TUTORS, SUBJECTS } from "./content";

const CTAS: { type: LeadType; label: string }[] = [
  { type: "find-tutor", label: "Find a Tutor" },
  { type: "become-tutor", label: "Become a Tutor" },
  { type: "request-training", label: "Request Training" },
];

export default function Home() {
  const [activeLead, setActiveLead] = useState<LeadType | null>(null);

  return (
    <div className="flex flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col items-center gap-24 bg-white px-6 py-24 dark:bg-black sm:px-16">
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Powered by Coop Lab
          </p>
          <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">
            StartRobos Tutor
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Connecting learners with experienced tutors for personalized, practical
            learning — from first lines of code to production-grade skills.
          </p>

          {activeLead ? (
            <div className="flex flex-col items-center gap-4">
              <LeadForm type={activeLead} />
              <button
                type="button"
                className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
                onClick={() => setActiveLead(null)}
              >
                Back
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row">
              {CTAS.map((cta) => (
                <button
                  key={cta.type}
                  type="button"
                  className="rounded-full bg-foreground px-5 py-3 text-background transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:hover:bg-zinc-200"
                  onClick={() => setActiveLead(cta.type)}
                >
                  {cta.label}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Subjects
          </h2>
          <ul className="flex flex-wrap justify-center gap-3">
            {SUBJECTS.map((subject) => (
              <li
                key={subject}
                className="rounded-full border border-black/[.08] px-4 py-2 text-sm text-zinc-700 dark:border-white/[.145] dark:text-zinc-300"
              >
                {subject}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            How it works
          </h2>
          <ol className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item, index) => (
              <li key={item.step} className="flex flex-col items-center gap-2 max-w-xs">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {index + 1}
                </span>
                <p className="font-medium text-black dark:text-zinc-50">{item.step}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Meet some of our tutors
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {SAMPLE_TUTORS.map((tutor) => (
              <div
                key={tutor.name}
                className="flex flex-col gap-2 rounded-2xl border border-black/[.08] p-6 text-left dark:border-white/[.145]"
              >
                <p className="font-semibold text-black dark:text-zinc-50">{tutor.name}</p>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {tutor.subject}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{tutor.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
