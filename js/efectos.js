/* My PonderUP - efectos: nota fuera de rango, tarjetas de "Elige tu curso", campo de numeros del pie y cursor propio de la bienvenida */
/* ---- bloque 1 ---- */
try{
/* Nota fuera de rango: mensaje, temblor (se reinicia en cada intento) y vibración corta en celulares que la soportan */
window.badFx=function(gi,t,mx){anim(gi&&gi.classList&&gi.classList.contains("minl")?"nota_minima_temblor":"nota_temblor");var v=parseFloat(String(t.value).replace(",","."));gi.setAttribute("data-msg",v<0?"Mínimo 0":"Máximo "+mx);gi.classList.remove("sk");void gi.offsetWidth;gi.classList.add("sk");clearTimeout(gi._sk);gi._sk=setTimeout(function(){gi.classList.remove("sk")},460);try{if(navigator.vibrate)navigator.vibrate(22)}catch(_){}};
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}

/* ---- bloque 2 ---- */
try{
/* "Elige tu curso": cada tarjeta se oscurece (clase .is-hov) y su brillo sigue al cursor. Solo con mouse y solo si el mouse se mueve de verdad: al tocar Empezar el cursor puede quedar quieto encima de una tarjeta y antes eso la encendia sola. La lista se vuelve a dibujar, por eso se escucha en #plist */
(function(){var pl=document.getElementById("plist");if(!pl)return;var on=null;
function off(){if(on){on.classList.remove("is-hov");on=null}}
pl.addEventListener("pointermove",function(e){if(e.pointerType!=="mouse")return;if(e.movementX===0&&e.movementY===0)return;if(on&&!pl.contains(on))on=null;var b=e.target.closest&&e.target.closest(".pl button");if(!b||b.disabled){off();return}if(on!==b){off();b.classList.add("is-hov");on=b;try{anim("tarjeta_elegir_curso")}catch(_){}}var r=b.getBoundingClientRect();b.style.setProperty("--mx",(e.clientX-r.left)+"px");b.style.setProperty("--my",(e.clientY-r.top)+"px")},{passive:true});
pl.addEventListener("pointerout",function(e){if(e.pointerType==="touch")return;var b=e.target.closest&&e.target.closest(".pl button");if(b&&!b.contains(e.relatedTarget)){/* la posicion del brillo (--mx/--my) se conserva: asi se desvanece donde estaba el cursor en vez de saltar a su lugar inicial */if(on===b)off()}});
/* Celular: el efecto se enciende en el mismo instante en que el dedo toca la tarjeta y SIGUE al dedo mientras se hace scroll (los eventos touch siguen llegando durante el desplazamiento; los pointer se cancelan al empezar a desplazar). Ademas, mientras el dedo esta abajo y la lista se mueve, se vuelve a buscar la tarjeta que queda bajo el dedo. Se apaga un momento despues de soltar. */
var tOff=0,tx=0,ty=0,tDown=false,tRaf=0;
function tEnd(){clearTimeout(tOff);tOff=setTimeout(function(){off()},650)}
function tAt(){tRaf=0;if(!tDown)return;var el=document.elementFromPoint(tx,ty),b=el&&el.closest&&el.closest(".pl button");
 if(!b||b.disabled||!pl.contains(b)){return}
 var r=b.getBoundingClientRect();b.style.setProperty("--mx",(tx-r.left)+"px");b.style.setProperty("--my",(ty-r.top)+"px");
 if(on!==b){off();b.classList.add("is-hov");on=b;try{anim("tarjeta_elegir_curso",{via:"toque"})}catch(_){}}}
function tKick(){if(!tRaf)tRaf=requestAnimationFrame(tAt)}
pl.addEventListener("touchstart",function(e){var t=e.touches[0];if(!t)return;clearTimeout(tOff);tDown=true;tx=t.clientX;ty=t.clientY;tAt()},{passive:true});
pl.addEventListener("touchmove",function(e){var t=e.touches[0];if(!t)return;tx=t.clientX;ty=t.clientY;tKick()},{passive:true});
window.addEventListener("scroll",function(){if(tDown)tKick()},{passive:true});
var tStop=function(){tDown=false;tEnd()};
pl.addEventListener("touchend",tStop,{passive:true});pl.addEventListener("touchcancel",tStop,{passive:true});
})();
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}

