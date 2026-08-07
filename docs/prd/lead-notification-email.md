# PRD: Email Notification on New Lead Submission

Status: needs-triage

## Problem Statement

Right now, submitted leads only land in the file-backed store. Nobody at Coop Lab
finds out a new lead came in unless they manually check the data. Interest can sit
unnoticed for days.

## Solution

When a visitor successfully submits any of the three lead forms (Find a Tutor,
Become a Tutor, Request Training), send an email notification to the site owner
summarizing the lead. The lead's persistence is not affected by whether the email
succeeds or fails.

## User Stories

1. As the site owner, I want an email whenever someone submits "Find a Tutor", so that I can follow up promptly.
2. As the site owner, I want an email whenever someone submits "Become a Tutor", so that I can review tutor applicants promptly.
3. As the site owner, I want an email whenever someone submits "Request Training", so that I can respond to organizations promptly.
4. As the site owner, I want the notification email to include the lead's name, email, subject/goal, and lead type, so that I have enough context to follow up without checking the store.
5. As a learner or applicant submitting a form, I want my submission to succeed and be saved even if the notification email fails to send, so that a transient email outage never causes me to lose my submission.
6. As the site owner, I want failed notification attempts logged, so that I can notice and investigate an email delivery problem instead of it failing silently forever.

## Implementation Decisions

- **New module: lead notifier** (deep) — a single function that takes a persisted lead and sends the admin notification email. It owns all Resend-specific details (client construction, message formatting, the sender address) behind that one call. It never throws: any send failure is caught and logged internally, so callers do not need their own try/catch around it.
- **Provider**: Resend.
- **Sender address**: `onboarding@resend.dev` (Resend's shared default sender - no custom domain verification needed for this phase).
- **Recipient**: a single fixed admin address (Mohamada@roboco-op.org), not user-configurable through the UI.
- **Trigger point**: the leads API route calls the notifier immediately after a lead is successfully persisted, for all three lead types. The route's response to the client (201 + the saved lead) does not wait on or depend on the notifier's outcome beyond "don't crash the request."
- **Credentials**: the Resend API key is read from an environment variable already configured in the Vercel production environment; no new user-facing configuration.
- **Email content**: subject line identifies the lead type (e.g. "New Find a Tutor lead"); body includes name, email, subject/goal, and lead type.

## Testing Decisions

- Test the **lead notifier module** in isolation: given a lead, it calls the email provider with the right recipient, sender, and content; if the provider call fails, the module does not throw and the failure is logged.
- Test the **leads API route**'s integration point: a successful submission still returns 201 with the lead even when the notifier reports failure (mock the notifier to reject, assert the response is unaffected).
- Prior art: `src/app/api/leads/route.test.ts` already mocks/stubs at the module boundary for the file store; the same pattern (mock the notifier, don't hit the real Resend API in tests) applies here.
- Not tested: real delivery to Resend's API (no network calls in the test suite), and email rendering/visual output.

## Out of Scope

- Confirmation email sent to the person who submitted the lead (only an admin notification, for now)
- Making the recipient address configurable
- Custom sender domain / domain verification
- Retry logic for failed sends
- Any change to lead storage itself (still tracked separately under issue #7)

## Further Notes

This feature has no dependency on resolving issue #7 (swapping lead storage off the
local filesystem) - the notifier only needs the lead data already returned by
`saveLead`, regardless of what storage backs it.
