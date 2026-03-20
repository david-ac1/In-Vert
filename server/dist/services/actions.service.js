import { HttpError } from "../lib/http-error.js";
import { createId } from "../lib/ids.js";
import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import { actionsRepository } from "../repositories/actions.repository.js";
import { hederaService } from "./hedera.service.js";
import { verificationService } from "./verification.service.js";
class ActionsService {
    async createAction(input) {
        const duplicate = await actionsRepository.findRecentDuplicateAction({
            walletAddress: input.walletAddress,
            actionType: input.actionType,
            description: input.description,
            quantity: input.quantity,
            location: input.location,
            photoUrl: input.photoUrl,
            lookbackHours: 24,
        });
        if (duplicate) {
            throw new HttpError(409, "Duplicate submission detected. This report was already submitted recently.", {
                existingActionId: duplicate.id,
                cooldownHours: 24,
            });
        }
        const user = await this.findOrCreateUser(input.walletAddress, input.username);
        const now = new Date().toISOString();
        const action = {
            id: createId("act"),
            userId: user.id,
            actionType: input.actionType,
            description: input.description,
            quantity: input.quantity,
            location: input.location,
            photoUrl: input.photoUrl,
            status: "queued",
            submittedAt: now,
            updatedAt: now,
        };
        const feedItem = {
            id: createId("feed"),
            type: "verification",
            message: `${user.username} submitted ${action.actionType}`,
            createdAt: now,
        };
        return actionsRepository.createQueuedAction(user, action, feedItem);
    }
    async processVerification(actionId) {
        const claimedAction = await actionsRepository.claimQueuedAction(actionId);
        if (!claimedAction) {
            return this.getActionStatus(actionId);
        }
        const action = claimedAction;
        try {
            const result = await verificationService.verify(action);
            const now = new Date().toISOString();
            await actionsRepository.upsertActionMediaSignals(result.mediaSignals);
            const verification = {
                id: createId("ver"),
                actionId: action.id,
                agentId: "rule-engine-v1",
                result: result.result,
                confidence: result.confidence,
                reasonCodes: result.reasonCodes,
                verifiedAt: now,
            };
            const verificationChecks = result.checks.map((check) => ({
                id: createId("chk"),
                verificationId: verification.id,
                checkName: check.name,
                passed: check.passed,
                score: check.score,
                detail: check.detail,
                createdAt: now,
            }));
            const user = await this.getUser(action.userId);
            const verificationFeed = {
                id: createId("feed"),
                type: "verification",
                message: `${user.username} action ${action.id} ${result.result}`,
                createdAt: now,
            };
            let rewardDelta;
            if (result.result === "approved") {
                const proofHash = hederaService.createProofHash(JSON.stringify({
                    actionId: action.id,
                    userId: action.userId,
                    actionType: action.actionType,
                    quantity: action.quantity,
                    verifiedAt: now,
                }));
                try {
                    const attestationResult = await hederaService.recordAttestation(action.id, proofHash);
                    const contractResult = await hederaService.registerAttestationOnChain(action.id, proofHash);
                    const rewardAmount = this.calculateReward(action.actionType, action.quantity);
                    const rewardResult = await hederaService.issueReward(action.id, user.walletAddress, rewardAmount);
                    const attestation = {
                        id: createId("att"),
                        actionId: action.id,
                        topicId: attestationResult.topicId,
                        messageId: attestationResult.messageId,
                        txId: attestationResult.txId,
                        proofHash,
                        contractTxId: contractResult?.txId,
                        createdAt: now,
                    };
                    const reward = {
                        id: createId("rew"),
                        actionId: action.id,
                        userId: user.id,
                        tokenAmount: rewardResult.tokenAmount,
                        txId: rewardResult.txId,
                        createdAt: now,
                    };
                    rewardDelta = {
                        attestation,
                        reward,
                        rewardFeed: {
                            id: createId("feed"),
                            type: "reward",
                            message: `${user.username} earned ${rewardAmount} IVRT for ${action.actionType}`,
                            createdAt: now,
                        },
                        rewardAmount,
                        userId: user.id,
                    };
                }
                catch (chainError) {
                    const chainErrorMessage = chainError instanceof Error ? chainError.message : String(chainError);
                    verificationChecks.push({
                        id: createId("chk"),
                        verificationId: verification.id,
                        checkName: "onchain_anchor",
                        passed: false,
                        score: 40,
                        detail: `Approved, but on-chain anchoring deferred: ${chainErrorMessage}`,
                        createdAt: now,
                    });
                    logger.warn("On-chain anchoring failed; keeping action approved", {
                        actionId,
                        error: chainErrorMessage,
                    });
                }
            }
            await actionsRepository.persistVerificationOutcome(actionId, result.result, verification, verificationFeed, verificationChecks, rewardDelta);
            return this.getActionStatus(actionId);
        }
        catch (error) {
            const now = new Date().toISOString();
            const errorMessage = error instanceof Error ? error.message : String(error);
            const user = await this.getUser(action.userId);
            const verification = {
                id: createId("ver"),
                actionId: action.id,
                agentId: "rule-engine-v1",
                result: "rejected",
                confidence: 0,
                reasonCodes: ["PROCESSING_ERROR"],
                verifiedAt: now,
            };
            const verificationChecks = [
                {
                    id: createId("chk"),
                    verificationId: verification.id,
                    checkName: "processing_error",
                    passed: false,
                    score: 0,
                    detail: errorMessage,
                    createdAt: now,
                },
            ];
            const verificationFeed = {
                id: createId("feed"),
                type: "verification",
                message: `${user.username} action ${action.id} rejected`,
                createdAt: now,
            };
            await actionsRepository.persistVerificationOutcome(actionId, "rejected", verification, verificationFeed, verificationChecks);
            logger.error("Verification pipeline failed; action marked rejected", {
                actionId,
                error: errorMessage,
            });
            return this.getActionStatus(actionId);
        }
    }
    async getActionStatus(actionId) {
        const status = await actionsRepository.getActionStatus(actionId);
        if (!status.action) {
            throw new HttpError(404, `Action ${actionId} not found`);
        }
        return status;
    }
    async getLeaderboard() {
        return actionsRepository.getLeaderboard();
    }
    async getFeed() {
        return actionsRepository.getFeed();
    }
    async getUserProfile(userId) {
        const profile = await actionsRepository.getUserProfile(userId);
        if (!profile.user) {
            throw new HttpError(404, `User ${userId} not found`);
        }
        return profile;
    }
    async getRecentVerifications() {
        return actionsRepository.getRecentVerifications();
    }
    async getProtocolStats() {
        return actionsRepository.getProtocolStats();
    }
    async getProtocolAttestation(actionId) {
        const status = await this.getActionStatus(actionId);
        if (!status.action) {
            throw new HttpError(404, `Action ${actionId} not found`);
        }
        const user = await this.getUser(status.action.userId);
        const checks = await actionsRepository.getVerificationChecksByActionId(actionId);
        const mediaSignals = await actionsRepository.getActionMediaSignalsByActionId(actionId);
        return {
            schemaVersion: "pos.v1",
            generatedAt: new Date().toISOString(),
            action: {
                id: status.action.id,
                type: status.action.actionType,
                description: status.action.description,
                quantity: status.action.quantity,
                location: status.action.location,
                submittedAt: status.action.submittedAt,
                status: status.action.status,
            },
            contributor: {
                id: user.id,
                username: user.username,
                walletAddress: user.walletAddress,
            },
            verification: status.verification
                ? {
                    id: status.verification.id,
                    agentId: status.verification.agentId,
                    result: status.verification.result,
                    confidence: status.verification.confidence,
                    reasonCodes: status.verification.reasonCodes,
                    verifiedAt: status.verification.verifiedAt,
                    checks: checks.map((check) => ({
                        name: check.checkName,
                        passed: check.passed,
                        score: check.score,
                        detail: check.detail,
                    })),
                }
                : null,
            proof: {
                hashAlgorithm: "sha256",
                proofHash: status.attestation?.proofHash ?? null,
            },
            evidenceAnalysis: mediaSignals
                ? {
                    sourceKind: mediaSignals.sourceKind,
                    imageHash: mediaSignals.imageHash,
                    stockRiskScore: mediaSignals.stockRiskScore,
                    stockSignals: mediaSignals.stockSignals,
                    exif: {
                        latitude: mediaSignals.exifLatitude,
                        longitude: mediaSignals.exifLongitude,
                        capturedAt: mediaSignals.exifCapturedAt,
                    },
                    claimedLocation: {
                        latitude: mediaSignals.claimedLatitude,
                        longitude: mediaSignals.claimedLongitude,
                    },
                    locationDistanceKm: mediaSignals.locationDistanceKm,
                }
                : null,
            onChain: {
                network: env.HEDERA_NETWORK,
                topicId: status.attestation?.topicId ?? null,
                hcsMessageId: status.attestation?.messageId ?? null,
                hcsTxId: status.attestation?.txId ?? null,
                htsRewardTxId: status.reward?.txId ?? null,
                hscsContractId: env.HEDERA_CONTRACT_ID ?? null,
                hscsRegistrationTxId: status.attestation?.contractTxId ?? null,
            },
            reward: status.reward
                ? {
                    amount: status.reward.tokenAmount,
                    txId: status.reward.txId,
                    createdAt: status.reward.createdAt,
                }
                : null,
        };
    }
    calculateReward(actionType, quantity) {
        const normalizedType = actionType.toLowerCase();
        if (normalizedType.includes("tree")) {
            return quantity * 5;
        }
        if (normalizedType.includes("cleanup")) {
            return quantity * 3;
        }
        return quantity * 2;
    }
    async findOrCreateUser(walletAddress, username) {
        const existingUser = await actionsRepository.findUserByWalletAddress(walletAddress);
        if (existingUser) {
            return existingUser;
        }
        const user = {
            id: createId("usr"),
            walletAddress,
            username,
            totalRewards: 0,
            actionsSubmitted: 0,
            createdAt: new Date().toISOString(),
        };
        return actionsRepository.createUser(user);
    }
    async getAction(actionId) {
        const action = await actionsRepository.findActionById(actionId);
        if (!action) {
            throw new HttpError(404, `Action ${actionId} not found`);
        }
        return action;
    }
    async getUser(userId) {
        const user = await actionsRepository.findUserById(userId);
        if (!user) {
            throw new HttpError(404, `User ${userId} not found`);
        }
        return user;
    }
}
export const actionsService = new ActionsService();
