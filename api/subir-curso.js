/* api/subir-curso.js  (Vercel Function, Node.js)
   Recibe el formulario "Agrega tu curso" y manda el sílabo o reglamento por correo con Resend.
   Los archivos nunca se guardan ni se publican: solo viajan en el correo.

   Variables de entorno (Vercel > Settings > Environment Variables):
     RESEND_API_KEY        obligatoria
     CONTACT_TO            correo que recibe (def. myponderup@gmail.com). Mientras uses onboarding@resend.dev
                           debe ser EL MISMO correo con el que creaste tu cuenta de Resend.
     RESEND_FROM           remitente (def. "My PonderUP <onboarding@resend.dev>"). Con dominio verificado: "My PonderUP <hola@tudominio.com>"
     ALLOWED_ORIGINS       opcional, orígenes permitidos separados por coma (def.: cualquiera)
     UP_GLOBAL_DAILY_CAP   tope de envíos por día en todo el sitio (def. 30)
     UP_IP_DAILY_MAX       tope por día y por IP (def. 5)

   Respuestas: 200 {ok:true}  |  4xx/5xx {error:"codigo"}. Los códigos son los que entiende index.html:
     invalido, archivos, tipo, tamano, enlace, espera, limite_dia, cupo, servidor */

"use strict";

const MAX_FILES = 3;
const MAX_TOTAL = 3 * 1024 * 1024; /* 3 MB en total, igual que el formulario */
const MIN_SECONDS = 3;
const TO = process.env.CONTACT_TO || "myponderup@gmail.com";
const FROM = process.env.RESEND_FROM || "My PonderUP <onboarding@resend.dev>";
const GLOBAL_CAP = Math.max(1, parseInt(process.env.UP_GLOBAL_DAILY_CAP, 10) || 30);
const IP_MAX = Math.max(1, parseInt(process.env.UP_IP_DAILY_MAX, 10) || 5);

/* Contadores en memoria: sirven de freno básico, pero cada instancia de Vercel tiene los suyos y se reinician. */
const ipHits = new Map();
const day = { key: "", n: 0 };
const today = () => new Date().toISOString().slice(0, 10);

const EXT = {
  pdf: (b) => b.subarray(0, 1024).includes("%PDF-"),
  docx: (b) => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
  png: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  jpg: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
};
EXT.jpeg = EXT.jpg;

const fail = (res, status, error) => res.status(status).json({ error });
const clean = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const ext = (n) => { const m = /\.([a-z0-9]+)$/i.exec(n || ""); return m ? m[1].toLowerCase() : ""; };
const safeName = (n) => clean(String(n).split(/[\\/]/).pop(), 100).replace(/[^\w .()\-áéíóúüñÁÉÍÓÚÜÑ]/g, "_") || "archivo";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return fail(res, 405, "invalido"); }

  const allowed = (process.env.ALLOWED_ORIGINS || process.env.SITE_URL || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
  const origin = String(req.headers.origin || "").replace(/\/$/, "");
  if (allowed.length && origin && !allowed.includes(origin)) return fail(res, 403, "invalido");

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (_) { body = null; } }
  if (!body || typeof body !== "object") return fail(res, 400, "invalido");

  /* Campo trampa para bots: se responde "ok" sin enviar nada */
  if (body._gotcha) return res.status(200).json({ ok: true });

  const curso = clean(body.curso, 80);
  const mensaje = clean(body.mensaje, 500);
  const email = clean(body.email, 120);
  if (curso.length < 3) return fail(res, 400, "invalido");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "invalido");
  if (/(https?:\/\/|www\.)/i.test(curso + " " + mensaje)) return fail(res, 400, "enlace");
  if (!(Number(body.seg) >= MIN_SECONDS)) return fail(res, 429, "espera");

  const lista = body.archivos;
  if (!Array.isArray(lista) || lista.length < 1 || lista.length > MAX_FILES) return fail(res, 400, "archivos");

  const adjuntos = [];
  let total = 0;
  for (const a of lista) {
    if (!a || typeof a.b64 !== "string" || !a.b64 || !/^[A-Za-z0-9+/=\r\n]+$/.test(a.b64)) return fail(res, 400, "archivos");
    const e = ext(a.nombre);
    if (!EXT[e]) return fail(res, 400, "tipo");
    const buf = Buffer.from(a.b64, "base64");
    total += buf.length;
    if (total > MAX_TOTAL) return fail(res, 413, "tamano");
    /* Se revisa el contenido real (primeros bytes), no el tipo que dice el navegador */
    if (!EXT[e](buf)) return fail(res, 400, "tipo");
    /* PDFs con JavaScript se aceptan. Solo se bloquea /Launch (ejecutar programas), que casi ningún sílabo trae. */
    if (e === "pdf" && buf.includes("/Launch")) return fail(res, 400, "tipo");
    /* Word con macros */
    if (e === "docx" && buf.includes("vbaProject.bin")) return fail(res, 400, "tipo");
    adjuntos.push({ filename: safeName(a.nombre), content: buf.toString("base64") });
  }

  /* Topes de envíos */
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "desconocida";
  const d = today();
  if (day.key !== d) { day.key = d; day.n = 0; ipHits.clear(); }
  if (day.n >= GLOBAL_CAP) return fail(res, 429, "cupo");
  if ((ipHits.get(ip) || 0) >= IP_MAX) return fail(res, 429, "limite_dia");

  const key = process.env.RESEND_API_KEY;
  if (!key) { console.error("subir-curso: falta RESEND_API_KEY"); return fail(res, 503, "servidor"); }

  const texto = ["Curso: " + curso, "Correo del alumno: " + (email || "(no indicó)"), "", "Comentario:", mensaje || "(sin comentario)", "", "Archivos: " + adjuntos.map((x) => x.filename).join(", ")].join("\n");
  const payload = { from: FROM, to: [TO], subject: "Nuevo curso para My PonderUP: " + curso, text: texto, attachments: adjuntos };
  if (email) payload.reply_to = email;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) {
      /* Aquí queda el motivo exacto en los logs de Vercel (por ejemplo: "You can only send testing emails to your own email address") */
      console.error("subir-curso: Resend respondió", r.status, (await r.text()).slice(0, 500));
      return fail(res, 502, "servidor");
    }
  } catch (err) {
    console.error("subir-curso: error al llamar a Resend", err && err.message);
    return fail(res, 502, "servidor");
  }

  day.n++;
  ipHits.set(ip, (ipHits.get(ip) || 0) + 1);
  return res.status(200).json({ ok: true });
};
