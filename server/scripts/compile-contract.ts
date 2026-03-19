/**
 * Compile SustainabilityRegistry.sol → contracts/SustainabilityRegistry.json
 *
 * Usage:
 *   cd server
 *   npx tsx scripts/compile-contract.ts
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const solc = require("solc");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsDir = path.resolve(__dirname, "../contracts");
const sourcePath = path.join(contractsDir, "SustainabilityRegistry.sol");
const outputPath = path.join(contractsDir, "SustainabilityRegistry.json");

const source = fs.readFileSync(sourcePath, "utf8");

const input = JSON.stringify({
  language: "Solidity",
  sources: {
    "SustainabilityRegistry.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
      },
    },
  },
});

const output = JSON.parse(solc.compile(input) as string);

if (output.errors) {
  const errors = output.errors.filter((e: { severity: string }) => e.severity === "error");
  if (errors.length > 0) {
    console.error("Compilation errors:");
    for (const err of errors) {
      console.error(err.formattedMessage);
    }
    process.exit(1);
  }
  for (const warn of output.errors) {
    console.warn(warn.formattedMessage);
  }
}

const contract =
  output.contracts["SustainabilityRegistry.sol"]["SustainabilityRegistry"];

const artifact = {
  contractName: "SustainabilityRegistry",
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
  deployedBytecode: contract.evm.deployedBytecode.object,
};

fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2));
console.log(`✅ Compiled → ${outputPath}`);
console.log(`   Bytecode size: ${artifact.bytecode.length / 2} bytes`);
