/* My PonderUP - logica principal: analiticas, calculadora, simulador, compartir, sugerencias, buscador, agrega tu curso y factor de inscripcion */
const $=id=>document.getElementById(id),clone=o=>JSON.parse(JSON.stringify(o));
/* FACTOR DE INSCRIPCION: false = oculto (el codigo y los datos siguen en este archivo). true = visible. */
const FI_ACTIVO=false;
/* ===== ANALITICAS (PostHog) =====
   Para activarlas: crea un proyecto en posthog.com, pega abajo tu clave (empieza con phc_) y elige la region ("us" o "eu").
   Mientras PH_KEY este vacia no se envia nada. Solo se envian eventos (que curso, que pantalla, que boton); NUNCA las notas. */
const idle=f=>("requestIdleCallback" in window)?requestIdleCallback(f,{timeout:4000}):setTimeout(f,1500);
const PH_KEY="phc_q6PgfjjfSHRyMd65DY3vcoayYPk5Siv4oX2t3zP6bzxj",PH_REGION="us";
/* Para que los bloqueadores no la confundan con publicidad, los eventos viajan por TU dominio (/_u/, ver "rewrites" en vercel.json) y de ahi pasan a PostHog.
   Si ese camino no esta puesto en vercel.json, usa PostHog directo; y si el script de PostHog no carga, el "modo ligero" envia los eventos con un POST pequeno. */
const PH_DIRECT=PH_REGION==="eu"?"https://eu.i.posthog.com":"https://us.i.posthog.com",PH_ASSETS=PH_DIRECT.replace(".i.posthog.com","-assets.i.posthog.com"),PH_PROXY="/_u";
let PH_HOST=PH_PROXY;
/* Trafico interno: abre la pagina una vez con ?interno=1 en cada dispositivo tuyo (?interno=0 lo quita). Tambien se marcan localhost y los previews de Vercel; el sitio real (myponderup.vercel.app) no */
let INT=false;try{const q=new URLSearchParams(location.search).get("interno");if(q==="1")localStorage.setItem("mp-int","1");else if(q==="0")localStorage.removeItem("mp-int");INT=localStorage.getItem("mp-int")==="1"}catch(_){}
if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)||/^[a-z0-9-]+-[a-z0-9]{9}-[a-z0-9-]+\.vercel\.app$/.test(location.hostname))INT=true;
/* Etapa: ultima fase alcanzada; se guarda como propiedad global para que el evento de salida ($pageleave) diga donde se fue la persona */
let ETAPA="inicio";const setEtapa=e=>{ETAPA=e;try{if(phOn)posthog.register({etapa:e})}catch(_){}};
/* Instagram: usuario de la cuenta (sin @). Se cambia solo aqui; si lo dejas vacio, los enlaces se ocultan */
const IG_USER="myponderup";
{const iu=()=>document.querySelectorAll("a[data-ig]").forEach(a=>{if(!IG_USER){a.hidden=true;return}a.href="https://www.instagram.com/"+IG_USER+"/";a.setAttribute("aria-label","Instagram de @"+IG_USER);a.querySelectorAll(".igu").forEach(x=>x.textContent="@"+IG_USER)});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iu);else iu()}
const phQ=[];let phOn=false,phErr=0,phLite=false;
/* "No rastrear" del navegador: se respeta siempre (tambien en modo ligero) */
const DNT=(()=>{try{return navigator.doNotTrack==="1"||window.doNotTrack==="1"||navigator.msDoNotTrack==="1"}catch(_){return false}})();
/* Visitante nuevo o recurrente (para medir permanencia). Se guarda solo en este navegador: fecha de la primera visita y cuantas visitas (sesiones) lleva. Nunca se envian notas ni datos personales. */
const VIS=(()=>{const o={visitante:"nuevo",visitas:1,dias_desde_primera_visita:0};try{if(DNT)return o;const K="mp-vis",now=Date.now();let d=null;try{d=JSON.parse(localStorage.getItem(K)||"null")}catch(_){}
 if(!d||typeof d.f!=="number"||typeof d.n!=="number")d={f:now,n:0};
 let nueva=false;try{nueva=!sessionStorage.getItem("mp-vs");if(nueva)sessionStorage.setItem("mp-vs","1")}catch(_){}
 if(nueva||d.n<1)d.n++;
 localStorage.setItem(K,JSON.stringify(d));
 o.visitas=d.n;o.visitante=d.n>1?"recurrente":"nuevo";o.dias_desde_primera_visita=Math.max(0,Math.floor((now-d.f)/864e5))}catch(_){}return o})();
