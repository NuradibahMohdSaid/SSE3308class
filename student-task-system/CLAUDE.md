# Student Task Web App – project context

SSE3308 Web Application Development assignment (UPM). A secure task manager where each
student can only see and change their own tasks. The lecturer's reference guide used
Firebase (Auth + Firestore + callable Cloud Functions); this project uses **Supabase
instead** because Firebase Cloud Functions need the paid Blaze plan.

The lecturer will try to hack the app, so **security is the top priority**.

## Assignment rubric (10 marks)
- Authentication: register, login, logout – 2
- Database: task data + real-time display – 2
- Server functions: create, toggle, delete – 3
- Security: authentication + ownership checks – 2
- UI: layout, responsiveness, usability – 1

Submission: source code + short README (setup and deployment). Demo with two accounts to
prove a user cannot see or modify another user's tasks, and explain how Auth, the database
and the functions work together.

## Stack
- Frontend: React + Vite (JavaScript), `@supabase/supabase-js` v2, plain CSS (UPM red theme)
- Backend: Supabase Free plan
  - Auth: email/password (Confirm email OFF, min password 8)
  - Postgres table `public.tasks` with Row Level Security
  - Realtime on `tasks` (INSERT and UPDATE only)
  - Edge Functions (Deno/TypeScript): `create-task`, `toggle-task`, `delete-task`
- Hosting (planned): Vercel Hobby, Root Directory = `student-task-system`
- Supabase project: `student-task-system-lab`, ref `sliczvjvycqayppzuuet`, region Singapore

## File structure
```
student-task-system/
  supabase/
    config.toml            # verify_jwt = true for all three functions
    schema.sql             # table, RLS, grants, realtime – already run in SQL Editor
    functions/
      _shared/helpers.ts   # HttpError, requireStudentId, readJsonBody, requireTaskId, requireTitle, handleErrors
      create-task/index.ts
      toggle-task/index.ts
      delete-task/index.ts
  src/
    supabase.js            # createClient with VITE_ env vars; window.supabase in DEV only
    App.jsx                # session check, shows Login or Dashboard
    pages/Login.jsx
    pages/Dashboard.jsx    # read via RLS, writes via functions.invoke, realtime channel
    index.css
  .env.local               # VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY (never commit)
```

## Security design (do not weaken)
- RLS enabled. Only policy: SELECT `to authenticated using ((select auth.uid()) = user_id)`.
- No INSERT/UPDATE/DELETE policies, plus `revoke` on anon/authenticated → the browser
  cannot write directly. All writes go through Edge Functions.
- DB check constraint: title 1–100 chars. `user_id` references `auth.users` on delete cascade.
- Edge Functions use `withSupabase` from `@supabase/server` with
  `auth: "user"`, `issuer: fromSupabaseUrl(SUPABASE_URL)`, `errors: { detailed: false }`.
- User ID always comes from the verified JWT (`ctx.userClaims.id`), never from the request body.
- Server-side validation: POST only, body ≤ 2000 chars, JSON object, title 1–100 chars with
  no control characters, taskId must be a UUID.
- Ownership: toggle checks `task.user_id === uid` and updates with `.eq("user_id", uid)`;
  delete uses `.eq("id", taskId).eq("user_id", uid)`. Not-owned and missing both return 404
  "Task not found."
- Limit of 200 tasks per user (429).
- Functions write with `ctx.supabaseAdmin` (secret key, bypasses RLS) – that's why the
  checks above are essential.
- Internal errors are logged with console.error and return a generic 500 message.
- Frontend uses only the publishable key. The secret key (`sb_secret_...`) must never appear
  in frontend code or git.
- Realtime: do NOT add a DELETE listener – Supabase does not apply RLS to DELETE events.
  The dashboard reloads the list after each delete instead.
- React renders titles as text (no dangerouslySetInnerHTML) to prevent XSS.

## Commands
```
npm run dev                                              # http://localhost:5173
npx supabase functions deploy create-task toggle-task delete-task --use-api
```
`--use-api` = no Docker needed.

## Progress so far
- [x] Supabase project created, auth configured, schema.sql run
- [x] Three Edge Functions deployed and listed in the dashboard
- [x] curl without login → 401 UNAUTHORIZED_NO_AUTH_HEADER (passed)
- [ ] Finish frontend files (pages/Login.jsx, pages/Dashboard.jsx, App.jsx, index.css; delete App.css)
- [ ] Run the functional tests and the 13 security tests (lab guide Section 10)
- [ ] Move project into the GitHub repo folder `SSE3308class`, commit and push
      (remove the old top-level node_modules from the repo)
- [ ] Deploy frontend to Vercel; add the Vercel URL in Supabase Auth URL Configuration
- [ ] Write the final README

## Working environment
- Windows, VS Code, terminal is **cmd** (not bash): use one-line commands, double quotes,
  escape inner quotes as `\"`. No `\` line continuation.
- Project path: `...\SSE3308 - WEB APP DEV\ASSIGN LAB\` (inside OneDrive).
- GitHub repo: `NuradibahMohdSaid/SSE3308class` (public).

## How to help me
- Use simple, plain English. Short explanations, bullet points.
- Give complete, ready-to-paste code, not fragments.
- Keep the security design above. If a change would weaken it, say so first.
- Free tier only – no paid services.
