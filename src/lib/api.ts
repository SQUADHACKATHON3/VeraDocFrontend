/**
 * VeraDoc API client.
 *
 * The Next.js app is a pure frontend — all data comes from the FastAPI backend.
 * This module owns: the base URL, token storage, the Bearer-auth fetch wrapper
 * (with automatic 401 -> refresh -> retry), and typed endpoint helpers.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Verdict = "AUTHENTIC" | "SUSPICIOUS" | "FAKE";
export type VerificationStatus = "pending" | "processing" | "complete" | "error";

export type Tokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type Me = {
  id: string;
  name: string;
  organisation: string;
  email: string;
  credits: number;
};

export type CreditPack = { credits: number; amountKobo: number };

export type CreditPacks = {
  packs: CreditPack[];
  pricePerCreditKobo: number;
  currency: string;
};

export type CreditPurchaseInitiate = {
  purchaseId: string;
  checkoutUrl: string;
  credits: number;
  amountKobo: number;
};

export type CreditPurchaseStatus = {
  purchaseId: string;
  status: "pending" | "completed" | "failed";
  credits: number;
};

export type CreditPurchaseVerify = {
  purchaseId: string;
  status: "pending" | "completed" | "failed";
  credits: number;
  /** Squad's answer: true if paid, false if not, null if it couldn't be reached. */
  paymentConfirmed: boolean | null;
  /** True when the purchase was already settled before this call. */
  alreadyCompleted: boolean;
};

export type InitiateVerification = {
  verificationId: string;
  creditsRemaining: number;
};

export type VerificationStatusOut = {
  status: VerificationStatus;
  verdict: Verdict | null;
  trustScore: number | null;
  summary: string | null;
};

export type VerificationListItem = {
  id: string;
  documentName: string;
  verdict: Verdict | null;
  trustScore: number | null;
  status: VerificationStatus;
  createdAt: string;
};

export type VerificationList = {
  data: VerificationListItem[];
  total: number;
  page: number;
  limit: number;
};

export type IssuerContactItem = {
  type: string; // "email" | "phone" | ...
  value: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
};

export type IssuerContactHints = {
  included: boolean;
  trigger: string;
  unverified: boolean;
  disclaimer: string;
  items: IssuerContactItem[];
  suggestedOutreachMessage: string | null;
  suggestedOutreachMessageNote: string | null;
  outreachMessageSource: "ai_merge" | "template_fallback" | null;
  note: string | null;
};

export type VerificationDetail = {
  id: string;
  documentName: string;
  squadTransactionRef: string | null;
  paymentStatus: "pending" | "paid" | "failed";
  status: VerificationStatus;
  verdict: Verdict | null;
  trustScore: number | null;
  flags: string[];
  passedChecks: string[];
  summary: string | null;
  issuerContactHints: IssuerContactHints | null;
  createdAt: string;
  completedAt: string | null;
};

/* ------------------------------------------------------------------ */
/* Token storage                                                       */
/* ------------------------------------------------------------------ */

const ACCESS_KEY = "veradoc.access_token";
const REFRESH_KEY = "veradoc.refresh_token";

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: Tokens) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * FastAPI wraps errors as { detail: string | object | array }.
 * Pull out the most user-friendly string we can.
 */
function extractMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const detail = (body as Record<string, unknown>).detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    const msg = (detail as Record<string, unknown>).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(detail) && detail[0]) {
      const first = detail[0] as Record<string, unknown>;
      if (typeof first.msg === "string") return first.msg;
    }
  }
  const error = (body as Record<string, unknown>).error;
  if (typeof error === "string") return error;
  return fallback;
}

/* ------------------------------------------------------------------ */
/* Core fetch wrapper                                                  */
/* ------------------------------------------------------------------ */

