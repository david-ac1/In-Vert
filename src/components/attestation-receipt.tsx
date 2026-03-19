"use client";

import { useMemo, useState } from "react";
import { api, type ProtocolAttestationResponse } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export function AttestationReceipt({ initialActionId = "" }: { initialActionId?: string }) {
  const [actionId, setActionId] = useState(initialActionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ProtocolAttestationResponse | null>(null);

  const hashscanBase = useMemo(() => {
    const network = receipt?.onChain.network === "mainnet" ? "mainnet" : "testnet";
    return `https://hashscan.io/${network}`;
  }, [receipt]);

  async function handleFetch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const next = await api.getProtocolAttestation(actionId.trim());
      setReceipt(next);
    } catch (fetchError) {
      setReceipt(null);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load attestation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full border-2 border-black bg-white p-6 shadow-[10px_10px_0_0_#000] md:p-8">
      <h2 className="text-xl font-black uppercase tracking-[0.15em]">Protocol Attestation Receipt</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Load any action by ID to view its full Proof-of-Sustainability envelope: verifier checks,
        proof hash, and on-chain references.
      </p>

      <form onSubmit={handleFetch} className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          type="text"
          value={actionId}
          onChange={(event) => setActionId(event.target.value)}
          className="h-12 border-2 border-black px-4 text-sm font-bold focus:outline-none"
          placeholder="Enter action ID e.g. act_abc123..."
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 border-2 border-black bg-black px-6 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Loading" : "Fetch Receipt"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 border-2 border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      ) : null}

      {receipt ? (
        <div className="mt-8 space-y-5 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-2 border-black p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Schema</p>
              <p className="mt-2 font-bold">{receipt.schemaVersion}</p>
              <p className="mt-2 text-xs text-zinc-500">Generated: {formatDate(receipt.generatedAt)}</p>
            </div>
            <div className="border-2 border-black p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Action</p>
              <p className="mt-2 font-bold">{receipt.action.id}</p>
              <p className="mt-1">{receipt.action.type} · qty {receipt.action.quantity}</p>
              <p className="mt-1">Status: <span className="font-black uppercase">{receipt.action.status}</span></p>
            </div>
          </div>

          <div className="border-2 border-black p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Contributor</p>
            <p className="mt-2 font-bold">{receipt.contributor.username}</p>
            <p className="mt-1 text-zinc-700">Wallet: {receipt.contributor.walletAddress}</p>
          </div>

          <div className="border-2 border-black p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Verification Checks</p>
            {receipt.verification ? (
              <>
                <p className="mt-2 font-bold uppercase">
                  {receipt.verification.result} ({receipt.verification.confidence}%)
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {receipt.verification.checks.map((check) => (
                    <div key={check.name} className="border border-zinc-300 p-3">
                      <p className="text-xs font-black uppercase tracking-widest">{check.name.replaceAll("_", " ")}</p>
                      <p className="mt-1 font-bold">{check.passed ? "PASS" : "FAIL"} · score {check.score}</p>
                      <p className="mt-1 text-xs text-zinc-600">{check.detail}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 font-bold text-zinc-600">Verification pending</p>
            )}
          </div>

          <div className="border-2 border-black p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Proof</p>
            <p className="mt-2 font-bold">{receipt.proof.hashAlgorithm.toUpperCase()}</p>
            <p className="mt-1 break-all text-xs text-zinc-700">{receipt.proof.proofHash ?? "Not available yet"}</p>
          </div>

          <div className="border-2 border-black p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">On-Chain References</p>
            <div className="mt-2 space-y-2">
              <p>Network: <span className="font-bold">{receipt.onChain.network}</span></p>
              {receipt.onChain.topicId ? (
                <p>
                  Topic: <a className="underline" href={`${hashscanBase}/topic/${encodeURIComponent(receipt.onChain.topicId)}`} target="_blank" rel="noreferrer">{receipt.onChain.topicId}</a>
                </p>
              ) : null}
              {receipt.onChain.hcsTxId ? (
                <p>
                  HCS Tx: <a className="underline" href={`${hashscanBase}/transaction/${encodeURIComponent(receipt.onChain.hcsTxId)}`} target="_blank" rel="noreferrer">{receipt.onChain.hcsTxId}</a>
                </p>
              ) : null}
              {receipt.onChain.htsRewardTxId ? (
                <p>
                  HTS Tx: <a className="underline" href={`${hashscanBase}/transaction/${encodeURIComponent(receipt.onChain.htsRewardTxId)}`} target="_blank" rel="noreferrer">{receipt.onChain.htsRewardTxId}</a>
                </p>
              ) : null}
              {receipt.onChain.hscsContractId ? (
                <p>
                  HSCS Contract: <a className="underline" href={`${hashscanBase}/contract/${encodeURIComponent(receipt.onChain.hscsContractId)}`} target="_blank" rel="noreferrer">{receipt.onChain.hscsContractId}</a>
                </p>
              ) : null}
              {receipt.onChain.hscsRegistrationTxId ? (
                <p>
                  Registry Tx: <a className="underline" href={`${hashscanBase}/transaction/${encodeURIComponent(receipt.onChain.hscsRegistrationTxId)}`} target="_blank" rel="noreferrer">{receipt.onChain.hscsRegistrationTxId}</a>
                </p>
              ) : null}
            </div>
          </div>

          {receipt.reward ? (
            <div className="border-2 border-emerald-700 bg-emerald-50 p-4 font-bold text-emerald-900">
              Reward Issued: {receipt.reward.amount} IVRT · {formatDate(receipt.reward.createdAt)}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
