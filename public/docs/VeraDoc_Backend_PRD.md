# VeraDoc — Backend PRD

**Owner:** Temi (FastAPI Backend)
**Repo:** github.com/SQUADHACKATHON3/VeraDocBacktend
**Stack:** Python, FastAPI, MongoDB, Squad API, Groq API, Tavily (web search)
**Deployment:** Render
**Last Updated:** May 2026

---

## 1. Overview

**Architecture note — this changed.** VeraDoc's backend is now a **single FastAPI
service** that owns everything server-side:

- Authentication (JWT access + refresh tokens, bcrypt password hashing)
- User accounts and credit balances
- Credit packs and Squad payment/checkout
- Document verification (consumes credits, runs AI analysis in-process)
- AI forensic analysis via Groq
- Issuer contact hints via web search (Tavily)
- All MongoDB persistence

The previous split (Next.js API routes for auth/payments/DB + a separate FastAPI
"AI service") has been **collapsed into this one service**. The Next.js app is
now a pure frontend (see the Frontend PRD) and contains no backend logic.

Interactive API docs are served at `GET {BASE_URL}/docs` (Swagger UI). The
canonical request/response contract is **VeraDoc_API_Documentation.md** — this
PRD describes behaviour, models, and rules.

**Base URLs**
- Local: `http://127.0.0.1:8000`
- Production: `https://backend-sf30.onrender.com`

---

## 2. Conventions

- Bodies are `application/json` unless noted (verification upload is
  `multipart/form-data`).
- Protected endpoints require `Authorization: Bearer <access_token>`.
- IDs are UUID strings. Dates are ISO 8601 with timezone.
- Errors use the FastAPI shape `{ "detail": <string | object | array> }`.
- **CORS:** not enabled by default. Enable CORS middleware (or document a
  same-origin proxy) so the Vercel frontend can call the API.

---

## 3. Data Models (MongoDB)

### User
```js
{
  _id,                  // UUID
  name: String,         // required, 1–200 chars
  organisation: String, // required, 1–200 chars
  email: String,        // required, unique
  password: String,     // bcrypt hash
  credits: Number,      // current balance; new users start with 1
  createdAt: Date
}
```

### Verification
```js
{
  _id,                       // UUID
  userId,                    // ref: User
  documentName: String,
  paymentStatus: String,     // "pending" | "paid" | "failed"
  squadTransactionRef: String | null,   // null for credit-funded verifications
  status: String,            // "pending" | "processing" | "complete" | "error"
  verdict: String | null,    // "AUTHENTIC" | "SUSPICIOUS" | "FAKE"
  trustScore: Number | null, // 0–100
  flags: [String],
  passedChecks: [String],
  summary: String | null,
  issuerContactHints: Object | null,    // see §7
  createdAt: Date,
  completedAt: Date | null
}
```

### CreditPurchase
```js
{
  _id,                  // purchaseId (UUID)
  userId,               // ref: User
  pack: Number,         // 1 | 5 | 10 | 20
  credits: Number,      // credits to grant on success
  amountKobo: Number,
  squadTransactionRef: String,
  status: String,       // "pending" | "completed" | "failed"
  createdAt: Date,
  completedAt: Date | null
}
```

---

## 4. Authentication

- **Strategy:** JWT. Login/refresh return an `access_token` (short-lived) and a
  `refresh_token` (longer-lived), plus `token_type: "bearer"`.
- **Passwords:** hashed with bcrypt.
- **Register** (`POST /api/auth/register`): validate fields, reject duplicate
  email with `409`, hash password, create the user with **1 free credit**.
  Does **not** auto-login — the frontend signs in afterward.
- **Login** (`POST /api/auth/login`): verify credentials, return the token pair.
  `401` on bad credentials.
- **Refresh** (`POST /api/auth/refresh?refresh_token=…`): refresh token passed as
  a **query parameter**; returns a fresh token pair. `401` if invalid.
- **Me** (`GET /api/auth/me`): returns `id`, `name`, `organisation`, `email`,
  `credits`. Used by the frontend to hydrate the session and re-check the
  balance after a purchase.

---

## 5. Credits & Payments (Squad)

Verifications are funded by **credits**, not per-document payments.

- **Pricing:** `CREDIT_PRICE_KOBO`, default `70000` (₦700 per credit).
- **Packs:** `1`, `5`, `10`, `20` credits.
- **`GET /api/credits/packs`** — public catalogue: pack list, per-credit price,
  currency.
- **`POST /api/credits/purchase/initiate`** — body `{ "pack": 1|5|10|20 }`.
  Creates a `CreditPurchase` (`status: "pending"`), calls Squad to create a
  checkout session, returns `purchaseId`, `checkoutUrl`, `credits`, `amountKobo`.
  `400` on an invalid pack.
- **`GET /api/credits/purchases/{purchase_id}`** — purchase status
  (`pending` | `completed` | `failed`). Owner-only (`404` otherwise).
- **Fulfilment:** Squad notifies the backend webhook (§8) after payment. On a
  successful charge the backend marks the purchase `completed` and increments
  the user's `credits`. The frontend polls `GET /api/auth/me` (or the purchase
  status) until the balance updates.

---

## 6. Verification Pipeline

