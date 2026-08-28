import nodemailer from "https://esm.sh/nodemailer@6.9.13";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAIL_HOST = Deno.env.get("MAIL_HOST") ?? "mail.supremecluster.com";
const MAIL_USER = Deno.env.get("MAIL_USER") ?? "info@manassehhealthcare.org";

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

    const { data: caller, error: callerErr } = await supabase.auth.getUser();
    if (callerErr || !caller.user) return json({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", caller.user.id).single();
    if (!profile || profile.role === "client" || profile.role === "caregiver") {
      return json({ error: "Forbidden" }, 403);
    }

    const pass = Deno.env.get("MAIL_PASS");
    if (!pass) {
      return json({ error: "Mailbox not configured. Please add the MAIL_PASS secret." }, 500);
    }

    const body = await req.json();
    const to = String(body.to ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const text = String(body.text ?? "").trim();
    const html = typeof body.html === "string" ? body.html : undefined;

    if (!to || !subject || !text) {
      return json({ error: "to, subject and text are required" }, 400);
    }

    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: 465,
      secure: true,
      auth: { user: MAIL_USER, pass },
    });

    const info = await transporter.sendMail({
      from: `"Manasseh Health Care" <${MAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    await admin.from("mail_messages").insert({
      message_id: info.messageId || `sent-${Date.now()}`,
      from_name: "Manasseh Health Care",
      from_email: MAIL_USER,
      to_email: to,
      subject,
      body_text: text,
      body_html: html ?? null,
      date: new Date().toISOString(),
      seen: true,
      direction: "sent",
    });

    return json({ ok: true, messageId: info.messageId ?? null }, 200);
  } catch (e) {
    console.error("mail-send error:", e);
    return json({ error: String(e) }, 500);
  }
});
