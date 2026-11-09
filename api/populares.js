/* api/populares.js  -  Ranking de cursos mas elegidos para el orden "Más usados".
   Consulta a PostHog (evento curso_elegido, ultimos 90 dias) y devuelve SOLO las claves de curso, de la mas a la menos elegida:
   {"cursos":["mat1","eco1",...]}. Nunca devuelve conteos ni datos de personas.
   Variables de entorno (Vercel > Settings > Environment Variables):
     POSTHOG_PERSONAL_API_KEY  clave personal de PostHog con permiso de lectura (query:read). NO es la clave del proyecto (PH_KEY).
     POSTHOG_PROJECT_ID        numero del proyecto en PostHog (sale en la URL: /project/12345/...)
     POSTHOG_HOST              opcional; por defecto https://us.posthog.com (si tu cuenta es de la UE: https://eu.posthog.com)
   Sin variables o si PostHog falla responde {"cursos":[]} y la web usa su orden de respaldo (A-Z).
   Si tus otras funciones usan "export default", cambia la linea module.exports por: export default async function handler(req,res){ ... } */
const CACHE_S = 3600;

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") { res.statusCode = 405; return res.end(JSON.stringify({ error: "metodo" })); }
  const key = process.env.POSTHOG_PERSONAL_API_KEY, pid = process.env.POSTHOG_PROJECT_ID;
  const host = (process.env.POSTHOG_HOST || "https://us.posthog.com").replace(/\/+$/, "");
  const vacio = () => { res.statusCode = 200; res.setHeader("Cache-Control", "public, s-maxage=300"); return res.end(JSON.stringify({ cursos: [] })); };
  if (!key || !pid) return vacio();
  try {
    const q = "SELECT properties.curso AS c, count() AS n FROM events WHERE event = 'curso_elegido' AND timestamp > now() - INTERVAL 90 DAY AND properties.curso IS NOT NULL GROUP BY c ORDER BY n DESC LIMIT 60";
    const r = await fetch(host + "/api/projects/" + encodeURIComponent(pid) + "/query/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: q } })
    });
    if (!r.ok) throw new Error("posthog " + r.status);
    const j = await r.json();
    const cursos = (j.results || []).map(x => String(x[0])).filter(k => /^[a-z0-9]{1,12}$/i.test(k));
    res.statusCode = 200;
    res.setHeader("Cache-Control", "public, s-maxage=" + CACHE_S + ", stale-while-revalidate=86400");
    return res.end(JSON.stringify({ cursos }));
  } catch (e) { return vacio(); }
};