/* ---- bloque 3 ---- */
try{
/* Pie de pagina: campo de notas. Es la escala de la pagina hecha fondo: una cuadricula de numeros del 0 al 20 muy tenues. El fondo del pie queda limpio. Solo cuando el cursor (o el dedo) pasa por una zona aparecen ahi numeros del 0 al 20: cuentan hacia arriba hasta 20 y se encienden en un blanco tenue, apenas mas grandes mientras estas cerca; al alejarte se apagan y vuelven a su valor. Un clic o toque lanza una ola de 20 que cruza el pie. Sin colores: blanco sobre el azul del pie. Sin "reducir movimiento" no aparece. El dibujo solo corre mientras hay cursor o dedo en el pie, o numeros volviendo a su sitio. */
(function(){
 if(!window.matchMedia||RMQ().matches)return;
 var R=190,TOP=20,WAVE_MS=1200,FONT=' Montserrat,"Montserrat Fallback",Arial,sans-serif';
 var rnd=function(i){var t=Math.sin(i*127.1+311.7)*43758.5453;return t-Math.floor(t)};
 var note=function(n){try{if(typeof anim==="function")anim(n)}catch(_){}};
 document.querySelectorAll("footer").forEach(function(ft){
  var cv=document.createElement("canvas"),cx=cv.getContext&&cv.getContext("2d");
  if(!cx)return;
  cv.className="fl-nt";cv.setAttribute("aria-hidden","true");ft.insertBefore(cv,ft.firstChild);
  var W=0,H=0,GAP=42,cols=0,rows=0,B=null,V=null,mx=0,my=0,inside=false,entered=false,raf=0,waves=[];
  function paint(now){
   if(!W||!B)return false;
   cx.clearRect(0,0,W,H);
   waves=waves.filter(function(v){return now-v.t<WAVE_MS});
   cx.textAlign="center";cx.textBaseline="middle";cx.font="600 12px"+FONT;
   var act=[],i,j,k,x,y,dx,dy,d,f,g,w,wi,v,busy=false,tgt;
   for(j=0;j<rows;j++)for(i=0;i<cols;i++){
    k=j*cols+i;x=i*GAP+((j&1)?GAP/2:0);y=j*GAP+GAP/2;
    f=0;
    if(inside){dx=mx-x;dy=my-y;d=Math.sqrt(dx*dx+dy*dy);if(d<R)f=Math.pow(1-d/R,1.4)}
    w=0;
    for(wi=0;wi<waves.length;wi++){v=waves[wi];dx=x-v.x;dy=y-v.y;d=(Math.sqrt(dx*dx+dy*dy)-(now-v.t)*.8)/60;w=Math.max(w,Math.exp(-d*d)*(1-(now-v.t)/WAVE_MS))}
    g=Math.max(f,w);
    tgt=B[k]+(TOP-B[k])*g;
    V[k]+=(tgt-V[k])*.2;
    if(g>.01||Math.abs(V[k]-B[k])>.05){busy=true;act.push(x,y,V[k],B[k],w)}
    else{V[k]=B[k]}
   }
   for(i=0;i<act.length;i+=5){
    x=act[i];y=act[i+1];var val=act[i+2],b=act[i+3],ww=act[i+4],n=Math.round(val),e=Math.max(0,Math.min(1,(val-b)/(TOP-b))),m=ww>.05?Math.min(1,ww*1.5):0;
    /* blanco, cada vez mas opaco */
    cx.fillStyle="rgba(255,255,255,"+Math.min(.34,.45*e+.1*m).toFixed(3)+")";
    cx.font="600 "+(12+Math.round(2*e))+"px"+FONT;
    cx.fillText(n,x,y)
   }
   return busy||waves.length>0
  }
  function frame(t){raf=0;if(paint(t)||inside)raf=requestAnimationFrame(frame)}
  function kick(){if(!raf)raf=requestAnimationFrame(frame)}
  function size(){
   var r=ft.getBoundingClientRect();if(!r.width||!r.height)return;
   var dpr=Math.min(2,window.devicePixelRatio||1),k;
   W=r.width;H=r.height;GAP=W<640?46:42;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cx.setTransform(dpr,0,0,dpr,0,0);
   cols=Math.ceil(W/GAP)+2;rows=Math.ceil(H/GAP)+1;
   B=new Uint8Array(cols*rows);V=new Float32Array(cols*rows);
   for(k=0;k<B.length;k++){B[k]=Math.floor(rnd(k)*11);V[k]=B[k]}
   paint(performance.now());cv.classList.add("on")}
  function at(cx0,cy0){var r=ft.getBoundingClientRect();mx=cx0-r.left;my=cy0-r.top}
  function enter(){inside=true;if(!entered){entered=true;note("pie_notas_cursor")}if(!W)size()}
  function wave(){waves.push({x:mx,y:my,t:performance.now()});if(waves.length>4)waves.shift();note("pie_notas_ola")}
  ft.addEventListener("pointermove",function(e){if(e.pointerType!=="mouse")return;at(e.clientX,e.clientY);enter();kick()},{passive:true});
  ft.addEventListener("pointerleave",function(e){if(e.pointerType!=="mouse")return;inside=false;entered=false;kick()});
  ft.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse"||e.button!==0)return;at(e.clientX,e.clientY);enter();wave();kick()});
  /* celular: el dedo hace de cursor; al soltar los numeros vuelven despacio */
  function touchAt(e){var t=e.touches&&e.touches[0];if(!t)return false;at(t.clientX,t.clientY);return true}
  ft.addEventListener("touchstart",function(e){if(!touchAt(e))return;clearTimeout(ft._te);enter();wave();kick()},{passive:true});
  ft.addEventListener("touchmove",function(e){if(!touchAt(e))return;enter();kick()},{passive:true});
  var end=function(){clearTimeout(ft._te);ft._te=setTimeout(function(){inside=false;entered=false;kick()},500)};
  ft.addEventListener("touchend",end,{passive:true});ft.addEventListener("touchcancel",end,{passive:true});
  if(window.ResizeObserver)new ResizeObserver(size).observe(ft);else{window.addEventListener("resize",size);size()}
 })
})();
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}

