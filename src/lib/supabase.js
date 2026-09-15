import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://psyurwvdnizzatwhfhmt.supabase.co";

const supabaseKey =
  "sb_publishable_yyaAtjmFPQiMgTjYPzmsgQ_6iKzjx_Z";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);