import { createHash } from "node:crypto";
import { env } from "../lib/env.js";
import { createId } from "../lib/ids.js";

export class HederaService {
  createProofHash(input: string) {
    return createHash("sha256").update(input).digest("hex");
  }

  async recordAttestation(actionId: string, proofHash: string) {
    return {
      topicId: env.HEDERA_TOPIC_ID ?? "mock-topic-id",
      messageId: createId("msg"),
      txId: createId("hcs"),
      proofHash,
      actionId,
    };
  }

  async issueReward(actionId: string, userId: string, tokenAmount: number) {
    return {
      actionId,
      userId,
      tokenAmount,
      txId: createId("hts"),
    };
  }
}

export const hederaService = new HederaService();
