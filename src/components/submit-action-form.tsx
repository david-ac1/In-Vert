"use client";

import { useRef, useState } from "react";
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
  const [evidenceMode, setEvidenceMode] = useState<"url" | "file">("url");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ActionStatusResponse | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const hederaNetwork =
    process.env.NEXT_PUBLIC_HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet";
  const hasCompletedVerification = Boolean(status?.verification);
  const hasReward = Boolean(status?.reward);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadProgress("idle");
    setUploadPreview(URL.createObjectURL(file));
    setPhotoUrl(""); // will be populated on submit
  }

  async function resolveEvidenceUrl(): Promise<string> {
    if (evidenceMode === "url") {
      if (!photoUrl) throw new Error("Please enter an evidence URL");
      return photoUrl;
    }
    if (!uploadedFile) throw new Error("Please select an evidence file");
    setUploadProgress("uploading");
    try {
      const { url } = await api.uploadEvidence(uploadedFile);
      setUploadProgress("done");
      return url;
    } catch (uploadError) {
      setUploadProgress("error");
      throw uploadError;
    }
  }

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

  function getTxUrl(txId: string) {
    return `https://hashscan.io/${hederaNetwork}/transaction/${encodeURIComponent(txId)}`;
  }

  function getTopicUrl(topicId: string) {
    return `https://hashscan.io/${hederaNetwork}/topic/${encodeURIComponent(topicId)}`;
  }

  function resetFormForNextSubmission() {
    setSelectedVector(vectors[0]);
    setQuantity(1);
    setDescription("");
    setLocation("Lagos");
    setEvidenceMode("url");
    setPhotoUrl("");
    setUploadedFile(null);
    setUploadPreview(null);
    setUploadProgress("idle");
    setError(null);
    setStatus(null);
    setActionId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      const resolvedUrl = await resolveEvidenceUrl();
      const result = await api.createAction({
        actionType: selectedVector.value,
        description,
        quantity,
        location,
        photoUrl: resolvedUrl,
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

            {/* Mode toggle */}
            <div className="mb-4 flex border-2 border-black">
              <button
                type="button"
                onClick={() => setEvidenceMode("url")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all ${evidenceMode === "url" ? "bg-black text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Enter URL
              </button>
              <button
                type="button"
                onClick={() => setEvidenceMode("file")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all ${evidenceMode === "file" ? "bg-black text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Upload File
              </button>
            </div>

            {evidenceMode === "url" ? (
              <div className="border-2 border-dashed border-zinc-300 p-6 transition-all hover:border-black hover:bg-zinc-50">
                <input
                  className="h-12 w-full border-2 border-black px-4 text-sm font-bold placeholder:text-zinc-300 focus:outline-none"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  required={evidenceMode === "url"}
                />
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                className="flex cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-300 p-12 text-center transition-all hover:border-black hover:bg-zinc-50"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                {uploadPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={uploadPreview} alt="Evidence preview" className="max-h-40 border-2 border-black object-contain" />
                ) : (
                  <span className="text-sm font-black uppercase tracking-widest text-zinc-500">
                    {uploadProgress === "uploading" ? "Uploading..." : "Click to select image"}
                  </span>
                )}
                {uploadedFile && (
                  <span className="text-xs font-bold text-zinc-600">{uploadedFile.name}</span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <button
              disabled={submitting || hasCompletedVerification}
              className="flex w-full items-center justify-center gap-4 border-2 border-black bg-primary py-5 text-xl font-black uppercase tracking-widest text-white shadow-[6px_6px_0_0_#000] transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Processing Submission" : "Transmit Submission"}
            </button>
            {hasCompletedVerification ? (
              <button
                type="button"
                onClick={resetFormForNextSubmission}
                className="w-full border-2 border-black bg-white py-3 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-50"
              >
                Submit Another Action
              </button>
            ) : null}
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
              {status.attestation ? (
                <p>
                  HCS Tx: <a className="underline" href={getTxUrl(status.attestation.txId)} target="_blank" rel="noreferrer">{status.attestation.txId}</a>
                </p>
              ) : null}
              {status.attestation ? (
                <p>
                  Topic: <a className="underline" href={getTopicUrl(status.attestation.topicId)} target="_blank" rel="noreferrer">{status.attestation.topicId}</a>
                </p>
              ) : null}
              {status.reward ? (
                <p>
                  HTS Reward: {status.reward.tokenAmount} IVRT (
                  <a className="underline" href={getTxUrl(status.reward.txId)} target="_blank" rel="noreferrer">{status.reward.txId}</a>
                  )
                </p>
              ) : null}
              {actionId ? (
                <p>
                  Receipt: <a className="underline" href={`/attestations?actionId=${encodeURIComponent(actionId)}`}>Open protocol receipt</a>
                </p>
              ) : null}
            </div>
          ) : null}
          {hasReward ? (
            <div className="mt-5 border-2 border-emerald-700 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              Reward delivered successfully. This action is completed and cannot be re-submitted in the duplicate-protection window.
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}
