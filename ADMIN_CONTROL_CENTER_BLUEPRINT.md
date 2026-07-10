# We Are With You Admin Control Center Blueprint

## Product Intent

This admin control center is designed for a life-critical, anonymous mental support platform. It is not a generic dashboard. Every screen, service, and data contract should optimize for:

- Human safety first
- Fast operator comprehension under stress
- Privacy by design
- Auditable AI supervision
- Real-time intervention readiness

## Core Roles

- `Admin`: full platform control, security, billing, clinical escalation, and system policy
- `Moderator`: community moderation, user safety actions, report triage, content takedowns
- `AI Supervisor`: model health, override review, classifier confidence, prompt and policy governance
- `Clinical Supervisor`: therapist assignment, crisis escalation, session oversight, care quality
- `Finance Ops`: subscriptions, payments, refunds, invoicing, revenue reporting

All actions should be enforced through role-based access control plus fine-grained permissions by resource and action.

## Frontend System Design

### Route Strategy

- `/dashboard`: mission control and system-wide intervention view
- `/users`: anonymous user registry and behavior oversight
- `/notifications`: alert center and delivery history
- `/analytics`: executive and operational reporting
- `/settings`: privacy, RBAC, retention, AI policy, and system control

### Mission Control Sections

- Overview: top-level KPIs, on-call status, safety posture, emergency actions
- AI Monitoring & Alerts: live model outputs, confidence drift, alert source mapping
- Crisis Management: open crisis cases, owner assignment, intervention SLA, next step
- Community & Posts: flagged posts/comments/chat, toxicity and self-harm risk, moderation state
- Therapists & Sessions: availability, occupancy, ratings, case load, next-open slot
- Bookings & Payments: session flow, fill rate, no-show risk, subscription performance
- Mood Tracking & Progress: recovery cohorts, user mood trajectories, intervention effectiveness
- Content Management: clinically reviewed articles, podcasts, videos, audience coverage
- Reports & Moderation: user reports, AI flags, therapist abuse reports, owner backlog
- Analytics & Governance: engagement, crisis trendline, content recovery lift, compliance posture

### Frontend Technical Notes

- Next.js App Router for route composition
- Tailwind + ShadCN primitives for consistent enterprise-grade surfaces
- Framer Motion for KPI animation, panel reveals, and state transitions
- React Query for snapshot polling and cache mutation
- Command palette for operator navigation and power-user workflows
- AI assistant widget for natural-language queries such as `Show users at highest risk`

## Backend Service Architecture

### Primary Services

- `api-gateway` (NestJS): authenticated admin APIs, RBAC, orchestration, audit logging
- `realtime-gateway` (NestJS WebSocket): live alerts, queue updates, therapist capacity events
- `risk-engine` (Python NLP microservice): emotion classification, depression scoring, self-harm detection, model confidence
- `chatbot-orchestrator`: routes messages between users, guardrails, retrieval, and human override
- `community-safety-service`: flags posts/comments, applies moderation policy, issues takedown actions
- `clinical-ops-service`: therapist management, assignment, booking flows, crisis routing
- `billing-service`: subscriptions, payments, refunds, invoicing, ledger reconciliation
- `content-service`: content workflow, publishing, localization, clinical review states
- `compliance-service`: retention rules, deletion jobs, access reviews, consent and policy tracking

### Suggested API Surface

#### Control Center

- `GET /api/v1/control-center/snapshot`
- `GET /api/v1/control-center/alerts`
- `GET /api/v1/control-center/risk-users`
- `GET /api/v1/control-center/health`

#### Users and Signals

- `GET /api/v1/users`
- `GET /api/v1/users/:anonymousId/timeline`
- `GET /api/v1/users/:anonymousId/mood`
- `POST /api/v1/users/:anonymousId/actions/restrict`
- `POST /api/v1/users/:anonymousId/actions/watch`

#### Community and Moderation

- `GET /api/v1/community/posts`
- `GET /api/v1/community/flags`
- `POST /api/v1/community/moderation/actions`
- `POST /api/v1/community/moderation/shadow-ban`

#### AI Governance

- `GET /api/v1/ai/signals`
- `GET /api/v1/ai/evaluations/drift`
- `POST /api/v1/ai/chatbot/override`
- `POST /api/v1/ai/chatbot/safe-mode`
- `PATCH /api/v1/ai/policies/:policyId`

#### Crisis Ops

- `GET /api/v1/crisis-cases`
- `POST /api/v1/crisis-cases/:id/acknowledge`
- `POST /api/v1/crisis-cases/:id/escalate`
- `POST /api/v1/crisis-cases/:id/assign`
- `POST /api/v1/crisis-cases/:id/resolve`

