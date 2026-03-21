export interface LeaderboardContributor {
  id: string;
  username: string;
  walletAddress: string;
  totalRewards: number;
  actionsSubmitted: number;
}

export interface FeedItem {
  id: string;
  type: "verification" | "reward";
  message: string;
  createdAt: string;
}

export interface VerificationQueueItem {
  id: string;
  type: string;
  result: string;
  score: number;
  verifiedAt: string;
}

export interface SustainabilityMuralItem {
  actionId: string;
  photoUrl: string;
  actionType: string;
  location: string;
  username: string;
  status: string;
  verificationResult: string | null;
  submittedAt: string;
}

export interface ActionStatusResponse {
  action: {
    id: string;
    actionType: string;
    status: string;
    submittedAt: string;
    updatedAt: string;
  } | null;
  verification: {
    confidence: number;
    reasonCodes: string[];
    result: string;
  } | null;
  attestation: {
    topicId: string;
    messageId: string;
    txId: string;
    proofHash: string;
  } | null;
  reward: {
    tokenAmount: number;
    txId: string;
  } | null;
}

export interface ProtocolStats {
  totalActions: number;
  totalContributors: number;
  approvedActions: number;
  rejectedActions: number;
  totalRewardsIssued: number;
  totalAttestations: number;
}

export interface ImpactPoolSummary {
  id: string;
  title: string;
  status: string;
  totalActions: number;
  totalQuantity: number;
  avgConfidence: number;
  geoCount: number;
  poolHash: string;
  createdAt: string;
}

export interface ImpactPoolDetail extends ImpactPoolSummary {
  actionIds: string[];
}

export interface ImpactPoolExport {
  schemaVersion: string;
  exportedAt: string;
  pool: ImpactPoolDetail;
  composability: {
    suggestedUseCases: string[];
    verificationPrimitive: string;
  };
}

export interface ProtocolAttestationResponse {
  schemaVersion: string;
  generatedAt: string;
  action: {
    id: string;
    type: string;
    description: string;
    quantity: number;
    location: string;
    submittedAt: string;
    status: string;
  };
  contributor: {
    id: string;
    username: string;
    walletAddress: string;
  };
  verification: {
    id: string;
    agentId: string;
    result: string;
    confidence: number;
    reasonCodes: string[];
    verifiedAt: string;
    checks: Array<{
      name: string;
      passed: boolean;
      score: number;
      detail: string;
    }>;
  } | null;
  proof: {
    hashAlgorithm: string;
    proofHash: string | null;
  };
  onChain: {
    network: string;
    topicId: string | null;
    hcsMessageId: string | null;
    hcsTxId: string | null;
    htsRewardTxId: string | null;
    hscsContractId: string | null;
    hscsRegistrationTxId: string | null;
  };
  reward: {
    amount: number;
    txId: string;
    createdAt: string;
  } | null;
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  getLeaderboard: async () =>
    readJson<{ contributors: LeaderboardContributor[] }>("/api/leaderboard"),
  getFeed: async () => readJson<{ items: FeedItem[] }>("/api/feed"),
  getVerifications: async () =>
    readJson<{ items: VerificationQueueItem[] }>("/api/verifications"),
  getSustainabilityMural: async () =>
    readJson<{ items: SustainabilityMuralItem[] }>("/api/impact/mural"),
  createAction: async (payload: {
    actionType: string;
    description: string;
    quantity: number;
    location: string;
    photoUrl: string;
    walletAddress: string;
    username: string;
  }) =>
    readJson<{ actionId: string; status: string; message: string }>("/api/actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  getActionStatus: async (actionId: string) =>
    readJson<ActionStatusResponse>(`/api/actions/${actionId}/status`),
  getProtocolAttestation: async (actionId: string) =>
    readJson<ProtocolAttestationResponse>(`/api/protocol/attestations/${actionId}`),
  getProtocolStats: async () =>
    readJson<ProtocolStats>("/api/protocol/stats"),
  getImpactPools: async () =>
    readJson<{ items: ImpactPoolSummary[] }>("/api/impact-pools"),
  createImpactPool: async (payload?: { targetActions?: number; title?: string }) =>
    readJson<ImpactPoolDetail>("/api/impact-pools", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload ?? {}),
    }),
  getImpactPool: async (poolId: string) =>
    readJson<ImpactPoolDetail>(`/api/impact-pools/${poolId}`),
  exportImpactPool: async (poolId: string) =>
    readJson<ImpactPoolExport>(`/api/impact-pools/${poolId}/export`),
  uploadEvidence: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error((errorBody as { message?: string }).message ?? "Upload failed");
    }
    return (await response.json()) as { url: string };
  },
};