/** Fired when refresh fails — AuthContext listens and logs the user out. */
function emitUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("veradoc:unauthorized"));
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;

  // Dedupe concurrent refreshes.
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/auth/refresh?refresh_token=${encodeURIComponent(
            refresh
          )}`,
          { method: "POST" }
        );
        if (!res.ok) return false;
        const tokens = (await res.json()) as Tokens;
        tokenStore.set(tokens);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

type RequestOptions = {
  method?: string;
  /** JSON body — serialised automatically. Mutually exclusive with `formData`. */
  body?: unknown;
  /** Multipart body — sent as-is, no Content-Type header. */
  formData?: FormData;
  /** Whether to attach the Bearer token. Default true. */
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, auth = true, query } = options;

  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const send = async (isRetry: boolean): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (auth) {
      const token = tokenStore.getAccess();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    if (body !== undefined && !formData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });

    if (res.status === 401 && auth && !isRetry) {
      const ok = await refreshTokens();
      if (ok) return send(true);
      emitUnauthorized();
    }
    return res;
  };

  const res = await send(false);

  if (res.status === 204) return undefined as T;

  let parsed: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      parsed,
      extractMessage(parsed, `Request failed (${res.status})`)
    );
  }

  return parsed as T;
}

/* ------------------------------------------------------------------ */
/* Endpoint helpers                                                    */
/* ------------------------------------------------------------------ */

export const api = {
  /* --- auth --- */
  register(input: {
    name: string;
    organisation: string;
    email: string;
    password: string;
  }) {
    return request<{ message: string; credits: number }>(
      "/api/auth/register",
      { method: "POST", body: input, auth: false }
    );
  },

  login(input: { email: string; password: string }) {
    return request<Tokens>("/api/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
  },

  me() {
    return request<Me>("/api/auth/me");
  },

  /* --- credits --- */
  getCreditPacks() {
    return request<CreditPacks>("/api/credits/packs", { auth: false });
  },

  initiatePurchase(pack: number) {
    return request<CreditPurchaseInitiate>("/api/credits/purchase/initiate", {
      method: "POST",
      body: { pack },
    });
  },

  getPurchaseStatus(purchaseId: string) {
    return request<CreditPurchaseStatus>(
      `/api/credits/purchases/${purchaseId}`
    );
  },

  /**
   * Actively asks Squad whether the purchase was paid and grants credits if so.
   * Idempotent — safe to call repeatedly (see `alreadyCompleted`). This is what
   * settles a purchase; `getPurchaseStatus` only reads the stored state.
   */
  verifyPurchase(purchaseId: string) {
    return request<CreditPurchaseVerify>(
      `/api/credits/purchases/${purchaseId}/verify`,
      { method: "POST" }
    );
  },

  /* --- verification --- */
  initiateVerification(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<InitiateVerification>("/api/verify/initiate", {
      method: "POST",
      formData,
    });
  },

  getVerificationStatus(id: string) {
    return request<VerificationStatusOut>(`/api/verify/${id}/status`);
  },

  listVerifications(params: {
    page?: number;
    limit?: number;
    verdict?: string;
    search?: string;
  }) {
    return request<VerificationList>("/api/verifications", { query: params });
  },

  getVerification(id: string) {
    return request<VerificationDetail>(`/api/verifications/${id}`);
  },

  /* --- account --- */
  changePassword(input: { currentPassword: string; newPassword: string }) {
    return request<{ message: string }>("/api/user/password", {
      method: "PUT",
      body: input,
    });
  },

  deleteAccount() {
    return request<{ message: string }>("/api/user", { method: "DELETE" });
  },
};

/* ------------------------------------------------------------------ */
/* Pending purchase persistence                                        */
/* ------------------------------------------------------------------ */

const PENDING_PURCHASE_KEY = "veradoc.pending_purchase";

export type PendingPurchase = {
  purchaseId: string;
  credits: number;
  /** ISO timestamp when the purchase was initiated. */
  initiatedAt: string;
};

export const pendingPurchaseStore = {
  get(): PendingPurchase | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(PENDING_PURCHASE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingPurchase;
    } catch {
      return null;
    }
  },
  set(purchase: PendingPurchase) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(purchase));
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PENDING_PURCHASE_KEY);
  },
};

/** Convenience: format a kobo amount as Naira for display. */
export function formatNaira(amountKobo: number): string {
  return `₦${(amountKobo / 100).toLocaleString("en-NG")}`;
}
