# VeraDoc — Frontend

AI-powered academic document verification platform for Nigerian institutions.

## Overview
VeraDoc is an AI-powered platform designed to verify academic documents for Nigerian institutions. This repository contains the pure Next.js frontend that consumes the VeraDoc FastAPI backend. It provides a seamless interface for users to upload documents, purchase verification credits, and manage their verification history.

## Tech Stack
- Next.js 16
- React 19
- Tailwind CSS v4
- Poppins (Google Fonts)
- react-hook-form
- JWT Bearer token auth (no NextAuth)
- Deployed on Vercel

## Project Structure
```text
.
├── src/
│   ├── app/                    # Next.js App Router (Pages & Layouts)
│   │   ├── (authenticated)/    # Protected routes requiring auth
│   │   │   ├── dashboard/      # User dashboard overview
│   │   │   ├── history/        # Verification history list
│   │   │   ├── settings/       # User profile and account settings
│   │   │   ├── verify/         # Document upload and verification flow
│   │   │   └── layout.tsx      # Dashboard layout with sidebar
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── credits/            # Credit management
│   │   │   └── callback/       # Payment redirect handler
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable UI components
│   ├── context/                # React Context providers (Auth)
│   └── lib/                    # Utility functions and API client
├── public/                     # Static assets
└── tailwind.config.ts          # Tailwind CSS configuration
```

## Getting Started
Step by step:
1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run dev server: `npm run dev`
5. Open `http://localhost:3000`

## Environment Variables
| Variable | Description | Example Value |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the VeraDoc FastAPI backend. | `https://backend-sf30.onrender.com` |

## Pages
| Route | Page Name | Auth Required |
|---|---|---|
| `/` | Landing Page | No |
| `/auth/login` | Login | No |
| `/auth/register` | Register | No |
| `/dashboard` | Dashboard | Yes |
| `/verify` | Verify Document | Yes |
| `/history` | Verification History | Yes |
| `/settings` | Settings | Yes |
| `/credits/callback`| Payment Callback | Yes |

## Backend
Note that this frontend connects to the VeraDoc FastAPI backend at:
`https://github.com/SQUADHACKATHON3/VeraDocBacktend`
All API calls go through `src/lib/api.ts`.

## Team
- Samuel Ezekiel — Frontend Engineer
- Oluwatobi Lupo — Frontend Engineer
- Temiloluwa Gboyega — Backend Engineer

Obafemi Awolowo University, Ile-Ife · Squad Hackathon 3.0

## License
MIT
