# In-Vert Stage 2 Sub-Implementation Plan

## Objective
Deliver a production-grade MVP backend and Hedera-integrated end-to-end loop that satisfies PRD functional requirements FR1 to FR6 and maps directly to hackathon judging criteria.

## Stage 2 Scope Window
- Start: March 16, 2026
- End: March 23, 2026 submission cutoff
- Goal: Live, auditable flow
  - submit action
  - queue verification
  - approve or reject
  - write Hedera attestation
  - issue token rewards
  - show live leaderboard and feed

## Working Principles
- Keep deterministic rule verification first. AI scoring is optional in this stage.
- Prioritize proof of execution over broad scope.
- Every major feature must emit demo-visible evidence.
- Preserve design-system parity while wiring real data.

## Workstream A: Backend Service Foundation
### Deliverables
- Node.js + Express + TypeScript API in root project under `server/`
- Layered modules
  - `server/src/routes`
  - `server/src/services`
  - `server/src/repositories`
  - `server/src/workers`
  - `server/src/lib`
- Environment handling with `.env.example`

### Task List
1. Bootstrap backend project with lint and build scripts.
2. Add health endpoint `GET /health`.
3. Add request validation middleware.
4. Add centralized error middleware.
5. Add structured logger for request and worker flows.

### Acceptance Criteria
- `npm run build` and `npm run lint` pass in server package.
- `GET /health` returns status and environment.
- Invalid payloads return consistent 400 response shape.

## Workstream B: Data Layer and Queue
### Deliverables
- PostgreSQL schema and migrations
- Redis queue for verification jobs (with in-memory fallback)

### Core Tables
- `users`
  - id, wallet_address, username, total_rewards, actions_submitted, created_at
- `actions`
  - id, user_id, action_type, description, quantity, location, photo_url, status, submitted_at
- `verifications`
  - id, action_id, agent_id, result, confidence, reason, verified_at
- `attestations`
  - id, action_id, hcs_topic_id, message_id, tx_id, proof_hash, created_at
- `rewards`
  - id, user_id, action_id, token_amount, tx_id, created_at

### Task List
1. Create migrations for all core tables.
2. Add status enum for `actions`.
3. Add indexes for leaderboard and recent feed queries.
4. Implement queue producer on action submit.
5. Implement worker consumer for verification jobs.

### Acceptance Criteria
- Migrations run clean from zero.
- Submitting an action creates DB row and queue job.
- Worker updates action status and writes verification row.

## Workstream C: Verification Engine MVP
### Deliverables
- Rule-based verifier with explicit pass or fail reasons
- Confidence scoring model for demo transparency

### Rule Set
1. Evidence presence check
2. Timestamp validity check
3. Quantity sanity check by action type
4. Location metadata presence check

### Result Contract
- `approved` if all mandatory rules pass
- `rejected` otherwise
- Include `reason_codes` and `confidence`

### Acceptance Criteria
- Each verified action stores reason codes.
- Rejected actions are visible in verification status API.
- Processing latency per action is under 2 seconds in local demo mode.

## Workstream D: Hedera Integration (HCS + HTS)
### Deliverables
- Hedera client module in `server/src/lib/hedera`
- HCS attestation writer
- HTS token reward transfer service

### Task List
1. Create or load reward token id from environment.
2. Create or load HCS topic id from environment.
3. On approved verification
  - compute proof hash
  - publish HCS message
  - transfer HTS reward
  - persist tx references
4. On failed chain write, retry with backoff and dead-letter logging.

### Acceptance Criteria
- Approved action produces persisted HCS tx and message id.
- Approved action produces persisted HTS transfer tx id.
- Dashboard API can return chain references for proof.

## Workstream E: API Contract Implementation
### Endpoints
1. `POST /actions`
- Creates action and enqueues verification.

2. `POST /verify`
- Manual trigger for admin or testing path.

