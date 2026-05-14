# VeraDoc — Frontend PRD

**Owner:** Samkiel (Samuel Ezekiel)
**Repo:** github.com/SQUADHACKATHON3/VeraDocFrontend
**Stack:** Next.js 16, React 19, Tailwind CSS v4, react-hook-form
**Deployment:** Vercel
**Last Updated:** May 2026

---

## 1. Overview

This document defines the complete frontend product requirements for VeraDoc.

**Architecture note — this changed.** VeraDoc is now a **two-service** system:

- **VeraDocFrontend (this repo)** — a **pure Next.js frontend**. It renders all
  pages and talks to the backend over HTTP. It has **no API routes, no database,
  and no server-side auth**.
- **VeraDocBacktend** — a **FastAPI backend** that owns everything else: auth,
  users, credits, payments (Squad), document verification, and AI analysis
  (Groq). See the Backend PRD and the API Documentation.

The previous design (Next.js full-stack with its own API routes, NextAuth, and
Mongoose) has been **removed**. All data now comes from the FastAPI backend via
`src/lib/api.ts`.

---

## 2. App Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing Page | No |
| `/auth/login` | Login | No |
| `/auth/register` | Register | No |
| `/dashboard` | Main Dashboard | Yes |
| `/verify` | New Verification | Yes |
| `/verify/[id]` | Verification Result | Yes |
| `/history` | Verification History | Yes |
| `/settings` | Account Settings | Yes |

Protected routes live under the `(authenticated)` route group, guarded by
`src/app/(authenticated)/layout.tsx`.

---

## 3. Page Specifications

### 3.1 Landing Page (`/`)

**Purpose:** Introduce VeraDoc, communicate value, drive sign-up.

**Sections:** Hero (two CTAs), Problem section, How It Works (Upload → Verify →
Get Results), Pricing, CTA banner, Footer.

**Note:** Pricing is now **credit-based** (see §3.5). Marketing copy should
reflect "buy credits, verify documents" rather than per-document payment.

---

### 3.2 Login Page (`/auth/login`)

**Fields:** Email, Password.

**Action:** Submit → `useAuth().login(email, password)` → on success redirect to
`/dashboard`. `login()` calls `POST /api/auth/login`, stores the returned
`access_token` + `refresh_token`, then hydrates the profile from
`GET /api/auth/me`.

**States:** Default, Loading, Error (`401` → "Invalid email or password"),
Success → redirect.

---

### 3.3 Register Page (`/auth/register`)

**Fields:** Full Name, Organisation Name, Email, Password (min 8), Confirm
Password.

**Action:** Submit → `useAuth().register({ name, organisation, email, password })`.
The backend does **not** auto-login, so `register()` calls
`POST /api/auth/register` and then immediately signs in with the same
credentials. New accounts receive **1 free credit**.

**States:** Default, Loading, Validation errors (inline), Server error
(`409` → "An account with this email already exists", `422` → field message),
Success → redirect to `/dashboard`.

---

### 3.4 Dashboard (`/dashboard`)

**Sections:**
- Welcome header — greeting + first name from `useAuth().user`.
- Stats row — Total Verifications, Authentic Results, Flagged (FAKE) Results.
  Derived from three lightweight `GET /api/verifications?limit=1[&verdict=…]`
  calls (each returns an accurate `total`).
- Quick action — "New Verification" → `/verify`.
- Recent verifications — last 5 from `GET /api/verifications?limit=5`.
- Empty state when the account has no verifications.

`verdict` and `trustScore` may be `null` while a verification is still
processing — render the status instead.

---

### 3.5 New Verification Page (`/verify`)

**Purpose:** Core flow. Upload a document and spend **1 credit** to verify it.
There is **no per-document payment** — payment happens up front via credit packs.

**Step 1 — Upload**
- Drag-and-drop + click to browse. Accepts PDF, JPG, PNG, JPEG. Max 5MB.
- File preview (name + size), remove option.
- "Continue" enabled once a valid file is selected.

**Step 2 — Confirm**
- Summary card: file name, "1 credit", and the user's current balance
  (`useAuth().user.credits`).
- If balance ≥ 1 → "Verify Document (1 credit)" button → `POST /api/verify/initiate`
  (multipart). On success: store `verificationId`, refresh the balance, go to
  Step 3.
- If balance < 1 (or the API returns `402`) → show "Buy Credits" → open the
  **Buy Credits modal** (§4).

**Step 3 — Processing**
- Animated loading state. Polls `GET /api/verify/{id}/status` every 3 seconds.
- Transitions to Step 4 on `status: "complete"`. Shows an error state on
  `status: "error"` or after a 60-second timeout (with a link to History).

**Step 4 — Result Preview**
- Verdict badge + Trust Score + one-line summary.
- "View Full Report" → `/verify/[id]`. "Run Another Verification" → resets.

---

### 3.6 Verification Result Page (`/verify/[id]`)

**Data source:** `GET /api/verifications/{id}`.

**Sections:**
- **Verdict banner** — verdict badge (AUTHENTIC = green, SUSPICIOUS = amber,
  FAKE = red) + Trust Score gauge (0–100).
- **AI summary** — one-paragraph summary, plus a standing disclaimer that this
  is an **AI screening result, not a legal confirmation**.
- **Issues Found** — `flags[]` as red items; empty state if none.
- **Passed Checks** — `passedChecks[]` as green items.
- **Confirm With the Issuer** — rendered only when `issuerContactHints` is
  present and `included`. Shows the backend disclaimer, the `items[]` (issuer
  email/phone with source links, all marked **Unverified**), and the
  `suggestedOutreachMessage` as a copyable draft with
  `suggestedOutreachMessageNote` as small print.
