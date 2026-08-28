import PostalMime from "https://esm.sh/postal-mime@2.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAIL_HOST = Deno.env.get("MAIL_HOST") ?? "mail.supremecluster.com";
const MAIL_USER = Deno.env.get("MAIL_USER") ?? "info@manassehhealthcare.org";
const SYNC_COUNT = 50;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Minimal IMAP client over Deno TLS (no external IMAP dependency). */
class ImapClient {
  private conn: Deno.TlsConn;
  private buffer = new Uint8Array();
  private tag = 1;

  constructor(conn: Deno.TlsConn) {
    this.conn = conn;
  }

  static async connect(host: string, port: number): Promise<ImapClient> {
    const conn = await Deno.connectTls({ hostname: host, port });
    const client = new ImapClient(conn);
    await client.readLine(); // server greeting
    return client;
  }

  private async readChunk(): Promise<boolean> {
    const reader = this.conn.readable.getReader();
    try {
      const { value, done } = await reader.read();
      if (done) return false;
      const nb = new Uint8Array(this.buffer.length + value.length);
      nb.set(this.buffer);
      nb.set(value, this.buffer.length);
      this.buffer = nb;
      return true;
    } finally {
      reader.releaseLock();
    }
  }

  async readLine(): Promise<string | null> {
    while (true) {
      const idx = this.buffer.indexOf(10); // \n
      if (idx >= 0) {
        const raw = this.buffer.subarray(0, idx);
        this.buffer = this.buffer.subarray(idx + 1);
        return decoder.decode(raw).replace(/\r$/, "");
      }
      const more = await this.readChunk();
      if (!more) return null;
    }
  }

  async readExact(n: number): Promise<Uint8Array> {
    while (this.buffer.length < n) {
      const more = await this.readChunk();
      if (!more) break;
    }
    const out = this.buffer.subarray(0, n);
    this.buffer = this.buffer.subarray(n);
    return out;
  }

  async command(cmd: string): Promise<{ lines: string[]; literals: Uint8Array[] }> {
    const tag = `a${String(this.tag++).padStart(3, "0")}`;
    await this.conn.write(encoder.encode(`${tag} ${cmd}\r\n`));
    const lines: string[] = [];
    const literals: Uint8Array[] = [];
    while (true) {
      const line = await this.readLine();
      if (line === null) break;
      lines.push(line);
      const lit = line.match(/\{(\d+)\}$/);
      if (lit) {
        literals.push(await this.readExact(parseInt(lit[1])));
        await this.readLine(); // trailing \r\n after literal
      }
      if (line.startsWith(tag)) break;
    }
    return { lines, literals };
  }

  async logout() {
    try {
      await this.conn.write(encoder.encode("a999 LOGOUT\r\n"));
    } catch {
      /* ignore */
    }
    try {
      this.conn.close();
    } catch {
      /* ignore */
    }
  }
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

    const client = await ImapClient.connect(MAIL_HOST, 993);
    try {
      const login = await client.command(`LOGIN "${MAIL_USER}" "${pass}"`);
      if (!login.lines.some((l) => l.startsWith("a") && /\sOK\s/i.test(l))) {
        throw new Error("Login failed: " + login.lines.join(" | "));
      }

      const sel = await client.command("SELECT INBOX");
      const existsLine = sel.lines.find((l) => /^\* \d+ EXISTS/.test(l));
      const exists = existsLine ? parseInt(existsLine.split(" ")[1] || "0") : 0;
      if (exists === 0) {
        return json({ ok: true, synced: 0, total: 0 }, 200);
      }

      const start = Math.max(1, exists - SYNC_COUNT + 1);
      const fetch = await client.command(`FETCH ${start}:* (UID FLAGS BODY.PEEK[])`);

      // Parse per-message FETCH blocks; each BODY[] literal maps to a message.
      const messages: { uid: number | null; seen: boolean; raw: string }[] = [];
      let litIdx = 0;
      for (const line of fetch.lines) {
        if (line.startsWith("* ") && / FETCH \(/.test(line) && /\{\d+\}$/.test(line)) {
          const uidM = line.match(/UID (\d+)/);
          const uid = uidM ? parseInt(uidM[1]) : null;
          const seen = /\\Seen/.test(line);
          const raw = fetch.literals[litIdx] ? decoder.decode(fetch.literals[litIdx]) : "";
          litIdx++;
          messages.push({ uid, seen, raw });
        }
      }

      let synced = 0;
      for (const msg of messages) {
        try {
          const parsed = await new PostalMime().parse(msg.raw);
          const { error } = await admin.from("mail_messages").upsert({
            message_id: parsed.messageId || `uid-${msg.uid ?? Date.now()}`,
            uid: msg.uid,
            from_name: parsed.from?.name ?? null,
            from_email: parsed.from?.address ?? null,
            to_email: parsed.to?.[0]?.address ?? null,
            subject: parsed.subject ?? null,
            body_text: parsed.text ?? null,
            body_html: parsed.html ?? null,
            date: parsed.date ? new Date(parsed.date).toISOString() : null,
            seen: msg.seen,
            direction: "inbound",
          }, { onConflict: "message_id" });
          if (error) {
            console.error("mail upsert error:", error);
          } else {
            synced += 1;
          }
        } catch (e) {
          console.error("mail parse error:", e);
        }
      }

      return json({ ok: true, synced, total: exists }, 200);
    } finally {
      await client.logout();
    }
  } catch (e) {
    console.error("mail-sync error:", e);
    return json({ error: String(e) }, 500);
  }
});
