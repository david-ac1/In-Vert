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
};