3. `GET /actions/:id/status`
- Returns status timeline, reasons, and chain refs when available.

4. `GET /leaderboard`
- Returns ranked contributors and aggregate metrics.

5. `GET /feed`
- Returns recent verified actions and reward events.

6. `GET /users/:id`
- Returns user profile, actions, rewards, and token summary.

### Acceptance Criteria
- OpenAPI spec committed for all endpoints.
- All endpoints return deterministic response shapes.
- Frontend routes consume these endpoints without mock fallback.

## Workstream F: Frontend Integration with Live Data
### Deliverables
- Replace static data in impact and verification pages
- Submit page wired to live action submission

### Task List
1. Add API client module under `src/lib/api`.
2. Wire submit form to `POST /actions` with optimistic UI.
3. Wire verification page to `GET /actions/:id/status` or queue feed endpoint.
4. Wire impact page to `GET /leaderboard` and `GET /feed`.
5. Add loading, retry, and error states for all routes.

### Acceptance Criteria
- Submit action creates visible state change in verification and impact views.
- No hard-coded leaderboard or status demo arrays remain.
- End-to-end user flow completes in under 90 seconds.

## Workstream G: Security and Anti-Spam Hardening
### Deliverables
- Request throttling and abuse controls
- Duplicate evidence prevention

### Task List
1. Add API rate limiting on `POST /actions`.
2. Add payload size limits and file metadata checks.
3. Store and compare evidence hash to detect duplicates.
4. Add lightweight wallet challenge for identity binding.

### Acceptance Criteria
- Burst spam is throttled.
- Duplicate evidence submission is blocked with clear error.
- Security checks are logged and queryable.

## Workstream H: Metrics, Validation, and Demo Readiness
### Deliverables
- Judge-facing metrics on dashboard
- Deterministic demo script and seed data

### Metrics to expose
- total_actions_submitted
- total_actions_verified
- verification_success_rate
- total_tokens_distributed
- unique_contributors
- average_verification_time

### Task List
1. Add seed script for users, actions, verifications, and rewards.
2. Add one-click demo script sequence.
3. Add fallback demo dataset if live Hedera writes are delayed.
4. Add screenshot and tx-proof capture checklist.

### Acceptance Criteria
- Demo can be run twice with same expected output.
- All metrics appear in UI and are queryable via API.
- At least one live HCS and one live HTS reference ready for judges.

## Day-by-Day Execution Plan
## Day 1
- Backend scaffold, migrations, and queue baseline.
- Health endpoint and request validation.

## Day 2
- Action submission and verification worker operational.
- Status endpoint operational.

## Day 3
- Hedera HCS and HTS integrations completed.
- Persist chain references.

## Day 4
- Frontend fully connected to live API and no mock path by default.

## Day 5
- Security hardening, duplicate checks, and rate limits.

## Day 6
- Metrics, seed data, and deterministic demo script.

## Day 7
- Final QA, pitch alignment, and submission package lock.

## Definition of Done for Stage 2
1. Core loop works end-to-end with real backend and Hedera writes.
2. Frontend displays live leaderboard and verification feed.
3. Evidence of integration is visible with transaction references.
4. Security baseline is active for submission endpoint.
5. Demo is stable and fully scriptable in less than 90 seconds.

## Risks and Mitigations
1. Hedera testnet instability
- Mitigation: queue retries, fallback demo records, pre-warmed token and topic.

2. Scope overrun
- Mitigation: freeze AI enhancements and keep rule engine deterministic.

3. Data quality inconsistency
- Mitigation: strict request validation and schema constraints.

4. Demo failure risk
- Mitigation: pre-seeded data and step-by-step backup walkthrough.

## Required Repo Updates After Stage 2 Kickoff
- Update root `README.md` with backend and frontend run commands.
- Add `docs/api/openapi.yaml`.
- Add `docs/demo/DEMO_SCRIPT.md`.
- Add `server/.env.example` with Hedera and DB variables.
