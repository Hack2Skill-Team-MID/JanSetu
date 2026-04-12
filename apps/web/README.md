# 🎨 JanSetu Web — Frontend

> Next.js 14 application for JanSetu's NGO Dashboard and Volunteer Portal.
>
> **Owned by: Frontend Dev (Teammate 2)**

## Setup

This directory will be initialized with Next.js. Run:

```bash
cd apps/web
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
npm install
npm run dev
```

## Pages to Build

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, features, CTA |
| Login | `/login` | Email/password login |
| Register | `/register` | Role-based registration |
| Dashboard | `/dashboard` | NGO needs map + charts |
| Needs | `/dashboard/needs` | Community needs list |
| Tasks | `/dashboard/tasks` | Task management |
| Volunteer Home | `/volunteer` | Matched opportunities |
| Profile | `/profile` | User profile + settings |
| Admin | `/admin` | System admin panel |

## API Client

Use `src/lib/api.ts` to call backend endpoints. See `packages/shared/src/types/api.types.ts` for types.
