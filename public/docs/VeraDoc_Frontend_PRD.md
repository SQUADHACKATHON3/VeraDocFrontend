# VeraDoc — Frontend PRD
**Owner:** Samkiel (Samuel Ezekiel)
**Repo:** github.com/SQAUDHACKATHON/VeraDocFrontend
**Stack:** Next.js 16 (Latest), React 19, Tailwind CSS v4, Auth.js, MongoDB (Mongoose)
**Deployment:** Vercel
**Last Updated:** May 2026

---

## 1. Overview

This document defines the complete frontend product requirements for VeraDoc. It covers every page, component, user flow, state, and integration point that Samkiel owns. The backend API routes (Squad webhook, FastAPI bridge, MongoDB queries) are defined in the Backend PRD.

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

---

## 3. Page Specifications

---

### 3.1 Landing Page (`/`)

**Purpose:** Introduce VeraDoc, communicate value proposition, drive sign-up with a "WOW" factor.

**Sections:**
- **Hero:** Product name, one-liner, two CTAs — "Get Started" (→ `/auth/register`) and "See How It Works" (scrolls to How It Works section)
- **Problem Section:** Short copy on academic certificate fraud in Nigeria. One stat or quote if available.
- **How It Works:** Three-step visual — Upload, Pay, Get Results
- **Pricing Section:** Two cards — Pay-Per-Verification and Monthly Subscription
- **CTA Banner:** "Start verifying in minutes" → register link
- **Footer:** Product name, GitHub org link, hackathon credit

**States:**
- Default (not logged in)
- If user is already authenticated, "Get Started" CTA redirects to `/dashboard`

---

### 3.2 Login Page (`/auth/login`)

**Purpose:** Authenticate existing users via Auth.js.

**Fields:**
- Email (required)
- Password (required)

**Actions:**
- Submit → Auth.js `signIn()` with credentials provider
- "Don't have an account?" → `/auth/register`
- "Forgot password?" → placeholder (not in scope for hackathon)

**States:**
- Default
- Loading (form disabled, premium spinner/skeleton)
- Error (invalid credentials — show high-fidelity toast/inline error)
- Success → redirect to `/dashboard`

---

### 3.3 Register Page (`/auth/register`)

**Purpose:** Create a new verifier account.

**Fields:**
- Full Name (required)
- Organisation Name (required)
- Email (required)
- Password (required, min 8 chars)
- Confirm Password (required)

**Actions:**
- Submit → POST `/api/auth/register` → auto sign-in → redirect to `/dashboard`
- "Already have an account?" → `/auth/login`

**States:**
- Default
- Loading
- Validation errors (inline per field, real-time validation)
- Server error (email already exists)
- Success → redirect

---

### 3.4 Dashboard (`/dashboard`)

**Purpose:** Central hub. Shows account summary and quick actions.

**Sections:**
- **Welcome Header:** "Welcome back, [Name]"
- **Stats Row:** Three stat cards
  - Total Verifications
  - Authentic Results
  - Flagged / Fake Results
- **Quick Action:** "New Verification" button → `/verify`
- **Recent Verifications:** Last 5 verifications as a table (Date, Document Name, Verdict badge, Trust Score, View link)
- **Empty State:** If no verifications yet — illustration + "Run your first verification" CTA

**Data Source:**
- Stats and recent verifications fetched from `GET /api/verifications?limit=5` on page load
- Loading skeleton while fetching

---

### 3.5 New Verification Page (`/verify`)

**Purpose:** Core product flow. User uploads document and initiates payment.

**Flow:**

**Step 1 — Upload**
- Drag-and-drop upload zone + click to browse
- Accepted file types: PDF, JPG, PNG, JPEG
- Max file size: 5MB
- File preview on upload (file name + size)
- Remove file option
- "Continue to Payment" button (disabled until file selected)

**Step 2 — Payment**
- Summary card showing: file name, verification fee (NGN 1,000)
- "Pay with Squad" button
- On click → POST `/api/verify/initiate` → receives `checkout_url` → opens Squad modal (or redirect)
- Loading state while awaiting Squad response

**Step 3 — Processing**
- Shown after Squad payment confirmation (redirect back or webhook trigger)
- Animated loading state: "Analyzing your document..."
- Auto-polls `GET /api/verify/[id]/status` every 3 seconds
- Timeout after 60 seconds with error state

**Step 4 — Result Preview**
- Brief result card: Verdict badge + Trust Score
- "View Full Report" button → `/verify/[id]`

