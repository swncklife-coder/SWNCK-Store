import { createClient } from "@supabase/supabase-js";

// Prefer explicit SUPABASE_URL, fall back to VITE_SUPABASE_URL from the frontend env.
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error("Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD");
  process.exit(1);
}

const adminClient = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error("Error listing users:", error.message);
    process.exit(1);
  }

  const user = data.users.find((u) => u.email === adminEmail);
  if (!user) {
    console.error(`No user found with email ${adminEmail}`);
    process.exit(1);
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: adminPassword,
  });

  if (updateError) {
    console.error("Error updating user password:", updateError.message);
    process.exit(1);
  }

  console.log("Password updated for", adminEmail);
}

main();

