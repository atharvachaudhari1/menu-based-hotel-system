# Recommendation: Create a NEW GitHub repo for this site

Go with a **new, separate repo**. Do not push into `hotel-menu-fi`.

## Why separate is the right call

The two projects are fundamentally different apps:

| | This site (Sai Vijay Hotel) | hotel-menu-fi |
|---|---|---|
| Purpose | Public marketing website (6 pages) | WhatsApp menu automation backend |
| Stack | TanStack Start + React + Vite + Tailwind | Different stack (Node backend) |
| Deploy target | Vercel (static/SSR frontend) | Vercel + Render (backend/API) |
| Who edits it | You + Lovable (2-way sync) | Atharva / manual commits |
| Release cycle | Frequent UI tweaks | Backend logic changes |

Mixing them into one repo causes real problems:
- Lovable's GitHub 2-way sync expects a dedicated repo. Sharing a repo will fight the sync and can overwrite backend files.
- One `package.json` cannot cleanly hold both dependency trees.
- Vercel/Render build settings collide (different build commands, output dirs, env vars).
- A bug in one app can break the other's deploy.
- Rollbacks become dangerous — reverting a frontend change could revert backend code.

They are already **loosely coupled the right way**: this site just opens a `wa.me` link with a pre-filled `menu RID-...` message, and the backend receives that message independently. No shared code = no shared repo needed.

## What to do

1. In Lovable: bottom-left **+** → **GitHub** → **Connect project** → authorize → **Create Repository**. Name it something like `sai-vijay-hotel-site`.
2. Lovable auto-pushes the current code and enables 2-way sync (edits in Lovable → GitHub, and pushes to GitHub → Lovable).
3. On Vercel: **Import Project** → pick the new repo → deploy. Framework preset: TanStack Start / Vite.
4. Leave `hotel-menu-fi` completely untouched — it keeps running on Vercel + Render as-is.

## When a monorepo WOULD make sense (not your case)

Only if the frontend and backend shared TypeScript types, a component library, or were versioned/released together. Neither applies here.

## Optional next steps after the repo is live

- Unify the WhatsApp number + `menu RID-...` message across Header, Footer, and Contact page (currently only the floating buttons use them).
- Add a custom domain in Vercel once deployed.
