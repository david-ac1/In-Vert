/**
 * Deploy SustainabilityRegistry to Hedera testnet using HSCS.
 * Requires: compiled artifact at contracts/SustainabilityRegistry.json
 *
 * Usage:
 *   cd server
 *   npx tsx scripts/compile-contract.ts   # compile first
 *   npx tsx scripts/deploy-contract.ts    # then deploy
 *
 * After successful deployment, copy the printed HEDERA_CONTRACT_ID
 * into server/.env so the backend can call registerAttestation().
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import dotenv from "dotenv";
import {
  Client,
  ContractCreateFlow,
  ContractCallQuery,
  ContractFunctionParameters,
  PrivateKey,
  Hbar,
} from "@hashgraph/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;
const network = process.env.HEDERA_NETWORK ?? "testnet";

if (!accountId || !privateKey) {
  console.error("❌ HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in server/.env");
  process.exit(1);
}

const artifactPath = path.resolve(__dirname, "../contracts/SustainabilityRegistry.json");
if (!fs.existsSync(artifactPath)) {
  console.error("❌ Artifact not found. Run: npx tsx scripts/compile-contract.ts first");
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8")) as {
  bytecode: string;
  abi: unknown[];
};

const client = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
client.setOperator(accountId, PrivateKey.fromString(privateKey));

console.log(`\n🚀 Deploying SustainabilityRegistry to Hedera ${network}...`);
console.log(`   Operator: ${accountId}`);

const contractCreate = await new ContractCreateFlow()
  .setGas(1_500_000)
  .setBytecode(artifact.bytecode)
  .execute(client);

const receipt = await contractCreate.getReceipt(client);
if (!receipt.contractId) {
  console.error("❌ Deployment failed — no contractId in receipt");
  process.exit(1);
}

const contractId = receipt.contractId.toString();
console.log(`\n✅ SustainabilityRegistry deployed!`);
console.log(`   Contract ID : ${contractId}`);
console.log(`   HashScan    : https://hashscan.io/testnet/contract/${contractId}`);

// Verify: query totalAttestations (should be 0 on fresh deploy)
const query = await new ContractCallQuery()
  .setContractId(receipt.contractId)
  .setGas(50_000)
  .setFunction("totalAttestations", new ContractFunctionParameters())
  .execute(client);

const total = query.getUint256(0);
console.log(`   totalAttestations: ${total.toString()} (sanity check ✓)`);

console.log(`\n📋 Add to server/.env:`);
console.log(`   HEDERA_CONTRACT_ID=${contractId}`);

client.close();
