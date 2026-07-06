# Admin Panel — Multi-Hotel Manager

Build a full admin panel at `/admin` in this project, connected to the **same Supabase database** that `hotel-menu-fi` already uses. Single source of truth — no data sync needed. Changes here reflect instantly in the WhatsApp bot.

## Architecture

```text
   ┌────────────────────────────────────┐
   │   Existing Supabase Postgres DB    │
   │   (restaurants, menu_categories,   │
   │    menu_items, customers,          │
   │    feedback, …)                    │
   └──────────┬──────────────┬──────────┘
              │              │
   Read/Write │              │ Read/Write
              │              │
   ┌──────────▼───────┐  ┌───▼──────────────────┐
   │  hotel-menu-fi   │  │  THIS project        │
   │  backend         │  │  /admin (new)        │
   │  (Render, bot)   │  │  /  (marketing site) │
   └──────────────────┘  └──────────────────────┘
```

Both apps talk to the same DB. The bot keeps working exactly as before.

## What the admin panel will do

**Hotels (restaurants table)**
- List all hotels with their RID, status, created date
- Add new hotel → auto-generates UUID (RID) → copy button for the `wa.me` link
- Edit hotel name / active status
- Delete hotel (with confirmation, cascades to menu)

**Menu management (per hotel)**
- List categories, drag-to-reorder
- Add / edit / delete categories
- Add / edit / delete menu items (name, description, price, availability)
- Upload menu item images (Supabase Storage)

**Customers (view-only)**
- List customers per hotel, phone, name, birthdate, registered date
- Search / filter

**Feedback (view-only)**
- List feedback per hotel with rating + comment
- Average rating widget

**This site's content (bonus — since scope = "All of the above")**
- Edit hero text, room details, gallery images, contact info for the Sai Vijay page
- These fields go in a new `site_content` table keyed by restaurant_id

## Auth

- Email + password via **Supabase Auth** (same Supabase project as the DB)
- New `admin_users` table with a `role` column (`super_admin` / `hotel_admin`)
- Super admin sees all hotels; hotel admin sees only their assigned hotel
- Login at `/admin/login`, dashboard at `/admin/*` (protected by `_authenticated` layout)
- You create the first super_admin manually in Supabase dashboard (I'll give exact steps)

## Technical details

**Connection to existing Supabase** (not new Lovable Cloud project):
- Add 3 secrets via `add_secret`:
  - `SUPABASE_URL` — from hotel-menu-fi's Supabase project settings
  - `SUPABASE_PUBLISHABLE_KEY` (anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, for admin writes)
- Also add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for browser client (login form)

**New tables to add via SQL** (you run in Supabase SQL editor, I'll provide):
```sql
-- Admin users linked to Supabase Auth
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin','hotel_admin')),
  restaurant_id uuid REFERENCES restaurants(id),  -- null for super_admin
  created_at timestamptz DEFAULT now()
);

-- Site content for marketing pages (optional, for editing Sai Vijay content)
CREATE TABLE site_content (
  restaurant_id uuid PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
  hero_title text, hero_subtitle text,
  about_text text, contact_phone text, contact_email text, contact_address text,
  updated_at timestamptz DEFAULT now()
);

-- RLS + security-definer has_role() function + policies (I'll write all of these)
```

**File layout to add:**
```text
src/
├── integrations/supabase/
│   ├── client.ts              # browser client
│   ├── client.server.ts       # service-role client (server-only)
│   └── auth-middleware.ts     # requireAdminAuth for server fns
├── routes/
│   ├── admin/
│   │   ├── login.tsx          # public
│   │   └── _protected/        # gated
│   │       ├── route.tsx      # auth + role check
│   │       ├── index.tsx      # dashboard
│   │       ├── hotels.tsx     # list + add
│   │       ├── hotels.$id.tsx # edit + menu manager
│   │       ├── customers.tsx
│   │       └── feedback.tsx
├── lib/
│   ├── hotels.functions.ts    # createServerFn CRUD
│   ├── menu.functions.ts
│   └── admin.functions.ts
└── components/admin/
    ├── AdminLayout.tsx         # sidebar nav
    ├── HotelForm.tsx
    ├── MenuEditor.tsx
    └── ...
```

**Marketing site stays public.** The `/admin/*` routes are the only auth-protected surface. The Sai Vijay homepage keeps rendering as-is (later step: swap hardcoded content for `site_content` table reads).

## Build order (I'll do these in phases, one at a time)

**Phase 1 — Foundation** (this next step)
- Install `@supabase/supabase-js`, create Supabase clients, add secrets
- Set up auth middleware and `/admin/login` page
- Create `admin_users` table, RLS policies, `has_role()` function
- Instructions for you to create the first super_admin

**Phase 2 — Hotel CRUD**
- List / add / edit / delete hotels
- Copy `wa.me` link + QR code preview for each hotel

**Phase 3 — Menu editor**
- Categories + items CRUD per hotel
- Image upload to Supabase Storage

**Phase 4 — Customers + Feedback views**
- Read-only tables with filters

**Phase 5 — Site content editor**
- Edit Sai Vijay marketing page from admin
- Rewire home/about/rooms/etc. to read from `site_content` table

## What I need from you before Phase 1

1. From the existing Supabase project (hotel-menu-fi's), share these via the secure form I'll open:
   - Project URL (e.g. `https://xxxxx.supabase.co`)
   - `anon` / `publishable` key
   - `service_role` key
2. Confirmation to proceed with Phase 1 (auth + first super_admin creation).

## Out of scope for now (can add later)

- QR code image generation (bot handles per-hotel QR already, or add later)
- Analytics dashboards
- Multi-language menu editor
- Billing / SaaS subscription management
