import { ImapFlow } from "https://esm.sh/imapflow@1.0.165";
import { PostalMime } from "https://esm.sh/postal-mime@2.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAIL_HOST = Deno.env.get("MAIL_HOST") ?? "mail.supremecluster.com";
const MAIL_USER = Deno.env.get("MAIL_USER") ?? "info@manassehhealthcare.org";
const SYNC_COUNT = 50;

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

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const client = new ImapFlow({
      host: MAIL_HOST,
      port: 993,
      secure: true,
      auth: { user: MAIL_USER, pass },
      logger: false,
    });

    await client.connect();
    try {
      const mailbox = await client.mailboxOpen("INBOX");
      const total = mailbox.exists;
      if (!total) {
        return json({ ok: true, synced: 0, total: 0 }, 200);
      }

      const startSeq = Math.max(1, total - SYNC_COUNT + 1);
      const messages: Record<string, unknown>[] = [];

      for await (const msg of client.fetch(`${startSeq}:*`, { source: true, uid: true, flags: true, internalDate: true })) {
        let raw = "";
        for await (const chunk of msg.source) {
          raw += chunk.toString("utf8");
        }
        try {
          const parsed = await new PostalMime().parse(raw);
          messages.push({
            message_id: parsed.messageId || `uid-${msg.uid}`,
            uid: msg.uid,
            from_name: parsed.from?.name ?? null,
            from_email: parsed.from?.address ?? null,
            to_email: parsed.to?.[0]?.address ?? null,
            subject: parsed.subject ?? null,
            body_text: parsed.text ?? null,
            body_html: parsed.html ?? null,
            date: parsed.date ? new Date(parsed.date).toISOString() : msg.internalDate ? new Date(msg.internalDate).toISOString() : null,
            seen: Array.isArray(msg.flags) ? msg.flags.includes("\\Seen") : false,
            direction: "inbound",
          });
        } catch (e) {
          console.error("mail parse error:", e);
        }
      }

      let inserted = 0;
      for (const m of messages) {
        const { error } = await admin
          .from("mail_messages")
          .upsert(m, { onConflict: "message_id" });
        if (error) {
          console.error("mail upsert error:", error);
        } else {
          inserted += 1;
        }
      }

      return json({ ok: true, synced: inserted, total }, 200);
    } finally {
      await client.logout().catch(() => {});
    }
  } catch (e) {
    console.error("mail-sync error:", e);
    return json({ error: String(e) }, 500);
  }
});
