# Missing Piece CRM — ABA Client Communications V2

Internal client-communications and operational-learning application for Missing Piece ABA Billing.

## Core workflow

**Client inquiry → Frontline response → Resolved → Operations Review → Confirmed root cause → Corrective action/routing → 30-day trends → client education/process work or internal escalation**

Frontline staff never classify root cause. Root cause is confirmed in Operations Review.

## Stack

- Next.js 16.4.0 / React 19.3.0 / TypeScript 7.0.2
- Supabase PostgreSQL + Auth using `@supabase/ssr`
- Vitest
- Vercel-ready

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add the project's **publishable key** from Supabase Connect settings. Never put a secret/service-role key in `NEXT_PUBLIC_*` variables.
3. Apply `supabase/migrations/202610090001_initial_schema.sql` to the Supabase project.
4. `npm install`
5. `npm run dev`

Target Supabase URL: `https://dgvqhlycojecqykgelll.supabase.co`

## Security

RLS is enabled on every public table. Client/inquiry/report data is available only to authenticated internal users; Operations writes require an Operations/Admin/Management profile role; configuration writes require Admin; management escalation records require Admin/Management.
