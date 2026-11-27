import "@supabase/functions-js/edge-runtime.d.ts";
import { fromSupabaseUrl, withSupabase } from "@supabase/server";
import {
  handleErrors,
  HttpError,
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
        .insert({ user_id: uid, title, completed: false })
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