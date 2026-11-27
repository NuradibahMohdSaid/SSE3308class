import "@supabase/functions-js/edge-runtime.d.ts";
import { fromSupabaseUrl, withSupabase } from "@supabase/server";
import {
  handleErrors,
  HttpError,
  optionalFolderId,
  readJsonBody,
  requireStudentId,
  requireTaskId,
} from "../_shared/helpers.ts";

// MOVE TASK to another folder (or to "No folder" when folderId is null)
export default {
  fetch: withSupabase(
    {
      auth: "user",
      issuer: fromSupabaseUrl(Deno.env.get("SUPABASE_URL")!),
      errors: { detailed: false },
    },
    handleErrors(async (req, ctx) => {
      const uid = requireStudentId(ctx); // verified UID from the token
      const body = await readJsonBody(req);
      const taskId = requireTaskId(body);
      const folderId = optionalFolderId(body); // null = "No folder"

      // 1. The target folder must belong to THIS student.
      //    (The database has a second check: tasks_folder_owner_fkey.)
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

      // 2. Update only if the task ID matches AND the task belongs to this user.
      const { data, error } = await ctx.supabaseAdmin
        .from("tasks")
        .update({ folder_id: folderId })
        .eq("id", taskId)
        .eq("user_id", uid)
        .select("id");
      if (error) throw error;

      // Same message whether it does not exist or belongs to someone else
      if (!data || data.length === 0) {
        throw new HttpError(404, "Task not found.");
      }

      return { success: true, folderId };
    }),
  ),
};
