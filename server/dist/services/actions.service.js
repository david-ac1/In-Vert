import { store } from "../data/store.js";
import { HttpError } from "../lib/http-error.js";
import { createId } from "../lib/ids.js";
import { hederaService } from "./hedera.service.js";
import { verificationService } from "./verification.service.js";
class ActionsService {
    createAction(input) {
        const user = this.findOrCreateUser(input.walletAddress, input.username);
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
        store.actions.set(action.id, action);
        user.actionsSubmitted += 1;
        store.users.set(user.id, user);
        store.feed.unshift({
            id: createId("feed"),
            type: "verification",
            message: `${user.username} submitted ${action.actionType}`,
            createdAt: now,
        });
        return action;
    }
    async processVerification(actionId) {
        const action = this.getAction(actionId);
        const result = verificationService.verify(action);
        const now = new Date().toISOString();
        action.status = result.result;
        action.updatedAt = now;
        store.actions.set(action.id, action);
        const verification = {
            id: createId("ver"),
            actionId: action.id,
            agentId: "rule-engine-v1",
            result: result.result,
            confidence: result.confidence,
            reasonCodes: result.reasonCodes,
            verifiedAt: now,
        };
        store.verifications.set(action.id, verification);
        const user = this.getUser(action.userId);
        store.feed.unshift({
            id: createId("feed"),
            type: "verification",
            message: `${user.username} action ${action.id} ${result.result}`,
            createdAt: now,
        });
        if (result.result === "approved") {
            const proofHash = hederaService.createProofHash(JSON.stringify({
                actionId: action.id,
                userId: action.userId,
                actionType: action.actionType,
                quantity: action.quantity,
                verifiedAt: now,
            }));
            const attestationResult = await hederaService.recordAttestation(action.id, proofHash);
            const rewardAmount = this.calculateReward(action.actionType, action.quantity);
            const rewardResult = await hederaService.issueReward(action.id, user.id, rewardAmount);
            const attestation = {
                id: createId("att"),
                actionId: action.id,
                topicId: attestationResult.topicId,
                messageId: attestationResult.messageId,
                txId: attestationResult.txId,
                proofHash,
                createdAt: now,
            };
            store.attestations.set(action.id, attestation);
            const reward = {
                id: createId("rew"),
                actionId: action.id,
                userId: user.id,
                tokenAmount: rewardResult.tokenAmount,
                txId: rewardResult.txId,
                createdAt: now,
            };
            store.rewards.set(action.id, reward);
            user.totalRewards += rewardAmount;
            store.users.set(user.id, user);
            store.feed.unshift({
                id: createId("feed"),
                type: "reward",
                message: `${user.username} earned ${rewardAmount} IVRT for ${action.actionType}`,
                createdAt: now,
            });
        }
        return this.getActionStatus(actionId);
    }
    getActionStatus(actionId) {
        const action = this.getAction(actionId);
        return {
            action,
            verification: store.verifications.get(actionId) ?? null,
            attestation: store.attestations.get(actionId) ?? null,
            reward: store.rewards.get(actionId) ?? null,
        };
    }
    getLeaderboard() {
        return [...store.users.values()]
            .sort((left, right) => right.totalRewards - left.totalRewards)
            .map((user) => ({
            id: user.id,
            username: user.username,
            walletAddress: user.walletAddress,
            totalRewards: user.totalRewards,
            actionsSubmitted: user.actionsSubmitted,
        }));
    }
    getFeed() {
        return store.feed.slice(0, 25);
    }
    getUserProfile(userId) {
        const user = this.getUser(userId);
        const actions = [...store.actions.values()].filter((action) => action.userId === userId);
        const rewards = [...store.rewards.values()].filter((reward) => reward.userId === userId);
        return {
            user,
            actions,
            rewards,
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
    findOrCreateUser(walletAddress, username) {
        const existingUser = [...store.users.values()].find((user) => user.walletAddress === walletAddress);
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
        store.users.set(user.id, user);
        return user;
    }
    getAction(actionId) {
        const action = store.actions.get(actionId);
        if (!action) {
            throw new HttpError(404, `Action ${actionId} not found`);
        }
        return action;
    }
    getUser(userId) {
        const user = store.users.get(userId);
        if (!user) {
            throw new HttpError(404, `User ${userId} not found`);
        }
        return user;
    }
}
export const actionsService = new ActionsService();
