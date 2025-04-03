import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function uploadFile(file, folderPath, uniqueId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${uniqueId}-${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from(folderPath)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    throw error;
  }
  return `${supabaseUrl}/storage/v1/object/public/${folderPath}/${fileName}`;
}
