# PRD: StartRobos Tutor Landing Page

Status: needs-triage

## Problem Statement

Learners who want to build programming, AI, robotics, automation, or professional
skills have no single place to discover Coop Lab's tutoring offering, understand
how it works, or express interest. Prospective tutors and organizations similarly
have no entry point to apply or request training. Coop Lab currently has no public
page representing this product.

## Solution

A single marketing landing page ("StartRobos Tutor") that explains the offering,
lists the subjects covered, and gives visitors three clear paths: find a tutor,
become a tutor, or request training for an organization. Each path opens a
lightweight lead-capture form; there is no live booking or account system yet.

## User Stories

1. As a learner, I want to see what subjects are taught, so I can tell if this fits my goals.
2. As a learner, I want to understand how tutoring works (select a subject → find a tutor → book a session), so I know what to expect before signing up.
3. As a learner, I want a clear "Find a Tutor" action, so I can express interest in getting matched.
4. As an experienced practitioner, I want a clear "Become a Tutor" action, so I can apply to teach.
5. As a representative of an organization, I want a "Request Training" action, so I can ask about group/corporate training.
6. As any visitor, I want to submit my name, email, and subject/goal through a short form, so I don't need to create an account just to express interest.
7. As the site owner, I want submitted leads persisted somewhere durable, so no interest is lost even before email notifications exist.

## Implementation Decisions

- **Stack**: Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
- **Page module**: a single-page marketing site (hero, subjects, how-it-works, three CTA paths, footer). No routing complexity beyond the one page plus form modals/sections.
- **LeadForm module** (deep): one reusable form component parameterized by lead type (`find-tutor` | `become-tutor` | `request-training`), fields: name, email, subject/goal, plus the type. Same component backs all three CTAs — only copy and the type field differ.
- **Leads API route**: one route handler that validates and stores a submitted lead. Storage is a simple persisted store (flat file or lightweight DB table) behind that route — the rest of the app never talks to storage directly. No email/notification integration in this phase.
- **Content data**: subjects (programming, AI, robotics, automation, professional skills) and sample tutor profiles are static placeholder data local to the page module, not fetched from an external source.
- **Branding**: no existing Coop Lab logo/assets to reuse — page ships with a clean typographic wordmark and a self-contained Tailwind theme (no external design system).

## Testing Decisions

- Test the **LeadForm module** and **leads API route** behavior (external behavior, not implementation): valid submission succeeds and is persisted; missing/invalid fields are rejected with a clear error; each lead type stores its type correctly.
- Page-level content (copy, layout) is not unit tested — verify visually via `/robobuilder:browse` after build.
- No prior art in this repo yet (greenfield project) — first tests establish the pattern for future pages.

## Out of Scope

- Real tutor discovery/matching or search
- Live booking calendar, scheduling, or availability system
- Payments/billing
- User accounts, login, or tutor dashboards
- Email or notification delivery for submitted leads
- Any content or linkage related to StartupRobos (separate product)
