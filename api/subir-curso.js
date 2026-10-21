/* Vercel Function: recibe los archivos de "Agrega tu curso", los revisa y los envía por correo (Resend).
   Variables de entorno (Vercel > Settings > Environment Variables):
     RESEND_API_KEY   obligatoria
     CONTACT_TO       correo que recibe (por defecto myponderup@gmail.com)
     RESEND_FROM      remitente (por defecto "My PonderUP <onboarding@resend.dev>")
     ALLOWED_ORIGINS  orígenes permitidos separados por coma (o SITE_URL). Sin ellas solo se acepta el mismo dominio.
     UP_GLOBAL_DAILY_CAP (def. 30) | UP_IP_DAILY_MAX (def. 5)
   Los contadores viven en memoria de la instancia: sirven de freno, no son estrictos. Añade además una regla de
   Rate Limit en Vercel Firewall sobre /api/subir-curso. */
const MAX_FILES = 3, MAX_TOTAL = 3 * 1024 * 1024;
const TYPES = {
  pdf: [[0x25, 0x50, 0x44, 0x46]],
  docx: [[0x50, 0x4B, 0x03, 0x04]],
  png: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  jpg: [[0xFF, 0xD8, 0xFF]],
  jpeg: [[0xFF, 0xD8, 0xFF]],
};
const ipHits = new Map();
let day = "", globalCount = 0;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ext = n => { const m = /\.([a-z0-9]+)$/i.exec(n || ""); return m ? m[1].toLowerCase() : ""; };
const safeName = n => {
  const e = ext(n);
  const base = String(n || "archivo").replace(/\.[^.]*$/, "").normalize("NFKD").replace(/[^\w.\- ]+/g, "").trim().slice(0, 60) || "archivo";
  return base + "." + e;
};
const sigOk = (buf, e) => (TYPES[e] || []).some(s => s.every((v, i) => buf[i] === v));
const fail = (res, status, error) => res.status(status).json({ ok: false, error });

function deepCheck(buf, e) {
  const t = buf.toString("latin1");
  if (e === "pdf") return !/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction)\b/.test(t) && !/\/AA\b/.test(t);
  if (e === "docx") return t.includes("word/") && !/vbaProject|\.bin\b|oleObject|embeddings\//i.test(t);
  return true;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return fail(res, 405, "metodo"); }
  if (!/application\/json/i.test(req.headers["content-type"] || "")) return fail(res, 415, "invalido");

  // Origen
  const origin = req.headers.origin || "";
  if (origin) {
    const allowed = (process.env.ALLOWED_ORIGINS || process.env.SITE_URL || "").split(",").map(s => s.trim().replace(/\/$/, "")).filter(Boolean);
    let ok = allowed.includes(origin.replace(/\/$/, ""));
    try { if (!ok && new URL(origin).host === req.headers.host) ok = true; } catch (_) {}
    if (!ok) return fail(res, 403, "origen");
  }

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (_) { b = null; } }
  if (!b || typeof b !== "object") return fail(res, 400, "invalido");

  if (b._gotcha) return res.status(200).json({ ok: true }); // trampa para bots

  const curso = String(b.curso || "").replace(/\s+/g, " ").trim();
  const mensaje = String(b.mensaje || "").trim();
  const email = String(b.email || "").trim();
  if (curso.length < 3 || curso.length > 80 || mensaje.length > 500 || email.length > 120) return fail(res, 400, "invalido");
  if (email && !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) return fail(res, 400, "invalido");
  if (/(https?:\/\/|www\.)/i.test(curso + " " + mensaje)) return fail(res, 400, "enlace");
  if (Number(b.seg) < 2) return fail(res, 400, "espera");

  // Archivos
  const list = Array.isArray(b.archivos) ? b.archivos : [];
  if (!list.length || list.length > MAX_FILES) return fail(res, 400, "archivos");
  const attachments = [];
  let total = 0;
  for (const a of list) {
    if (!a || typeof a.nombre !== "string" || typeof a.b64 !== "string") return fail(res, 400, "archivos");
    const e = ext(a.nombre);
    if (!TYPES[e] || !/^[A-Za-z0-9+/]+={0,2}$/.test(a.b64)) return fail(res, 400, "tipo");
    const buf = Buffer.from(a.b64, "base64");
    total += buf.length;
    if (!buf.length || total > MAX_TOTAL) return fail(res, 400, "tamano");
    if (!sigOk(buf, e) || !deepCheck(buf, e)) return fail(res, 400, "tipo");
    attachments.push({ filename: safeName(a.nombre), content: buf.toString("base64") });
  }

  // Límites por IP y globales
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "?").split(",")[0].trim();
  const today = new Date().toISOString().slice(0, 10);
  if (day !== today) { day = today; globalCount = 0; ipHits.clear(); }
  const hit = ipHits.get(ip) || { n: 0, last: 0 };
  if (Date.now() - hit.last < 20000) return fail(res, 429, "espera");
  if (hit.n >= (+process.env.UP_IP_DAILY_MAX || 5)) return fail(res, 429, "limite_dia");
  if (globalCount >= (+process.env.UP_GLOBAL_DAILY_CAP || 30)) return fail(res, 429, "cupo");

  const key = process.env.RESEND_API_KEY;
  if (!key) return fail(res, 500, "servidor");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "My PonderUP <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO || "myponderup@gmail.com"],
        ...(email ? { reply_to: email } : {}),
        subject: "Nuevo curso: " + curso,
        html: `<h2>Nuevo curso enviado desde My PonderUP</h2>
<p><b>Curso:</b> ${esc(curso)}</p>
<p><b>Comentario:</b> ${mensaje ? esc(mensaje).replace(/\n/g, "<br>") : "(sin comentario)"}</p>
<p><b>Correo del alumno:</b> ${email ? esc(email) : "(no dejó correo)"}</p>
<p><b>Archivos adjuntos:</b> ${attachments.map(a => esc(a.filename)).join(", ")}</p>
<p style="color:#888;font-size:12px">Los archivos fueron revisados por tipo, pero ábrelos con precaución.</p>`,
        attachments,
      }),
    });
    if (!r.ok) return fail(res, 502, "servidor");
  } catch (_) {
    return fail(res, 502, "servidor");
  }

  hit.n++; hit.last = Date.now(); ipHits.set(ip, hit); globalCount++;
  return res.status(200).json({ ok: true });
};
module.exports.config = { api: { bodyParser: { sizeLimit: "4.5mb" } } };
