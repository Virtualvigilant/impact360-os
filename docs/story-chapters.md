# Scroll-story hero — chapter copy

Source of truth for `chapters.js` in the story hero. Copy here is final; do not
paraphrase it in the component.

---

## The page's single job

Convince a qualified student to start an application, by showing them exactly what
happens to it after they do.

## Reading order a first-time visitor follows

1. Brand mark, top left — establishes who is asking.
2. Chapter 01 headline, bottom left — the largest thing on screen, read in under a second.
3. Chapter 01 body, directly beneath it — the claim behind the headline.
4. The chapter rail on the right edge, noticed peripherally — tells them this is six
   beats, not an endless page, so they keep scrolling.
5. Chapters 02–05, headline first then body, as the camera pushes forward.
6. Chapter 06 headline and body — the outcome.
7. The primary CTA, which is the first filled button on the page.

Chapters 01–05 carry quiet text links only. The eye should not find a filled button
until the outcome has been stated.

---

## Stage mapping

The real lifecycle is `public.application_status`
(`supabase/migrations/20260829000100_enums.sql`), with the active pipeline order
declared in `src/lib/domain/pipeline.ts`:

```
draft → submitted → under_review → shortlisted → interview → assessment → selected
terminal: waitlisted | rejected | withdrawn
```

Seven active stages, six chapters. One merge, one extension:

| Chapter | Real stage(s) | Why |
| --- | --- | --- |
| 01 | `draft`, `submitted` | An applicant experiences these as one act. `draft` is an autosave state, not a stage they think about. |
| 02 | `under_review` | Unchanged. |
| 03 | `shortlisted` | Unchanged. Terminal outcomes (`rejected`, `waitlisted`) are addressed here, since this is where most files stop. |
| 04 | `interview` | Unchanged. |
| 05 | `assessment` | Unchanged. |
| 06 | `selected` → `offers.accepted` → `placements` | `selected` is a decision, not an outcome. The chapter carries through to the placement, which is what the applicant actually wants. |

---

## CHAPTER 01

- **CHAPTER LABEL:** 01
- **EYEBROW:** THE APPLICATION
- **HEADLINE:** ONE HONEST FORM
- **BODY:** You tell us what you built and what you would change about it. Consent is two
  separate checkboxes — the optional one stays optional.
- **PRIMARY CTA:** See open roles *(text link)*
- **SECONDARY CTA:** Privacy notice *(text link)*

Concrete specific: the two separate consent checkboxes are real —
`privacy_consent` (required) and `screening_consent` (optional) in
`src/lib/validation/schemas.ts`. The form's largest field is `project_summary`,
"tell us about something you have built".

### Rejected headlines for chapter 01

| Rejected | Why it was weaker |
| --- | --- |
| YOUR JOURNEY STARTS | Uses a banned noun, and it is about the abstraction rather than the applicant. It could open any careers page for any company. |
| APPLY IN MINUTES | A verb phrase, not a noun phrase, and it sells speed — which is neither true of this form nor the reason anyone should trust it. |
| OPEN APPLICATIONS | Accurate and inert. It labels a state instead of making a claim, so it gives the reader nothing to disagree with or believe. |

---

## CHAPTER 02

- **CHAPTER LABEL:** 02
- **EYEBROW:** UNDER REVIEW
- **HEADLINE:** A NAMED READER
- **BODY:** Every reviewer records one position against your file, with written reasons.
  Assistive scoring informs that decision; it never makes it.
- **PRIMARY CTA:** How we review *(text link)*
- **SECONDARY CTA:** —

Concrete specific: `application_reviews` is unique on
`(application_id, reviewer_id)` — one standing position per reviewer, updated rather
than duplicated — and `applicationDecisionSchema` refuses a decision with an empty
`reason`.

---

## CHAPTER 03

- **CHAPTER LABEL:** 03
- **EYEBROW:** SHORTLIST
- **HEADLINE:** THE SHORTER LIST
- **BODY:** Your file moves one stage at a time, never in jumps. If it stops here, we
  keep it twelve months and we tell you why.
- **PRIMARY CTA:** See the timeline *(text link)*
- **SECONDARY CTA:** —

Concrete specific: `nextStage()` in `src/lib/domain/pipeline.ts` permits exactly one
step forward or an explicit terminal outcome. Twelve months is the real
`unsuccessful_applications` rule in `supabase/seed.sql`.

---

## CHAPTER 04

- **CHAPTER LABEL:** 04
- **EYEBROW:** THE CONVERSATION
- **HEADLINE:** FORTY-FIVE MINUTES
- **BODY:** A scheduled conversation with a named panel, scored against the same
  criteria for every candidate. You see the format before you sit down.
- **PRIMARY CTA:** See interview format *(text link)*
- **SECONDARY CTA:** —

Concrete specific: `interviews.duration_minutes` defaults to 45;
`interviews.panel_ids` names the panel; `interview_scores` holds the structured
per-criterion scoring.

---

## CHAPTER 05

- **CHAPTER LABEL:** 05
- **EYEBROW:** THE TASK
- **HEADLINE:** WORK, NOT TRIVIA
- **BODY:** A practical task in your track — one of five, from software development to
  cybersecurity. Scored on evidence, with a comment against every criterion.
- **PRIMARY CTA:** See the tracks *(text link)*
- **SECONDARY CTA:** —

Concrete specific: the five tracks are the real list in `src/app/page.tsx`.
`evaluation_scores.comment` is `NOT NULL`, so a number can never be recorded without
its justification.

---

## CHAPTER 06

- **CHAPTER LABEL:** 06
- **EYEBROW:** THE OUTCOME
- **HEADLINE:** A NAMED PLACEMENT
- **BODY:** Accept, and a placement opens with a named mentor, supervisor and manager.
  Forty hours a week, weekly check-ins, a certificate at the end.
- **PRIMARY CTA:** Start your application *(filled button — the only one on the page)*
- **SECONDARY CTA:** See open roles *(text link)*

Concrete specific: `placements` carries `primary_mentor_id`, `supervisor_id` and
`programme_manager_id` as separate named columns;
`internship_programmes.expected_hours_per_week` defaults to 40; check-ins are
Monday–Sunday periods; `certificates` issues a numbered record on completion.

---

## Constraints applied

- Headlines are 2–4 words, uppercase, declarative noun phrases. No gerunds, no
  possessive "Your ___". Possessives appear in body copy only.
- Bodies are 18–28 words, second person, present tense, each carrying one specific
  drawn from this codebase rather than a benefit claim.
- Banned words checked and absent: leverage, empower, unlock, seamless, cutting-edge,
  world-class, passionate, embark, elevate, dive in, game-changer, transformative, and
  "journey" as a noun in any headline.
- No `[TODO]` placeholders were needed — every specific above is real and traceable to
  a file in this repository.
