import { createHash } from "node:crypto";
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenSupplyType,
  TokenType,
  TokenId,
  TopicCreateTransaction,
  TopicId,
  TopicMessageSubmitTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";
import { env } from "../lib/env.js";
import { HttpError } from "../lib/http-error.js";

export class HederaService {
  private client: Client | null = null;
  private topicId: TopicId | null = null;
  private rewardTokenId: TokenId | null = null;

  createProofHash(input: string) {
    return createHash("sha256").update(input).digest("hex");
  }

  async recordAttestation(actionId: string, proofHash: string) {
    const client = await this.getClient();
    const topicId = await this.getTopicId(client);
    const response = await new TopicMessageSubmitTransaction({
      topicId,
      message: JSON.stringify({ actionId, proofHash }),
    }).execute(client);
    const receipt = await response.getReceipt(client);

    return {
      topicId: topicId.toString(),
      messageId: `${topicId.toString()}@${receipt.topicSequenceNumber?.toString() ?? "0"}`,
      txId: response.transactionId.toString(),
      proofHash,
      actionId,
    };
  }

  async issueReward(actionId: string, userId: string, tokenAmount: number) {
    const client = await this.getClient();
    const tokenId = await this.getRewardTokenId(client);
    const operator = client.operatorAccountId;
    if (!operator) {
      throw new HttpError(500, "Hedera operator account is not configured");
    }

    const response = await new TransferTransaction()
      .addTokenTransfer(tokenId, operator, -tokenAmount)
      .addTokenTransfer(tokenId, userId, tokenAmount)
      .execute(client);

    return {
      actionId,
      userId,
      tokenAmount,
      txId: response.transactionId.toString(),
    };
  }

  private async getClient() {
    if (this.client) {
      return this.client;
    }

    if (!env.HEDERA_ACCOUNT_ID || !env.HEDERA_PRIVATE_KEY) {
      throw new HttpError(500, "Hedera credentials are not configured");
    }

    const client = env.HEDERA_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    client.setOperator(env.HEDERA_ACCOUNT_ID, PrivateKey.fromStringED25519(env.HEDERA_PRIVATE_KEY));
    this.client = client;
    return client;
  }

  private async getTopicId(client: Client) {
    if (this.topicId) {
      return this.topicId;
    }

    if (env.HEDERA_TOPIC_ID) {
      this.topicId = TopicId.fromString(env.HEDERA_TOPIC_ID);
      return this.topicId;
    }

    const response = await new TopicCreateTransaction().setTopicMemo("In-Vert sustainability attestations").execute(client);
    const receipt = await response.getReceipt(client);
    if (!receipt.topicId) {
      throw new HttpError(500, "Failed to create Hedera topic");
    }

    this.topicId = receipt.topicId;
    return this.topicId;
  }

  private async getRewardTokenId(client: Client) {
    if (this.rewardTokenId) {
      return this.rewardTokenId;
    }

    if (env.HEDERA_REWARD_TOKEN_ID) {
      this.rewardTokenId = TokenId.fromString(env.HEDERA_REWARD_TOKEN_ID);
      return this.rewardTokenId;
    }

    if (!env.HEDERA_PRIVATE_KEY) {
      throw new HttpError(500, "Hedera private key is required to create reward token");
    }

    const supplyKey = PrivateKey.fromStringED25519(env.HEDERA_PRIVATE_KEY);
    const response = await new TokenCreateTransaction()
      .setTokenName(env.HEDERA_TOKEN_NAME)
      .setTokenSymbol(env.HEDERA_TOKEN_SYMBOL)
      .setDecimals(env.HEDERA_TOKEN_DECIMALS)
      .setInitialSupply(env.HEDERA_TOKEN_INITIAL_SUPPLY)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTokenType(TokenType.FungibleCommon)
      .setTreasuryAccountId(client.operatorAccountId!)
      .setSupplyKey(supplyKey)
      .setAdminKey(supplyKey.publicKey)
      .execute(client);
    const receipt = await response.getReceipt(client);
    if (!receipt.tokenId) {
      throw new HttpError(500, "Failed to create Hedera reward token");
    }

    this.rewardTokenId = receipt.tokenId;
    return this.rewardTokenId;
  }
}

export const hederaService = new HederaService();