#### Therapists, Bookings, and Billing

- `GET /api/v1/therapists`
- `PATCH /api/v1/therapists/:id/availability`
- `POST /api/v1/bookings`
- `PATCH /api/v1/bookings/:id/reassign`
- `GET /api/v1/subscriptions`
- `GET /api/v1/payments`
- `POST /api/v1/payments/:id/refund`

## Database Structure

### Core Entities

- `anonymous_users`
  - Stable anonymous ID, region, locale, status, risk tier, retention state
- `user_signal_events`
  - Source event stream from posts, comments, chatbot, mood check-ins, therapist notes
- `emotion_inferences`
  - Model output, class, confidence, suicide risk, explanation hash, reviewer state
- `crisis_cases`
  - Trigger source, severity, owner, state, SLA, last action, next action
- `community_posts`
  - Anonymous author, content, visibility, moderation state, safety score
- `community_comments`
  - Parent post, anonymous author, content, safety score, moderation state
- `chat_threads`
  - Channel metadata, assigned human owner, safe-mode state, last response timestamp
- `chat_messages`
  - Sender type, content, model response metadata, guardrail decisions
- `therapists`
  - Profile, specialties, languages, rating, availability, capacity state
- `therapist_assignments`
  - Case mapping, ownership, start/end timestamps, reassignment history
- `bookings`
  - Session type, therapist, anonymous user, scheduled time, attendance, notes
- `subscriptions`
  - Plan, status, billing cycle, entitlement bundle
- `payments`
  - Ledger event, provider ref, amount, status, refund linkage
- `mood_checkins`
  - Timestamped mood scores, notes, streaks, trigger tags
- `content_assets`
  - Format, language, review state, audience segment, publish windows
- `moderation_reports`
  - Source, severity, owner, status, evidence reference
- `notifications`
  - Channel, priority, delivery state, response metadata
- `audit_logs`
  - Actor, role, action, resource, diff, IP, reason code
- `access_reviews`
  - Role audit events, elevated access approvals, revocations

### Relationship Highlights

- `anonymous_users 1:N user_signal_events`
- `user_signal_events 1:N emotion_inferences`
- `anonymous_users 1:N crisis_cases`
- `anonymous_users 1:N community_posts`
- `community_posts 1:N community_comments`
- `anonymous_users 1:N mood_checkins`
- `anonymous_users 1:N bookings`
- `therapists 1:N bookings`
- `therapists 1:N therapist_assignments`
- `crisis_cases 1:N therapist_assignments`
- `subscriptions 1:N payments`
- `anonymous_users 1:N notifications`
- Every privileged write `1:N audit_logs`

## AI Integration Flow

1. User creates a post, comment, chatbot message, or mood check-in.
2. Event is written to `user_signal_events` and published to the event bus.
3. Python `risk-engine` scores emotion, depression, toxicity, and self-harm probability.
4. Inference is stored in `emotion_inferences` with model version and confidence.
5. Rules engine evaluates:
   - threshold crossing
   - sudden deterioration
   - repeated high-risk signals
   - therapist no-show plus mood decline
   - community contagion patterns
6. Matching rules open or update `crisis_cases`, `moderation_reports`, or `chatbot safe-mode`.
7. `realtime-gateway` pushes WebSocket updates into the admin control center.
8. Human operators acknowledge, reassign, override AI, or escalate.
9. Every action is written to `audit_logs` for compliance and clinical review.

## Privacy and Safety Requirements

- No direct identity exposure in the admin UI by default
- Separate identity vault from the operational data plane
- Encryption at rest for message content and sensitive inference data
- Field-level masking for roles that do not require message-level detail
- Just-in-time elevated access with reason capture for emergency workflows
- Deletion tooling for user-controlled data removal and regional retention policies

## Real-Time Event Model

- `alert.created`
- `alert.updated`
- `crisis-case.created`
- `crisis-case.assigned`
- `crisis-case.resolved`
- `therapist.capacity.changed`
- `chatbot.override.created`
- `moderation.flag.created`
- `notification.delivery.failed`
- `model.drift.detected`

## Delivery Roadmap

1. Stabilize the control-center snapshot contract and WebSocket event schema.
2. Implement RBAC, audit logs, and privacy masking before broad admin rollout.
3. Connect the Python risk engine and chatbot guardrails into the event bus.
4. Add therapist scheduling, booking workflow, and billing ledger integrations.
5. Launch model evaluation, drift detection, and human override reporting.
