import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ROLES = [
  "super_admin",
  "director",
  "care_manager",
  "caregiver",
  "client",
  "hr_manager",
  "finance_officer",
  "compliance_officer",
];

const PROVISIONER_ROLES = ["super_admin", "director", "hr_manager", "care_manager"];

function json(obj: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, ...extraHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: caller, error: callerErr } = await supabase.auth.getUser();
    if (callerErr || !caller.user) return json({ error: "Unauthorized" }, 401);

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.user.id)
      .single();

    if (!profile || !PROVISIONER_ROLES.includes(profile.role as string)) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.full_name ?? "").trim();
    const password = String(body.password ?? "").trim();
    const role = String(body.role ?? "").trim();

    if (!email || !fullName || !password || password.length < 8) {
      return json({ error: "email, full_name and a password (min 8 chars) are required" }, 400);
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return json({ error: "Invalid role" }, 400);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (createErr || !created.user) {
      return json({ error: createErr?.message ?? "Failed to create user" }, 400);
    }

    const { error: profErr } = await admin.from("profiles").upsert(
      {
        id: created.user.id,
        email,
        full_name: fullName,
        role,
        status: "active",
      },
      { onConflict: "id" },
    );
    if (profErr) return json({ error: profErr.message }, 500);

    await admin.from("audit_logs").insert({
      user_id: caller.user.id,
      action: "user.created",
      entity_type: "profiles",
      entity_id: created.user.id,
      details: { email, role },
    });

    return json({ ok: true, id: created.user.id, email }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
