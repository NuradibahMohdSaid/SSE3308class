import "@supabase/functions-js/edge-runtime.d.ts";
import { fromSupabaseUrl, withSupabase } from "@supabase/server";
import {
  handleErrors,
  HttpError,
  readJsonBody,
  requireFolderId,
  requireStudentId,
} from "../_shared/helpers.ts";

// DELETE FOLDER
// The tasks inside are KEPT: the database sets their folder_id to null
// ("No folder") because of "on delete set null (folder_id)".
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
      const folderId = requireFolderId(body);

      // Delete only if the ID matches AND the folder belongs to this user.
      const { data, error } = await ctx.supabaseAdmin
        .from("folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", uid)
        .select("id");
      if (error) throw error;

      // Same message whether it does not exist or belongs to someone else
      if (!data || data.length === 0) {
        throw new HttpError(404, "Folder not found.");
      }

      return { success: true, message: "Folder deleted. Its tasks were kept." };
    }),
  ),
};
