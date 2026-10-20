const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdaenqmujfpduvjmuxzm.supabase.co";
const secretKey = process.env.SUPABASE_SECRET_KEY || "";
const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

async function main() {
  console.log("Testing Supabase connection with project: vdaenqmujfpduvjmuxzm...");
  
  // 1. Test secret key client
  const adminClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    const { data, error } = await adminClient.from("notes").select("*").limit(5);
    if (error) {
      console.log("Admin client query on 'notes':", error.message);
    } else {
      console.log("Admin client query success! Found notes:", data);
    }
  } catch (err) {
    console.error("Error querying with admin client:", err);
  }

  // 2. Test pubKey client
  const pubClient = createClient(url, pubKey);
  try {
    const { data, error } = await pubClient.from("notes").select("*").limit(5);
    if (error) {
      console.log("Publishable client query on 'notes':", error.message);
    } else {
      console.log("Publishable client query success! Found notes:", data);
    }
  } catch (err) {
    console.error("Error querying with pub client:", err);
  }
}

main();
