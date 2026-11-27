// Shared helpers for create-task, toggle-task and delete-task.
import type { SupabaseContext } from "@supabase/server";

// An error we send back to the browser with a clear status code.
export class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

// Get the verified user ID from the login token (JWT).
// withSupabase({ auth: "user" }) has already checked the token signature.
// We NEVER trust a user ID sent in the request body.
export function requireStudentId(ctx: SupabaseContext): string {
  const uid = ctx.userClaims?.id;
  if (!uid || ctx.userClaims?.role !== "authenticated") {
    throw new HttpError(401, "Please login first.");
  }
  return uid;
}

// Read the JSON body safely: POST only, small size, must be an object.
export async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  if (req.method !== "POST") {
    throw new HttpError(405, "Method not allowed.");
  }
  const text = await req.text();
  if (text.length > 2000) {
    throw new HttpError(413, "Request is too large.");
  }
  try {
    const body = JSON.parse(text);
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
  } catch {
    // fall through to the error below
  }
  throw new HttpError(400, "Invalid request body.");
}

// Task IDs are UUIDs. Reject anything else before touching the database.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireTaskId(body: Record<string, unknown>): string {
  const taskId = body.taskId;
  if (typeof taskId !== "string" || !UUID_PATTERN.test(taskId)) {
    throw new HttpError(400, "Invalid task ID.");
  }
  return taskId;
}

// Folder IDs are UUIDs too.
export function requireFolderId(body: Record<string, unknown>): string {
  const folderId = body.folderId;
  if (typeof folderId !== "string" || !UUID_PATTERN.test(folderId)) {
    throw new HttpError(400, "Invalid folder ID.");
  }
  return folderId;
}

// For create-task: folderId is optional. Missing or null = "No folder".
export function optionalFolderId(body: Record<string, unknown>): string | null {
  if (body.folderId === undefined || body.folderId === null) return null;
  return requireFolderId(body);
}

// For create-task: dueDate is optional. Missing or null = "No due date".
// Must be a real calendar date "YYYY-MM-DD" between 2000 and 2100.
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function optionalDueDate(body: Record<string, unknown>): string | null {
  const value = body.dueDate;
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new HttpError(400, "Invalid due date.");
  }
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects impossible dates like 2026-02-31
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, "Invalid due date.");
  }
  const year = date.getUTCFullYear();
  if (year < 2000 || year > 2100) {
    throw new HttpError(400, "Invalid due date.");
  }
  return value;
}

// Title must be text, 1-100 characters after trimming, no control characters.
// deno-lint-ignore no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

// Folder name: text, 1-40 characters after trimming, no control characters.
export function requireFolderName(body: Record<string, unknown>): string {
  const name = body.name;
  if (typeof name !== "string") {
    throw new HttpError(400, "Folder name must contain 1-40 characters.");
  }
  const clean = name.trim();
  if (clean.length < 1 || clean.length > 40 || CONTROL_CHARS.test(clean)) {
    throw new HttpError(400, "Folder name must contain 1-40 characters.");
  }
  return clean;
}

export function requireTitle(body: Record<string, unknown>): string {
  const title = body.title;
  if (typeof title !== "string") {
    throw new HttpError(400, "Task title must contain 1-100 characters.");
  }
  const clean = title.trim();
  if (clean.length < 1 || clean.length > 100 || CONTROL_CHARS.test(clean)) {
    throw new HttpError(400, "Task title must contain 1-100 characters.");
  }
  return clean;
}

// Wraps a handler: turns results into JSON and hides internal errors.
export function handleErrors(
  handler: (req: Request, ctx: SupabaseContext) => Promise<Record<string, unknown>>,
) {
  return async (req: Request, ctx: SupabaseContext): Promise<Response> => {
    try {
      const result = await handler(req, ctx);
      return Response.json(result, { status: 200 });
    } catch (err) {
      if (err instanceof HttpError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      // Log the real error for you (Dashboard > Edge Functions > Logs),
      // but never show database details to the caller.
      console.error(err);
      return Response.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }
  };
}