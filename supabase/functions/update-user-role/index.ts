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

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    if (!profile || profile.role !== "super_admin") {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json();
    const userId = String(body.user_id ?? "");
    const role = String(body.role ?? "").trim();

    if (!userId || !ALLOWED_ROLES.includes(role)) {
      return json({ error: "user_id and a valid role are required" }, 400);
    }

    const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });
    if (authErr) return json({ error: authErr.message }, 400);

    const { error: profErr } = await admin
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    if (profErr) return json({ error: profErr.message }, 500);

    await admin.from("audit_logs").insert({
      user_id: caller.user.id,
      action: "user.role_changed",
      entity_type: "profiles",
      entity_id: userId,
      details: { role },
    });

    return json({ ok: true, user_id: userId, role }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
