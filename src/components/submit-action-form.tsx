"use client";

import { useState } from "react";
import { api, type ActionStatusResponse } from "@/lib/api";

const vectors = [
  { label: "Nature", value: "tree_planting" },
  { label: "Circularity", value: "recycling" },
  { label: "Energy", value: "cleanup" },
];

export function SubmitActionForm() {
  const [selectedVector, setSelectedVector] = useState(vectors[0]);
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Lagos");
  const [photoUrl, setPhotoUrl] = useState("https://example.com/evidence.jpg");
  const [walletAddress, setWalletAddress] = useState("0.0.123456");
  const [username, setUsername] = useState("david");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ActionStatusResponse | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const projectedYield =
    selectedVector.value === "tree_planting"
      ? quantity * 5
      : selectedVector.value === "cleanup"
        ? quantity * 3
        : quantity * 2;

  async function pollStatus(createdActionId: string) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const nextStatus = await api.getActionStatus(createdActionId);
      setStatus(nextStatus);
      if (nextStatus.verification) {
        return;
      }
      await new Promise((resolve) => {
        window.setTimeout(resolve, 750);
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      const result = await api.createAction({
        actionType: selectedVector.value,
        description,
        quantity,
        location,
        photoUrl,
        walletAddress,
        username,
      });
      setActionId(result.actionId);
      await pollStatus(result.actionId);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Failed to submit action",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl overflow-hidden border-2 border-black bg-white shadow-[12px_12px_0_0_#000]">
        <div className="p-8 md:p-12">
          <div className="mb-12">
            <label className="mb-6 block text-xs font-black uppercase tracking-[0.25em] text-black">
              01. Select Vector
            </label>
            <div className="grid grid-cols-3 gap-1">
              {vectors.map((vector) => (
                <button
                  key={vector.value}
                  type="button"
                  onClick={() => setSelectedVector(vector)}
                  className={`flex flex-col items-center justify-center gap-4 border-2 border-black p-6 text-xs font-black uppercase tracking-widest transition-all ${
                    selectedVector.value === vector.value
                      ? "bg-primary text-white"
                      : "text-zinc-400 hover:bg-zinc-50 hover:text-black"
                  }`}
                >
                  {vector.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-4 block text-xs font-black uppercase tracking-[0.25em] text-black">
                02. Magnitude
              </label>
              <input
                className="h-14 w-full border-2 border-black px-4 text-center text-xl font-black focus:outline-none"
                type="number"
                value={quantity}
                min={1}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-4 block text-xs font-black uppercase tracking-[0.25em] text-black">
                03. Specification
              </label>
              <input
                className="h-14 w-full border-2 border-black px-4 text-sm font-bold placeholder:text-zinc-300 focus:outline-none"
                placeholder="Brief metadata description..."
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              className="h-14 w-full border-2 border-black px-4 text-sm font-bold focus:outline-none"
              placeholder="Location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
            />
            <input
              className="h-14 w-full border-2 border-black px-4 text-sm font-bold focus:outline-none"
              placeholder="Username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <input
              className="h-14 w-full border-2 border-black px-4 text-sm font-bold focus:outline-none md:col-span-2"
              placeholder="Hedera account ID"
              type="text"
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              required
            />
          </div>

          <div className="mb-14">
            <label className="mb-4 block text-xs font-black uppercase tracking-[0.25em] text-black">
              04. Evidence Protocol
            </label>
            <div className="border-2 border-dashed border-zinc-300 p-12 text-center transition-all hover:border-black hover:bg-zinc-50">
              <span className="text-sm font-black uppercase tracking-widest text-zinc-500">
                Evidence URL
              </span>
              <input
                className="mt-4 h-12 w-full border-2 border-black px-4 text-sm font-bold focus:outline-none"
                type="url"
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            <button
              disabled={submitting}
              className="flex w-full items-center justify-center gap-4 border-2 border-black bg-primary py-5 text-xl font-black uppercase tracking-widest text-white shadow-[6px_6px_0_0_#000] transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Processing Submission" : "Transmit Submission"}
            </button>
            <div className="flex flex-col items-center justify-between gap-4 px-1 md:flex-row">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <div className="border border-zinc-200 px-3 py-2">
                  Gas: <span className="text-black">Testnet estimate</span>
                </div>
                <div className="border border-zinc-200 px-3 py-2">
                  Yield: <span className="text-black">{projectedYield} IVRT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-black bg-zinc-50 p-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="size-2.5 animate-pulse bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
              In-Vert Testnet Node Active
            </span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
            Hedera HCS + HTS pipeline enabled
          </div>
        </div>
      </form>

      {(error || actionId || status) && (
        <section className="mt-8 w-full max-w-2xl border-2 border-black bg-white p-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">Submission Status</h2>
          {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
          {actionId ? <p className="mt-4 text-sm font-bold">Action ID: {actionId}</p> : null}
          {status?.action ? (
            <div className="mt-4 space-y-2 text-sm font-medium">
              <p>Status: <span className="font-black uppercase">{status.action.status}</span></p>
              {status.verification ? <p>Verification: {status.verification.result} ({status.verification.confidence}%)</p> : <p>Verification: pending</p>}
              {status.attestation ? <p>HCS Tx: {status.attestation.txId}</p> : null}
              {status.reward ? <p>HTS Reward: {status.reward.tokenAmount} IVRT ({status.reward.txId})</p> : null}
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}