const rid=()=>(window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const liteId=()=>{try{let d=localStorage.getItem("mp-did");if(!d){d=rid();localStorage.setItem("mp-did",d)}return d}catch(_){return "anon-"+rid()}};
const liteSes=()=>{try{let d=sessionStorage.getItem("mp-sid");if(!d){d=rid();sessionStorage.setItem("mp-sid",d)}return d}catch(_){return "s-"+rid()}};
/* Modo ligero: evento anonimo (sin perfil de persona) directo a la API de captura */
let liteBase=PH_PROXY;
const liteSend=(n,p)=>{if(DNT)return;try{
 const body=JSON.stringify({api_key:PH_KEY,event:n,distinct_id:liteId(),timestamp:new Date().toISOString(),properties:Object.assign({$lib:"mp-lite",$session_id:liteSes(),$current_url:location.href,$host:location.host,$pathname:location.pathname,$process_person_profile:false,app:"myponderup",pantalla_ancho:window.innerWidth,interno:INT,etapa:ETAPA},VIS,p||{})});
 const go=u=>fetch(u+"/e/",{method:"POST",body,keepalive:true,headers:{"Content-Type":"text/plain"}}).then(r=>{if(!r.ok)throw 0});
 go(liteBase).catch(()=>{if(liteBase===PH_PROXY){liteBase=PH_DIRECT;go(PH_DIRECT).catch(()=>{})}})}catch(_){}};
const track=(n,p)=>{if(!PH_KEY)return;try{if(phOn)posthog.capture(n,p);else if(phLite)liteSend(n,p);else phQ.push([n,p])}catch(_){}};
(()=>{if(!PH_KEY)return;
 const lite=()=>{phLite=true;if(DNT){phQ.length=0;return}liteSend("$pageview");phQ.splice(0).forEach(([n,p])=>liteSend(n,p));window.addEventListener("pagehide",()=>liteSend("$pageleave"),{once:true})};
 const start=host=>{posthog.init(PH_KEY,{api_host:host,ui_host:PH_REGION==="eu"?"https://eu.posthog.com":"https://us.posthog.com",person_profiles:"identified_only",capture_pageview:true,capture_pageleave:true,autocapture:true,
   capture_heatmaps:true,respect_dnt:true,disable_surveys:true,session_recording:{maskAllInputs:true,maskTextSelector:"#sgm"},
   /* Se completan en TODOS los eventos (tambien el primer $pageview): interno, visitante, etapa y tema_actual (claro|oscuro, el que se ve en ese momento), sin depender de valores guardados de visitas anteriores */
   before_send:e=>{try{if(e&&e.properties)Object.assign(e.properties,{app:"myponderup",interno:INT,etapa:ETAPA,tema_actual:document.documentElement.dataset.theme==="dark"?"oscuro":"claro"},VIS)}catch(_){}return e}});
   posthog.register(Object.assign({app:"myponderup",pantalla_ancho:window.innerWidth,interno:INT,etapa:ETAPA},VIS));
   phOn=true;phQ.splice(0).forEach(([n,p])=>posthog.capture(n,p))};
 const load=(src,host,next)=>{const sc=document.createElement("script");sc.async=true;sc.src=src;
  sc.onload=()=>{try{if(!window.posthog||typeof posthog.init!=="function")throw 0;PH_HOST=host;start(host)}catch(_){next()}};
  sc.onerror=()=>{sc.remove();next()};document.head.appendChild(sc)};
 const go=()=>{try{load(PH_PROXY+"/static/array.js",PH_PROXY,()=>load(PH_ASSETS+"/static/array.js",PH_DIRECT,lite))}catch(_){lite()}};
 /* PostHog se carga cuando la pagina ya termino de cargar y el navegador esta libre; los eventos mientras tanto quedan en cola */
 if(document.readyState==="complete")idle(go);else window.addEventListener("load",()=>idle(go),{once:true});
 window.addEventListener("error",e=>{if(phErr++<5)track("error_js",{mensaje:String(e.message).slice(0,120)})})})();
/* Indicador de animaciones: UN solo evento "animacion" con la propiedad "nombre" (en PostHog: Trends > evento animacion > desglosar por nombre).
   Sirve para ver cuales se usan mas. Para no llenar PostHog, cada animacion cuenta como maximo una vez cada 8 s por visita y hay un tope de 60 por visita;
   es decir, se mide "en cuantos momentos distintos" la persona la activo, no cuantas veces repitio el gesto. dispositivo: mouse | tactil. Nunca incluye notas. */
const ANIM_T={};let ANIM_C=0;
function anim(n,extra){try{const now=Date.now();if(ANIM_C>=60||(ANIM_T[n]||0)+8000>now)return;ANIM_T[n]=now;ANIM_C++;
 track("animacion",Object.assign({nombre:n,dispositivo:matchMedia("(hover:none)").matches?"tactil":"mouse",vista:view,curso:cur||""},extra||{}))}catch(_){}}
const seenFirst=new Set(),seenCombo=new Set(),seenSec=new Set(),seenTyp=new Set(),seenBad=new Set();let calcTm=0,pmT=0;
const trackCombo=()=>{if(view==="tool"&&cur&&!seenCombo.has(cur)&&$("cb").innerHTML.indexOf("<table")>-1){seenCombo.add(cur);track("combos_vistos",{curso:cur,pendientes:pend().length})}};
const rnd=x=>Math.floor(x+.5+1e-9),fmt=x=>String(Math.round((x+1e-9)*100)/100);
const KS=["mat","len","inf","con","fce","int","der1","mat1","len1","eco1","cfi","mat3","mac1","hee","inv","est1","ctd","dcg","gct","psc","lid","fil","rce","ipfe","cdc","gdp"],ST={};let cur,S,idx,view="welcome",sumIn=false,faqIn=false,upFrom="pick",upY=0;
const GR=[["Nivelación",0],["Cursos",1],["Cursos Sellos UP",2]],gof=x=>C[x].gp??(C[x].pre===""?1:0),inG=g=>KS.filter(x=>gof(x)===g),cname=k=>(C[k].pre??"Nivelación en ")+C[k].n;
const walk=(n,f,d=0)=>(n.ch||[]).forEach(c=>{f(c,d);walk(c,f,d+1)});
const leaves=(n,a=[])=>((n.ch||[]).forEach(c=>c.ch?leaves(c,a):a.push(c)),a);
const isP=id=>{const g=S.g[id];return g===undefined||g===""||isNaN(+g)};
const pend=()=>leaves(S.root).filter(l=>isP(l.id));
const full=o=>{const v={};leaves(S.root).forEach(l=>{const m=l.mx||20;v[l.id]=isP(l.id)?(o[l.id]??0):Math.min(m,Math.max(0,+S.g[l.id]))*20/m});return v};
const ev=(n,v)=>{const x=n.ch?n.ch.reduce((s,c)=>s+ev(c,v)*(+c.w||0)/100,0):v[n.id];return n.r?rnd(x):x};
const pass=a=>(S.rf?rnd(a):a)>=S.pm-1e-9;
const inp=c=>{const v=S.g[c.id],f=v!==undefined&&v!=="",bd=f&&(+v>(c.mx||20)||+v<0);return `<label class="gi${f?" fl":""}${bd?" bad":""}"><input class="g" data-id="${c.id}" type="text" inputmode="decimal" enterkeyhint="next" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="6" placeholder="Por rendir" aria-label="Nota de ${c.n}" value="${v??""}"${f?` style="width:${String(v).length+.6}ch"`:""}><span class="sf">/${c.mx||20}</span></label>`};
/* Modelo A: cada evaluación muestra su % sobre el total del curso (c.a se calcula en mkState). d:"" oculta el % (partes medidas en puntos). */
const dv=c=>c.d===""?"":fmt(c.a)+"%";
const absW=(n,p)=>(n.ch||[]).forEach(c=>{c.a=p*(+c.w||0)/100;absW(c,c.a)});
const mkState=k=>{const root=clone(C[k].root);absW(root,100);return{root,g:{},rf:!!C[k].rf,pm:11}};
const row=(c,d)=>`<div class="row${c.ch?" grp":""}${c.b?" bd":""}" style="--d:${d}"><span class="nm">${c.n}${dv(c)?`<em>${dv(c)}</em>`:""}</span>${c.ch?`<span class="sv" id="sv-${c.id}">—</span>`:inp(c)}</div>`;

const sl=(g,flat)=>{const o=[];const rec=(n,sh,k)=>{if(!n.ch||(n.z&&!flat)){o.push({id:n.id,n:n.n,s:n.s||n.n,w:sh,k,L:n.ch?leaves(n):null});return}const t=n.ch.reduce((a,x)=>a+(+x.w||0),0)||100;n.ch.forEach(x=>rec(x,sh*(+x.w||0)/t,k))};
 const t0=g.ch.reduce((a,x)=>a+(+x.w||0),0)||100;g.ch.forEach((c,k)=>rec(c,(+c.w||0)/t0*100,k));return o};
function paintBars(){
 S.root.ch.forEach((g,i)=>{const e=document.querySelector(`#wbar span[data-i="${i}"]`);if(!e)return;
  let f;if(g.ch){const L=sl(g,true),t=L.reduce((a,x)=>a+x.w,0)||1;f=L.filter(x=>!isP(x.id)).reduce((a,x)=>a+x.w,0)/t*100}else f=isP(g.id)?0:100;
  e.style.setProperty("--f",f+"%");const b=document.querySelector(`.blk[data-b="${i}"]`);if(b){b.style.setProperty("--f",f+"%");const c=b.querySelector(".cnt");if(c){const L=leaves(g),n=L.filter(l=>!isP(l.id)).length;c.textContent=n+" de "+L.length;c.classList.toggle("full",n===L.length)}}});
 document.querySelectorAll("input.g").forEach(i=>{const r=i.closest(".row,.bh");if(r)r.classList.toggle("dn",!isP(i.dataset.id))});
 document.querySelectorAll("#zb .zs").forEach(e=>{const was=e.classList.contains("pd"),now=e.dataset.ids.split(",").some(isP);e.classList.toggle("pd",now);if(was&&!now){e.classList.remove("pop");void e.offsetWidth;e.classList.add("pop");anim("zona_barra_pop")}})}
let faqNear=false,bodyIn=false,fiBodyIn=false,bodySee=false,fiBodySee=false,miniAn=false,fiMiniAn=false;
/* bodyIn / fiBodyIn: el contenido claro/oscuro ya ocupa buena parte de la pantalla (para la barra "Mi promedio hasta ahora"). bodySee / fiBodySee: se ve aunque sea un poco de ese contenido; el interruptor solo se oculta cuando el azul tapa toda la pantalla. */
const chk=()=>{const mOn=view==="tool"&&bodyIn&&!sumIn&&!faqIn,fm=$("fimini"),
 tOn=view==="tool"?bodySee:view==="fi"?fiBodySee:false;
 if(mOn&&!miniAn&&!$("mini").classList.contains("on")){miniAn=true;anim("mini_resumen_aparece")}$("mini").classList.toggle("on",mOn);
 $("tgw").classList.toggle("off",!tOn);
 $("tgw").classList.toggle("low",!(mOn||(fm&&fm.classList.contains("on"))))};
function showView(v){if(v==="fi"&&!FI_ACTIVO)v="welcome";view=v;document.body.classList.toggle("dk",v==="welcome"||v==="pick"||v==="up");track("pantalla",{vista:v});setEtapa({welcome:"inicio",pick:"elegir",tool:"curso",fi:"fi",up:"subir"}[v]||v);["welcome","pick","tool","fi","up"].forEach(x=>$("v-"+x).hidden=x!==v);window.scrollTo({top:0,behavior:"instant"});chk();fchk();trackCombo()}
function closeList(){$("clist").hidden=true;$("cbtn").setAttribute("aria-expanded","false")}
/* "Agrega tu curso": recuerda desde donde se abrio para volver al mismo lugar */
function updUpLabels(){const t=upFrom==="tool"&&cur,s=document.querySelector("#upback span"),g=$("upgo");if(s)s.textContent=t?"← Volver a mi curso":"← Volver a cursos";if(g)g.textContent=t?"Volver a mi curso":"Volver a cursos"}
function leaveUp(){const t=upFrom==="tool"&&cur;showView(t?"tool":"pick");if(t)window.scrollTo({top:upY,behavior:"instant"})}

function setCourse(k){
 cur=k;S=ST[k]||(ST[k]=mkState(k));
 idx={};walk(S.root,c=>idx[c.id]=c);
 $("cval").textContent=(C[k].pre??"Nivelación en ")+C[k].n;
 $("cbtn").style.setProperty("--s",SC[KS.indexOf(k)%4]);
 $("clist").innerHTML=BQ(0)+GR.map(([t,g])=>`<div class="gh">${t}</div>`+inG(g).map(x=>`<button type="button" data-c="${x}" class="${x===k?"on":""}"><small>${C[x].pre===""?"Curso":"Nivelación en"}</small>${C[x].n}</button>`).join("")).join("")+(FI_ACTIVO?`<div class="gh">Factor de inscripción</div><button type="button" data-fi="1"><small>Herramienta</small>Calcular mi FI</button>`:"")+`<div class="caddw"><button type="button" data-add="lista"><span aria-hidden="true">+</span> Agrega tu curso</button></div>`;
 closeList();
 setLetters($("ctitle"),(C[k].pre??"Nivelación en ")+C[k].n);
 {const t=$("ctitle");t.classList.remove("mr");void t.offsetWidth;t.classList.add("mr")}
 $("fl").innerHTML=GR.map(([t,g],j)=>{const xs=inG(g),mk=x=>`<button type="button" data-c="${x}" data-f="1">${C[x].pre??"Nivelación en "}${C[x].n}</button>`,L=FLIM,open=fexp.has(j);
  return `<b${j?' class="sp2"':""}>${t}</b>`+(xs.length<=L?xs.map(mk).join(""):xs.slice(0,L).map(mk).join("")+`<div class="fmore" id="fm${j}"${open?"":" hidden"}>${xs.slice(L).map(mk).join("")}</div><button type="button" class="vm" data-vm="${j}" aria-expanded="${open}" aria-controls="fm${j}">${open?"Ver menos":`Ver ${xs.length-L} más`}</button>`)}).join("")+(FI_ACTIVO?`<b class="sp2">Factor de inscripción</b><button type="button" data-fi="1">Calcular mi FI</button>`:"");
 const G=S.root.ch;
 $("wbar").innerHTML=G.map((g,i)=>`<span data-i="${i}" style="flex:${g.w};--wb:${wbc(i)[0]};--wc:${wbc(i)[1]}">${fmt(g.w)}%</span>`).join("");
 $("lgd").innerHTML=G.map((g,i)=>`<span style="--wb:${wbc(i)[0]}">${g.n}</span>`).join("");
 const zi=C[k].nz?-1:G.findIndex(g=>g.ch);
 if(zi>=0){const g=G[zi],L=sl(g),SH=[100,78,56];
  const lg="";
  $("zm").style.cssText=`--wb:${wbc(zi)[0]};--wc:${wbc(zi)[1]}`;
  $("zm").innerHTML=`<div class="zb" id="zb">${L.map(x=>`<span class="zs" data-id="${x.id}" data-ids="${x.L?x.L.map(l=>l.id).join(","):x.id}" title="${x.n}" style="flex:${x.w};--sh:${SH[x.k%3]}%">${x.s}</span>`).join("")}</div>${lg}`}
 else $("zm").innerHTML="";
 let h="";
 G.forEach((g,i)=>{h+=`<div class="blk rv" data-b="${i}" style="--i:${i+4}"><div class="bh${g.ch?"":" lf"}"><div class="bn"><span class="pct">${fmt(g.w)}%</span><b>${g.n}</b></div>${g.ch?`<span class="sv" id="sv-${g.id}">—</span>`:inp(g)}</div>`;
  if(g.ch){h+=`<div class="bb">`;walk(g,(c,d)=>{h+=row(c,d)});h+=`</div>`}
  h+=`</div>`});
 $("tree").innerHTML=h;
 {const L=document.querySelectorAll("#tree input.g");if(L.length)L[L.length-1].setAttribute("enterkeyhint","done")}
 $("tree").classList.toggle("hdots",G.slice(1).every(g=>!g.ch));
 renderInfo(k);
 let r="";walk(S.root,c=>r+=`<label class="ck"><input type="checkbox" data-r="${c.id}"${c.r?" checked":""}> Redondear ${c.n} a entero</label>`);
 $("rules").innerHTML=`<p>Marca lo que quieras redondear al entero (el .5 sube). Lo que dejes sin marcar se calcula con decimales.</p><div class="stl"><div class="sti"><div class="stt"><span class="tag y">Cada evaluación</span></div><div>${r}</div></div><div class="sti"><div class="stt"><span class="tag m">Promedio final</span></div><div><label class="ck"><input type="checkbox" id="rf"${S.rf?" checked":""}> Redondear el promedio final a entero (10.5 cuenta como 11)</label></div></div><div class="sti"><div class="stt"><span class="tag w">Los del curso</span></div><div><button type="button" class="btn" id="rs">Restablecer redondeos</button></div></div></div>`;
 $("pm").value=S.pm;
 prevOk=null;prevA=null;prevK=null;prevNum=null;
 update();
}

/* Pregunta 1 de "Cómo funciona": una fila por evaluación (con su peso total) y una fila de "Ten en cuenta" con las aclaraciones propias del curso */
function renderInfo(k){
 const jn=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" y "+a[a.length-1];
 let h="";
 S.root.ch.forEach((g,i)=>{const c=wbc(i),kids=g.ch?g.ch.map(x=>escL(x.n)+(dv(x)?" ("+dv(x)+")":"")):null,
  txt=kids?`Se forma con ${jn(kids)}.`:"Se ingresa como una sola nota.";
  h+=`<div class="sti"><div class="stt"><span class="tag" style="background:${c[0]};color:${c[1]}">${escL(g.n)} · ${fmt(g.a)}%</span></div><p>${txt}</p></div>`});
 h+=`<div class="sti"><div class="stt"><span class="tag w">Promedio final</span></div><p>Suma cada parte según su peso${S.rf?" y se redondea al entero (el .5 sube)":""}.</p></div>`;
 const nt=(C[k].i||"").split(/\.\s+/).map(x=>x.replace(/\.$/,"")+".").filter(x=>/sobre 10|se asume|no indica/i.test(x));
 if(nt.length)h+=`<div class="sti"><div class="stt"><span class="tag m">Ten en cuenta</span></div><p>${escL(nt.join(" "))}</p></div>`;
 $("cinfo").innerHTML=h}
/* ===== Nombre del curso: cada letra salta al pasar el cursor por ella =====
   setLetters() parte el texto en palabras (que no se cortan a la mitad) y letras. El texto completo queda oculto para lectores de pantalla.
   hopLetter() anima con la Web Animations API, asi no choca con el brillo (CSS). Solo salta la letra tocada.
   measureLetters() guarda en cada letra su posicion dentro del titulo para que el brillo cruce todo el titulo como uno solo. */
const escL=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function measureLetters(el){
 const L=el&&el._L;if(!L||!L.length)return;
 let mn=1e9,mx=-1e9;L.forEach(e=>{mn=Math.min(mn,e.offsetLeft);mx=Math.max(mx,e.offsetLeft+e.offsetWidth)});
 if(!(mx>mn))return;
 el.style.setProperty("--tw",(mx-mn)+"px");L.forEach(e=>e.style.setProperty("--ox",(e.offsetLeft-mn)+"px"))}
const lettersEls=new Set();
function setLetters(el,text){
 if(!el)return;
 el.classList.add("lt");let k=0;
 el.innerHTML=`<span class="sgv">${escL(text)}</span><span aria-hidden="true">`+text.split(" ").map(w=>`<span class="lw">`+[...w].map(ch=>`<span class="ltr">${escL(ch)}</span>`).join("")+`</span>`).join(" ")+`</span>`;
 el._L=[...el.querySelectorAll(".ltr")];
 if(!lettersEls.has(el)){lettersEls.add(el);if(window.ResizeObserver)new ResizeObserver(()=>measureLetters(el)).observe(el)}
 measureLetters(el)}
function hopLetter(e){
if(!e||e._h)return;e._h=1;anim("titulo_letra_salto");
 const s=Math.random()<.5?1:-1;
 const an=e.animate([
  {transform:"translateY(0) rotate(0) scale(1)",easing:"cubic-bezier(.2,.8,.3,1)"},
  {offset:.3,transform:`translateY(-.26em) rotate(${8*s}deg) scale(1.16)`,filter:"brightness(1.45) drop-shadow(0 0 .3em rgba(0,240,60,.7))",easing:"cubic-bezier(.4,0,.3,1)"},
  {offset:.62,transform:`translateY(.05em) rotate(${-3*s}deg) scale(1)`,easing:"ease-out"},
  {transform:"translateY(0) rotate(0) scale(1)"}],{duration:680});
 const end=()=>{e._h=0};an.onfinish=end;an.oncancel=end}
{const mqR=window.matchMedia?RMQ():{matches:false};
 document.querySelectorAll("#v-fi .hero h1 .t2").forEach(el=>setLetters(el,el.textContent.trim()));
 const remeasure=()=>lettersEls.forEach(measureLetters);
 window.addEventListener("resize",remeasure);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remeasure);
 document.querySelectorAll(".hero h1").forEach(h=>h.addEventListener("pointerover",e=>{
  if(mqR.matches)return;const g=e.target.closest&&e.target.closest(".ltr");if(g)hopLetter(g)}));
 document.querySelectorAll(".hero h1").forEach(h=>h.addEventListener("pointermove",e=>{
  if(e.pointerType!=="touch"||mqR.matches)return;const g=document.elementFromPoint(e.clientX,e.clientY);if(g&&g.classList&&g.classList.contains("ltr"))hopLetter(g)},{passive:true}))}

/* ===== Simulador "¿Y si saco...?": prueba notas en lo pendiente sin tocar las reales ===== */
function simR(){
 const P=pend(),W=$("sim");W.hidden=!P.length;if(!P.length)return;
 $("simt").setAttribute("aria-expanded",String(simOpen));if(!simOpen){simShow(false);return}
 const ol=outlook(),sv=S.sim||(S.sim={}),def=ol.nec!==null?ol.nec:(ol.k==="no"?20:S.pm);
 $("simr").innerHTML=P.map(l=>{const mx=l.mx||20,v=sv[l.id]!==undefined?Math.min(mx,sv[l.id]):Math.min(mx,Math.ceil(def*mx/20*2-1e-6)/2);sv[l.id]=v;
  return `<div class="srow"><span>${l.n}${dv(l)?`<em>${dv(l)}</em>`:""}</span><div class="sc2"><input type="range" min="0" max="${mx}" step="0.5" value="${v}" style="--p:${v/mx*100}%" data-sid="${l.id}" aria-label="Nota simulada de ${l.n}"><output>${fmt(v)}</output><button type="button" class="btn sm" data-use="${l.id}" title="Usar como nota real">Usar</button></div></div>`}).join("");
 simU();simShow(true)}
/* Abrir y cerrar "¿Y si saco...?" con una animacion suave de altura y opacidad */
let simT=0;
function simShow(o){const b=$("simb");if(o===(b.dataset.s==="open")&&!(o&&b.hidden))return;
 clearTimeout(simT);b.dataset.s=o?"open":"closed";
 const from=b.hidden?0:b.offsetHeight,E="cubic-bezier(.2,.7,.2,1)";
 b.hidden=false;b.style.overflow="hidden";b.style.transition="none";b.style.height=from+"px";b.style.opacity=o?(from?"1":"0"):"1";
 void b.offsetHeight;
 b.style.transition="height .45s "+E+",opacity .35s ease";
 b.style.height=(o?b.scrollHeight:0)+"px";b.style.opacity=o?"1":"0";
 simT=setTimeout(()=>{b.style.transition=b.style.height=b.style.overflow=b.style.opacity="";if(!o)b.hidden=true},470)}
function simU(){
 const P=pend(),sv=S.sim||{},u={};P.forEach(l=>u[l.id]=(sv[l.id]||0)*20/(l.mx||20));
 const v=ev(S.root,full(u)),ok=pass(v);
 $("simn").textContent=S.rf?rnd(v):fmt(v);$("simn").className=ok?"gn":"rd";
  $("simv").innerHTML=`<span class="tag ${ok?"y":"n"}">${ok?"Aprobarías":"Desaprobarías"}</span>`}
$("simt").addEventListener("click",()=>{simOpen=!simOpen;if(simOpen)anim("simulador_despliegue");if(simOpen&&!seenSim.has(cur)){seenSim.add(cur);track("simulador_abierto",{curso:cur,pendientes:pend().length})}simR()});
$("sim").addEventListener("input",e=>{const t=e.target;if(!t.dataset||!t.dataset.sid)return;(S.sim||(S.sim={}))[t.dataset.sid]=+t.value;const o=t.parentNode.querySelector("output");if(o)o.textContent=fmt(+t.value);simU()});
$("sim").addEventListener("click",e=>{const b=e.target.closest("button[data-use]");if(!b)return;
 const id=b.dataset.use,v=(S.sim||{})[id],inpt=[...document.querySelectorAll("#tree input.g")].find(x=>x.dataset.id===id);if(!inpt||v===undefined)return;
 inpt.value=String(v);inpt.dispatchEvent(new Event("input",{bubbles:true}));inpt.dispatchEvent(new Event("change",{bubbles:true}));
 toast(`Pusiste ${fmt(v)} como nota de ${idx[id].n}`);track("simulador_usar",{curso:cur,evaluacion:id})});

