# StudentTask – Secure Student Task Web App

SSE3308 Web Application Development assignment (UPM).
A secure task manager where **each student can only see and change their own tasks**.

**Live site:** https://task-system-one.vercel.app

> The lecturer's reference guide used Firebase (Auth + Firestore + Cloud Functions).
> This project uses **Supabase** instead, because Firebase Cloud Functions need the paid
> Blaze plan. Supabase gives the same three parts on the free plan:
> **Auth**, a **Postgres database** with Row Level Security, and **Edge Functions**.

---

## Features

- **Authentication:** register, login, logout, forgot / reset password (email link),
  clear message if an email is already registered.
- **Tasks:** add, tick complete / pending, delete – with **real-time** updates.
- **Folders (subjects):** create and delete folders, add a task into a folder,
  move a task between folders, "All Folders" page with progress per folder.
  Deleting a folder **keeps** its tasks (they move to "No folder").
- **Due dates:** pick a due date or tick "No due date"; tags show
  *Due today / tomorrow / Overdue*.
- **Schedule:** month calendar of due dates, tasks for a selected day,
  Overdue and Next 7 days lists.
- **Dashboard:** totals, completion donut chart, recent tasks, search, filter tabs.
- **Responsive UI:** desktop, tablet and phone layouts.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19 + Vite, plain CSS, `@supabase/supabase-js` v2 |
| Auth | Supabase Auth (email + password) |
| Database | Supabase Postgres, Row Level Security, Realtime |
| Server functions | Supabase Edge Functions (Deno / TypeScript) |
| Hosting | Vercel (frontend, free Hobby plan) + Supabase (free plan) |

---

## How Auth, the database and the functions work together

```
 Browser (React)                     Supabase
 ───────────────                     ────────────────────────────────────────
 1. Login ─────────────────────────▶ Auth  ──▶ returns a signed JWT (login token)

 2. READ tasks/folders ────────────▶ Postgres + RLS
    (publishable key + JWT)            policy: auth.uid() = user_id
                                       → only the student's own rows come back

 3. WRITE (add/tick/delete/move) ──▶ Edge Function (verify_jwt = true)
    supabase.functions.invoke()         • checks the JWT signature → user ID
                                        • validates the input
                                        • checks the task/folder belongs to that user
                                        • writes with the service role key
                                     ──▶ Postgres (database rules check again)

 4. Realtime ◀───────────────────── INSERT / UPDATE events, filtered by RLS
```

- **Auth** proves who the user is. Every request carries the JWT.
- **The database** only lets the browser **read** its own rows (RLS). The browser has
  **no** insert / update / delete permission, so it cannot change data directly.
- **Edge Functions** are the only way to change data. They take the user ID **from the
  verified JWT, never from the request body**, and check ownership before every change.

| Function | What it does | Ownership check |
|---|---|---|
| `create-task` | Add a task (title, optional folder, optional due date) | Folder must belong to the user |
| `toggle-task` | Mark a task complete / pending | Task must belong to the user |
| `delete-task` | Delete a task | Task must belong to the user |
| `move-task` | Move a task to another folder or "No folder" | Task **and** folder must belong to the user |
| `create-folder` | Add a folder (unique name per user) | – (user ID from the token) |
| `delete-folder` | Delete a folder, keep its tasks | Folder must belong to the user |

## Security design

| Layer | Protection |
|---|---|
| Auth | Email + password (min. 8 characters). Functions reject missing or fake tokens (401). |
| Database (RLS) | RLS on `tasks` and `folders`. Only policy: `SELECT ... using ((select auth.uid()) = user_id)`. |
| Database (grants) | `anon`: nothing. `authenticated`: `SELECT` only. `service_role` (functions): full access. |
| Database (rules) | Title 1–100 chars, folder name 1–40 chars, due date 2000–2100. A task can only be in a folder **with the same owner** (`tasks_folder_owner_fkey`). |
| Edge Functions | POST only, body ≤ 2000 chars, JSON object, IDs must be UUIDs, no control characters. Someone else's task/folder → `404 Not found` (same as missing, so IDs cannot be guessed). Max 200 tasks and 30 folders per user. Internal errors are logged and return a generic message. |
| Frontend | Only the **publishable** key is used. The secret key is never in the frontend or Git. Titles are rendered as text (no `dangerouslySetInnerHTML`) → no XSS. |
| Realtime | Only INSERT / UPDATE listeners. No DELETE listener, because Supabase does not apply RLS to DELETE events; the list reloads after each delete instead. |

The full list of attack tests (with code and expected results) is in
[`SECURITY_TESTS.md`](SECURITY_TESTS.md).

---

## Project structure

```
student-task-system/
├── index.html
├── public/favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx                  # checks the session → Login, Reset password or Dashboard
│   ├── supabase.js              # Supabase client (URL + publishable key from .env.local)
│   ├── index.css                # all styles
│   └── pages/
│       ├── Login.jsx            # login, register, forgot password
│       ├── ResetPassword.jsx    # set a new password after the email link
│       └── Dashboard.jsx        # dashboard, folders, schedule (reads via RLS, writes via functions)
├── supabase/
│   ├── config.toml              # verify_jwt = true for every function
│   ├── schema.sql               # tables, RLS, grants, rules, realtime
│   └── functions/
│       ├── _shared/helpers.ts   # login check, input validation, error handling
│       ├── create-task/   toggle-task/   delete-task/   move-task/
│       └── create-folder/ delete-folder/
├── SECURITY_TESTS.md
└── .env.local                   # NOT in Git (see below)
```

