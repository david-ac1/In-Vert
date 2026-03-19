-- Migration 003: add optional smart-contract tx reference to attestations
-- Records the Hedera Smart Contract Service (HSCS) transaction that registered
-- each attestation on the SustainabilityRegistry contract.
ALTER TABLE attestations
  ADD COLUMN IF NOT EXISTS contract_tx_id TEXT;