/* Pie: "Ver más / Ver menos" en cada seccion de cursos */
$("fl").addEventListener("click",e=>{const b=e.target.closest("button[data-vm]");if(!b)return;
 const j=+b.dataset.vm,m=$("fm"+j),open=m.hidden;m.hidden=!open;open?fexp.add(j):fexp.delete(j);
 b.setAttribute("aria-expanded",String(open));b.textContent=open?"Ver menos":`Ver ${m.children.length} más`;track("pie_ver_mas",{seccion:GR[j][0],abierto:open})});

const RM=window.matchMedia&&RMQ().matches;
function setNum(el,txt){
 const to=parseFloat(txt),dec=(String(txt).split(".")[1]||"").length;
 if(RM||isNaN(to)||el._to===to){el.textContent=txt;el._to=to;el._v=to;return}
 const from=el._v??0;el._to=to;cancelAnimationFrame(el._r);const t0=performance.now(),D=500;
 const step=t=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);el._v=from+(to-from)*e;el.textContent=k<1?el._v.toFixed(dec):txt;if(k<1)el._r=requestAnimationFrame(step)};
 el._r=requestAnimationFrame(step)}
const FLIM=3,fexp=new Set();
let prevOk=null,prevA=null,prevK=null,prevNum=null,simOpen=false;const seenEst=new Set(),seenSim=new Set();
function burst(){
 if(RM)return;anim("confeti_aprobar");const r=document.createElement("div");r.className="cf";r.setAttribute("aria-hidden","true");
 const cols=["#00F03C","#0A5CFF","#F000F0","#ffffff"];
 for(let i=0;i<26;i++){const p=document.createElement("i"),an=Math.random()*Math.PI*2,dist=50+Math.random()*90;
  p.style.cssText=`--x:${Math.cos(an)*dist}px;--y:${Math.sin(an)*dist-40}px;--r:${Math.round(Math.random()*540-270)}deg;--c:${cols[i%4]};--s:${6+Math.round(Math.random()*6)}px;--d:${Math.round(Math.random()*90)}ms`;r.appendChild(p)}
 $("sum").appendChild(r);setTimeout(()=>r.remove(),1500)}
/* Estado de aprobacion. Con notas pendientes se miran los dos extremos: lo pendiente en 0 (lo), lo pendiente en 20 (hi), y el promedio parejo
   que hace falta en lo pendiente (nec, sobre 20). k: ya = aprobado seguro | aun = todavia se puede | no = imposible | fa / fd = final aprobado / desaprobado */
function outlook(){
 const R=S.root,P=pend(),n=P.length,z={},t={};P.forEach(l=>{z[l.id]=0;t[l.id]=20});
 const lo=ev(R,full(z)),hi=ev(R,full(t)),o={n,P,lo,hi,loOk:pass(lo),hiOk:pass(hi),nec:null};
 if(n&&!o.loOk&&o.hiOk){const at=x=>{const u={};P.forEach(l=>u[l.id]=x);return pass(ev(R,full(u)))};
  let a=0,b=20;for(let i=0;i<32;i++){const m=(a+b)/2;if(at(m))b=m;else a=m}
  let x=Math.min(20,Math.ceil(b*10-1e-6)/10);while(x<20&&!at(x))x=Math.min(20,Math.round((x+.1)*10)/10);o.nec=x}
 o.k=!n?(o.loOk?"fa":"fd"):o.loOk?"ya":!o.hiOk?"no":"aun";return o}
/* Texto del aviso. yo=true lo escribe en primera persona (para la imagen que se comparte) */
function vtxt(o,yo){
 if(!o.n)return o.loOk?{t:"Aprobado",c:"y",m:""}:{t:"Desaprobado",c:"n",m:""};
 if(o.loOk)return{t:yo?"Ya aprobé":"Ya aprobaste",c:"y",m:""};
 if(!o.hiOk)return{t:yo?`No puedo llegar a ${S.pm}`:`No puedes llegar a ${S.pm}`,c:"n",m:""};
 return{t:yo?"Aún puedo aprobar":"Aún puedes aprobar",c:"m",m:""}}
/* ===== Barra de progreso: agua =====
   Solo es visual. update() sigue calculando el % y escribiendo style.width con el valor exacto; aquí solo se anima lo que se ve.
   - Nivel: movimiento amortiguado crítico (sube o baja y se detiene sin pasarse, sin rebotes).
   - Oleaje: la superficie pasa suavemente entre dos formas de ola (como el efecto de agua en texto con clip-path), con ease-in-out.
   - Mini olas: olas pequeñas que avanzan siempre hacia el frente, encima del oleaje.
   - Luz: canvas sobre la barra con profundidad, brillo bajo la superficie, reflejos en las crestas y menisco en el frente.
   La altura de todo depende de cuánto se mueve el nivel y se apaga sola.
   En reposo se quita todo (clase .pf-agua, clip-path, canvas y variables) y la barra vuelve a ser la normal, con el ancho exacto. */
const waterTo=(()=>{
 const pf=$("pf"),pb=pf&&pf.parentNode,mq=window.matchMedia?RMQ():null;
 if(!pf||!pb)return()=>{};
 /* Nivel: resorte con rebote suave (como agua que se mece al subir o bajar). Superficie: tres olas que viajan hacia el frente con crestas puntiagudas.
    En reposo la superficie sigue meciéndose despacio (solo mientras la barra se ve en pantalla y a ~30 fps). Al moverse el nivel, las olas crecen y se apagan solas. */
 const NP=12,RY=36,H=1/240,WN=6.2,ZT=.5,AS=2600,TP=Math.PI*2,IDLE=.3,cl=(x,a,b)=>x<a?a:x>b?b:x;
 const LM=[44,27,17.5,11.3],WG=[.34,.34,.22,.1],KK=LM.map(l=>TP/l),CC=LM.map(l=>13.5*Math.sqrt(l));
 const WL=[128,70,40],WA=[.5,.32,.18],WK=WL.map(l=>TP/l),WC=WL.map(l=>7.5*Math.sqrt(l)),PS=[0,1.7,3.1];
 const cv=document.createElement("canvas"),cx=cv.getContext("2d"),oc=document.createElement("canvas"),ox=oc.getContext("2d");
 cv.setAttribute("aria-hidden","true");cv.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;display:none";pf.after(cv);
 const XF=new Float32Array(RY),yy=new Float32Array(RY),cr=new Float32Array(RY),sr=new Float32Array(RY),PH=new Float32Array(4);
 let YS=null,SA=null,CA=null,img=null,cols=0,hp=0,L=0,Vl=0,T=0,A=0,Pm=0,W=0,HH=12,raf=0,last=0,acc=0,on=false,vis=true,Vp=0,Ap=0;
 /* altura (px, desde arriba) de la superficie en la posicion x */
 const surf=(xc,am,lp)=>{let w=0;for(let i=0;i<3;i++)w+=WA[i]*Math.sin(WK[i]*xc-PS[i]);
  const h=Math.pow((cl(w,-1,1)+1)/2,1.6),sh=.65+.35*cl(xc/Math.max(lp,1),0,1),md=.85+.15*Math.sin(xc/310-Pm*.4);
  return(1+6.8*am)*sh*md*(1-h)};
 const ensure=()=>{const c=Math.max(1,Math.round(W)),dpr=Math.min(window.devicePixelRatio||1,3),h=Math.max(1,pb.clientHeight);
  if(c!==cols||h!==hp){cols=c;hp=h;oc.width=cols;oc.height=RY;img=ox.createImageData(cols,RY);YS=new Float32Array(cols);SA=new Float32Array(cols);CA=new Float32Array(cols);for(let r=0;r<RY;r++){yy[r]=(r+.5)/RY*hp;cr[r]=Math.cos(.5*yy[r]);sr[r]=Math.sin(.5*yy[r])}}
  const cw=Math.round(cols*dpr),ch=Math.round(hp*dpr);if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch}};
 const rest=()=>{if(raf)cancelAnimationFrame(raf);raf=0;on=false;L=T;Vl=A=Vp=Ap=0;
  pf.classList.remove("pf-agua");pf.style.clipPath=pf.style.webkitClipPath="";pf.style.removeProperty("--vw");cv.style.display="none"};
 const draw=()=>{
  const lp=Math.max(0,L*W/100),am=Math.max(A,IDLE),g=cl(lp/8,0,1)*cl((W-lp)/8,0,1),bu=cl(Vp/70,-1,1)*2.2*g,hh=HH;
  pf.style.setProperty("--vw",Math.max(0,L).toFixed(3)+"%");
  if(lp<.5){pf.style.clipPath=pf.style.webkitClipPath="polygon(0 0,0 0,0 0)";cv.style.display="none";return}
  const nt=Math.max(2,Math.min(120,Math.ceil(lp/6)));let q="";
  for(let j=0;j<=nt;j++){const x=lp*j/nt;q+=(j?",":"")+x.toFixed(1)+"px "+surf(x,am,lp).toFixed(2)+"px"}
  const yf=surf(lp,am,lp);
  for(let j=0;j<=NP;j++){const u=j/NP;q+=","+(lp+bu*(1-(2*u-1)*(2*u-1))).toFixed(2)+"px "+(yf+(hh-yf)*u).toFixed(2)+"px"}
  q+=",0px "+hh+"px";
  pf.style.clipPath=pf.style.webkitClipPath="polygon("+q+")";
  if(!cx||!ox||A<=.03){cv.style.display="none";return}
  ensure();cv.style.display="block";
  for(let r=0;r<RY;r++){const v=yy[r]/hp;XF[r]=lp+bu*(1-(2*v-1)*(2*v-1))}
  const d=img.data,Am=A,Af=Math.min(1,A*1.25);
  for(let x=0;x<cols;x++){const xc=x+.5;YS[x]=surf(xc,am,lp);const a1=KK[1]*xc+PH[1];SA[x]=Math.sin(a1);CA[x]=Math.cos(a1)}
  for(let x=0;x<cols;x++){
   const xc=x+.5,ys=YS[x],sl=(YS[x<cols-1?x+1:x]-YS[x>0?x-1:x])*.5,sp=cl(.5-sl*6,0,1),sp3=Math.pow(cl(-sl*6,0,1),3),sA=SA[x],cA=CA[x];
   for(let r=0;r<RY;r++){
    const o=(r*cols+x)*4,dd=XF[r]-xc,m=cl(dd+.5,0,1);
    if(m<=0){d[o+3]=0;continue}
    const y=yy[r],ya=y-ys,v=y/hp;
    let aw=0,ak=Am*(.03+.16*v*v);
    if(ya>-.5){const dp=ya>0?ya:0;
     aw+=Am*.11*Math.exp(-dp/1.6);
     const st=cA*cr[r]-sA*sr[r];if(st>0){const q2=st*st;aw+=Am*.07*q2*q2*Math.exp(-dp/4)}
     aw+=Am*(.24+.4*sp*sp)*Math.exp(-ya*ya/.3);
     aw+=Am*.45*sp3*Math.exp(-ya*ya/.25);
     if(dd>-.5){aw+=Af*.34*Math.exp(-Math.max(dd,0)/2.2);const e=dd-4.5;ak+=Af*.09*Math.exp(-e*e/2)}}
    if(aw>.9)aw=.9;
    const at=aw+ak*(1-aw),gy=at>0?aw/at*255:0;
    d[o]=d[o+1]=d[o+2]=gy;d[o+3]=Math.min(1,at)*m*255}
  }
  ox.putImageData(img,0,0);cx.clearRect(0,0,cv.width,cv.height);cx.imageSmoothingEnabled=true;cx.drawImage(oc,0,0,cols,RY,0,0,cv.width,cv.height)};
 const frame=ts=>{
  raf=0;if(!on||!vis)return;
  const moving=Math.abs(L-T)>.003||Math.abs(Vl)>.05||A>.03,dt=last?Math.min((ts-last)/1000,.05):H;
  if(!moving&&last&&dt<.032){raf=requestAnimationFrame(frame);return}
  last=ts;acc+=dt;
  while(acc>=H){acc-=H;const a=-2*ZT*WN*Vl-WN*WN*(L-T);Vl+=a*H;L+=Vl*H;Ap=a*W/100}
  Vp=Vl*W/100;
  if(Math.abs(L-T)<.003&&Math.abs(Vl)<.05){L=T;Vl=0;Vp=0;Ap=0}
  const tg=Math.min(1,Math.abs(Vp)/45+Math.abs(Ap)/AS);A=tg>A?Math.min(tg,A+dt*7):Math.max(tg,A*Math.exp(-dt/1.5));
  const am=Math.max(A,IDLE),sf=.5+A;for(let i=0;i<4;i++)PH[i]+=dt*KK[i]*CC[i]*sf;
  for(let i=0;i<3;i++)PS[i]+=dt*WK[i]*WC[i]*(.55+1.1*am);Pm+=dt*(.8+1.2*am);
  draw();raf=requestAnimationFrame(frame)};
 const go=()=>{if(vis&&on&&!raf){last=0;acc=0;raf=requestAnimationFrame(frame)}};
 const begin=()=>{if(on||!W||(mq&&mq.matches))return;on=true;HH=pb.clientHeight||12;pf.classList.add("pf-agua");draw();go()};
 if(window.ResizeObserver)new ResizeObserver(()=>{W=pb.clientWidth;HH=pb.clientHeight||12}).observe(pb);
 if(window.IntersectionObserver)new IntersectionObserver(es=>{vis=es[es.length-1].isIntersecting;if(vis){W=pb.clientWidth;if(!on)begin();else go()}},{rootMargin:"80px"}).observe(pb);
 return v=>{
  if(!isFinite(v))return;
  W=pb.clientWidth;
  if(!W||(mq&&mq.matches)){T=v;rest();return}
  if(on&&v===T)return;
  const was=T;T=v;
  if(!on)begin();else go();
  if(was!==T)anim("barra_agua")}
})();
/* update() agrupado: varias entradas en el mismo fotograma (input + change) se calculan una sola vez */
let updRaf=0;
const updSoon=()=>{if(updRaf)return;updRaf=requestAnimationFrame(()=>{updRaf=0;if(S)update()})};
function update(){
 if(updRaf){cancelAnimationFrame(updRaf);updRaf=0}
 const R=S.root,P=pend(),n=P.length,a=ev(R,full({})),okk=pass(a),num=S.rf?rnd(a):fmt(a),ol=outlook(),vd=vtxt(ol),col=ol.k==="aun"?"wn":(okk?"gn":"rd");
 if(prevOk===false&&okk&&a!==prevA)burst();prevOk=okk;prevA=a;
 walk(R,c=>{if(!c.ch)return;const hp=leaves(c).some(l=>isP(l.id)),e=$("sv-"+c.id);e.textContent=hp?"Faltan notas":fmt(ev(c,full({})));e.classList.toggle("pn",hp)});
 $("sl1").innerHTML=n?'Mi promedio <span class="l2">hasta ahora</span>':'Mi promedio <span class="l2">final</span>';
 $("sl2").innerHTML=`<span class="tag ${vd.c}">${vd.t}</span>${vd.m?`<span class="sst">${vd.m}</span>`:""}`;
 setNum($("big"),num);$("big").className=col+(String(num).length>3?" dec":"");if(prevNum!==null&&prevNum!==num&&!RM){const bg2=$("big");void bg2.offsetWidth;bg2.classList.add("pop")}prevNum=num;
 setNum($("mbig"),num);$("mbig").className=col;
 const w=Math.min(100,a/20*100)+"%",m=Math.min(100,S.pm/20*100)+"%",bg=ol.k==="aun"?"#FFC400":(okk?"#00F03C":"#ff5a5f");
 $("pf").style.width=w;waterTo(parseFloat(w));$("pf").style.background=bg;$("mk").style.left=m;$("mk").setAttribute("aria-valuenow",S.pm);$("mkt").textContent=fmt(S.pm);
 $("mpf").style.width=w;$("mpf").style.background=bg;$("mmk").style.left=m;
 $("pt").textContent=n?`Actual: ${fmt(a)} | Objetivo: ${S.pm}`:`Cerraste con ${fmt(a)}, tu meta era ${S.pm}`;
 $("rib").hidden=leaves(R).length-n===0;
 if(ol.k!==prevK){if(prevK!==null&&!seenEst.has(cur+ol.k)){seenEst.add(cur+ol.k);track("estado_aprobacion",{curso:cur,estado:ol.k,pendientes:n})}prevK=ol.k}
 let cb="";
 if(n){
  const fp=(x,l)=>String(Math.round(x*(l.mx||20)/20*100)/100);
  /* Encabezados en dos filas: si termina en numero, el numero va solo abajo ("Control 1" -> Control / 1, "PC1" -> PC / 1);
     si no, se reparte el nombre en dos filas lo mas parejas posible para que la columna no se ensanche */
  const hn=n=>{n=String(n).trim();let a=n,b="";const w=n.split(/\s+/);
   if(w.length>1&&/^\d+$/.test(w[w.length-1])){a=w.slice(0,-1).join(" ");b=w[w.length-1]}
   else if(w.length===1){const d=n.match(/^(\D+?)(\d+)$/);if(d){a=d[1];b=d[2]}}
   else{let best=1e9;for(let k=1;k<w.length;k++){const x=w.slice(0,k).join(" "),y=w.slice(k).join(" "),m=Math.max(x.length,y.length);if(m<=best){best=m;a=x;b=y}}}
   return `<span>${a}</span>${b?` <span>${b}</span>`:""}`};
  const hdr=`<tr>${P.map(l=>`<th>${hn(l.n)}</th>`).join("")}<th class="pfc"><span>Promedio</span> <span>final</span></th></tr>`;
  const mk=o=>{const v=ev(R,full(o)),pv=S.rf?rnd(v):fmt(v);return `<tr>${P.map(l=>`<td>${fp(o[l.id],l)}</td>`).join("")}<td class="pfc">${pv}</td></tr>`};
  /* Combinaciones: las evaluaciones van en orden de rendición (las primeras son las más fáciles).
     Cada fila es una escalera que baja: primeras notas más altas, últimas más bajas, y todas llegan a la nota mínima.
     D = diferencia entre la primera y la última nota pendiente (0 = todas parecidas). Para cada D se busca la nota "base" más baja que aprueba. */
  const sn=(x,l)=>{const m=l.mx;if(!m)return Math.round(x);return Math.min(m,Math.round(x*m/20*2)/2)*20/m};
  const okc=o=>pass(ev(R,full(o)));
  const rows=[],seen=new Set();
  if(n===1){const l=P[0];for(let i=0;i<=20&&rows.length<5;i++){const o={[l.id]:sn(i,l)};if(okc(o)){const k=String(o[l.id]);if(!seen.has(k)){seen.add(k);rows.push(mk(o))}}}}
  else for(const D of [0,3,6,9,12]){
   for(let x=-D/2;x<=20+D/2+1e-9;x+=.5){
    const o={};P.forEach((l,i)=>o[l.id]=sn(Math.max(0,Math.min(20,x+D*(.5-i/(n-1)))),l));
    if(okc(o)){const k=P.map(l=>o[l.id]).join(",");if(!seen.has(k)){seen.add(k);rows.push(mk(o))}break}}}
  cb=okk?"":(ol.k==="no"||!rows.length)?`<p class="msg bad">Ya no se llega a ${S.pm}, ni sacando la nota máxima en lo que falta.</p>`:`<h2>Combinaciones posibles para aprobar con ${S.pm}</h2><div class="sc"><table>${hdr}${rows.join("")}</table></div>`;
 }
 $("cb").innerHTML=cb;
 simR();
 trackCombo();
 paintBars();
 fbSync();
 save();
}