### `POST /api/verify/initiate`
**Auth:** Bearer. **Request:** `multipart/form-data` with `file` (PDF, JPEG, PNG;
max 5MB).

**Logic:**
1. Validate file type and size (`400` otherwise).
2. If the user has **0 credits**, return `402` with
   `{ "detail": { "message": "...", "credits": 0 } }`.
3. Deduct **1 credit immediately** and create a `Verification`
   (`status: "pending"`, `paymentStatus: "paid"`).
4. Return `{ "verificationId", "creditsRemaining" }` right away.
5. Run analysis **asynchronously** as an in-process background task (no Squad
   step on verify).

### Background analysis task
1. Set `status: "processing"`.
2. If PDF, convert the first page to an image; encode to base64.
3. Call Groq with the forensic system prompt and the image.
4. Parse the structured JSON verdict.
5. For qualifying results, build `issuerContactHints` (§7).
6. Save `verdict`, `trustScore`, `flags`, `passedChecks`, `summary`,
   `issuerContactHints`, `completedAt`; set `status: "complete"`.
7. On any failure, set `status: "error"` and leave result fields `null`.

### `GET /api/verify/{id}/status`
**Auth:** Bearer, owner-only. Returns `status`, `verdict`, `trustScore`,
`summary`. The frontend polls this every 2–4s while `processing`.

### Groq analysis

Model: `meta-llama/llama-4-scout-17b-16e-instruct` (vision), `temperature: 0.1`.
The system prompt instructs the model to return **only** this JSON:

```json
{
  "verdict": "AUTHENTIC" | "SUSPICIOUS" | "FAKE",
  "trust_score": 0-100,
  "flags": ["..."],
  "passed_checks": ["..."],
  "summary": "one sentence"
}
```

Signals analysed: font consistency, seal/watermark presence and placement,
formatting alignment, text-layer anomalies, date validity, institution name
formatting, signature presence, structural integrity.

Verdict bands: **AUTHENTIC** (75–100), **SUSPICIOUS** (40–74), **FAKE** (0–39).

---

## 7. Issuer Contact Hints

For results that warrant a human follow-up — **typically SUSPICIOUS with a trust
score around 45–70** — the backend attempts to surface how to contact the
issuing institution, using a web-search path (Tavily) over public snippets.

The result is stored on the verification as `issuerContactHints`:

- **`null`** — no hint block (verdict outside the trigger band, no web path
  taken, or legacy data).
- **Object** — shape:
  ```json
  {
    "included": true,
    "trigger": "suspicious_45_70_trust",
    "unverified": true,
    "disclaimer": "...",
    "items": [
      { "type": "email", "value": "...", "sourceUrl": "...", "sourceTitle": "..." }
    ],
    "suggestedOutreachMessage": "Subject: ...\n\nDear ...",
    "suggestedOutreachMessageNote": "...",
    "outreachMessageSource": "ai_merge" | "template_fallback" | null,
    "note": null
  }
  ```

Rules:
- `items` may be empty if no email/phone was found in snippets; in that case
  `note` may be `"no_contacts_found_in_snippets"`.
- All contacts are **unverified** — extracted from public web snippets, not
  confirmed with the institution.
- `suggestedOutreachMessage` is a **draft** with placeholders; the UI must show
  it with a disclaimer and require the user to proofread before sending.

---

## 8. Squad Webhook (server-only)

### `POST /api/verify/webhook`
**Auth:** none — verified via a signed body.

Squad calls this endpoint with a signed payload to confirm payments (credit
purchases). Configure `SQUAD_WEBHOOK_CALLBACK_URL` on the backend to a **public
HTTPS URL** that reaches this route.

**Logic:** verify the signature, identify the related `CreditPurchase`, mark it
`completed` on a successful charge, and increment the user's `credits`. Never
called by the frontend.

---

## 9. Account Endpoints

- **`PUT /api/user/password`** — body `{ currentPassword, newPassword }`.
  `200` on success, `401` if the current password is wrong.
- **`DELETE /api/user`** — deletes the user (and associated data). `200` on
  success.

---

## 10. Environment Variables

```env
# Auth
JWT_SECRET=
ACCESS_TOKEN_TTL=
REFRESH_TOKEN_TTL=

# Database
MONGODB_URI=

# Payments (Squad)
SQUAD_SECRET_KEY=
SQUAD_WEBHOOK_CALLBACK_URL=
CREDIT_PRICE_KOBO=70000

# AI / web search
GROQ_API_KEY=
TAVILY_API_KEY=
```

---

## 11. Error Handling Standards

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / invalid file / invalid pack |
| 401 | Missing/invalid Bearer, wrong password, or bad refresh token |
| 402 | Insufficient credits (verify) |
| 403 | Authenticated but not allowed (another user's resource) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email on register) |
| 422 | Validation error (FastAPI) — `detail` lists invalid fields |
| 500 | Unhandled server error |

All errors follow the FastAPI shape `{ "detail": ... }`.

---

## 12. Out of Scope (Hackathon)

- Rate limiting per user
- Email notifications on verification complete
- Bulk document upload / batch processing
- Admin dashboard
- Audit logging
- Subscription billing (credits only for now)

---

*VeraDoc Backend PRD — The Dev Team — Squad Hackathon 3.0*