/* ---- bloque 4 ---- */
try{
/* ===== EFECTOS DE CURSOR =====
   Solo visual. Bienvenida: cursor propio (punto + aro), estrellitas al mover, explosion al hacer clic (tambien al tocar en celular),
   inclinacion 3D del logo hacia el cursor, foco de luz, boton Empezar "magnetico". Resto de pantallas: ondas en botones y brillo en tarjetas. */
(function(){
 const W=document.getElementById("v-welcome");if(!W||!window.matchMedia)return;
 const RM=RMQ(),FINE=matchMedia("(hover:hover) and (pointer:fine)").matches;
 const COL=["#00F03C","#0A5CFF","#F000F0","#ffffff"],rnd=(a,b)=>a+Math.random()*(b-a);
 const layer=document.createElement("div");layer.className="cx-layer";layer.setAttribute("aria-hidden","true");document.body.appendChild(layer);
 const spot=document.createElement("div");spot.className="wel-spot";spot.setAttribute("aria-hidden","true");W.insertBefore(spot,W.firstChild);
 const vis=()=>!W.hidden;
 const UP=document.getElementById("v-up"),cvis=()=>!W.hidden||(!!UP&&!UP.hidden);
 function part(x,y,o){
  if(RM.matches||layer.childElementCount>80)return;
  const p=document.createElement("i");p.className="cx-p"+(o.st?" st":"");
  p.style.cssText=`left:${x}px;top:${y}px;--s:${o.s}px;--c:${o.c};--dx:${o.dx}px;--dy:${o.dy}px;--r:${o.r}deg;--t:${o.t}s`;
  p.addEventListener("animationend",()=>p.remove());layer.appendChild(p)}
 function trail(x,y){anim("bienvenida_estrellitas");const c=COL[(Math.random()*4)|0];part(x,y,{st:Math.random()<.6,s:rnd(8,16),c,dx:rnd(-18,18),dy:rnd(10,34),r:rnd(-120,120),t:rnd(.6,1)})}
 function burst(x,y){
  if(RM.matches)return;anim("bienvenida_explosion");
  const r=document.createElement("i");r.className="cx-rip";r.style.cssText=`left:${x}px;top:${y}px;--c:${COL[(Math.random()*3)|0]}`;r.addEventListener("animationend",()=>r.remove());layer.appendChild(r);
  for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2+rnd(-.2,.2),d=rnd(40,100);
   part(x,y,{st:i%2===0,s:rnd(7,15),c:COL[i%4],dx:Math.cos(a)*d,dy:Math.sin(a)*d,r:rnd(-300,300),t:rnd(.6,.95)})}}
 document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("[data-up]"))window.scrollTo({top:0,behavior:RM.matches?"auto":"smooth"})});
 /* ondas en botones (todas las pantallas) */
 document.addEventListener("pointerdown",e=>{
  const b=e.target.closest&&e.target.closest(".btn,.rib");
  if(b&&!b.disabled&&!RM.matches){anim("boton_onda");const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement("span");
   s.className="cx-rpl";s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;
   s.addEventListener("animationend",()=>s.remove());b.appendChild(s)}
  if(vis())burst(e.clientX,e.clientY)},{passive:true});
 /* brillo que sigue al cursor en tarjetas */
 if(FINE)document.addEventListener("pointermove",e=>{
  const t=e.target.closest&&e.target.closest(".blk,.upst li,#sum");
  if(t){const r=t.getBoundingClientRect();t.style.setProperty("--gx",(e.clientX-r.left)+"px");t.style.setProperty("--gy",(e.clientY-r.top)+"px")}},{passive:true});
 /* ---- celular / pantalla tactil: el dedo inclina el logo igual que el mouse (al soltar vuelve suave al centro) ---- */
 {
  let px=0,py=0,ttx=0,tty=0,tx=0,ty=0,ls=1,tls=1,raf=0,down=false,lx=0,ly=0;
  const logo=W.querySelector(".lgw");
  const step=()=>{
   raf=0;if(!vis()||RM.matches)return;
   tx+=(ttx-tx)*.14;ty+=(tty-ty)*.14;ls+=(tls-ls)*.14;
   W.style.setProperty("--tx",tx.toFixed(4));W.style.setProperty("--ty",ty.toFixed(4));W.style.setProperty("--ls",ls.toFixed(4));
   if(Math.abs(tx-ttx)>.002||Math.abs(ty-tty)>.002||Math.abs(ls-tls)>.002)raf=requestAnimationFrame(step)};
  const upd=e=>{
   anim("bienvenida_inclinar_logo");W.style.setProperty("--mx",e.clientX+"px");W.style.setProperty("--my",e.clientY+"px");W.classList.add("tdown");
   px=e.clientX;py=e.clientY;ttx=(px/innerWidth-.5)*2;tty=(py/innerHeight-.5)*2;
   tls=1;if(logo){const r=logo.getBoundingClientRect();if(px>r.left&&px<r.right&&py>r.top&&py<r.bottom)tls=1.06}
   if(!raf)raf=requestAnimationFrame(step)};
  document.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch"||!vis())return;down=true;lx=e.clientX;ly=e.clientY;upd(e)},{passive:true});
  document.addEventListener("pointermove",e=>{
   if(e.pointerType!=="touch"||!down||!vis())return;upd(e);
   if(Math.hypot(e.clientX-lx,e.clientY-ly)>30){lx=e.clientX;ly=e.clientY;trail(e.clientX,e.clientY)}},{passive:true});
  const end=e=>{if(e.pointerType!=="touch"||!down)return;down=false;W.classList.remove("tdown");ttx=0;tty=0;tls=1;if(!raf)raf=requestAnimationFrame(step)};
  document.addEventListener("pointerup",end,{passive:true});document.addEventListener("pointercancel",end,{passive:true});
 }
 if(!FINE)return;
 /* ---- solo con mouse: cursor propio, inclinacion, foco, iman ---- */
 document.documentElement.classList.add("cx-fine");
 const dot=document.createElement("div"),ring=document.createElement("div");
 dot.className="cx-cur cx-dot";ring.className="cx-cur cx-ring";dot.setAttribute("aria-hidden","true");ring.setAttribute("aria-hidden","true");
 document.body.append(ring,dot);
 const go=document.getElementById("go"),logo=W.querySelector(".lgw");
 let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,tx=0,ty=0,ls=1,gx=0,gy=0,lx=mx,ly=my,raf=0,inside=false;
 function setOn(v){dot.classList.toggle("on",v);ring.classList.toggle("on",v)}
 function frame(){
  raf=0;
  if(!cvis()||RM.matches){setOn(false);return}
  const ttx=inside?(mx/innerWidth-.5)*2:0,tty=inside?(my/innerHeight-.5)*2:0;
  rx+=(mx-rx)*.2;ry+=(my-ry)*.2;tx+=(ttx-tx)*.08;ty+=(tty-ty)*.08;
  ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;
  let tls=1;if(inside&&logo){const r=logo.getBoundingClientRect();if(mx>r.left&&mx<r.right&&my>r.top&&my<r.bottom)tls=1.06}
  ls+=(tls-ls)*.12;
  let tgx=0,tgy=0;
  if(inside&&go){const r=go.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=mx-cx,dy=my-cy;
   if(Math.hypot(dx,dy)<Math.max(r.width,r.height)*.7){tgx=Math.max(-4,Math.min(4,dx*.07));tgy=Math.max(-3,Math.min(3,dy*.1))}}
  gx+=(tgx-gx)*.18;gy+=(tgy-gy)*.18;
  if(go)go.style.translate=(Math.abs(gx)+Math.abs(gy)>.05)?`${gx.toFixed(2)}px ${gy.toFixed(2)}px`:"";
  W.style.setProperty("--tx",tx.toFixed(4));W.style.setProperty("--ty",ty.toFixed(4));W.style.setProperty("--ls",ls.toFixed(4));
  const settled=Math.abs(rx-mx)<.3&&Math.abs(ry-my)<.3&&Math.abs(tx-ttx)<.002&&Math.abs(ty-tty)<.002&&Math.abs(ls-tls)<.002&&Math.abs(gx-tgx)<.05&&Math.abs(gy-tgy)<.05;
  if(!settled)raf=requestAnimationFrame(frame)}
 const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
 document.addEventListener("pointermove",e=>{
  if(e.pointerType==="touch")return;
  mx=e.clientX;my=e.clientY;
  if(!cvis()){setOn(false);return}
  if(!inside){inside=true;rx=mx;ry=my;lx=mx;ly=my}
  dot.style.transform=`translate3d(${mx}px,${my}px,0)`;
  const tf=!!(e.target.closest&&e.target.closest("#v-up input:not([type=file]),#v-up textarea"));setOn(!tf);if(vis())anim("bienvenida_inclinar_logo");
  W.style.setProperty("--mx",mx+"px");W.style.setProperty("--my",my+"px");
  const h=!!(e.target.closest&&e.target.closest("a,button,label.upd"));dot.classList.toggle("hov",h);ring.classList.toggle("hov",h);
  if(vis()&&Math.hypot(mx-lx,my-ly)>30){lx=mx;ly=my;trail(mx,my)}
  kick()},{passive:true});
 document.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch"&&cvis())ring.classList.add("dn")},{passive:true});
 document.addEventListener("pointerup",()=>ring.classList.remove("dn"),{passive:true});
 document.documentElement.addEventListener("pointerleave",()=>{inside=false;setOn(false);kick()});
 document.documentElement.addEventListener("pointerenter",()=>{inside=true;kick()});
 /* al cambiar de pantalla el cursor propio se apaga y la bienvenida vuelve a su posicion */
 new MutationObserver(()=>{if(!cvis()){setOn(false)}if(!vis()){if(go)go.style.translate=""}if(cvis())kick()}).observe(W,{attributes:true,attributeFilter:["hidden"]});
 if(UP)new MutationObserver(()=>{if(!cvis())setOn(false);else kick()}).observe(UP,{attributes:true,attributeFilter:["hidden"]});
})();
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}
