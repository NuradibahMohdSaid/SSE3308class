# Security Tests – Student Task Web App

These tests prove that a student can only see and change their own tasks.
Run them on **http://localhost:5173** (`npm run dev`), because `window.supabase`
is only available in development mode.

## Setup (do this once)

1. Register two accounts: **Student A** and **Student B**.
2. **Normal Chrome window:** log in as **B**, add a task called `B secret task`.
3. Open DevTools (**F12 → Console**). If Chrome blocks pasting, type `allow pasting` and press Enter.
4. As B, run this and **copy the two values** it prints:

```js
const me = (await supabase.auth.getUser()).data.user.id;
const { data } = await supabase.from("tasks").select("id, title");
console.log("B_USER_ID =", me);
console.log("B_TASK_ID =", data[0].id, data[0].title);
```

5. **Incognito window** (Ctrl+Shift+N): open localhost:5173 and log in as **A**. Add one task.
6. In A's console, paste this helper and B's two values:

```js
const URL = "https://sliczvjvycqayppzuuet.supabase.co";
const B_USER_ID = "paste-B-user-id-here";
const B_TASK_ID = "paste-B-task-id-here";

// Calls an Edge Function and shows the HTTP status + message
async function call(name, body, method = "POST") {
  const { data, error } = await supabase.functions.invoke(name, { body, method });
  if (!error) return { status: 200, body: data };
  const res = error.context;
  return { status: res?.status, body: await res?.json?.().catch(() => null) };
}
```

Run each test below **in A's console**.

---

## Test 1 – Function call without login is rejected

```js
const r = await fetch(`${URL}/functions/v1/create-task`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "hack" }),
});
console.log(r.status, await r.text());
```
**Expected:** `401` (no Authorization header).

## Test 2 – Fake / forged token is rejected

```js
const r = await fetch(`${URL}/functions/v1/create-task`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer fake.token.value" },
  body: JSON.stringify({ title: "hack" }),
});
console.log(r.status, await r.text());
```
**Expected:** `401` (invalid JWT).

## Test 3 – A sees only their own tasks (no filter)

```js
const { data, error } = await supabase.from("tasks").select("id, title, user_id");
console.log(data, error);
```
**Expected:** only A's tasks. `B secret task` is **not** in the list
(RLS adds `user_id = auth.uid()` automatically).

## Test 4 – A cannot read B's task by its ID

```js
const { data, error } = await supabase.from("tasks").select("*").eq("id", B_TASK_ID);
console.log(data, error);
```
**Expected:** `[]` (empty array).

## Test 5 – A cannot read B's tasks by B's user ID

```js
const { data, error } = await supabase.from("tasks").select("*").eq("user_id", B_USER_ID);
console.log(data, error);
```
**Expected:** `[]` (empty array).

## Test 6 – Browser cannot insert directly (bypassing the function)

```js
const { data, error } = await supabase.from("tasks").insert({ title: "direct insert", user_id: B_USER_ID });
console.log(data, error);
```
**Expected:** error `permission denied for table tasks` (code `42501`).

## Test 7 – Browser cannot update directly

```js
const { data, error } = await supabase.from("tasks").update({ title: "HACKED" }).eq("id", B_TASK_ID);
console.log(data, error);
```
**Expected:** error `permission denied for table tasks`. B's task is unchanged.

## Test 8 – Browser cannot delete directly

```js
const { data, error } = await supabase.from("tasks").delete().eq("id", B_TASK_ID);
console.log(data, error);
```
**Expected:** error `permission denied for table tasks`. B's task still exists.

## Test 9 – A cannot toggle B's task through the function

```js
console.log(await call("toggle-task", { taskId: B_TASK_ID }));
```
**Expected:** `{ status: 404, body: { error: "Task not found." } }`.
Check B's window: the task is **not** ticked.

## Test 10 – A cannot delete B's task through the function

```js
console.log(await call("delete-task", { taskId: B_TASK_ID }));
```
**Expected:** `{ status: 404, body: { error: "Task not found." } }`.
Check B's window: the task is still there.

## Test 11 – Fake `user_id` in the request body is ignored

