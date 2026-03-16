import type { PoolClient } from "pg";
import { query, withTransaction } from "../lib/db.js";
import type {
  ActionRecord,
  AttestationRecord,
  FeedItem,
  RewardRecord,
  UserRecord,
  VerificationCheckRecord,
  VerificationRecord,
} from "../types/domain.js";

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    walletAddress: String(row.wallet_address),
    username: String(row.username),
    totalRewards: Number(row.total_rewards),
    actionsSubmitted: Number(row.actions_submitted),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapAction(row: Record<string, unknown>): ActionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    actionType: String(row.action_type),
    description: String(row.description),
    quantity: Number(row.quantity),
    location: String(row.location),
    photoUrl: String(row.photo_url),
    status: String(row.status) as ActionRecord["status"],
    submittedAt: new Date(String(row.submitted_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapVerification(row: Record<string, unknown>): VerificationRecord {
  return {
    id: String(row.id),
    actionId: String(row.action_id),
    agentId: String(row.agent_id),
    result: String(row.result) as VerificationRecord["result"],
    confidence: Number(row.confidence),
    reasonCodes: Array.isArray(row.reason_codes) ? (row.reason_codes as string[]) : [],
    verifiedAt: new Date(String(row.verified_at)).toISOString(),
  };
}

function mapAttestation(row: Record<string, unknown>): AttestationRecord {
  return {
    id: String(row.id),
    actionId: String(row.action_id),
    topicId: String(row.topic_id),
    messageId: String(row.message_id),
    txId: String(row.tx_id),
    proofHash: String(row.proof_hash),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapReward(row: Record<string, unknown>): RewardRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    actionId: String(row.action_id),
    tokenAmount: Number(row.token_amount),
    txId: String(row.tx_id),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapFeedItem(row: Record<string, unknown>): FeedItem {
  return {
    id: String(row.id),
    type: String(row.type) as FeedItem["type"],
    message: String(row.message),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapVerificationCheck(row: Record<string, unknown>): VerificationCheckRecord {
  return {
    id: String(row.id),
    verificationId: String(row.verification_id),
    checkName: String(row.check_name),
    passed: Boolean(row.passed),
    score: Number(row.score),
    detail: String(row.detail),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

async function upsertUser(client: PoolClient, user: UserRecord) {
  const result = await client.query(
    `INSERT INTO users (id, wallet_address, username, total_rewards, actions_submitted, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (wallet_address)
     DO UPDATE SET username = EXCLUDED.username
     RETURNING *`,
    [
      user.id,
      user.walletAddress,
      user.username,
      user.totalRewards,
      user.actionsSubmitted,
      user.createdAt,
    ],
  );

  return mapUser(result.rows[0]);
}

export const actionsRepository = {
  async findRecentDuplicateAction(input: {
    walletAddress: string;
    actionType: string;
    description: string;
    quantity: number;
    location: string;
    photoUrl: string;
    lookbackHours?: number;
  }) {
    const lookbackHours = input.lookbackHours ?? 24;
    const result = await query(
      `SELECT a.*
       FROM actions a
       INNER JOIN users u ON u.id = a.user_id
       WHERE u.wallet_address = $1
         AND lower(a.action_type) = lower($2)
         AND lower(trim(a.description)) = lower(trim($3))
         AND a.quantity = $4
         AND lower(trim(a.location)) = lower(trim($5))
         AND a.photo_url = $6
         AND a.status IN ('queued', 'approved')
         AND a.submitted_at >= NOW() - ($7::text || ' hours')::interval
       ORDER BY a.submitted_at DESC
       LIMIT 1`,
      [
        input.walletAddress,
        input.actionType,
        input.description,
        input.quantity,
        input.location,
        input.photoUrl,
        String(lookbackHours),
      ],
    );

    return result.rowCount ? mapAction(result.rows[0]) : null;
  },

  async findUserByWalletAddress(walletAddress: string) {
    const result = await query("SELECT * FROM users WHERE wallet_address = $1", [walletAddress]);
    return result.rowCount ? mapUser(result.rows[0]) : null;
  },

  async findUserById(userId: string) {
    const result = await query("SELECT * FROM users WHERE id = $1", [userId]);
    return result.rowCount ? mapUser(result.rows[0]) : null;
  },

  async createUser(user: UserRecord) {
    const result = await query(
      `INSERT INTO users (id, wallet_address, username, total_rewards, actions_submitted, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.id, user.walletAddress, user.username, user.totalRewards, user.actionsSubmitted, user.createdAt],
    );
    return mapUser(result.rows[0]);
  },

  async createQueuedAction(user: UserRecord, action: ActionRecord, feedItem: FeedItem) {
    return withTransaction(async (client) => {
      const persistedUser = await upsertUser(client, user);
      const actionResult = await client.query(
        `INSERT INTO actions (id, user_id, action_type, description, quantity, location, photo_url, status, submitted_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          action.id,
          persistedUser.id,
          action.actionType,
          action.description,
          action.quantity,
          action.location,
          action.photoUrl,
          action.status,
          action.submittedAt,
          action.updatedAt,
        ],
      );

      await client.query(
        "UPDATE users SET actions_submitted = actions_submitted + 1 WHERE id = $1",
        [persistedUser.id],
      );
      await client.query(
        "INSERT INTO feed_items (id, type, message, created_at) VALUES ($1, $2, $3, $4)",
        [feedItem.id, feedItem.type, feedItem.message, feedItem.createdAt],
      );

      return mapAction(actionResult.rows[0]);
    });
  },

  async findActionById(actionId: string) {
    const result = await query("SELECT * FROM actions WHERE id = $1", [actionId]);
    return result.rowCount ? mapAction(result.rows[0]) : null;
  },

  async persistVerificationOutcome(
    actionId: string,
    status: ActionRecord["status"],
    verification: VerificationRecord,
    verificationFeed: FeedItem,
    verificationChecks: VerificationCheckRecord[] = [],
    rewardDelta?: {
      attestation: AttestationRecord;
      reward: RewardRecord;
      rewardFeed: FeedItem;
      rewardAmount: number;
      userId: string;
    },
  ) {
    await withTransaction(async (client) => {
      await client.query(
        "UPDATE actions SET status = $2, updated_at = NOW() WHERE id = $1",
        [actionId, status],
      );
      await client.query(
        `INSERT INTO verifications (id, action_id, agent_id, result, confidence, reason_codes, verified_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
         ON CONFLICT (action_id)
         DO UPDATE SET agent_id = EXCLUDED.agent_id, result = EXCLUDED.result, confidence = EXCLUDED.confidence,
           reason_codes = EXCLUDED.reason_codes, verified_at = EXCLUDED.verified_at`,
        [
          verification.id,
          verification.actionId,
          verification.agentId,
          verification.result,
          verification.confidence,
          JSON.stringify(verification.reasonCodes),
          verification.verifiedAt,
        ],
      );
      await client.query(
        "INSERT INTO feed_items (id, type, message, created_at) VALUES ($1, $2, $3, $4)",
        [verificationFeed.id, verificationFeed.type, verificationFeed.message, verificationFeed.createdAt],
      );

      for (const check of verificationChecks) {
        await client.query(
          `INSERT INTO verification_checks (id, verification_id, check_name, passed, score, detail, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id)
           DO UPDATE SET check_name = EXCLUDED.check_name, passed = EXCLUDED.passed,
             score = EXCLUDED.score, detail = EXCLUDED.detail, created_at = EXCLUDED.created_at`,
          [
            check.id,
            check.verificationId,
            check.checkName,
            check.passed,
            check.score,
            check.detail,
            check.createdAt,
          ],
        );
      }

      if (rewardDelta) {
        await client.query(
          `INSERT INTO attestations (id, action_id, topic_id, message_id, tx_id, proof_hash, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (action_id)
           DO UPDATE SET topic_id = EXCLUDED.topic_id, message_id = EXCLUDED.message_id, tx_id = EXCLUDED.tx_id,
             proof_hash = EXCLUDED.proof_hash, created_at = EXCLUDED.created_at`,
          [
            rewardDelta.attestation.id,
            rewardDelta.attestation.actionId,
            rewardDelta.attestation.topicId,
            rewardDelta.attestation.messageId,
            rewardDelta.attestation.txId,
            rewardDelta.attestation.proofHash,
            rewardDelta.attestation.createdAt,
          ],
        );
        await client.query(
          `INSERT INTO rewards (id, user_id, action_id, token_amount, tx_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (action_id)
           DO UPDATE SET user_id = EXCLUDED.user_id, token_amount = EXCLUDED.token_amount, tx_id = EXCLUDED.tx_id, created_at = EXCLUDED.created_at`,
          [
            rewardDelta.reward.id,
            rewardDelta.reward.userId,
            rewardDelta.reward.actionId,
            rewardDelta.reward.tokenAmount,
            rewardDelta.reward.txId,
            rewardDelta.reward.createdAt,
          ],
        );
        await client.query(
          "UPDATE users SET total_rewards = total_rewards + $2 WHERE id = $1",
          [rewardDelta.userId, rewardDelta.rewardAmount],
        );
        await client.query(
          "INSERT INTO feed_items (id, type, message, created_at) VALUES ($1, $2, $3, $4)",
          [rewardDelta.rewardFeed.id, rewardDelta.rewardFeed.type, rewardDelta.rewardFeed.message, rewardDelta.rewardFeed.createdAt],
        );
      }
    });
  },

  async getActionStatus(actionId: string) {
    const [actionResult, verificationResult, attestationResult, rewardResult] = await Promise.all([
      query("SELECT * FROM actions WHERE id = $1", [actionId]),
      query("SELECT * FROM verifications WHERE action_id = $1", [actionId]),
      query("SELECT * FROM attestations WHERE action_id = $1", [actionId]),
      query("SELECT * FROM rewards WHERE action_id = $1", [actionId]),
    ]);

    return {
      action: actionResult.rowCount ? mapAction(actionResult.rows[0]) : null,
      verification: verificationResult.rowCount ? mapVerification(verificationResult.rows[0]) : null,
      attestation: attestationResult.rowCount ? mapAttestation(attestationResult.rows[0]) : null,
      reward: rewardResult.rowCount ? mapReward(rewardResult.rows[0]) : null,
    };
  },

  async getLeaderboard() {
    const result = await query(
      `SELECT id, username, wallet_address, total_rewards, actions_submitted
       FROM users
       ORDER BY total_rewards DESC, actions_submitted DESC, created_at ASC`,
    );

    return result.rows.map((row) => ({
      id: String(row.id),
      username: String(row.username),
      walletAddress: String(row.wallet_address),
      totalRewards: Number(row.total_rewards),
      actionsSubmitted: Number(row.actions_submitted),
    }));
  },

  async getFeed(limit = 25) {
    const result = await query(
      "SELECT * FROM feed_items ORDER BY created_at DESC LIMIT $1",
      [limit],
    );
    return result.rows.map(mapFeedItem);
  },

  async getRecentVerifications(limit = 25) {
    const result = await query(
      `SELECT v.*, a.action_type
       FROM verifications v
       INNER JOIN actions a ON a.id = v.action_id
       ORDER BY v.verified_at DESC
       LIMIT $1`,
      [limit],
    );

    return result.rows.map((row) => ({
      id: String(row.action_id),
      type: String(row.action_type),
      result: String(row.result),
      score: Number(row.confidence),
      verifiedAt: new Date(String(row.verified_at)).toISOString(),
    }));
  },

  async getUserProfile(userId: string) {
    const [userResult, actionsResult, rewardsResult] = await Promise.all([
      query("SELECT * FROM users WHERE id = $1", [userId]),
      query("SELECT * FROM actions WHERE user_id = $1 ORDER BY submitted_at DESC", [userId]),
      query("SELECT * FROM rewards WHERE user_id = $1 ORDER BY created_at DESC", [userId]),
    ]);

    return {
      user: userResult.rowCount ? mapUser(userResult.rows[0]) : null,
      actions: actionsResult.rows.map(mapAction),
      rewards: rewardsResult.rows.map(mapReward),
    };
  },

  async getVerificationChecksByActionId(actionId: string) {
    const result = await query(
      `SELECT vc.*
       FROM verification_checks vc
       INNER JOIN verifications v ON v.id = vc.verification_id
       WHERE v.action_id = $1
       ORDER BY vc.created_at ASC`,
      [actionId],
    );

    return result.rows.map(mapVerificationCheck);
  },
};
