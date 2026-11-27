import "@supabase/functions-js/edge-runtime.d.ts";
import { fromSupabaseUrl, withSupabase } from "@supabase/server";
import {
  handleErrors,
  HttpError,
  optionalDueDate,
  optionalFolderId,
  readJsonBody,
  requireStudentId,
  requireTitle,
} from "../_shared/helpers.ts";

const MAX_TASKS_PER_STUDENT = 200;

// CREATE TASK
export default {
  fetch: withSupabase(
    {
      auth: "user", // only logged-in users; the JWT signature is verified
      issuer: fromSupabaseUrl(Deno.env.get("SUPABASE_URL")!), // only tokens from THIS project
      errors: { detailed: false }, // short error messages for attackers
    },
    handleErrors(async (req, ctx) => {
      const uid = requireStudentId(ctx); // verified UID from the token
      const body = await readJsonBody(req);
      const title = requireTitle(body); // validate input on the server
      const folderId = optionalFolderId(body); // null = "No folder"
      const dueDate = optionalDueDate(body); // null = "No due date"

      // Ownership check: the folder must belong to THIS student.
      // (The database has a second check: tasks_folder_owner_fkey.)
      if (folderId) {
        const { data: folder, error: folderError } = await ctx.supabaseAdmin
          .from("folders")
          .select("id")
          .eq("id", folderId)
          .eq("user_id", uid)
          .maybeSingle();
        if (folderError) throw folderError;
        if (!folder) throw new HttpError(404, "Folder not found.");
      }

      // Stop one user from flooding the database
      const { count, error: countError } = await ctx.supabaseAdmin
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid);
      if (countError) throw countError;
      if ((count ?? 0) >= MAX_TASKS_PER_STUDENT) {
        throw new HttpError(429, `Task limit reached (${MAX_TASKS_PER_STUDENT}).`);
      }

      // user_id comes from the token, never from the request body
      const { data, error } = await ctx.supabaseAdmin
        .from("tasks")
        .insert({ user_id: uid, title, completed: false, folder_id: folderId, due_date: dueDate })
        .select("id")
        .single();
      if (error) throw error;

      return {
        success: true,
        message: "Task created successfully!",
        taskId: data.id,
      };
    }),
  ),
};
