"use client";

import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";

export default function Home() {
  const [showFindTutorForm, setShowFindTutorForm] = useState(false);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          StartRobos Tutor
        </h1>
        {showFindTutorForm ? (
          <LeadForm type="find-tutor" />
        ) : (
          <button
            type="button"
            className="rounded-full bg-foreground px-5 py-3 text-background"
            onClick={() => setShowFindTutorForm(true)}
          >
            Find a Tutor
          </button>
        )}
      </main>
    </div>
  );
}
