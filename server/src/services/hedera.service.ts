import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import {
  Client,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Hbar,
  PrivateKey,
  Transaction,
  TokenCreateTransaction,
  TokenSupplyType,
  TokenType,
  TokenId,
  TopicCreateTransaction,
  TopicId,
  TopicMessageSubmitTransaction,
  TransactionResponse,
  TransferTransaction,
} from "@hashgraph/sdk";
import { env } from "../lib/env.js";
import { HttpError } from "../lib/http-error.js";
import { awsKmsService } from "./aws-kms.service.js";

export class HederaService {
  private client: Client | null = null;
  private topicId: TopicId | null = null;
  private rewardTokenId: TokenId | null = null;
  private contractId: ContractId | null = null;

  createProofHash(input: string) {
    return createHash("sha256").update(input).digest("hex");
  }

  async recordAttestation(actionId: string, proofHash: string) {
    const client = await this.getClient();
    const topicId = await this.getTopicId(client);
    const tx = new TopicMessageSubmitTransaction({
      topicId,
      message: JSON.stringify({ actionId, proofHash }),
    });
    tx.setMaxTransactionFee(new Hbar(1));
    const response = await this.executeTransaction(tx, client);
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

    const tx = new TransferTransaction()
      .addTokenTransfer(tokenId, operator, -tokenAmount)
      .addTokenTransfer(tokenId, userId, tokenAmount);
    const response = await this.executeTransaction(tx, client);

    return {
      actionId,
      userId,
      tokenAmount,
      txId: response.transactionId.toString(),
    };
  }

  private async getClient() {
    if (this.client) return this.client;
    if (!env.HEDERA_ACCOUNT_ID) {
      throw new HttpError(500, "HEDERA_ACCOUNT_ID is not configured");
    }
    const client = env.HEDERA_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    if (awsKmsService.isConfigured() && env.AWS_KMS_KEY_ID) {
      const { hederaPublicKey } = await awsKmsService.getSigner(env.AWS_KMS_KEY_ID);
      client.setOperatorWith(env.HEDERA_ACCOUNT_ID, hederaPublicKey, async (bytes) => {
        const { sign } = await awsKmsService.getSigner(env.AWS_KMS_KEY_ID!);
        return sign(bytes);
      });
    } else {
      if (!env.HEDERA_PRIVATE_KEY) {
        throw new HttpError(500, "HEDERA_PRIVATE_KEY (or AWS_KMS_KEY_ID) is not configured");
      }
      client.setOperator(env.HEDERA_ACCOUNT_ID, PrivateKey.fromString(env.HEDERA_PRIVATE_KEY));
    }
    this.client = client;
    return client;
  }

  /**
   * Execute a Hedera transaction. When AWS KMS is configured the transaction is
   * frozen, signed via KMS (key never leaves the HSM), then submitted. Otherwise
   * falls back to the standard operator private-key signing path.
   */
  private async executeTransaction(tx: Transaction, client: Client): Promise<TransactionResponse> {
    if (awsKmsService.isConfigured() && env.AWS_KMS_KEY_ID) {
      const { hederaPublicKey, sign } = await awsKmsService.getSigner(env.AWS_KMS_KEY_ID);
      await tx.freezeWith(client);
      await tx.signWith(hederaPublicKey, sign);
      return tx.execute(client);
    }
    return tx.execute(client);
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
    const supplyKey =
      !awsKmsService.isConfigured() && env.HEDERA_PRIVATE_KEY
        ? PrivateKey.fromString(env.HEDERA_PRIVATE_KEY)
        : null;
    if (!supplyKey && !awsKmsService.isConfigured()) {
      throw new HttpError(500, "Hedera private key (or AWS KMS) is required to create reward token");
    }
    const tokenTx = new TokenCreateTransaction()
      .setTokenName(env.HEDERA_TOKEN_NAME)
      .setTokenSymbol(env.HEDERA_TOKEN_SYMBOL)
      .setDecimals(env.HEDERA_TOKEN_DECIMALS)
      .setInitialSupply(env.HEDERA_TOKEN_INITIAL_SUPPLY)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTokenType(TokenType.FungibleCommon)
      .setTreasuryAccountId(client.operatorAccountId!);
    if (supplyKey) {
      tokenTx.setSupplyKey(supplyKey).setAdminKey(supplyKey.publicKey);
    } else {
      const { hederaPublicKey } = await awsKmsService.getSigner(env.AWS_KMS_KEY_ID!);
      tokenTx.setSupplyKey(hederaPublicKey).setAdminKey(hederaPublicKey);
    }
    const response = await this.executeTransaction(tokenTx, client);
    const receipt = await response.getReceipt(client);
    if (!receipt.tokenId) {
      throw new HttpError(500, "Failed to create Hedera reward token");
    }

    this.rewardTokenId = receipt.tokenId;
    return this.rewardTokenId;
  }

  /**
   * Register the proof hash on the SustainabilityRegistry smart contract (HSCS).
   * Falls back gracefully when HEDERA_CONTRACT_ID is not yet configured.
   */
  async registerAttestationOnChain(
    actionId: string,
    proofHash: string,
  ): Promise<{ contractId: string; txId: string } | null> {
    const contractId = await this.getContractId();
    if (!contractId) {
      return null; // contract not yet deployed — non-fatal
    }

    const client = await this.getClient();
    const proofHashBytes = Buffer.from(proofHash, "hex");

    const response = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300_000)
      .setMaxTransactionFee(new Hbar(2))
      .setFunction(
        "registerAttestation",
        new ContractFunctionParameters().addString(actionId).addBytes32(proofHashBytes),
      )
      .execute(client);

    await response.getReceipt(client); // confirm success

    return {
      contractId: contractId.toString(),
      txId: response.transactionId.toString(),
    };
  }

  /**
   * Read back an attestation from the smart contract (useful for verification/explorer).
   */
  async getOnChainAttestation(
    actionId: string,
  ): Promise<{ proofHash: string; timestamp: number; exists: boolean } | null> {
    const contractId = await this.getContractId();
    if (!contractId) return null;

    const client = await this.getClient();
    const result = await new ContractCallQuery()
      .setContractId(contractId)
      .setGas(50_000)
      .setFunction(
        "getAttestation",
        new ContractFunctionParameters().addString(actionId),
      )
      .execute(client);

    const exists = result.getBool(2);
    if (!exists) return { proofHash: "", timestamp: 0, exists: false };

    const proofHashRaw = result.getBytes32(0);
    const timestamp = result.getUint256(1);
    return {
      proofHash: Buffer.from(proofHashRaw).toString("hex"),
      timestamp: Number(timestamp),
      exists,
    };
  }

  private async getContractId(): Promise<ContractId | null> {
    if (this.contractId) return this.contractId;
    if (env.HEDERA_CONTRACT_ID) {
      this.contractId = ContractId.fromString(env.HEDERA_CONTRACT_ID);
      return this.contractId;
    }
    return null;
  }
}

export const hederaService = new HederaService();
