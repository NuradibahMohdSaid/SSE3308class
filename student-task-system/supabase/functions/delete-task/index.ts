import "@supabase/functions-js/edge-runtime.d.ts";
import { fromSupabaseUrl, withSupabase } from "@supabase/server";
import {
  handleErrors,
  HttpError,
  readJsonBody,
  requireStudentId,
  requireTaskId,
} from "../_shared/helpers.ts";

// DELETE TASK
export default {
  fetch: withSupabase(
    {
      auth: "user",
      issuer: fromSupabaseUrl(Deno.env.get("SUPABASE_URL")!),
      errors: { detailed: false },
    },
    handleErrors(async (req, ctx) => {
      const uid = requireStudentId(ctx);
      const body = await readJsonBody(req);
      const taskId = requireTaskId(body);

      // Delete only if the ID matches AND the task belongs to this user.
      // Both conditions are in one query, so another user's task is never touched.
      const { data, error } = await ctx.supabaseAdmin
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", uid)
        .select("id");
      if (error) throw error;

      if (!data || data.length === 0) {
        throw new HttpError(404, "Task not found.");
      }

      return { success: true, message: "Task deleted successfully!" };
    }),
  ),
};