- **Verification details** — document name, date verified, time to verify,
  payment ref (`squadTransactionRef` or "Paid with credits"), verified-by
  (current user), verification ID.
- **Actions** — Download Report (print), Run Another, Back to History.

**States:** Loading skeleton; "Still analyzing" / "Analysis failed" when
`status` is not `complete`; `404`/`403` → redirect to `/history`.

---

### 3.7 Verification History (`/history`)

**Data source:** `GET /api/verifications` with `page`, `limit` (10), `verdict`,
`search`.

**Features:** table (Date, Document Name, Verdict, Trust Score, View), verdict
filter (All / Authentic / Suspicious / Fake), debounced search by document name,
pagination, URL-synced state, empty state. `totalPages` is derived from
`Math.ceil(total / limit)`.

---

### 3.8 Account Settings (`/settings`)

**Sections:**
- **Profile** — name, organisation, email (read-only), and **credit balance**,
  all from `useAuth().user`.
- **Change Password** — `PUT /api/user/password`. `401` → "Current password is
  incorrect".
- **Danger Zone** — Delete account → `DELETE /api/user` → `logout()`.
  Confirmation modal required ("type DELETE").

---

## 4. Shared Components & Library

| File | Description |
|---|---|
| `src/lib/api.ts` | Typed FastAPI client — base URL, token storage, Bearer-auth fetch wrapper with automatic `401 → refresh → retry`, `ApiError`, and all endpoint helpers. |
| `src/context/AuthContext.tsx` | `AuthProvider` + `useAuth()` — token-based session: `user`, `isLoading`, `login`, `register`, `logout`, `refreshUser`. |
| `src/components/BuyCreditsModal.tsx` | Credit purchase flow — pick a pack → `purchase/initiate` → open Squad checkout → poll `purchases/{id}` → refresh balance. |
| `src/components/Navbar.tsx` | Public marketing navbar (landing / auth pages). |
| `(authenticated)/layout.tsx` | Auth route guard + sidebar + live credit badge. |

UI primitives (verdict badge, trust gauge, tables, upload zone, skeletons, empty
states, toasts) are implemented inline within their pages.

---

## 5. Auth Flow (Bearer Token)

NextAuth has been removed. Auth is **JWT Bearer tokens** issued by the FastAPI
backend.

- **Login/Register:** `POST /api/auth/login` returns `access_token` +
  `refresh_token`. Both are stored in `localStorage` via `tokenStore`.
- **Authenticated requests:** `src/lib/api.ts` attaches
  `Authorization: Bearer <access_token>` to every protected call.
- **Refresh:** on a `401`, the client calls
  `POST /api/auth/refresh?refresh_token=…` once, stores the new tokens, and
  retries the original request. Concurrent refreshes are de-duplicated.
- **Session loss:** if refresh fails, the client emits a `veradoc:unauthorized`
  event; `AuthContext` clears tokens and redirects to `/auth/login`.
- **Hydration:** on mount, if a token exists, `AuthContext` loads the profile
  from `GET /api/auth/me`.
- **Protected routes:** everything except `/`, `/auth/login`, `/auth/register`.
  The `(authenticated)` layout redirects unauthenticated users to login.

> **Hackathon tradeoff:** both tokens live in `localStorage` for simplicity. A
> hardened build would keep the refresh token in an httpOnly cookie.

---

## 6. Backend Integration

The frontend consumes the VeraDocBacktend FastAPI service. All request/response
shapes are defined in **VeraDoc_API_Documentation.md**. Every backend call goes
through `src/lib/api.ts` — pages never call `fetch` directly.

> **CORS:** the FastAPI backend does not ship CORS middleware by default. For
> deployments where the frontend and API are on different origins, CORS must be
> enabled on the backend (or the API proxied through the same host).

---

## 7. Environment Variables (Frontend)

```env
# Origin of the VeraDoc FastAPI backend (no trailing slash). Required.
# Local dev: http://127.0.0.1:8000  (set in .env.local)
NEXT_PUBLIC_API_BASE_URL=https://backend-sf30.onrender.com
```

That is the **only** variable the frontend needs, and it is **required** —
`src/lib/api.ts` reads it with no hard-coded fallback. `.env.local` sets it to
`http://127.0.0.1:8000` for local development. There are no MongoDB, Squad, or
NextAuth secrets in the frontend — all of that lives in the backend.

---

## 8. Design System

| Token | Value |
|---|---|
| Primary | `#2563EB` |
| Success | `#16A34A` |
| Warning | `#D97706` |
| Danger | `#DC2626` |
| Background | `#0A0E1A` / dark theme |
| Font (heading) | Playfair Display |
| Font (body) | Outfit |

---

## 9. Non-Functional Requirements

- Fully responsive (mobile + desktop).
- Auth state persisted across refreshes (token in `localStorage` + `/auth/me`
  hydration).
- Result page shareable via URL (backend enforces ownership — `403` otherwise).
- No backend secrets exposed to the client.
- Graceful handling of `null` `verdict` / `trustScore` for in-progress rows.

---

## 10. Out of Scope (Hackathon)

- Password reset via email
- Multi-user organisations / team accounts
- Bulk document upload
- Third-party OAuth (Google, GitHub)
- Internationalisation
- httpOnly-cookie refresh-token storage

---

*VeraDoc Frontend PRD — The Dev Team — Squad Hackathon 3.0*