```js
const r = await call("create-task", { title: "spoof test", user_id: B_USER_ID });
console.log(r);
const { data } = await supabase.from("tasks").select("id, title, user_id").eq("id", r.body.taskId);
console.log(data);
```
**Expected:** the task is created, but `user_id` is **A's** ID, not B's.
It appears in A's list, not in B's. (The function takes the user ID from the verified JWT only.)

## Test 12 – Server-side input validation

```js
console.log("empty title   ", await call("create-task", { title: "   " }));
console.log("101 chars     ", await call("create-task", { title: "x".repeat(101) }));
console.log("control char  ", await call("create-task", { title: "bad\u0000title" }));
console.log("title not text", await call("create-task", { title: 12345 }));
console.log("bad task ID   ", await call("toggle-task", { taskId: "1 OR 1=1" }));
console.log("body too big  ", await call("create-task", { title: "a", junk: "x".repeat(3000) }));
console.log("GET method    ", await call("create-task", undefined, "GET"));
console.log("bad due date  ", await call("create-task", { title: "x", dueDate: "2026-02-31" }));
console.log("due date text ", await call("create-task", { title: "x", dueDate: "tomorrow" }));
```
**Expected:** `400`, `400`, `400`, `400`, `400`, `413`, `405`, `400`, `400`. No tasks are created.

## Test 13 – XSS: HTML in a title is shown as plain text

```js
console.log(await call("create-task", { title: '<img src=x onerror="alert(1)">' }));
```
**Expected:** the task shows the text `<img src=x onerror="alert(1)">` in the list.
**No** alert pop-up appears (React escapes text; no `dangerouslySetInnerHTML`).

---

## Folder tests (14–16)

Setup: as **B**, create a folder (e.g. `B folder`), then in B's console:

```js
const { data } = await supabase.from("folders").select("id, name");
console.log("B_FOLDER_ID =", data[0].id);
```

In A's console: `const B_FOLDER_ID = "paste-B-folder-id-here";`

## Test 14 – A cannot see B's folders

```js
const { data, error } = await supabase.from("folders").select("*");
console.log(data, error);
```
**Expected:** only A's folders. `B folder` is **not** listed.

## Test 15 – A cannot put a task into B's folder

```js
console.log(await call("create-task", { title: "sneaky", folderId: B_FOLDER_ID }));
```
**Expected:** `{ status: 404, body: { error: "Folder not found." } }`. No task is created.
(Even if the function had a bug, the database rule `tasks_folder_owner_fkey` would refuse it.)

## Test 16 – A cannot delete B's folder

```js
console.log(await call("delete-folder", { folderId: B_FOLDER_ID }));
```
**Expected:** `{ status: 404, body: { error: "Folder not found." } }`. B's folder still exists.

## Test 17 – A cannot move B's task, or move a task into B's folder

```js
console.log("move B's task     ", await call("move-task", { taskId: B_TASK_ID, folderId: null }));
const { data: mine } = await supabase.from("tasks").select("id").limit(1);
console.log("into B's folder   ", await call("move-task", { taskId: mine[0].id, folderId: B_FOLDER_ID }));
```
**Expected:** `404 "Task not found."` and `404 "Folder not found."`. Nothing changes for B.

---

## Extra demo (no console needed)

- **Real-time privacy:** keep A and B side by side. Add a task as A → it appears instantly
  in A's window only; B's list does not change.
- **Logged out:** log out, then run
  `await supabase.from("tasks").select("*")` → error `permission denied` or `[]`. No data.

## Clean up

Delete the test tasks (`spoof test`, the `<img ...>` task) using the Delete button.

## Why it is secure (for the demo explanation)

| Layer | Protection |
|---|---|
| **Auth** | Supabase Auth issues a signed JWT on login. Edge Functions use `verify_jwt = true` + `withSupabase({ auth: "user" })`, so no token / fake token → 401. |
| **Database** | Row Level Security: only a SELECT policy `auth.uid() = user_id`. The browser role has SELECT only, so it cannot insert, update or delete directly. |
| **Functions** | User ID comes only from the verified JWT. Toggle/delete/move (and folders) also check `user_id = uid` → someone else's task or folder returns 404. A task can only go into your own folder (checked in the function AND by a database rule). Inputs are validated on the server. |
| **Frontend** | Only the publishable key is used. Titles are rendered as text (XSS-safe). No realtime DELETE listener (DELETE events skip RLS). |