**States:**
- Upload idle
- Upload drag-active
- File selected
- Payment loading
- Payment failed (Squad error)
- Processing / polling
- Processing timeout
- Result ready

---

### 3.6 Verification Result Page (`/verify/[id]`)

**Purpose:** Full detailed result for a single verification.

**Sections:**
- **Verdict Banner:** Large verdict badge (AUTHENTIC = green, SUSPICIOUS = amber, FAKE = red) + Trust Score gauge (0–100)
- **Summary:** One-sentence AI summary
- **Flags Section:** List of issues detected (red badges). Empty state if none.
- **Passed Checks Section:** List of checks that passed (green badges)
- **Document Info:** File name, date verified, verifier name
- **Actions:**
  - "Download Report" → triggers PDF report generation and download
  - "Run Another Verification" → `/verify`
  - "Back to History" → `/history`

**States:**
- Loading skeleton
- Loaded
- Error (result not found)

---

### 3.7 Verification History (`/history`)

**Purpose:** Full list of all verifications for the logged-in account.

**Features:**
- Table: Date, Document Name, Verdict badge, Trust Score, Actions (View)
- Filter by verdict: All / Authentic / Suspicious / Fake
- Search by document name
- Pagination (10 per page)
- Empty state

**Data Source:** `GET /api/verifications` with filter and pagination params

---

### 3.8 Account Settings (`/settings`)

**Purpose:** Manage account details.

**Sections:**
- **Profile:** Full name, organisation name, email (read-only)
- **Change Password:** Current password, new password, confirm new password
- **Danger Zone:** Delete account (confirmation modal required)

---

## 4. Shared Components

| Component | Description |
|---|---|
| `Navbar` | Logo, nav links, user avatar dropdown (Dashboard, History, Settings, Sign Out) |
| `VerdictBadge` | Coloured badge: AUTHENTIC (green), SUSPICIOUS (amber), FAKE (red) |
| `TrustScoreGauge` | Visual 0–100 score display |
| `VerificationTable` | Reusable table for dashboard and history |
| `FileUploadZone` | Drag-and-drop upload with preview |
| `LoadingSkeleton` | Placeholder while data fetches |
| `EmptyState` | Illustration + CTA for empty lists |
| `ConfirmModal` | Generic confirmation dialog |
| `ToastNotification` | Success / error toast messages |
| `StatCard` | Dashboard stat display card |

---

## 5. Auth Flow (NextAuth.js)

- **Provider:** Credentials (email + password)
- **Session strategy:** JWT
- **Protected routes:** All routes except `/`, `/auth/login`, `/auth/register`
- **Middleware:** `middleware.ts` at root — redirect unauthenticated users to `/auth/login`
- **Session data stored:** `id`, `name`, `email`, `organisation`

**NextAuth config location:** `/app/api/auth/[...nextauth]/route.ts`

---

## 6. MongoDB Integration (Frontend Side)

Samkiel owns these interactions via Next.js API routes and Mongoose:

| Operation | Route | Description |
|---|---|---|
| Create user | `POST /api/auth/register` | On registration |
| Get user session data | Via NextAuth | On every protected page |
| Get verifications list | `GET /api/verifications` | Dashboard + History |
| Get single verification | `GET /api/verifications/[id]` | Result page |

**Mongoose models used:** `User`, `Verification` (schemas defined in Backend PRD)

---

## 7. Environment Variables (Frontend)

```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=

MONGODB_URI=

NEXT_PUBLIC_SQUAD_PUBLIC_KEY=
SQUAD_SECRET_KEY=

FASTAPI_SERVICE_URL=
```

---

## 8. Design System

| Token | Value |
|---|---|
| Primary | `#2563EB` (Squad-aligned blue) |
| Success | `#16A34A` |
| Warning | `#D97706` |
| Danger | `#DC2626` |
| Background | `#F9FAFB` |
| Card | `#FFFFFF` |
| Text Primary | `#111827` |
| Text Secondary | `#6B7280` |
| Border | `#E5E7EB` |
| Font | Inter or Geist (Next.js default) |

---

## 9. Non-Functional Requirements

- All pages must be fully responsive (mobile + desktop)
- Page load time under 2 seconds on 4G
- Auth state persisted across page refreshes
- Result page must be shareable via URL (same user only)
- No sensitive data (Squad keys, MongoDB URI) exposed to client

---

## 10. Out of Scope (Hackathon)

- Password reset via email
- Multi-user organisations / team accounts
- Bulk document upload
- Third-party OAuth (Google, GitHub)
- Internationalisation

---

*VeraDoc Frontend PRD — The Dev Team — Squad Hackathon 3.0*
