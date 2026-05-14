# VeraDoc Backend — API Documentation

**Version:** 2.0.0
**Organisation:** github.com/SQUADHACKATHON3
**Service:** VeraDocBacktend (FastAPI)
**Last Updated:** May 2026

This is the canonical request/response contract between the Next.js frontend and
the FastAPI backend. The backend is a single service that owns auth, users,
credits, payments, verification, and AI analysis.

---

## Base URLs

| Environment | URL |
|---|---|
| Local | `http://127.0.0.1:8000` |
| Production | `https://backend-sf30.onrender.com` |

- **OpenAPI / Swagger UI:** `GET {BASE_URL}/docs` (interactive try-out).
- **Content type:** `application/json` unless noted (`/api/verify/initiate` is
  `multipart/form-data`).
- **Auth:** send `Authorization: Bearer <access_token>` on every protected route.
- **IDs:** UUID strings (e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`).
- **Dates:** ISO 8601 with timezone (e.g. `"2026-05-13T10:15:00+00:00"`).
- **CORS:** the backend does **not** ship CORS middleware by default. If the web
  app is on another origin, enable CORS on the API or proxy through the same host.

---

## Response Format & Errors

All endpoints return JSON. FastAPI wraps errors as:

```json
{ "detail": "Human-readable message" }
```

`detail` may be a string, an object, or an array (validation errors).

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / invalid file / invalid pack |
| `401` | Missing/invalid Bearer, wrong password, or bad refresh token |
| `402` | Insufficient credits |
| `403` | Forbidden — accessing another user's resource |
| `404` | Resource not found |
| `409` | Conflict — e.g. duplicate email |
| `422` | Validation error (FastAPI) — `detail` lists invalid fields |
| `500` | Internal server error |

---

## 1. Authentication

### 1.1 Register
`POST /api/auth/register` · **Auth:** none

**Body:**
| Field | Type | Rules |
|---|---|---|
| `name` | string | 1–200 chars |
| `organisation` | string | 1–200 chars |
| `email` | string | Valid, unique email |
| `password` | string | Min 8 chars |

**`201` response:**
```json
{ "message": "Account created successfully", "credits": 1 }
```
New accounts start with **1 free credit**. Registration does **not** auto-login.

**`409`:** `{ "detail": "Email already registered" }`

---

### 1.2 Login
`POST /api/auth/login` · **Auth:** none

**Body:**
```json
{ "email": "user@example.com", "password": "secret" }
```

**`200` response (`TokenOut`):**
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer"
}
```
Store both tokens. (Frontend currently stores both in `localStorage`.)

**`401`:** `{ "detail": "Invalid credentials" }`

---

### 1.3 Refresh Access Token
`POST /api/auth/refresh?refresh_token=<refresh_token>` · **Auth:** none

`refresh_token` is a **query parameter** (the full JWT string, URL-encoded).

**`200` response:** same shape as login.

**`401`:** `{ "detail": "Unauthorized" }`

---

### 1.4 Current User
`GET /api/auth/me` · **Auth:** Bearer

**`200` response (`MeOut`):**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "organisation": "Acme Ltd",
  "email": "user@example.com",
  "credits": 5
}
```
Use after login and after a credit purchase to refresh the balance.

---

## 2. Credits (Squad Checkout)

Pricing is driven by `CREDIT_PRICE_KOBO` (default `70000` = ₦700 per credit).
Packs: **1, 5, 10, 20** credits.

### 2.1 List Packs
`GET /api/credits/packs` · **Auth:** none (public catalogue)

**`200` response (`CreditPacksOut`):**
```json
{
  "packs": [
    { "credits": 1,  "amountKobo": 70000 },
    { "credits": 5,  "amountKobo": 350000 },
    { "credits": 10, "amountKobo": 700000 },
    { "credits": 20, "amountKobo": 1400000 }
  ],
  "pricePerCreditKobo": 70000,
  "currency": "NGN"
}
```
Display amounts as **₦ (amountKobo / 100)**.

---

### 2.2 Start a Purchase
`POST /api/credits/purchase/initiate` · **Auth:** Bearer

**Body:** `{ "pack": 5 }` — `pack` must be `1`, `5`, `10`, or `20`.

**`200` response (`CreditPurchaseInitiateOut`):**
```json
{
  "purchaseId": "uuid",
  "checkoutUrl": "https://...",
  "credits": 5,
  "amountKobo": 350000
}
```

**Frontend flow:**
1. Call initiate → receive `checkoutUrl` and `purchaseId`.
2. Open `checkoutUrl` (new tab / redirect).
3. After the user pays, Squad notifies the **backend** webhook; credits are
   updated server-side.
4. Poll `GET /api/credits/purchases/{purchaseId}` (or `GET /api/auth/me`) until
   `status` is `completed` / `credits` increases.

**`400`:** invalid pack.

---

### 2.3 Purchase Status
`GET /api/credits/purchases/{purchase_id}` · **Auth:** Bearer (must own it)

**`200` response:**
```json
{ "purchaseId": "uuid", "status": "pending", "credits": 5 }
```
`status`: `pending` | `completed` | `failed`.

**`404`:** not found or not yours.

---

## 3. Document Verification

Each successful initiate **consumes 1 credit immediately**. There is no Squad
step on verify — payment happens up front via credit packs.

### 3.1 Start Verification
`POST /api/verify/initiate` · **Auth:** Bearer · **Content-Type:** `multipart/form-data`

| Field | Type | Notes |
|---|---|---|
| `file` | file | Required. PDF, JPEG, or PNG. Max 5 MB. |

**Example:**
```js
const form = new FormData();
form.append("file", fileBlob, "certificate.pdf");
await fetch(`${BASE}/api/verify/initiate`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form,
});
```

**`200` response (`InitiateOut`):**
```json
{ "verificationId": "uuid", "creditsRemaining": 4 }
```
Processing runs **asynchronously** (in-process background task) after the
response returns. Poll §3.2 with `verificationId`.

**Errors:**
| Status | When |
|---|---|
| `400` | Wrong file type or file > 5 MB |
| `401` | Missing/invalid token |
| `402` | Not enough credits |

**`402` body** (object inside `detail`):
```json
{
  "detail": {
    "message": "Insufficient credits. Buy a credit pack to run a verification.",
    "credits": 0
  }
}
```
Send the user to the credit-purchase flow (§2.2) on `402`.

---

### 3.2 Verification Status (poll)
`GET /api/verify/{verification_id}/status` · **Auth:** Bearer

**`200` response (`StatusOut`):**
```json
{
  "status": "processing",
  "verdict": null,
  "trustScore": null,
  "summary": null
}
```
`status`: `pending` | `processing` | `complete` | `error`.

When `status` is `complete`, `verdict`, `trustScore`, and `summary` are usually
set. On `error`, they may stay `null` — load the detail endpoint or handle empty.

**Errors:** `404`, `403` (wrong user).

**Suggested polling:** every 2–4 s while `processing`; stop on `complete`/`error`.

---

## 4. Verification History & Full Report

### 4.1 List Verifications
`GET /api/verifications` · **Auth:** Bearer

**Query params:**
| Param | Default | Notes |
|---|---|---|
| `page` | `1` | ≥ 1 |
| `limit` | `10` | 1–100 |
| `verdict` | — | Optional: `AUTHENTIC`, `SUSPICIOUS`, or `FAKE` |
| `search` | — | Case-insensitive substring on `documentName` |

**Example:** `GET /api/verifications?page=1&limit=10&verdict=SUSPICIOUS&search=cert`

**`200` response (`VerificationListOut`):**
```json
{
  "data": [
    {
      "id": "uuid",
      "documentName": "cert.pdf",
      "verdict": "SUSPICIOUS",
      "trustScore": 65,
      "status": "complete",
      "createdAt": "2026-05-13T10:00:00+00:00"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

### 4.2 Verification Detail
`GET /api/verifications/{verification_id}` · **Auth:** Bearer (must own it)

**`200` response (`VerificationDetailOut`):**
```json
{
  "id": "uuid",
  "documentName": "cert.pdf",
  "squadTransactionRef": null,
  "paymentStatus": "paid",
  "status": "complete",
  "verdict": "SUSPICIOUS",
  "trustScore": 65,
  "flags": ["..."],
  "passedChecks": ["..."],
  "summary": "One paragraph explanation.",
  "issuerContactHints": null,
  "createdAt": "2026-05-13T10:00:00+00:00",
  "completedAt": "2026-05-13T10:01:30+00:00"
}
```

**Enums:**
- `paymentStatus`: `pending` | `paid` | `failed`
- `status`: `pending` | `processing` | `complete` | `error`
- `verdict`: `AUTHENTIC` | `SUSPICIOUS` | `FAKE` | `null` (until done)

**Errors:** `404`, `403`.

#### `issuerContactHints`

- **`null`** — no issuer-hint block (verdict outside the trigger band, no web
  path taken, or legacy data).
- **Object** — present when the backend stored hints (typically **SUSPICIOUS**
  with trust **~45–70** via the web path):

```json
{
  "included": true,
  "trigger": "suspicious_45_70_trust",
  "unverified": true,
  "disclaimer": "...",
  "items": [
    {
      "type": "email",
      "value": "admissions@example.edu.ng",
      "sourceUrl": "https://...",
      "sourceTitle": "..."
    }
  ],
  "suggestedOutreachMessage": "Subject: ...\n\nDear ...",
  "suggestedOutreachMessageNote": "...",
  "outreachMessageSource": "ai_merge",
  "note": null
}
```

- `items` may be empty if no email/phone was found in snippets; then `note` may
  be `"no_contacts_found_in_snippets"`.
- `outreachMessageSource`: `ai_merge` | `template_fallback` | `null` (older rows).
- All contacts are **unverified** (from public web snippets).
- Show `suggestedOutreachMessage` as a **draft** with a disclaimer and
  `suggestedOutreachMessageNote` as small print. Users must replace placeholders
  and proofread before sending.

---

## 5. Account Settings

### 5.1 Change Password
`PUT /api/user/password` · **Auth:** Bearer

**Body:**
```json
{ "currentPassword": "old", "newPassword": "newlonger" }
```

**`200`:** `{ "message": "Password updated successfully" }`
**`401`:** current password is wrong.

---

### 5.2 Delete Account
`DELETE /api/user` · **Auth:** Bearer

**`200`:** `{ "message": "Account deleted" }`

> Removes the user record. Confirm the action in the UI before calling.

---

## 6. Server-Only: Squad Webhook (not called by the frontend)

`POST /api/verify/webhook`

Squad calls this with a signed body to confirm payments (credit purchases). On a
successful charge the backend marks the related purchase `completed` and
increments the user's credits. Configure `SQUAD_WEBHOOK_CALLBACK_URL` on the
backend to a **public HTTPS URL** that reaches this route.

---

## 7. Typical User Journeys

### A) First-time user
1. `POST /api/auth/register` → account created with `credits: 1`.
2. `POST /api/auth/login` → store tokens.
3. `POST /api/verify/initiate` with a file → `verificationId`, `creditsRemaining`.
4. Poll `GET /api/verify/{id}/status` until `complete` / `error`.
5. `GET /api/verifications/{id}` for the full report + optional
   `issuerContactHints`.

### B) Out of credits
1. `POST /api/verify/initiate` → **`402`** → show "Buy credits".
2. `GET /api/credits/packs` for prices.
3. `POST /api/credits/purchase/initiate` → open `checkoutUrl`.
4. After payment, poll `GET /api/credits/purchases/{purchaseId}` (or
   `GET /api/auth/me`) until credits increase.
5. Retry the verification.

### C) Session refresh
When the `access_token` expires, `POST /api/auth/refresh?refresh_token=...`,
then retry the failed request. (The frontend's `src/lib/api.ts` does this
automatically on a `401`.)

---

## 8. AI Screening Reminders (for UI)

- Verdicts are **AI screening results**, not legal confirmation. For high-stakes
  decisions, confirm directly with the issuing school or ministry.
- `issuerContactHints` come from **public web snippets** — always confirm before
  acting on them.
- `suggestedOutreachMessage` is a **draft**; users must replace placeholders and
  proofread before sending.

---

*VeraDoc API Documentation — The Dev Team — Squad Hackathon 3.0*
*Field names match the current Pydantic/OpenAPI models. When in doubt, use
`{BASE_URL}/docs` against the running API.*