/* Notas: se puede escribir con coma o con punto, pero siempre se guarda y se muestra con punto */
const nd=t=>{let v=t.value.replace(/,/g,".").replace(/[^0-9.]/g,"");const i=v.indexOf(".");if(i>=0)v=v.slice(0,i+1)+v.slice(i+1).replace(/\./g,"");
 if(v!==t.value){const p=t.selectionStart,d=t.value.length-v.length;t.value=v;try{const q=Math.max(0,(p==null?v.length:p)-d);t.setSelectionRange(q,q)}catch(_){}}return v};
const h=e=>{const t=e.target,id=t.dataset.id;
 if(t.classList.contains("g")){let nv=nd(t);const mxv=idx[id].mx||20;let over=false;if(nv!==""&&+nv>mxv){over=true;nv=String(S.g[id]??"");t.value=nv}S.g[id]=nv;if(e.type==="input"&&t.value!==""&&!seenTyp.has(cur)){seenTyp.add(cur);track("nota_escribiendo",{curso:cur})}const gi=t.closest(".gi");if(gi){const f=t.value!=="";gi.classList.toggle("fl",f);const bd=f&&(+t.value>(idx[id].mx||20)||+t.value<0);gi.classList.toggle("bad",bd);if(bd&&typeof badFx==="function")badFx(gi,t,idx[id].mx||20);if(bd){const k=cur+":"+id;if(!seenBad.has(k)){seenBad.add(k);track("nota_fuera_de_rango",{curso:cur,evaluacion:id})}}t.style.width=f?(t.value.length+.6)+"ch":"";if(over){gi.classList.add("bad");if(typeof badFx==="function")badFx(gi,t,mxv);clearTimeout(gi._bd);gi._bd=setTimeout(()=>gi.classList.remove("bad"),1100);const k=cur+":"+id;if(!seenBad.has(k)){seenBad.add(k);track("nota_fuera_de_rango",{curso:cur,evaluacion:id})}}}}
 else if(t.dataset.r)idx[t.dataset.r].r=t.checked?1:0;
 else if(t.id==="rf")S.rf=t.checked;
 else if(t.id==="pm"){let v=nd(t),over=false;if(v!==""&&+v>20){over=true;v=String(S.pm);t.value=v}S.pm=Math.max(0,Math.min(20,+v||0));if(over){const ml=t.closest(".minl");if(ml){ml.classList.add("bad");if(typeof badFx==="function")badFx(ml,t,20);clearTimeout(ml._bd);ml._bd=setTimeout(()=>ml.classList.remove("bad"),1100)}}}
 else return;
 updSoon()};
document.addEventListener("input",h);document.addEventListener("change",h);
/* Analíticas de uso de la calculadora: solo conteos y si aprueba o no, nunca las notas */
function trackCalc(){clearTimeout(calcTm);calcTm=setTimeout(()=>{if(!S)return;const L=leaves(S.root),n=pend().length;
 track("calculo_actualizado",{curso:cur,total:L.length,ingresadas:L.length-n,pendientes:n,completo:n===0,aprobado:pass(ev(S.root,full({}))),estado:outlook().k,nota_minima:S.pm,redondeo_final:!!S.rf});if(n===0)setEtapa("completo")},1800)}
document.addEventListener("change",e=>{const t=e.target;if(!t||!t.classList)return;
 if(t.classList.contains("g")&&t.value!==""){const L=leaves(S.root),n=L.filter(l=>!isP(l.id)).length;
  track("nota_ingresada",{curso:cur,evaluacion:t.dataset.id,ingresadas:n,total:L.length});
  if(!seenFirst.has(cur)){seenFirst.add(cur);track("primera_nota",{curso:cur,nombre:cname(cur)});setEtapa("con_notas")}trackCalc()}
 else if(t.dataset&&t.dataset.r)track("redondeo_cambiado",{curso:cur,evaluacion:t.dataset.r,activo:t.checked});
 else if(t.id==="rf")track("redondeo_final_cambiado",{curso:cur,activo:t.checked});
 else if(t.id==="pm"){track("nota_minima_cambiada",{curso:cur,valor:S.pm});trackCalc()}});
document.addEventListener("click",e=>{
 if(!e.target.closest(".cs"))closeList();
 if(e.target.closest("a[href='#faq']"))track("como_funciona_click");
 {const ig=e.target.closest("a[data-ig]");if(ig)track("instagram_click",{lugar:ig.dataset.ig})}
 const b=e.target.closest("button");if(!b)return;
 if(b.hasAttribute("data-share"))doShare(b.classList.contains("shf")?"pie":"barra");
 else if(b.id==="go"){track("empezar_click");showView("pick")}
 else if(b.id==="addc"||b.id==="addc2"||b.dataset.add){upFrom=view==="tool"?"tool":"pick";upY=window.scrollY;track("subir_curso_abierto",{origen:b.dataset.add||(b.id==="addc"?"pick_arriba":"pick_bloque")});closeList();$("upok").hidden=true;$("upf").hidden=false;showView("up");updUpLabels()}
 else if(b.id==="upback"){leaveUp()}
 else if(b.id==="pickback"){track("volver_inicio");closeList();showView("welcome")}
 else if(b.id==="uphome"){closeList();showView("welcome")}
 else if(b.id==="home"){track("volver_inicio");closeList();showView("welcome")}
 else if(b.id==="cbtn"){const o=$("clist").hidden;if(o){anim("menu_cursos_despliegue");track("menu_cursos_abierto",{curso:cur})}$("clist").hidden=!o;b.setAttribute("aria-expanded",String(o))}
 else if(b.dataset.fi){closeList();showView("fi")}
 else if(b.dataset.c){track("curso_elegido",{curso:b.dataset.c,nombre:cname(b.dataset.c),grupo:["nivelacion","curso","sello_up"][gof(b.dataset.c)],origen:b.dataset.p?"pantalla_elegir":b.dataset.f?"pie":"menu"});
  /* Desde "Elige tu curso" el trabajo pesado (armar la calculadora) espera un cuadro para que primero se pinte el efecto de tocar y el telefono responda al instante */
  if(b.dataset.p){const k=b.dataset.c;requestAnimationFrame(()=>{setCourse(k);showView("tool")})}
  else{setCourse(b.dataset.c);if(b.dataset.f)window.scrollTo({top:0})}}
 else if(b.id==="rs"){track("redondeos_restablecidos",{curso:cur});const d=defR(cur);walk(S.root,c=>{c.r=d[c.id]?1:0});S.rf=!!C[cur].rf;document.querySelectorAll("#rules input[data-r]").forEach(x=>{x.checked=!!d[x.dataset.r]});const rfx=$("rf");if(rfx)rfx.checked=S.rf;update();toast("Redondeos restablecidos")}});
/* Notas: Enter (o "Siguiente" del teclado del celular) pasa a la siguiente; Shift+Enter vuelve a la anterior; en la ultima cierra el teclado y lleva al resumen */
const nCoarse=window.matchMedia?matchMedia("(pointer:coarse)"):{matches:false};
function nextNota(el,d){const L=[...document.querySelectorAll("#tree input.g")],n=L[L.indexOf(el)+d];
 if(n){n.focus({preventScroll:nCoarse.matches});if(!nCoarse.matches){try{n.select()}catch(_){}}n.scrollIntoView({block:nCoarse.matches?"nearest":"center",behavior:RM?"auto":"smooth"})}
 else if(d>0){el.blur();$("sum").scrollIntoView({block:"center",behavior:RM?"auto":"smooth"})}}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeList();
 const t=e.target;if(e.key==="Enter"&&!e.isComposing&&t&&t.matches){if(t.matches("#tree input.g")){e.preventDefault();nextNota(t,e.shiftKey?-1:1)}else if(t.id==="pm"){e.preventDefault();t.blur()}}});
$("plist").innerHTML=(FI_ACTIVO?`<section class="pg"><h2 class="gt">Factor de inscripción<i>1</i></h2><div class="pl"><button type="button" class="rv" style="--i:2;--s:#00F03C" data-fi="1"><small>Herramienta</small>Calcular mi FI</button></div></section>`:"")+GR.map(([t,g])=>`<section class="pg"><h2 class="gt">${t}<i>${inG(g).length}</i></h2><div class="pl">${inG(g).map(x=>{const i=KS.indexOf(x);return `<button type="button" class="rv" style="--i:${i+3};--s:${SC[i%4]}" data-c="${x}" data-p="1"><small>${C[x].pre===""?"Curso":"Nivelación en"}</small>${C[x].n}</button>`}).join("")}</div></section>`).join("");
const pb=document.querySelector("#sum .pbar");let drag=false,raf=0;
const setPm=v=>{v=Math.max(0,Math.min(20,Math.round(v)));if(v===S.pm)return;S.pm=v;anim("barra_nota_minima");trackCalc();clearTimeout(pmT);pmT=setTimeout(()=>track("meta_cambiada",{curso:cur,valor:S.pm,via:"barra"}),1200);$("pm").value=v;if(!raf)raf=requestAnimationFrame(()=>{raf=0;update()})};
const fromX=x=>{const r=pb.getBoundingClientRect();return r.width?(x-r.left)/r.width*20:S.pm};
/* Mouse: arrastra al instante. Dedo: tambien al instante, pero con dos candados para que un scroll nunca mueva la nota minima:
   1) si la pantalla se esta moviendo (scroll o inercia) la barra no responde a ese toque;
   2) si el dedo empieza moviendose hacia arriba/abajo es un scroll y se ignora; solo un movimiento hacia los lados la agarra. */
let armed=false,sx=0,sy=0,pid=0,lastScroll=0;
window.addEventListener("scroll",()=>{lastScroll=performance.now()},{passive:true});
const still=()=>performance.now()-lastScroll>150;
pb.addEventListener("pointerdown",e=>{
 if(e.pointerType==="mouse"){drag=true;try{pb.setPointerCapture(e.pointerId)}catch(_){}pb.classList.add("drag");setPm(fromX(e.clientX));return}
 armed=still();sx=e.clientX;sy=e.clientY;pid=e.pointerId});
pb.addEventListener("pointermove",e=>{
 if(armed){const dx=Math.abs(e.clientX-sx),dy=Math.abs(e.clientY-sy);if(dx<3&&dy<3)return;armed=false;
  if(dx>=dy){drag=true;try{pb.setPointerCapture(pid)}catch(_){}pb.classList.add("drag");setPm(fromX(e.clientX))}return}
 if(drag)setPm(fromX(e.clientX))});
