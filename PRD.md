IN-VERT
Product Requirements Document (PRD)
1. Product Overview
Product Name

In-Vert

Tagline

Proof of Sustainability On-Chain

Product Category

Web3 Sustainability Infrastructure

Product Description

In-Vert is a decentralized platform that verifies real-world sustainability actions and records them on-chain using Hedera. Contributors submit eco-friendly activities such as tree planting, recycling, or community cleanups. Autonomous verification agents validate these submissions and record attestations on Hedera. Verified actions receive tokenized rewards and become part of a transparent environmental impact ledger.

The system creates a trustless record of sustainability contributions while incentivizing environmental participation through blockchain-based rewards.

2. Problem Statement

Global sustainability initiatives face three structural problems:

1. Impact Verification

Many sustainability claims cannot be independently verified.

2. Incentive Misalignment

Environmental contributions are rarely rewarded financially.

3. Fragmented Impact Data

Environmental contributions are stored across disconnected systems.

3. Solution

In-Vert creates a decentralized infrastructure that:

• verifies environmental actions
• records them immutably on-chain
• rewards contributors automatically
• enables transparent environmental impact tracking

The system uses Hedera network services to provide high-throughput, low-cost environmental attestations.

4. Product Vision

Create the global infrastructure for Proof-of-Sustainability.

Every environmental action should become:

measurable

verifiable

rewarded

transparent

5. Target Users
Primary Users

Individual sustainability contributors

Examples:

volunteers

students

activists

community organizers

Secondary Users

Organizations

Examples:

NGOs

universities

environmental programs

corporate ESG teams

Observers

Impact stakeholders

Examples:

donors

auditors

researchers

6. Core Product Loop

The entire system revolves around one loop:

Submit → Verify → Record → Reward → Display Impact

This loop must function end-to-end in the MVP.

7. Core Features
Feature 1 — Sustainability Action Submission

Users submit sustainability activities.

Inputs

Action Type
Description
Quantity
Location
Photo Evidence

Example Actions

Plant trees
Recycle materials
Participate in cleanups
Install solar panels

Feature 2 — Verification Agents

Autonomous agents validate submitted actions.

Initial Verification Methods

Metadata validation
Timestamp validation
Image presence validation
Location confirmation

Future Improvements

AI image recognition
IoT sensors
Third-party validators

Feature 3 — Blockchain Attestation

Verified actions are recorded using:

Hedera Consensus Service (HCS)

Each attestation contains:

Action ID
User ID
Timestamp
Action Type
Verification Result
Proof Hash

Feature 4 — Tokenized Rewards

Contributors receive tokens for verified actions using:

Hedera Token Service (HTS)

Example reward model:

Tree planted → 5 tokens
Cleanup participation → 3 tokens

Tokens act as:

incentive

reputation score

sustainability currency

Feature 5 — Impact Dashboard

Public dashboard displaying:

Total actions verified
Total environmental impact
Top contributors
Recent verified actions

8. Functional Requirements
FR1

Users must be able to submit sustainability actions.

FR2

Submissions must enter a verification queue.

FR3

Verification agents must validate submissions.

FR4

Verified actions must be recorded on Hedera.

FR5

Users must receive token rewards for verified actions.

FR6

Impact dashboard must display live data.

9. Non-Functional Requirements
Performance

System should support high submission throughput.

Scalability

Architecture should allow thousands of actions per day.

Transparency

All verified actions must be publicly auditable.

Security

Prevent spam submissions and malicious actions.

10. System Architecture
Frontend

Framework:

Next.js

Responsibilities:

User interface
Submission forms
Impact dashboard
Leaderboard display

Backend

Framework:

Node.js + Express

Responsibilities:

Submission processing
Verification agent coordination
Blockchain interactions
Reward distribution

Agent Layer

Verification agents perform:

Submission validation
Verification decision
Blockchain trigger events

Blockchain Layer
Hedera Consensus Service (HCS)

Stores action attestations.

Hedera Token Service (HTS)

Handles reward tokens.

Mirror Node

Used for reading blockchain data.

11. Technical Stack

Frontend

Next.js
React
TailwindCSS

Backend

Node.js
Express

Blockchain

Hedera JavaScript SDK
HCS
HTS

Infrastructure

Vercel
Render or Railway

Agent Layer

LangChain or custom rule engine

12. Data Model
User

user_id
wallet_address
username
total_rewards
actions_submitted

Action

action_id
user_id
action_type
description
quantity
location
photo_url
status
timestamp

Verification

verification_id
action_id
agent_id
result
timestamp

Rewards

reward_id
user_id
token_amount
transaction_id

13. API Specification
Submit Action

POST /actions

Payload

action_type
description
quantity
location
photo_url

Verify Action

POST /verify

Payload

action_id

Leaderboard

GET /leaderboard

Returns

top contributors

User Profile

GET /users/:id

Returns

actions submitted
token balance

14. Hedera Integration
Step 1 — Create Token

Create sustainability reward token using HTS.

Step 2 — Create Consensus Topic

Create topic for action attestations.

Step 3 — Record Verified Actions

Submit HCS message.

Payload example

{
  action_id: "123",
  user_id: "user45",
  action_type: "tree_planting",
  quantity: 3,
  timestamp: "2026-03-16"
}
Step 4 — Issue Rewards

HTS token transfer to contributor wallet.

15. Verification Agent Logic
Input

New action submission

Validation Steps

Check image exists
Validate timestamp
Validate quantity
Confirm location metadata

Output

Verification status

Approved or Rejected

16. Implementation Plan

Time remaining ≈ 6–7 days.

Phase 1 — Project Setup (Day 1)

Tasks

Create GitHub repository
Initialize Next.js frontend
Initialize Node backend
Install Hedera SDK

Deliverables

Basic project skeleton.

Phase 2 — Submission System (Day 2)

Tasks

Build submission API
Create action database model
Connect frontend form

Deliverables

Users can submit actions.

Phase 3 — Verification Agent (Day 3)

Tasks

Create verification logic
Build verification queue
Return verification results

Deliverables

Actions can be verified automatically.

Phase 4 — Hedera Integration (Day 4)

Tasks

Create HCS topic
Write verified actions to HCS
Create HTS token
Issue token rewards

Deliverables

Blockchain recording working.

Phase 5 — Dashboard Integration (Day 5)

Tasks

Build leaderboard
Show verified actions
Display token balances

Deliverables

Full impact dashboard.

Phase 6 — Demo Preparation (Day 6)

Tasks

Prepare demo data
Test submission flow
Record demo video

Deliverables

Working demonstration.

17. Demo Flow

User submits action

“Plant 3 Trees”

Photo uploaded

Agent verifies action

HCS attestation created

Tokens issued

Leaderboard updates

Total demo time:

< 90 seconds

18. Metrics to Highlight

For judges.

Total actions verified
Total contributors
Total tokens distributed
Environmental impact metrics

Example:

120 trees planted
34 volunteers
800 tokens issued

19. Future Roadmap

AI verification agents
IoT environmental sensors
Corporate sustainability reporting
NGO validation integrations
Carbon credit markets

20. Success Criteria

Project considered successful if:

End-to-end submission works
Verification agent runs
Blockchain attestation recorded
Tokens distributed
Dashboard updates live