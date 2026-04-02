import { supabase } from "@/lib/supabase";

const BUCKET = "uploads";

export async function uploadSiteImage(file: File): Promise<{ publicUrl: string }> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("You must be signed in to upload images.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) ? ext : "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}