const endDrag=()=>{armed=false;drag=false;pb.classList.remove("drag")};
pb.addEventListener("pointerup",e=>{if(armed&&e.pointerType!=="mouse")setPm(fromX(e.clientX));endDrag()});
pb.addEventListener("pointercancel",endDrag);
pb.addEventListener("touchmove",e=>{if(drag&&e.cancelable)e.preventDefault()},{passive:false});
pb.addEventListener("contextmenu",e=>e.preventDefault());
$("mk").addEventListener("keydown",e=>{const d={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[e.key];if(d){e.preventDefault();setPm(d>0?Math.floor(S.pm)+1:Math.ceil(S.pm)-1)}else if(e.key==="Home"){e.preventDefault();setPm(0)}else if(e.key==="End"){e.preventDefault();setPm(20)}});
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.target.id==="sum")sumIn=e.isIntersecting;else faqIn=e.isIntersecting;if(e.isIntersecting&&view==="tool"){const k=e.target.id+":"+cur;if(!seenSec.has(k)){seenSec.add(k);track(e.target.id==="sum"?"resumen_visto":"faq_vista",{curso:cur})}}});chk()});
io.observe($("sum"));io.observe($("faq"));
const PT=Array.from({length:16},(_,i)=>`<i class="pt" style="--x:${(i*6.2+3+(i%3)*2).toFixed(1)}%;--t:${9+(i*7)%6}s;--d:${-(i*1.3).toFixed(1)}s;--z:${2+i%3}px;--dx:${(i%2?1:-1)*(10+i*2)}px;--c:${["#fff","#00F03C","#0A5CFF","#F000F0"][i%4]}"></i>`).join("");
const SPK=[[12,22],[84,16],[70,72],[16,78],[52,10],[93,50]].map(([x,y],i)=>`<i class="sp" style="--x:${x}%;--y:${y}%;--s:${12+(i%3)*5}px;--d:${(i*.7).toFixed(1)}s"></i>`).join("");
const DECO=`<div class="deco" aria-hidden="true"><div class="gw"><div class="gr"></div></div><div class="rg"><i class="ring" style="--d:0s"></i><i class="ring" style="--d:2.3s;--rc:#0A5CFF"></i><i class="ring" style="--d:4.6s;--rc:#F000F0"></i><i class="dash"></i><i class="dash dash2"></i><i class="core">%</i></div><i class="dt d1" style="width:22px;height:22px;background:#00F03C;top:9%;right:11%;--x:-16px;--y:20px;--t:6s"></i><i class="dt d2" style="width:15px;height:15px;background:#0A5CFF;top:34%;right:5%;--x:10px;--y:-24px;--t:8s;--d:-2s"></i><i class="dt d3" style="width:26px;height:26px;background:#F000F0;bottom:14%;right:28%;--x:-12px;--y:-18px;--t:7s;--d:-1s"></i><b class="cp c1" style="top:9%;left:7%;--t:9s">11</b><b class="cp c2" style="top:17%;right:30%;--t:7s;--d:-3s">15</b><b class="cp c3" style="bottom:9%;left:9%;--t:8s;--d:-5s">20</b><i class="sq s1" style="bottom:18%;right:9%"></i><i class="beam"></i>${PT}${SPK}</div>`;
document.querySelectorAll(".wel").forEach(el=>el.insertAdjacentHTML("afterbegin",DECO));
document.querySelectorAll(".tip,#sum,.faq h2,.qa,footer .fc").forEach((e,i)=>{e.classList.add("sr");e.style.setProperty("--i",String(i%4))});
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");so.unobserve(e.target)}}),{threshold:.1,rootMargin:"0px 0px -5% 0px"});
document.querySelectorAll(".sr").forEach(e=>so.observe(e));
const FBH={v:`<span class="fbv">My Ponder<b>UP</b></span>`,h:`<span class="fbh"><i class="mark">%</i><span>My Ponder<b>UP</b></span></span>`,f:`<span class="logo">My Ponder<b>UP</b></span>`};
const fbImg=img=>{if(img.dataset.done||!img.isConnected)return;img.dataset.done="1";const t=document.createElement("template");t.innerHTML=FBH[img.dataset.fb];img.replaceWith(t.content.firstElementChild)};
const chkImgs=()=>document.querySelectorAll("img[data-fb]").forEach(i=>{if(i.complete&&i.naturalWidth===0)fbImg(i)});
document.querySelectorAll("img[data-fb]").forEach(i=>i.addEventListener("error",()=>fbImg(i)));chkImgs();window.addEventListener("load",chkImgs);
/* Preguntas: abrir y cerrar con animación suave */
document.querySelectorAll(".qa").forEach(d=>{
 const sm=d.querySelector("summary"),an=d.querySelector(".ans"),inner=an.firstElementChild;let fa=null,fa2=null;
 sm.addEventListener("click",e=>{
  e.preventDefault();
  const mid=!!fa,h0=mid?an.getBoundingClientRect().height:0,o0=mid?+getComputedStyle(an).opacity:0;
  if(fa){fa.cancel();fa2&&fa2.cancel();fa=fa2=null}
  const open=!d.open||d.classList.contains("closing");if(open)anim("faq_despliegue");if(open)track("faq_abierta",{pregunta:((d.querySelector(".q")||{}).textContent||"").slice(0,80)});
  if(RM){d.classList.remove("closing");d.open=open;return}
  d.classList.remove("closing");d.open=true;
  const full=an.offsetHeight;
  an.style.overflow="hidden";
  if(!open)d.classList.add("closing");
  const a=open?[{height:(mid?h0:0)+"px",opacity:mid?o0:0},{height:full+"px",opacity:1}]:[{height:(mid?h0:full)+"px",opacity:mid?o0:1},{height:"0px",opacity:0}];
  const o={duration:open?460:340,easing:open?"cubic-bezier(.2,.7,.2,1)":"cubic-bezier(.4,0,.2,1)"};
  fa=an.animate(a,o);
  if(inner)fa2=inner.animate(open?[{transform:"translateY(-10px)",opacity:0},{transform:"none",opacity:1}]:[{transform:"none",opacity:1},{transform:"translateY(-8px)",opacity:0}],o);
  const me=fa;
  me.onfinish=()=>{if(fa!==me)return;fa=fa2=null;an.style.overflow="";if(!open){d.open=false;d.classList.remove("closing")}};
 });
});
/* Favicon: lo centra en un lienzo cuadrado sin estirarlo */
{const im=new Image();im.crossOrigin="anonymous";
 im.onload=()=>{try{const N=256,c=document.createElement("canvas");c.width=c.height=N;const x=c.getContext("2d"),k=Math.min(N/im.naturalWidth,N/im.naturalHeight),w=im.naturalWidth*k,hh=im.naturalHeight*k;x.imageSmoothingQuality="high";x.drawImage(im,(N-w)/2,(N-hh)/2,w,hh);const u=c.toDataURL("image/png");document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(l=>{l.type="image/png";l.href=u})}catch(_){}};
 idle(()=>{im.src="/img/favicon.png"})}
/* Modo claro / oscuro: sin eleccion guardada sigue al sistema; al tocar el interruptor se fija claro u oscuro y se guarda en mp-theme. */
{const root=document.documentElement,tg=$("tg"),mq=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;let saved=null;
 try{const v=localStorage.getItem("mp-theme");saved=(v==="dark"||v==="light")?v:null}catch(_){}
 const isDark=()=>saved?saved==="dark":!!(mq&&mq.matches);
 const apply=()=>{const d=isDark();root.dataset.theme=d?"dark":"light";tg.setAttribute("aria-checked",String(d))};
 const store=()=>{try{if(saved)localStorage.setItem("mp-theme",saved);else localStorage.removeItem("mp-theme")}catch(_){}};
 apply();
 tg.addEventListener("click",()=>{const d=root.dataset.theme!=="dark";saved=d?"dark":"light";store();apply();anim("tema_interruptor");toast(d?"Modo oscuro":"Modo claro");track("tema_cambiado",{tema:d?"oscuro":"claro",modo:"manual"})});

 if(mq&&mq.addEventListener)mq.addEventListener("change",()=>{if(!saved)apply()})}
const fo=new IntersectionObserver(es=>es.forEach(e=>{if(e.target.id==="faq"){faqNear=e.isIntersecting;chk()}}),{rootMargin:"0px 0px 170px 0px"});fo.observe($("faq"));
/* Zona donde se nota el cambio claro/oscuro: el contenido ya entro en el 60% superior de la pantalla */
{const mk=mg=>new IntersectionObserver(es=>es.forEach(e=>{const f=!!e.target.closest("#v-fi");if(mg)f?fiBodyIn=e.isIntersecting:bodyIn=e.isIntersecting;else f?fiBodySee=e.isIntersecting:bodySee=e.isIntersecting;chk()}),{rootMargin:mg?"0px 0px -40% 0px":"0px"}),
 bo=mk(true),bs=mk(false);
 document.querySelectorAll("#v-tool main.body,#v-fi main.body").forEach(m=>{bo.observe(m);bs.observe(m)})}

/* ===== Guardado automático (localStorage): notas, nota mínima y redondeos de cada curso ===== */
const LSK="mp-progress";
const defR=k=>{const d={};walk(C[k].root,c=>d[c.id]=c.r?1:0);return d};
function save(){try{const o={};
 for(const k in ST){const t=ST[k];if(!t)continue;const e={},g={};
  for(const id in t.g){const v=t.g[id];if(v!==undefined&&v!=="")g[id]=v}
  if(Object.keys(g).length)e.g=g;
  if(t.pm!==11)e.pm=t.pm;
  if(t.rf!==!!C[k].rf)e.rf=t.rf;
  const d=defR(k),r={};walk(t.root,c=>{if((c.r?1:0)!==d[c.id])r[c.id]=c.r?1:0});
  if(Object.keys(r).length)e.r=r;
  if(Object.keys(e).length)o[k]=e}
 localStorage.setItem(LSK,JSON.stringify({v:1,cur,c:o}))}catch(_){}}
function load(){try{const j=JSON.parse(localStorage.getItem(LSK)||"null");if(!j||j.v!==1||!j.c)return null;
 for(const k in j.c){if(!C[k])continue;const e=j.c[k]||{},t=ST[k]=mkState(k),lv={},nd={};
  walk(t.root,c=>{nd[c.id]=c;if(!c.ch)lv[c.id]=1});
  if(e.g)for(const id in e.g){const v=String(e.g[id]);if(lv[id]&&v!==""&&isFinite(+v)&&+v>=0)t.g[id]=+v>(nd[id].mx||20)?String(nd[id].mx||20):v}
  if(typeof e.pm==="number"&&e.pm>=0&&e.pm<=20)t.pm=e.pm;
  if(typeof e.rf==="boolean")t.rf=e.rf;
  if(e.r)for(const id in e.r)if(nd[id])nd[id].r=e.r[id]?1:0}
 const wg=k=>ST[k]&&Object.keys(ST[k].g).length>0;
 return (C[j.cur]&&wg(j.cur))?j.cur:(KS.find(wg)||null)}catch(_){return null}}

/* ===== Compartir ===== */
function toast(m){anim("aviso_emergente");const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("on"),2600)}
async function doShare(o){track("compartir_click",{origen:o});
 const url=location.origin+location.pathname+"?utm_source=share",d={title:"My PonderUP",text:"Calcula tu ponderado y mira qué notas necesitas para aprobar.",url};
 if(navigator.share&&window.matchMedia&&matchMedia("(pointer:coarse)").matches){try{await navigator.share(d);track("compartir_ok",{origen:o,metodo:"nativo"});return}catch(e){if(e&&e.name==="AbortError")return}}
 try{await navigator.clipboard.writeText(url);toast("Enlace copiado");track("compartir_ok",{origen:o,metodo:"copiar"})}
 catch(_){const ta=document.createElement("textarea");ta.value=url;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand("copy")}catch(_){}ta.remove();toast(ok?"Enlace copiado":url)}}

