import crypto from "node:crypto";
import { query, withTransaction } from "../lib/db.js";
import { HttpError } from "../lib/http-error.js";
import { createId } from "../lib/ids.js";
function mapPool(row) {
    return {
        id: String(row.id),
        title: String(row.title),
        status: String(row.status),
        totalActions: Number(row.total_actions),
        totalQuantity: Number(row.total_quantity),
        avgConfidence: Number(row.avg_confidence),
        geoCount: Number(row.geo_count),
        poolHash: String(row.pool_hash),
        createdAt: new Date(String(row.created_at)).toISOString(),
    };
}
class ImpactPoolsService {
    async createPool(input) {
        const targetActions = Math.min(Math.max(input?.targetActions ?? 3, 1), 1000);
        const candidates = await query(`SELECT a.id, a.quantity, a.location, v.confidence
       FROM actions a
       INNER JOIN verifications v ON v.action_id = a.id AND v.result = 'approved'
       LEFT JOIN impact_pool_actions ipa ON ipa.action_id = a.id
       WHERE ipa.action_id IS NULL
       ORDER BY v.verified_at ASC
       LIMIT $1`, [targetActions]);
        if (!candidates.rowCount) {
            throw new HttpError(400, "No approved actions are available to pool yet");
        }
        const actionIds = candidates.rows.map((row) => row.id);
        const totalQuantity = candidates.rows.reduce((sum, row) => sum + Number(row.quantity), 0);
        const avgConfidence = Math.round(candidates.rows.reduce((sum, row) => sum + Number(row.confidence), 0) / candidates.rows.length);
        const geoCount = new Set(candidates.rows.map((row) => String(row.location).trim().toLowerCase())).size;
        const createdAt = new Date().toISOString();
        const payloadForHash = JSON.stringify({
            actionIds,
            totalActions: actionIds.length,
            totalQuantity,
            avgConfidence,
            geoCount,
            createdAt,
        });
        const poolHash = crypto.createHash("sha256").update(payloadForHash).digest("hex");
        const poolId = createId("pool");
        const title = input?.title?.trim() || `Impact Pool ${new Date().toISOString().slice(0, 10)}`;
        await withTransaction(async (client) => {
            await client.query(`INSERT INTO impact_pools (
           id, title, status, total_actions, total_quantity, avg_confidence, geo_count, pool_hash, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [poolId, title, "ready", actionIds.length, totalQuantity, avgConfidence, geoCount, poolHash, createdAt]);
            for (const actionId of actionIds) {
                await client.query(`INSERT INTO impact_pool_actions (pool_id, action_id, created_at)
           VALUES ($1, $2, NOW())`, [poolId, actionId]);
            }
        });
        return this.getPoolById(poolId);
    }
    async listPools() {
        const result = await query(`SELECT *
       FROM impact_pools
       ORDER BY created_at DESC
       LIMIT 50`);
        return result.rows.map((row) => mapPool(row));
    }
    async getPoolById(poolId) {
        const [poolResult, actionIdsResult] = await Promise.all([
            query("SELECT * FROM impact_pools WHERE id = $1", [poolId]),
            query(`SELECT action_id
         FROM impact_pool_actions
         WHERE pool_id = $1
         ORDER BY created_at ASC`, [poolId]),
        ]);
        if (!poolResult.rowCount) {
            throw new HttpError(404, `Impact pool ${poolId} not found`);
        }
        const pool = mapPool(poolResult.rows[0]);
        return {
            ...pool,
            actionIds: actionIdsResult.rows.map((row) => String(row.action_id)),
        };
    }
    async exportPoolProof(poolId) {
        const pool = await this.getPoolById(poolId);
        return {
            schemaVersion: "impact-pool.v1",
            exportedAt: new Date().toISOString(),
            pool,
            composability: {
                suggestedUseCases: [
                    "NGO sponsorship packet",
                    "Corporate community impact proof",
                    "Carbon-linked methodology input",
                ],
                verificationPrimitive: "sha256_pool_hash",
            },
        };
    }
}
export const impactPoolsService = new ImpactPoolsService();
