import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://bgedfydlbizkbyiuosxl.supabase.co";

const supabaseKey =
  "sb_publishable_GAHGPopj92QsM_KpIv11QA_figXUVfy";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  );