/* ===== Compartir mi resultado: imagen hecha en el navegador (canvas), sin servidor ===== */
const SITE_HOST="myponderup.vercel.app";
{const M=$("rim"),IMG=$("rii"),BG=$("rig"),BD=$("rid"),CK=$("rin"),NT=$("ris"),PV=$("rimp"),FONT='Montserrat,"Montserrat Fallback",Arial,sans-serif',NAME="mi-resultado-myponderup.png";
 let fk=nCoarse.matches?"story":"post",file=null,blobUrl="",dataUrl="",seq=0,logo,nat=false,failed=false,back=null;
 const F=(w,s)=>`${w} ${s}px ${FONT}`,tmo=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(r,ms))]);
 const loadLogo=()=>logo!==undefined?Promise.resolve(logo):tmo(new Promise(r=>{const im=new Image();im.onload=()=>r(logo=im);im.onerror=()=>r(logo=null);im.src="/img/logo-horizontal.webp"}),2500).then(x=>x||(logo=null));
 const wrap=(c,t,w)=>{const o=[];let l="";String(t).split(" ").forEach(p=>{const x=l?l+" "+p:p;if(c.measureText(x).width>w&&l){o.push(l);l=p}else l=x});if(l)o.push(l);return o};
 const clip=(c,t,w)=>{if(c.measureText(t).width<=w)return t;while(t.length>1&&c.measureText(t+"…").width>w)t=t.slice(0,-1);return t+"…"};
 const d2b=u=>{const a=u.split(","),m=/:(.*?);/.exec(a[0])[1],s=atob(a[1]),u8=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u8[i]=s.charCodeAt(i);return new Blob([u8],{type:m})};
 const hint=()=>"La imagen solo muestra tu resultado. Tus notas no aparecen salvo que lo actives."+(nCoarse.matches?" Si no se descarga, mantén presionada la imagen para guardarla.":"");
 /* Datos de la imagen: solo resultado; las notas solo si la persona lo activa */
 const snap=notes=>{const o=outlook(),f=v=>S.rf?String(rnd(v)):fmt(v),L=leaves(S.root);
  return{curso:(C[cur].pre??"Nivelación en ")+C[cur].n,n:o.n,vd:vtxt(o,true),num:f(o.lo),lo:f(o.lo),hi:f(o.hi),lov:o.lo,hiv:o.hi,pm:S.pm,hechas:L.length-o.n,total:L.length,
   rows:notes?L.map(l=>({n:l.n,v:isP(l.id)?"—":fmt(Math.min(+S.g[l.id],l.mx||20))+(l.mx?" / "+l.mx:"")})):null}};
 function paint(c,W,d,lg){
  const X=84,CW=W-2*X,WH="#fff",MU="rgba(255,255,255,.74)",col=d.vd.c==="y"?"#00F03C":d.vd.c==="n"?"#ff7a7a":"#FFC400";let y=0;
  c.textBaseline="alphabetic";c.textAlign="left";
  ["#0A5CFF","#00F03C","#F000F0","#FFFFFF"].forEach((k,i)=>{c.fillStyle=k;c.fillRect(X+i*64,y,64,12)});y+=12+48;
  c.font=F(600,34);c.fillStyle=MU;c.fillText("Mi ponderado de",X,y+28);y+=28+18;
  let fs=72,L;c.font=F(800,fs);L=wrap(c,d.curso,CW);if(L.length>2){fs=54;c.font=F(800,fs);L=wrap(c,d.curso,CW)}
  c.fillStyle=WH;L.forEach(t=>{c.fillText(t,X,y+fs*.9);y+=fs*1.12});y+=40;
  c.font=F(900,100);const hs=Math.min(d.rows?240:360,Math.floor(CW/c.measureText(d.num).width*100));
  c.font=F(900,hs);c.fillStyle=d.vd.c==="m"?WH:col;c.fillText(d.num,X-6,y+hs*.74);y+=hs*.74+44;
  c.font=F(600,32);c.fillStyle=MU;wrap(c,d.n?"Mi promedio hasta ahora":"Mi promedio final",CW).forEach(t=>{c.fillText(t,X,y+28);y+=42});y+=30;
  let cs=40,tx=d.vd.t.toUpperCase();c.font=F(800,cs);while(c.measureText(tx).width>CW-64&&cs>24){cs-=2;c.font=F(800,cs)}
  const cw=c.measureText(tx).width+64,chh=cs+40;c.fillStyle=col;c.fillRect(X,y,cw,chh);c.fillStyle="#061F47";c.fillText(tx,X+32,y+chh/2+cs*.35);y+=chh+30;
  if(d.vd.m){c.font=F(600,40);c.fillStyle=WH;wrap(c,d.vd.m,CW).forEach(t=>{c.fillText(t,X,y+40);y+=54});y+=24}
  y+=46;const bh=30,fx=v=>Math.min(1,Math.max(0,v/20))*CW,px=X+fx(d.pm);
  c.fillStyle="rgba(255,255,255,.18)";c.fillRect(X,y,CW,bh);
  c.fillStyle=col;c.fillRect(X,y,fx(d.lov),bh);
  c.fillStyle=WH;c.fillRect(px-3,y-12,6,bh+24);
  c.font=F(700,28);c.textAlign="center";c.fillText("mín. "+d.pm,Math.min(X+CW-60,Math.max(X+60,px)),y-24);c.textAlign="left";
  y+=bh+12;
  if(d.rows){y+=36;const n=d.rows.length,cols=n>6?2:1,per=Math.ceil(n/cols),pad=30,rh=cols>1?56:66,gp=36,cw2=(CW-2*pad-(cols-1)*gp)/cols,ph=pad*2+46+per*rh;c.fillStyle="rgba(255,255,255,.07)";c.fillRect(X,y,CW,ph);
   c.font=F(700,28);c.fillStyle=MU;c.fillText("Mis notas",X+pad,y+pad+26);
   d.rows.forEach((r,i)=>{const cc=Math.floor(i/per),ri=i%per,rx=X+pad+cc*(cw2+gp),ry=y+pad+46+ri*rh;if(ri){c.fillStyle="rgba(255,255,255,.14)";c.fillRect(rx,ry,cw2,2)}
    c.textAlign="left";c.font=F(700,cols>1?28:34);c.fillStyle=WH;c.fillText(clip(c,r.n,cw2-(cols>1?150:250)),rx,ry+rh/2+11);
    c.textAlign="right";c.font=F(800,cols>1?30:38);c.fillText(r.v,rx+cw2,ry+rh/2+12);c.textAlign="left"});y+=ph}
  return y}
 /* Dibuja la imagen completa. k = escala (1 normal; si el telefono no aguanta, se reintenta mas chica) */
 function draw(d,k,lg){
  const W=1080,story=fk==="story",H=story?1920:1350,cv=document.createElement("canvas");cv.width=Math.round(W*k);cv.height=Math.round(H*k);const c=cv.getContext("2d");c.scale(k,k);
  c.fillStyle="#061F47";c.fillRect(0,0,W,H);
  let g=c.createRadialGradient(W*.88,H*.1,0,W*.88,H*.1,W*.75);g.addColorStop(0,"rgba(10,92,255,.42)");g.addColorStop(1,"rgba(10,92,255,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
  g=c.createRadialGradient(W*.05,H*.95,0,W*.05,H*.95,W*.6);g.addColorStop(0,"rgba(0,240,60,.16)");g.addColorStop(1,"rgba(0,240,60,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
  const X=84,CW=W-2*X,fy=H-(story?230:76)-64,top=story?230:84,avail=fy-34-34-top;
  /* si no cabe, se encoge todo el bloque pero se pinta mas ancho para que siga ocupando el mismo ancho que el pie */
  const sc=document.createElement("canvas").getContext("2d");let s=1,Wp=W,hh=0;
  for(let i=0;i<3;i++){Wp=2*X+CW/s;hh=paint(sc,Wp,d,lg);s=Math.min(1,avail/hh)}
  Wp=2*X+CW/s;hh=paint(sc,Wp,d,lg);const oy=top+Math.max(0,(avail-hh*s)/2);
  c.save();c.translate(X,oy);c.scale(s,s);c.translate(-X,0);paint(c,Wp,d,lg);c.restore();
  c.fillStyle="rgba(255,255,255,.2)";c.fillRect(X,fy-34,CW,2);
  if(lg&&lg.naturalWidth){const lh=60,lw=Math.min(380,lg.naturalWidth/lg.naturalHeight*lh);c.drawImage(lg,X,fy,lw,lw/(lg.naturalWidth/lg.naturalHeight))}
  else{c.textAlign="left";c.font=F(900,44);c.fillStyle="#fff";c.fillText("My Ponder",X,fy+44);const w=c.measureText("My Ponder").width;c.fillStyle="#00F03C";c.fillText("UP",X+w,fy+44)}
  c.textAlign="right";c.font=F(800,34);c.fillStyle="#00F03C";c.fillText(SITE_HOST,X+CW,fy+28);c.font=F(600,26);c.fillStyle="rgba(255,255,255,.74)";c.fillText("Calcula el tuyo gratis",X+CW,fy+64);
  return cv}
 const ui=b=>{BG.disabled=BD.disabled=b;PV.setAttribute("aria-busy",String(b))};
 async function render(){
  const my=++seq;failed=false;ui(true);NT.textContent="Creando tu imagen…";BG.textContent="Creando…";
  try{
   try{await tmo(Promise.all(["900 100px","800 40px","700 30px","600 30px"].map(f=>document.fonts.load(f+" Montserrat"))),1800)}catch(_){}
   const lg=await loadLogo();if(my!==seq)return;
   const d=snap(CK.checked);let cv=null,blob=null,du="";
   for(const k of [1,.7,.5]){try{cv=draw(d,k,lg);blob=await new Promise(r=>{try{cv.toBlob(r,"image/png")}catch(_){r(null)}});try{du=cv.toDataURL("image/png")}catch(_){du=""}if(du.length<200)du="";if(blob&&blob.size<500)blob=null;if(blob||du)break}catch(_){cv=null}}
   if(my!==seq)return;
   if(!blob&&du){try{blob=d2b(du)}catch(_){}}
   if(!blob&&!du)throw 0;
   if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=""}
   file=null;if(blob){try{file=new File([blob],NAME,{type:"image/png"})}catch(_){file=blob;try{file.name=NAME}catch(_){}}try{blobUrl=URL.createObjectURL(blob)}catch(_){blobUrl=""}}
   dataUrl=du;IMG.onerror=()=>{const o=IMG.src===dataUrl?blobUrl:dataUrl;if(o&&IMG.src!==o)IMG.src=o};IMG.src=du||blobUrl;
   nat=!!(file&&window.File&&file instanceof File&&nCoarse.matches&&navigator.canShare&&navigator.canShare({files:[file]}));
   const cp=!nCoarse.matches&&!!(navigator.clipboard&&window.ClipboardItem&&file);
   BG.textContent=nat?"Compartir imagen":"Descargar imagen";BD.textContent=nat?"Descargar":"Copiar imagen";BD.hidden=!nat&&!cp;NT.textContent=hint();ui(false)}
  catch(_){if(my!==seq)return;failed=true;ui(false);BG.textContent="Reintentar";BD.hidden=true;NT.textContent="No pudimos crear la imagen. Toca “Reintentar”."}}
 const link=()=>location.origin+location.pathname+"?utm_source=share_img";
 const dl=()=>{const u=blobUrl||dataUrl;if(!u)return;try{const a=document.createElement("a");a.href=u;a.download=NAME;a.rel="noopener";a.style.display="none";document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),600)}catch(_){}};
 const ev2=m=>track("resultado_compartido",{curso:cur,metodo:m,formato:fk,con_notas:CK.checked});
 const setF=()=>{M.querySelectorAll("[data-rf]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.rf===fk)))};
 const open=()=>{back=document.activeElement;setF();CK.checked=false;NT.textContent=hint();M.hidden=false;document.documentElement.style.overflow="hidden";track("resultado_imagen_abierta",{curso:cur,pendientes:pend().length});render();$("rix").focus()};
 const close=()=>{M.hidden=true;document.documentElement.style.overflow="";seq++;if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=""}file=null;dataUrl="";IMG.onerror=null;IMG.removeAttribute("src");if(back&&back.focus)back.focus()};
 $("rib").addEventListener("click",open);$("rix").addEventListener("click",close);
 M.addEventListener("click",e=>{if(e.target===M){close();return}const b=e.target.closest("[data-rf]");if(!b||b.dataset.rf===fk)return;fk=b.dataset.rf;setF();render()});
 CK.addEventListener("change",()=>{NT.textContent=CK.checked?"Tus notas aparecen en la imagen. Tú decides con quién la compartes.":hint();render().then(()=>{if(CK.checked&&!failed)NT.textContent="Tus notas aparecen en la imagen. Tú decides con quién la compartes."})});
 BG.addEventListener("click",async()=>{
  if(failed){render();return}
  if(!file&&!blobUrl&&!dataUrl)return;
  if(nat){try{await navigator.share({files:[file],title:"My PonderUP",text:`Mi resultado en ${C[cur].n}. Calcula el tuyo gratis: ${link()}`});ev2("nativo")}catch(e){if(e&&e.name!=="AbortError"){dl();ev2("descarga")}}}
  else{dl();ev2("descarga");toast("Descargando imagen…")}});
 BD.addEventListener("click",async()=>{if(!file&&!blobUrl&&!dataUrl)return;
  if(nat){dl();ev2("descarga");toast("Descargando imagen…")}
  else{try{await navigator.clipboard.write([new ClipboardItem({"image/png":file})]);ev2("copiar");toast("Imagen copiada")}catch(_){dl();toast("No se pudo copiar; se descargó la imagen")}}});
 document.addEventListener("keydown",e=>{if(M.hidden)return;
  if(e.key==="Escape"){e.preventDefault();close()}
  else if(e.key==="Tab"){const f=[...M.querySelectorAll("button,input")].filter(x=>!x.disabled&&!x.hidden&&x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];
   if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}})}

/* ===== Comentarios o sugerencias (API propia /api/sugerencia) =====
   El navegador solo ayuda al usuario (trampa oculta _gotcha, tiempo minimo escribiendo, sin enlaces, sin repetidos y
   3 al dia). Esas reglas se pueden saltar, asi que la proteccion real esta en el servidor (api/sugerencia.js): origen, captcha,
   limite por IP, tope global, etc. TS_SITEKEY: clave publica de Cloudflare Turnstile ("" = sin captcha). */
{const f=$("sgf"),m=$("sgm"),b=$("sgb"),st=$("sgs"),LK="mp-sg",MIN_MS=2500,MAXDAY=3,TS_SITEKEY="";let busy=false,t0=0,tsId=null,tsTok="",tsOn=false;
 const ERR={espera:"Espera unos segundos antes de enviar otro mensaje.",limite_dia:"Ya enviaste varios mensajes hoy. ¡Gracias! Puedes escribir de nuevo mañana.",
  enlace:"Por seguridad no se permiten enlaces en los mensajes.",captcha:"No pudimos verificar que eres una persona. Recarga la página e inténtalo otra vez.",
  cupo:"Hoy ya recibimos muchos mensajes. Inténtalo mañana, ¡gracias!",invalido:"Revisa tu mensaje: debe tener entre 5 y 1000 caracteres."};
 const grow=()=>{m.style.height="auto";m.style.height=Math.min(m.scrollHeight+2,130)+"px"};
 const say=(t,k)=>{st.textContent=t;st.className="sgs"+(k?" "+k:"")};
 const norm=x=>x.toLowerCase().replace(/\s+/g," ").slice(0,200);
 const hist=()=>{try{const a=JSON.parse(localStorage.getItem(LK)||"[]");return Array.isArray(a)?a.filter(x=>x&&typeof x.t==="number"&&Date.now()-x.t<864e5):[]}catch(_){return[]}};
 const addH=x=>{try{const a=hist();a.push({t:Date.now(),h:norm(x)});localStorage.setItem(LK,JSON.stringify(a))}catch(_){}};
 const block=(why,msg)=>{say(msg,"bad");track("sugerencia_bloqueada",{motivo:why,curso:cur})};
 /* Turnstile se carga solo cuando la persona toca el cuadro de texto: no afecta la velocidad de la pagina */
 const tsLoad=()=>{if(!TS_SITEKEY||tsOn)return;tsOn=true;
  const s=document.createElement("script");s.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";s.async=true;
  s.onload=()=>{try{tsId=turnstile.render("#sgt",{sitekey:TS_SITEKEY,appearance:"interaction-only",callback:t=>{tsTok=t},"expired-callback":()=>{tsTok=""},"error-callback":()=>{tsTok=""}})}catch(_){tsOn=false}};
  s.onerror=()=>{tsOn=false};document.head.appendChild(s)};
 const tsReset=()=>{tsTok="";try{if(tsId!==null)turnstile.reset(tsId)}catch(_){}};
 m.addEventListener("focus",()=>{if(!t0)t0=Date.now();tsLoad()});
 m.addEventListener("input",()=>{if(!t0)t0=Date.now();grow();if(st.textContent)say("")});
 f.addEventListener("submit",async e=>{e.preventDefault();if(busy)return;
  const t=m.value.trim();
  if(!t){say("Escribe algo antes de enviar.","bad");m.focus();return}
  if(f.elements._gotcha&&f.elements._gotcha.value){track("sugerencia_bloqueada",{motivo:"trampa"});m.value="";say("¡Gracias! Recibimos tu mensaje.","ok");return}
  if(t.length<5)return block("corto","Escribe un poco más para poder entenderte.");
  if(/(https?:\/\/|www\.)/i.test(t))return block("enlace",ERR.enlace);
  if(!t0||Date.now()-t0<MIN_MS)return block("rapido","Un momento, revisa tu mensaje e inténtalo otra vez.");
  const H=hist();
  if(H.length>=MAXDAY)return block("limite_dia",ERR.limite_dia);
  if(H.some(x=>x.h===norm(t)))return block("repetido","Ya recibimos ese mensaje. ¡Gracias!");
  if(TS_SITEKEY&&!tsTok){tsLoad();return block("captcha_espera","Estamos verificando que eres una persona. Espera un momento e inténtalo otra vez.")}
  busy=true;b.disabled=true;b.textContent="Enviando…";say("");
  try{const body={message:t,curso:cur?C[cur].n:"",_gotcha:f.elements._gotcha?f.elements._gotcha.value:"",token:tsTok,seg:Math.round((Date.now()-t0)/1000)};
   const r=await fetch(f.action,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(body),signal:window.AbortSignal&&AbortSignal.timeout?AbortSignal.timeout(15000):undefined});
   let j=null;try{j=await r.json()}catch(_){}
   if(r.ok&&j&&j.ok){addH(t);t0=0;m.value="";m.style.height="";say("¡Gracias! Recibimos tu mensaje.","ok");track("sugerencia_enviada",{curso:cur,largo:t.length})}
   else{let code=j&&j.error;if(code&&typeof code==="object")code="firewall";code=String(code||"");
    const sinClave=code==="captcha"&&!TS_SITEKEY;if(sinClave)code="captcha_sin_clave";
    say(sinClave?"El envío no está disponible por ahora. Inténtalo más tarde.":ERR[code]||(r.status===429?"Hay muchos envíos en este momento. Inténtalo en unos minutos.":"No se pudo enviar. Inténtalo otra vez."),"bad");track("sugerencia_error",{estado:r.status,motivo:code})}
   tsReset()}
  catch(_){say("No se pudo enviar. Revisa tu conexión e inténtalo otra vez.","bad");track("sugerencia_error",{estado:"red"});tsReset()}
  busy=false;b.disabled=false;b.textContent="Enviar"})}

