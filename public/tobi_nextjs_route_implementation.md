# Backend API Integration Guide

This guide covers all the Next.js API routes I've built, including the expected request payloads and how to integrate with the Squad webhook and FastAPI service.

## 1. Authentication (NextAuth)

For the frontend, authentication is handled via NextAuth.js.

### Registration
* **Endpoint:** `POST /api/auth/register`
* **Payload:** `{ "name": "", "organisation": "", "email": "", "password": "" }`
* **Response:** `201 Created` on success, `409` if email exists.

### Login
Do not make a direct fetch request to an API route for login. Use the NextAuth `signIn` function provided by `next-auth/react`:
```javascript
import { signIn } from "next-auth/react"

signIn('credentials', { email, password })
```
This automatically sets the JWT cookies. You can retrieve user data (including `id` and `organisation`) using the `useSession()` hook.

### Password Change
* **Endpoint:** `PUT /api/user/password`
* **Payload:** `{ "currentPassword": "", "newPassword": "" }`

### Account Deletion
* **Endpoint:** `DELETE /api/user`
* **Note:** This cascade-deletes all verification history linked to the user.

---

## 2. Document Verification Flow

### Step 1: Initiate Payment & Upload
* **Endpoint:** `POST /api/verify/initiate`
* **Content-Type:** `multipart/form-data`
* **Payload:** Attach the document under the key `file` (Max 5MB, PDF/JPG/PNG).
* **Response:** Returns `{ "checkoutUrl": "...", "verificationId": "..." }`.
* **Action:** Redirect the user to the `checkoutUrl` to complete the Squad payment. 
*(Note: The file is temporarily stored as a base64 string in MongoDB to prevent data loss on Vercel's serverless functions before payment completes).*

### Step 2: Squad Webhook & AI Hand-off
* **Endpoint:** `POST /api/verify/webhook`
* **How it works:** Squad hits this endpoint upon successful payment. I verify the `x-squad-signature` using our secret key. Once verified, I convert the base64 string back to a file and forward it to Temi's FastAPI endpoint (`/analyze`).
* **For Temi:** Expect a `POST` request with `multipart/form-data` containing the file, and an `X-Internal-Key` header matching our shared internal secret.

### Step 3: Polling for Results
* **Endpoint:** `GET /api/verify/[id]/status`
* **Action:** Poll this endpoint on the frontend while the user waits for the AI processing to complete.
* **Response:** `{ "status": "processing" | "complete", "verdict": "AUTHENTIC", "trustScore": 95, "summary": "..." }`

---

## 3. Data Retrieval Endpoints

### Get All Verifications (Dashboard History)
* **Endpoint:** `GET /api/verifications`
* **Query Params:** `?page=1&limit=10&verdict=FAKE&search=filename`
* **Response:** Paginated list of verifications for the logged-in user.

### Get Single Verification Detail
* **Endpoint:** `GET /api/verifications/[id]`
* **Response:** Full detailed JSON of the verification result.

---

## Environment Setup

Make sure your local `.env.local` includes the following keys. Reach out if you need the dev values.

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_SQUAD_PUBLIC_KEY=
SQUAD_SECRET_KEY=

FASTAPI_SERVICE_URL=
INTERNAL_SERVICE_KEY=
```