---

## Setup (run it locally)

### 1. Requirements
- **Node.js 20.19+ or 22+** (check with `node --version`)
- A free **Supabase** account – https://supabase.com
- Git

### 2. Get the code and install packages
```bash
git clone https://github.com/NuradibahMohdSaid/SSE3308class.git
cd SSE3308class/student-task-system
npm install
```

### 3. Create the Supabase project
1. Supabase Dashboard → **New project** (free plan). Wait until it is ready.
2. **Authentication → Sign In / Providers → Email:** enable Email, set the
   **minimum password length to 8**. "Confirm email" can be ON or OFF
   (OFF makes testing with two accounts easier).
3. **SQL Editor → New snippet:** paste the whole of [`supabase/schema.sql`](supabase/schema.sql)
   and click **Run**. If it warns about "destructive operations", choose **Run this query**
   (the file is safe to run more than once).
4. Check it worked (optional):
   ```sql
   select relname, relrowsecurity from pg_class where relname in ('tasks', 'folders');
   ```
   Both rows should show `true`.

### 4. Deploy the Edge Functions
No Docker needed (`--use-api`). Replace `<project-ref>` with your project's reference ID
(Project Settings → General).
```bash
npx supabase login
npx supabase functions deploy create-task toggle-task delete-task move-task create-folder delete-folder --use-api --project-ref <project-ref>
```
Supabase → **Edge Functions** should now list **6** functions.
`SUPABASE_URL` and the service role key are given to the functions automatically –
you do **not** need to set any secrets.

### 5. Add your environment variables
Create a file called **`.env.local`** in `student-task-system/`:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```
Find both values in Supabase → **Project Settings → API Keys**.

> ⚠️ Use the **publishable** key only. **Never** put the secret key (`sb_secret_...`)
> in this file, in frontend code, or in Git. `.env.local` is already in `.gitignore`.
> Variable names **must** start with `VITE_`, or Vite will not load them (blank page).

### 6. Run
```bash
npm run dev
```
Open http://localhost:5173 and register an account.

### 7. Set the redirect URLs (for confirm / reset-password emails)
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:5173` (change to the Vercel URL after deploying)
- **Redirect URLs:** add `http://localhost:5173/**`

---

## Deployment (Vercel)

1. Push the code to GitHub (never push `.env.local` or `node_modules`):
   ```bash
   git add .
   git status        # check: no .env.local, no node_modules
   git commit -m "Deploy"
   git push
   ```
2. https://vercel.com → **Add New… → Project** → import the GitHub repo
   (install the Vercel GitHub app for that repo if asked).
3. Settings on the import page:
   - **Root Directory:** `student-task-system`
   - **Framework Preset:** Vite (build `npm run build`, output `dist` – the defaults)
   - **Environment Variables:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
     (the same values as `.env.local`, publishable key only)
4. Click **Deploy**. You get a URL like `https://task-system-one.vercel.app`.
5. Back in Supabase → **Authentication → URL Configuration**:
   - **Site URL:** your Vercel URL
   - **Redirect URLs:** add `https://<your-app>.vercel.app/**` and keep `http://localhost:5173/**`
6. Every `git push` to `main` redeploys automatically. After changing an environment
   variable in Vercel, use **Deployments → ⋯ → Redeploy**.

### Updating the backend later
- Changed `schema.sql` → run the new part (or the whole file) in the **SQL Editor**.
- Changed a function → deploy it again, e.g.
  `npx supabase functions deploy create-task --use-api --project-ref <project-ref>`
- Update the database and functions **before** pushing a frontend that needs them.

---

## Testing

**Functional test:** register, log in, add a task (with and without a folder / due date),
tick it, move it to another folder, delete it, create and delete a folder, check the
Schedule page, log out, use "Forgot password?".

**Security test (demo with two accounts):**
1. Run `npm run dev` (the console tests use `window.supabase`, which only exists in dev mode).
2. Log in as **Student B** in a normal window and as **Student A** in an incognito window.
3. Follow [`SECURITY_TESTS.md`](SECURITY_TESTS.md): A tries to read, change, move and delete
   B's tasks and folders, both directly in the database and through the functions.
   Every attempt is blocked (empty result, `permission denied`, `401` or `404`).

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page | Check that the `.env.local` names start with `VITE_`, then restart `npm run dev`. Press F12 → Console to see the error. |
| "Something went wrong" when adding a task | Run `schema.sql` (grants / columns missing) and redeploy the functions. Check Supabase → Edge Functions → Logs. |
| Email link opens the wrong site or nothing | Set the Site URL and Redirect URLs in Supabase → Authentication → URL Configuration. |
| No email arrives | The free Supabase email service only sends a few emails per hour. Wait and try again. |
| Live site shows an old version | Check the files are pushed to `main`, wait for Vercel to finish, then press Ctrl + F5. |
