# In-Vert Comprehensive Implementation Plan

## 1) Inputs Used as Source of Truth
- Design system source: `invert-screens/` (absolute UI truth)
- Hackathon constraints: `Hackathon.md` (Hedera Hello Future Hackathon 2026)
- Product requirements: `PRD.md`

## 2) Winning Strategy for Hedera Hackathon 2026
We optimize for the seven judging dimensions with explicit engineering deliverables:

1. Innovation (10%)
- Build Proof-of-Sustainability attestations with transparent verification states.
- Add clear AI-agent verification pipeline (rule-based MVP + AI-ready extension points).

2. Feasibility (10%)
- Deliver realistic MVP in layers: submission -> verification -> HCS attestation -> HTS reward -> dashboard.
- Keep interfaces small and testable with mock mode for demos.

3. Execution (20%)
- End-to-end functional flow in one click demo path under 90 seconds.
- Observability, seed data, and failure states to show production discipline.

4. Integration (15%)
- Use Hedera Consensus Service for immutable attestation stream.
- Use Hedera Token Service for rewards issuance.
- Read/verify outcomes from Mirror Node for public transparency.

5. Success (20%)
- Surface network growth metrics in dashboard (actions, unique wallets, token rewards).
- Show impact data that can drive account and transaction growth.

6. Validation (15%)
- Include feedback capture loop in app (action-level confidence + user feedback notes).
- Track conversion funnel: submitted -> verified -> rewarded.

7. Pitch (10%)
- Prepare narrative-ready UI sections for problem, proof, metrics, and Hedera role.
- Keep architecture and demo flow directly mappable to pitch deck slides.

## 3) Target MVP Scope
### Must-Have (Hackathon Submission)
- Sustainability action submission form with evidence upload metadata.
- Automated verification queue + status transitions.
- Hedera attestation write for approved actions.
- Reward token transfer for approved actions.
- Public leaderboard and impact feed.

### Should-Have
- Wallet connection and simple user profile.
- Anti-spam protections (rate limit + duplicate evidence checks).
- Read model synced from Mirror Node.

### Could-Have
- AI-assisted evidence quality scoring.
- ESG export endpoints for organizations.

## 4) System Architecture
## Frontend (Next.js App Router)
- Routes:
  - `/` Guild landing page
  - `/submit` Submit eco action form
  - `/verification` AI verification status
  - `/impact` Impact leaderboard and feed
- Responsibilities:
  - Capture user action input
  - Show verification status timeline
  - Present leaderboard/feed metrics
  - Wallet-connected identity view

## Backend (Node.js + Express)
- API:
  - `POST /actions`
  - `POST /verify`
  - `GET /leaderboard`
  - `GET /users/:id`
  - `GET /actions/:id/status`
- Services:
  - Submission service
  - Verification service (rule engine)
  - Hedera service (HCS/HTS)
  - Reward service

## Agent Layer
- Rule engine (MVP):
  - image presence
  - timestamp validity
  - quantity sanity checks
  - location metadata checks
- Extendable adapter for AI model scoring later.

## Blockchain Layer
- HCS topic for action attestations.
- HTS reward token for incentives.
- Mirror Node indexer for dashboard read performance.

## Data Stores
- PostgreSQL for transactional state.
- Redis queue for verification pipeline.
- Object storage for evidence links.

## 5) Domain Model (MVP)
- `users`: wallet, username, reward totals.
- `actions`: submitted eco actions and evidence metadata.
- `verifications`: decision outputs + confidence.
- `rewards`: token transfer records and tx IDs.
- `attestations`: HCS message IDs + proof hashes.

## 6) Technical Standards
- Frontend: Next.js + TypeScript + Tailwind.
- Backend: Node.js + Express + TypeScript.
- Contracts/Chain SDK: Hedera JavaScript SDK.
- Quality: ESLint, Prettier, basic unit/integration tests.
- Environments: localnet/testnet first, mainnet later.

## 7) Security and Trust Controls
- API rate limiting and bot checks on submission endpoint.
- Signed wallet challenge for identity binding.
- Evidence hash deduplication.
- Audit logs for verification decisions.
- Role-based admin controls for dispute handling.

## 8) Delivery Plan (7-Day Sprint)
Day 1:
- Frontend scaffold + design tokens.
- Backend scaffold + DB schema + queue skeleton.

Day 2:
- Submission flow API + frontend `/submit` integration.
- Evidence metadata capture.

Day 3:
- Verification rule engine + status pipeline.
- Verification status UI (`/verification`).

Day 4:
- Hedera integration (HCS + HTS) and transaction persistence.

Day 5:
- Impact leaderboard/feed route (`/impact`) + mirror read model.

Day 6:
- End-to-end hardening, demo data scripts, QA.

Day 7:
- Pitch packaging, demo recording, final checklist.

## 9) Hackathon Submission Readiness Checklist
- Public GitHub repo with setup and test instructions.
- Live demo link.
- <=5 minute demo video.
- Pitch deck with architecture, metrics, and roadmap.
- Clear statement of selected track (Sustainability).
- Explicit Hedera service usage documented (HCS/HTS/Mirror).

## 10) Frontend Scaffolding Rules from Design System
- `invert-screens/` is treated as visual source of truth.
- Keep geometric logo motif, heavy uppercase typography, hard-edge borders, and emerald accent.
- Port coded HTML screen first (`submit_eco_action_form/code.html`) into reusable React components.
- For image-only screens, scaffold route skeletons and map section blocks until exact UI extraction is completed.

## 11) Immediate Next Engineering Actions
1. Use root-level Next.js App Router + Tailwind + TypeScript scaffold already in place.
2. Implement shared design tokens and shell layout from coded design.
3. Build `/submit` page parity from `invert-screens/submit_eco_action_form/code.html`.
4. Add `/`, `/verification`, and `/impact` route skeletons aligned to design folders.
5. Add mock data layer so UI can be demoed before backend completion.