/* ===== Buscador de cursos =====
   Filtra los botones que ya existen (los de "Elige tu curso" y los del desplegable de cursos); no duplica la lista de cursos.
   Ignora mayúsculas y tildes, busca por partes del nombre y ordena: primero lo que empieza con lo escrito, luego el resto. */
const bqN=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
const bqS=(n,q,t)=>{if(n.startsWith(q))return 0;const w=n.split(" ");if(w.some(x=>x.startsWith(q)))return 1;if(t.length>1&&t.every(x=>w.some(y=>y.startsWith(x))))return 2;if(n.includes(q))return 3;return t.every(x=>n.includes(x))?4:-1};
function BQ(k){return `<div class="${k?"bqw":"csb"}"><div class="bqx"><label class="bqs" for="${k?"bqp":"bqc"}">Buscar curso</label><svg class="bqm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" id="${k?"bqp":"bqc"}" class="bqi" placeholder="Buscar curso..." aria-label="Buscar curso" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search" maxlength="60"><button type="button" class="bqk" aria-label="Borrar búsqueda">×</button></div></div>`+(k?"":`<div class="sno" hidden role="status">No se encontraron cursos.</div>`)}
function bqD(root,raw,msg){
 const q=bqN(raw),t=q.split(" ").filter(Boolean),pick=root.id==="plist";let tot=0;
 const lab=b=>{const x=b.dataset.c;return x?bqN((C[x].pre??"Nivelación en ")+C[x].n):bqN(b.textContent)};
 const nom=b=>{const x=b.dataset.c;return x?bqN(C[x].n):bqN(b.textContent)};
 root.querySelectorAll("button[data-c],button[data-fi]").forEach((b,i)=>{
  if(b.dataset.o==null)b.dataset.o=i;
  let s=0;if(q){s=bqS(nom(b),q,t);if(s<0){s=bqS(lab(b),q,t);if(s>=0)s+=5}}
  b._s=s});
 const gs=pick?[...root.querySelectorAll(".pg")].map(h=>({h,box:h.querySelector(".pl"),bs:[...h.querySelectorAll(".pl button")]}))
  :[...root.querySelectorAll(".gh")].map(h=>{const bs=[];let n=h.nextElementSibling;while(n&&!n.classList.contains("gh")){if(n.matches("button"))bs.push(n);n=n.nextElementSibling}return{h,bs}});
 gs.forEach(g=>{
  const o=g.bs.slice().sort((a,b)=>(a._s<0?99:a._s)-(b._s<0?99:b._s)||a.dataset.o-b.dataset.o);
  if(pick)o.forEach(b=>g.box.append(b));else{let r=g.h;o.forEach(b=>{r.after(b);r=b})}
  let c=0;g.bs.forEach(b=>{const ok=b._s>=0;b.classList.toggle("bqh",!ok);if(ok)c++});
  g.h.classList.toggle("bqh",!c);tot+=c;
  if(pick){const n=g.h.querySelector(".gt i");if(n)n.textContent=c}});
 if(msg)msg.hidden=!(q&&!tot);
 if(!pick)root.scrollTop=0}
/* Transición suave: lo que queda se desliza a su nuevo lugar, lo nuevo aparece con fundido y el desplegable cambia de altura poco a poco */
function bqA(root,raw,msg){
 const pick=root.id==="plist",rm=RMQ().matches;
 if(rm){bqD(root,raw,msg);return}
 const els=()=>[...root.querySelectorAll(pick?".gt,button":".gh,button[data-c],button[data-fi],.sno,.caddw")].concat(pick?[...document.querySelectorAll("#addb,#bqpn")]:[]);
 const was=new Map(),h0=pick?0:root.offsetHeight;
 els().forEach(e=>{if(e.offsetParent!==null)was.set(e,e.getBoundingClientRect())});
 bqD(root,raw,msg);
 const all=els();all.forEach(e=>{e.style.transition="none";e.style.transform="";e.style.opacity=""});
 const mv=[];
 all.forEach(e=>{if(e.offsetParent===null)return;const o=was.get(e),n=e.getBoundingClientRect();
  if(o){const dx=o.left-n.left,dy=o.top-n.top;if(Math.abs(dx)+Math.abs(dy)>1)mv.push([e,"translate("+dx+"px,"+dy+"px)",0])}
  else mv.push([e,"translateY(10px)",1])});
 mv.forEach(([e,t,f])=>{e.style.transform=t;if(f)e.style.opacity="0"});
 const h1=pick?0:root.offsetHeight,gh=!pick&&h0&&h1&&h0!==h1;
 if(gh){root.style.height=h0+"px";root.style.overflow="hidden"}
 void root.offsetWidth;
 const T="transform .3s cubic-bezier(.2,.7,.2,1),opacity .3s ease";
 mv.forEach(([e])=>{e.style.transition=T;e.style.transform="";e.style.opacity=""});
 if(gh){root.style.transition="height .3s cubic-bezier(.2,.7,.2,1)";root.style.height=h1+"px"}
 clearTimeout(root._bt);
 root._bt=setTimeout(()=>{all.forEach(e=>{e.style.transition="";e.style.transform="";e.style.opacity=""});root.style.transition="";root.style.height="";root.style.overflow=""},340)}
function bqU(i){
 anim("buscador_lista");
 const pick=i.id==="bqp",root=pick?$("plist"):i.closest("#clist");if(!root)return;
 i.parentNode.querySelector(".bqk").classList.toggle("bqv",!!i.value);
 if(pick)root.classList.add("bqd");
 bqA(root,i.value,pick?$("bqpn"):root.querySelector(".sno"));bqTrack(i,pick)}
/* Cursos que faltan: si despues de dejar de escribir no hay resultados, se registra SOLO el texto buscado (en minusculas y sin tildes), una vez por texto.
   No se guarda si parece un correo o un numero largo. Sirve para ver en PostHog que cursos agregar primero. */
let bqT=0;const bqSeen=new Set();
function bqTrack(i,pick){clearTimeout(bqT);bqT=setTimeout(()=>{const q=bqN(i.value);if(q.length<3||q.length>40||/@|\d{5,}/.test(q)||bqSeen.has(q))return;
 const root=pick?$("plist"):i.closest("#clist");if(!root)return;const msg=pick?$("bqpn"):root.querySelector(".sno");
 if(msg&&!msg.hidden){bqSeen.add(q);track("busqueda_sin_resultados",{texto:q,origen:pick?"elegir_curso":"lista_curso",curso_actual:cur||""})}},1500)}
$("plist").insertAdjacentHTML("beforebegin",BQ(1));
$("plist").insertAdjacentHTML("afterend",`<p class="sno" id="bqpn" hidden role="status">No se encontraron cursos.</p>`);
document.addEventListener("input",e=>{const i=e.target.closest&&e.target.closest(".bqi");if(i)bqU(i)});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("bqi")){e.preventDefault();e.target.blur()}});
document.addEventListener("click",e=>{
 const k=e.target.closest(".bqk");
 if(k){const i=k.parentNode.querySelector(".bqi");i.value="";bqU(i);i.focus();return}
 if(e.target.closest("#plist button[data-p]")){const i=$("bqp");if(i&&i.value){i.value="";bqU(i)}}});
$("cbtn").addEventListener("click",()=>setTimeout(()=>{const l=$("clist");if(!l.hidden&&matchMedia("(pointer:fine)").matches){const i=l.querySelector(".bqi");if(i)i.focus({preventScroll:true})}},0));

