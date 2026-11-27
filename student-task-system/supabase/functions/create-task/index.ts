import "@supabase/functions-js/edge-runtime.d.ts";
import { fromSupabaseUrl, withSupabase } from "@supabase/server";
import {
  handleErrors,
  HttpError,
  readJsonBody,
  requireFolderName,
  requireStudentId,
} from "../_shared/helpers.ts";

const MAX_FOLDERS_PER_STUDENT = 30;

// CREATE FOLDER (e.g. a subject like "SSE3308")
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
      const name = requireFolderName(body); // 1-40 characters, checked on the server

      // Stop one user from flooding the database
      const { count, error: countError } = await ctx.supabaseAdmin
        .from("folders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid);
      if (countError) throw countError;
      if ((count ?? 0) >= MAX_FOLDERS_PER_STUDENT) {
        throw new HttpError(429, `Folder limit reached (${MAX_FOLDERS_PER_STUDENT}).`);
      }

      // user_id comes from the token, never from the request body
      const { data, error } = await ctx.supabaseAdmin
        .from("folders")
        .insert({ user_id: uid, name })
        .select("id")
        .single();

      // 23505 = unique rule broken: this student already has this folder name
      if (error?.code === "23505") {
        throw new HttpError(409, "You already have a folder with this name.");
      }
      if (error) throw error;

      return {
        success: true,
        message: "Folder created successfully!",
        folderId: data.id,
      };
    }),
  ),
};
