import {createClient} from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = "https://ttwderpqdribgfikkzel.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6M0A3JsGfCqdJYGojr9nPw_1tK0g7PP"

// Untuk mengexport, sehingga file lain bisa mengimport supabase
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
)