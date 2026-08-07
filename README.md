<!-- last-synced: 2026-08-07 by blueprint-sync -->
# StartRobos Tutor

A marketing landing page for **StartRobos Tutor**, a Coop Lab tutoring platform
connecting learners with experienced tutors in programming, AI, robotics,
automation, and professional skills. Visitors can Find a Tutor, Become a Tutor,
or Request Training for their organization — each opens a lead-capture form.

See `docs/prd/` for the full product decisions:
- [`startrobos-tutor-landing-page.md`](docs/prd/startrobos-tutor-landing-page.md) — the landing page itself
- [`lead-notification-email.md`](docs/prd/lead-notification-email.md) — admin email notification on new leads

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel. Leads are
validated with zod, persisted via a file-backed store (`src/lib/leadStore.ts`),
and trigger an admin notification email via Resend (`src/lib/notifyLead.ts`).

**Known issues** (tracked as GitHub issues):
- #7 — lead storage is broken on Vercel's serverless filesystem in production
- #9 — the notifier's timeout doesn't cancel the underlying Resend request

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site. The main
page is `src/app/page.tsx`.

## Testing

```bash
npm run test        # Vitest + React Testing Library
npm run build        # production build
```

Tests live alongside source as `*.test.ts(x)`.