/* ===== Agrega tu curso (envío de archivos a /api/subir-curso) =====
   Solo se aceptan PDF, Word (.docx), PNG y JPG: máximo 3 archivos y 3 MB en total. Aquí se revisa extensión, tipo y los primeros
   bytes del archivo (para que un .exe renombrado a .pdf no pase). Eso es solo comodidad: la revisión real se repite en el servidor
   (api/subir-curso.js), que además es quien envía los archivos por correo. Los archivos nunca se publican en la web. */
{const f=$("upf"),ok=$("upok"),E=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])),inp=$("upi"),dz=$("upd"),ul=$("upl2"),st=$("ups"),sb=$("upb"),cu=$("upc"),LK="mp-up",MAXF=3,MAXT=3*1024*1024,MIN_MS=3000,MAXDAY=3;
 const EXT={pdf:{m:["application/pdf"],s:[[0x25,0x50,0x44,0x46]]},docx:{m:["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],s:[[0x50,0x4B,0x03,0x04]]},
  png:{m:["image/png"],s:[[0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]]},jpg:{m:["image/jpeg"],s:[[0xFF,0xD8,0xFF]]},jpeg:{m:["image/jpeg"],s:[[0xFF,0xD8,0xFF]]}};
 let files=[],busy=false,t0=0;
 const say=(t,k)=>{st.textContent=t;st.className="ups"+(k?" "+k:"")};
 const ext=n=>{const m=/\.([a-z0-9]+)$/i.exec(n||"");return m?m[1].toLowerCase():""};
 const sz=b=>b<1048576?Math.max(1,Math.round(b/1024))+" KB":(b/1048576).toFixed(1)+" MB";
 const total=()=>files.reduce((a,x)=>a+x.size,0);
 const hist=()=>{try{const a=JSON.parse(localStorage.getItem(LK)||"[]");return Array.isArray(a)?a.filter(x=>typeof x==="number"&&Date.now()-x<864e5):[]}catch(_){return[]}};
 const addH=()=>{try{const a=hist();a.push(Date.now());localStorage.setItem(LK,JSON.stringify(a))}catch(_){}};
 const sigOk=async file=>{const e=ext(file.name),d=EXT[e];if(!d)return false;
  try{const u=new Uint8Array(await file.slice(0,8).arrayBuffer());return d.s.some(s=>s.every((v,i)=>u[i]===v))}catch(_){return false}};
 const render=()=>{ul.innerHTML=files.map((x,i)=>`<li data-t="${E(ext(x.name))}"><span class="fx">${E(ext(x.name).toUpperCase())}</span><span class="fi"><span class="fn">${E(x.name)}</span><span class="fs">${sz(x.size)}</span></span><button type="button" data-rm="${i}" aria-label="Quitar ${E(x.name)}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join("");
  dz.classList.toggle("off",files.length>=MAXF);const t=total(),p=Math.min(100,t/MAXT*100);
  $("upbar").style.width=p+"%";$("upbar").classList.toggle("hi",p>85);$("upc2").textContent=files.length+" / "+MAXF;$("upmt").textContent=(t?sz(t):"0 KB")+" de 3 MB"};
 const add=async list=>{say("");if(!t0)t0=Date.now();
  for(const file of list){
   if(files.length>=MAXF){say("Máximo "+MAXF+" archivos.","bad");break}
   const e=ext(file.name);
   if(!EXT[e]){say("«"+file.name+"» no se puede subir. Solo PDF, Word (.docx), PNG o JPG.","bad");continue}
   if(file.type&&!EXT[e].m.includes(file.type)){say("«"+file.name+"» no parece ser un archivo "+e.toUpperCase()+" válido.","bad");continue}
   if(!file.size){say("«"+file.name+"» está vacío.","bad");continue}
   if(total()+file.size>MAXT){say("Los archivos juntos no pueden pasar de 3 MB.","bad");continue}
   if(!(await sigOk(file))){say("«"+file.name+"» no parece ser un archivo "+e.toUpperCase()+" válido.","bad");continue}
   if(files.some(x=>x.name===file.name&&x.size===file.size)){say("«"+file.name+"» ya está en la lista.","bad");continue}
   files.push(file)}
  render()};
 const b64=file=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]||"");r.onerror=()=>no(r.error);r.readAsDataURL(file)});
 inp.addEventListener("change",()=>{add([...inp.files]);inp.value=""});
 ["dragenter","dragover"].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.add("dg");anim("subir_zona_arrastre")}));
 ["dragleave","drop"].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.remove("dg")}));
 dz.addEventListener("drop",e=>{if(e.dataTransfer&&e.dataTransfer.files)add([...e.dataTransfer.files])});
 ul.addEventListener("click",e=>{const b=e.target.closest("button[data-rm]");if(!b)return;files.splice(+b.dataset.rm,1);say("");render()});
 cu.addEventListener("focus",()=>{if(!t0)t0=Date.now()});
 $("upagain").addEventListener("click",()=>{ok.hidden=true;f.hidden=false;say("");t0=0;cu.focus()});
 $("upgo").addEventListener("click",()=>{ok.hidden=true;f.hidden=false;leaveUp()});
 f.addEventListener("submit",async e=>{e.preventDefault();if(busy)return;
  const curso=cu.value.trim().replace(/\s+/g," "),msg=$("upm").value.trim(),mail=$("upe").value.trim();
  if($("upg").value){files=[];render();f.hidden=true;ok.hidden=false;return}
  if(curso.length<3){say("Escribe el nombre del curso.","bad");cu.focus();return}
  if(/(https?:\/\/|www\.)/i.test(curso+" "+msg)){say("Por seguridad no se permiten enlaces.","bad");return}
  if(mail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){say("Revisa tu correo: parece que no está bien escrito.","bad");$("upe").focus();return}
  if(!files.length){say("Adjunta al menos un archivo (sílabo o reglamento del curso).","bad");return}
  if(!t0||Date.now()-t0<MIN_MS){say("Un momento, revisa los datos e inténtalo otra vez.","bad");return}
  if(hist().length>=MAXDAY){say("Ya enviaste varios cursos hoy. ¡Gracias! Puedes enviar más mañana.","bad");return}
  busy=true;sb.disabled=true;sb.textContent="Enviando…";say("");
  try{const archivos=[];for(const x of files)archivos.push({nombre:x.name,tipo:x.type,b64:await b64(x)});
   const r=await fetch("/api/subir-curso",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({curso,mensaje:msg,email:mail,_gotcha:$("upg").value,seg:Math.round((Date.now()-t0)/1000),archivos}),signal:window.AbortSignal&&AbortSignal.timeout?AbortSignal.timeout(45000):undefined});
   let j=null;try{j=await r.json()}catch(_){}
   if(r.ok&&j&&j.ok){addH();files=[];render();f.reset();t0=0;say("");f.hidden=true;ok.hidden=false;window.scrollTo({top:0,behavior:"smooth"});track("curso_enviado",{archivos:archivos.length})}
   else{let c=j&&j.error;if(c&&typeof c==="object")c="firewall";c=String(c||"");
    const M={invalido:"Revisa los datos: falta el nombre del curso o algún dato no es válido.",archivos:"Revisa los archivos: máximo 3 y 3 MB en total.",tipo:"Alguno de los archivos no es un PDF, Word (.docx), PNG o JPG válido.",
     tamano:"Los archivos juntos pasan de 3 MB.",enlace:"Por seguridad no se permiten enlaces.",espera:"Espera unos segundos antes de enviar otro curso.",limite_dia:"Ya enviaste varios cursos hoy. Inténtalo mañana, ¡gracias!",
     cupo:"Hoy ya recibimos muchos envíos. Inténtalo mañana, ¡gracias!",servidor:"El envío no está disponible por ahora. Inténtalo más tarde."};
    say(M[c]||(r.status===413?M.tamano:r.status===429?"Hay muchos envíos en este momento. Inténtalo en unos minutos.":"No se pudo enviar. Inténtalo otra vez."),"bad");track("curso_error",{estado:r.status,motivo:c})}}
  catch(_){say("No se pudo enviar. Revisa tu conexión e inténtalo otra vez.","bad");track("curso_error",{estado:"red"})}
  busy=false;sb.disabled=false;sb.textContent="Enviar curso"})}

/* ===== Factor de inscripción ===== */
/* false: el promedio NO se redondea antes de multiplicar por 10 (143.33). true: se redondea a 2 decimales primero (143.3) */
const FI_REDONDEA_PROMEDIO=false;
const FS={first:null,car:"",rows:[],ca:"",bon:{}};
let fiUid=0,fiSumIn=false,fiFaqIn=false,FI_LIST=[];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const unp=s=>s.split(";").map(x=>{const a=x.split("|");return[a[0],+a[1],a[2],+a[3],+a[4]]}); /* [nombre, créditos, código, horas T, horas P] */
function fchk(){const m=$("fimini"),on=view==="fi"&&FS.first!==null&&!fiSumIn&&!fiFaqIn;if(m&&on&&!fiMiniAn&&!m.classList.contains("on")){fiMiniAn=true;anim("mini_resumen_fi_aparece")}if(m)m.classList.toggle("on",on);chk()}
function fiCarOpts(){const k=Object.keys(PLN).sort((a,b)=>PLN[a].n.localeCompare(PLN[b].n,"es"));
 $("fi-car").innerHTML='<option value="">Elige tu carrera…</option>'+k.map(x=>`<option value="${x}">${esc(PLN[x].n)}</option>`).join("")}
function fiAddOpts(){
 const g=[{l:"Nivelación",it:FI_NV}],p=PLN[FS.car];
 if(p){p.c.forEach(([r,s])=>g.push({l:"Ciclo "+r,it:unp(s)}));(p.x||[]).forEach(([l,s])=>g.push({l,it:unp(s)}))}
 g.push({l:"Cursos de bloque (4 créditos)",it:FI_BL});
 FI_LIST=[];let h='<option value="">Elige un curso…</option>';
 g.forEach(gr=>{h+=`<optgroup label="${esc(gr.l)}">`;gr.it.forEach(it=>{h+=`<option value="${FI_LIST.length}">${esc(it[0])} (${it[1]} cr.)</option>`;FI_LIST.push(it)});h+="</optgroup>"});
 $("fi-add").innerHTML=h+'<option value="x">Otro curso (escribir nombre y créditos)</option>'}
const fiRow=r=>`<div class="frow" data-u="${r.u}" data-cod="${esc(r.code||"")}" data-t="${esc(r.t??"")}" data-p="${esc(r.p??"")}"><div class="fnm">${r.c?`<input class="fin tx" data-f="name" type="text" maxlength="70" placeholder="Nombre del curso" aria-label="Nombre del curso" value="${esc(r.name)}">`:esc(r.name)}</div>`+
 `<label class="flb fcr"><small>Créditos</small><input class="fin" data-f="cr" type="number" inputmode="numeric" min="1" max="12" step="1" placeholder="Créd." aria-label="Créditos de ${esc(r.name||"curso")}" value="${esc(r.cr)}"></label>`+
 `<label class="flb fnt"><small>Nota</small><input class="fin" data-f="n" type="number" inputmode="decimal" min="0" max="20" step="any" placeholder="Nota" aria-label="Nota de ${esc(r.name||"curso")}" value="${esc(r.n)}"></label>`+
 `<div class="fnc"><small>N × C</small><b>—</b></div><button type="button" class="fdel" data-del="${r.u}" aria-label="Quitar ${esc(r.name||"curso")}">✕</button></div>`;
function fiRows(){$("fi-rows").innerHTML=FS.rows.map(fiRow).join("");$("fi-empty").hidden=FS.rows.length>0;$("fhd").hidden=!FS.rows.length}
function fiBonUi(){$("fi-bon").innerHTML=FI_BON.map(b=>`<label class="fbon${FS.bon[b.id]?" on":""}"><input type="checkbox" data-b="${b.id}"${FS.bon[b.id]?" checked":""}><span class="fbt">${b.n}${b.d?`<em>${b.d}</em>`:""}</span><span class="fpt">+${b.p}</span></label>`).join("")}
function fiMode(){
 const f=FS.first;
 document.querySelectorAll("[data-first]").forEach(b=>b.setAttribute("aria-checked",String(f!==null&&(b.dataset.first==="1")===f)));
 $("fi-main").hidden=f===null;
 $("ffor").textContent=f?"FI = (promedio del semestre × 10) + créditos matriculados + bonificaciones":"FI = (promedio del último semestre × 10) + créditos académicos acumulados + bonificaciones";
 $("fi-cr-first").hidden=f!==true;$("fi-cr-next").hidden=f!==false;
 $("fi-h-cr").textContent=f?"Créditos matriculados":"Créditos acumulados";
 $("flg-cr").textContent=f?"Créditos matriculados":"Créditos acumulados";
 $("fb-cl").textContent=f?"Créditos matriculados":"Créditos acumulados";
 fiUpdate();fchk()}
function fiUpdate(){
 const R=FS.rows,first=FS.first===true;
 const bad=(r,k)=>{const v=r[k];if(v===""||v==null)return false;const x=+v;return !isFinite(x)||(k==="n"?(x<0||x>20):(x<=0||x>12))};
 let sc=0,sn=0,nok=0,miss=0,inv=0;
 R.forEach(r=>{
  const bn=bad(r,"n"),bc=bad(r,"cr"),ok=r.n!==""&&r.cr!==""&&!bn&&!bc;
  if(bn||bc)inv++;else if(!ok)miss++;
  if(ok){sc+=+r.cr;sn+=(+r.cr)*(+r.n);nok++}
  const el=document.querySelector('.frow[data-u="'+r.u+'"]');
  if(el){el.querySelector('[data-f="n"]').classList.toggle("bad",bn);el.querySelector('[data-f="cr"]').classList.toggle("bad",bc);el.querySelector(".fnc b").textContent=ok?fmt((+r.cr)*(+r.n)):"—"}
 });
 const avg=sc>0?sn/sc:null,avgU=avg===null?null:(FI_REDONDEA_PROMEDIO?Math.round(avg*100)/100:avg),base=avgU===null?null:avgU*10;
 const caOk=FS.ca!==""&&isFinite(+FS.ca)&&+FS.ca>=0,cred=first?(sc>0?sc:null):(caOk?+FS.ca:null);
 const bon=FI_BON.reduce((a,b)=>a+(FS.bon[b.id]?b.p:0),0);
 const fi=(base!==null&&cred!==null)?base+cred+bon:null,t=fi===null?"—":fmt(fi);
 $("fi-crv").textContent=sc;
 $("fi-tot").innerHTML=R.length?`<span>${nok} de ${R.length} ${R.length===1?"curso con nota":"cursos con nota"}</span><span>${sc} créditos · N × C: ${fmt(sn)}</span>`:"";
 $("fi-tot").hidden=!R.length;
 $("fi-bons").textContent=bon?"Bonificaciones: +"+bon+" puntos":"Aún no marcaste bonificaciones";
 $("fb-sc").textContent=nok?String(sc):"—";$("fb-sn").textContent=nok?fmt(sn):"—";
 $("fb-avg").textContent=avg===null?"—":avg.toFixed(2);
 $("fb-base").textContent=base===null?"—":fmt(base);
 $("fb-cr").textContent=cred===null?"—":"+ "+fmt(cred);
 $("fb-bon").textContent="+ "+fmt(bon);
 $("fb-fi").textContent=t;
 setNum($("fibig"),t);$("fibig").className=fi===null?"na":"";
 setNum($("fmbig"),t);$("fmbig").className=fi===null?"na":"";
 const vals=[base||0,cred||0,bon],tot=vals.reduce((a,b)=>a+b,0);
 document.querySelectorAll("#fbar span").forEach((s,i)=>{s.style.flexGrow=tot?(vals[i]>0?Math.max(vals[i],tot*.06):0):1;s.textContent=vals[i]>0?fmt(vals[i]):""});
 let m="",bd=false;
 if(!R.length)m="Agrega los cursos que llevaste este semestre para calcular tu promedio.";
 else if(inv){m="Revisa los campos en rojo: la nota va de 0 a 20 y los créditos deben ser mayores que 0.";bd=true}
 else if(!nok)m="Escribe la nota y los créditos de tus cursos para calcular el promedio.";
 else if(miss)m="Faltan datos en "+miss+(miss===1?" curso":" cursos")+": todavía no entra"+(miss===1?"":"n")+" al cálculo.";
 else if(!first&&!caOk)m="Escribe tus créditos acumulados para ver tu FI.";
 $("fimsg").hidden=!m;$("fimsg").textContent=m;$("fimsg").classList.toggle("bad",bd);
 fchk()}
function fiAddRow(r){FS.rows.push(Object.assign({u:++fiUid,name:"",cr:"",n:"",c:false,code:"",t:"",p:""},r));fiRows();fiUpdate();
 const q=FS.rows[FS.rows.length-1].c?'[data-f="name"]':'[data-f="n"]',el=document.querySelector('.frow[data-u="'+fiUid+'"] '+q);if(el)el.focus()}
function fiReset(){FS.first=null;FS.car="";FS.rows=[];FS.ca="";FS.bon={};$("fi-car").value="";$("fi-ca").value="";fiAddOpts();fiRows();fiBonUi();fiMode();window.scrollTo({top:0,behavior:"smooth"})}
function fiExample(){
 FS.first=false;FS.car="eco";FS.ca="32";FS.bon={enc:true};
 FS.rows=[["Lenguaje II",4,15],["Estadística I",4,12],["Economía General I",5,14],["Matemáticas II",5,16]].map(([name,cr,n])=>({u:++fiUid,name,cr:String(cr),n:String(n),c:false}));
 $("fi-car").value="eco";$("fi-ca").value="32";fiAddOpts();fiRows();fiBonUi();fiMode();
 $("fisum").scrollIntoView({behavior:"smooth",block:"center"})}
fiCarOpts();fiAddOpts();fiRows();fiBonUi();fiMode();
{const V=$("v-fi");
 V.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.first!==undefined){FS.first=b.dataset.first==="1";fiMode()}
  else if(b.dataset.del){FS.rows=FS.rows.filter(r=>r.u!==+b.dataset.del);fiRows();fiUpdate()}
  else if(b.id==="fiex")fiExample();
  else if(b.id==="firs")fiReset();
  else if(b.id==="home2"){closeList();showView("welcome")}
  else if(b.dataset.pick)showView("pick")});
 V.addEventListener("input",e=>{const t=e.target,row=t.closest(".frow");
  if(row&&t.dataset.f){const r=FS.rows.find(x=>x.u===+row.dataset.u);if(!r)return;
   if(t.dataset.f==="name"){r.name=t.value;return}
   r[t.dataset.f]=t.value;fiUpdate()}
  else if(t.id==="fi-ca"){FS.ca=t.value;fiUpdate()}});
 V.addEventListener("change",e=>{const t=e.target;
  if(t.id==="fi-car"){FS.car=t.value;fiAddOpts()}
  else if(t.id==="fi-add"){const v=t.value;t.value="";if(v==="")return;
   if(v==="x")fiAddRow({c:true});else{const c=FI_LIST[+v];if(c)fiAddRow({name:c[0],cr:String(c[1]),code:c[2],t:c[3],p:c[4]})}}
  else if(t.dataset.b){FS.bon[t.dataset.b]=t.checked;t.closest(".fbon").classList.toggle("on",t.checked);fiUpdate()}})}
new IntersectionObserver(es=>es.forEach(e=>{if(e.target.id==="fisum")fiSumIn=e.isIntersecting;else fiFaqIn=e.isIntersecting;fchk()})).observe($("fisum"));
new IntersectionObserver(es=>es.forEach(e=>{fiFaqIn=e.isIntersecting;faqNear=e.isIntersecting;chk();fchk()}),{rootMargin:"0px 0px 170px 0px"}).observe($("fifaq"));
if(FI_ACTIVO){const t=document.querySelector("#v-pick .t2");if(t)t.textContent="cálculo"}

/* ===== Valoracion "¿Te ayudo a planificar tus notas?" =====
   Aparece cuando ya hay al menos una nota. Un voto por curso y por navegador (clave mp-fb). Eventos: valoracion_vista (una vez por curso),
   resultado_util {valor: si|no} y resultado_util_comentar (el "No mucho" lleva al cuadro de comentarios). Nunca se envian las notas. */
const FB_KEY="mp-fb",seenFbView=new Set();
const fbGet=()=>{try{const o=JSON.parse(localStorage.getItem(FB_KEY)||"{}");return o&&typeof o==="object"?o:{}}catch(_){return{}}};
const fbSet=(k,v)=>{try{const o=fbGet();o[k]=v;localStorage.setItem(FB_KEY,JSON.stringify(o))}catch(_){}};
function fbPaint(v){const b=$("mpv");if(!b)return;b.classList.toggle("done",!!v);
 if(v){$("mpvm").textContent=v==="si"?"¡Gracias! Nos alegra que te haya servido.":"Gracias por decirlo. Cuéntanos qué faltó para mejorarlo.";$("mpvl").hidden=v!=="no"}}
function fbSync(){try{const b=$("mpv");if(!b||!S)return;const has=leaves(S.root).length>pend().length;b.hidden=!has;if(has)fbPaint(fbGet()[cur])}catch(_){}}
document.addEventListener("click",e=>{const t=e.target;if(!t||!t.closest)return;
 const v=t.closest(".mpvbtn");
 if(v){if(!S||fbGet()[cur])return;const val=v.dataset.v==="si"?"si":"no",L=leaves(S.root),n=pend().length;
  fbSet(cur,val);fbPaint(val);anim("valoracion_gracias");
  track("resultado_util",{curso:cur,nombre:cname(cur),valor:val,ingresadas:L.length-n,total:L.length,completo:n===0,estado:outlook().k});return}
 if(t.closest("#mpvl")){track("resultado_util_comentar",{curso:cur});const m=$("sgm");
  if(m){m.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>{try{m.focus({preventScroll:true})}catch(_){}},500)}}});
if("IntersectionObserver" in window){const b=$("mpv");
 if(b)new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting&&!b.hidden&&S&&!seenFbView.has(cur)){seenFbView.add(cur);if(!fbGet()[cur])track("valoracion_vista",{curso:cur})}}),{threshold:.6}).observe(b)}

/* Si hay notas guardadas, se vuelve directo al curso donde estaba el alumno */
const back=load();
if(back)track("progreso_restaurado",{curso:back});
setCourse(back||"mat");
showView(back?"tool":"welcome");
