import "@supabase/functions-js/edge-runtime.d.ts";
import { fromSupabaseUrl, withSupabase } from "@supabase/server";
import {
  handleErrors,
  HttpError,
  readJsonBody,
  requireStudentId,
  requireTaskId,
} from "../_shared/helpers.ts";

// TOGGLE TASK STATUS
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

      // 1. Find the task
      const { data: task, error } = await ctx.supabaseAdmin
        .from("tasks")
        .select("id, user_id, completed")
        .eq("id", taskId)
        .maybeSingle();
      if (error) throw error;

      // 2. Ownership check: same message whether it does not exist or belongs
      //    to someone else, so attackers cannot guess other users' task IDs.
      if (!task || task.user_id !== uid) {
        throw new HttpError(404, "Task not found.");
      }

      // 3. Update. The user_id filter is a second ownership check.
      const newStatus = !task.completed;
      const { error: updateError } = await ctx.supabaseAdmin
        .from("tasks")
        .update({ completed: newStatus })
        .eq("id", taskId)
        .eq("user_id", uid);
      if (updateError) throw updateError;

      return { success: true, completed: newStatus };
    }),
  ),
};