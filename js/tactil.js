/* My PonderUP - nota minima, version tactil de los hovers, fila resaltada de la tabla y bloques de notas en celular */
/* ---- bloque 5 ---- */
try{
/* Nota mínima: ya no deja escribir más de 20 (lo rechaza el manejador principal de notas, que muestra "Máximo 20" y vibra). Aquí solo queda el ajuste al salir del campo */
(function(){
 document.addEventListener("focusout",function(e){var t=e.target;if(!t||t.id!=="pm")return;
  var l=t.closest(".minl");if(!l||!l.classList.contains("bad"))return;
  t.value="20";setTimeout(function(){l.classList.remove("bad")},900)});
})();
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}

/* ---- bloque 6 ---- */
try{
/* ===== AL TOCAR (celular), FILA RESALTADA DE LA TABLA e INDICADORES DE ANIMACION =====
   1) Versiones tactiles de varios efectos de hover (franjas, "Bienvenido a", tarjetas, logo y titulos del pie): clase .tapfx unos instantes.
   2) Tabla de combinaciones: al tocar o hacer clic en una nota, esa fila queda resaltada; solo se quita al tocar o hacer clic FUERA de las celdas.
      Mover el dedo (scroll) o arrastrar el mouse NO la quita: solo cuenta un toque corto y casi sin movimiento (si el navegador cancela el gesto por scroll, no se hace nada).
   3) Indicadores: cada animacion de hover/toque manda el evento "animacion" (nombre + via) a PostHog con anim(). */
(function(){
 const RMq=window.matchMedia?RMQ():{matches:false};
 const flash=(el,ms)=>{el.classList.remove("tapfx");void el.offsetWidth;el.classList.add("tapfx");clearTimeout(el._tf);el._tf=setTimeout(()=>el.classList.remove("tapfx"),ms||700)};
 /* [selector, nombre en PostHog, tambien cuenta al tocar] (el primero que coincida) */
 const HV=[
  ["#v-welcome .wtop","bienvenida_titulo",1],["#v-welcome .strip","franja_bienvenida",1],[".hero .strip","franja_curso",1],
  ["#v-welcome #go","boton_empezar",0],[".btn","boton_principal_hover",0],["#v-welcome .igw","bienvenida_instagram",0],
  [".blk","tarjeta_nota_brillo",1],[".upst li","paso_agregar_curso",1],[".upd","subir_zona_icono",0],[".sc tbody td","tabla_resaltado",0],["#clist button[data-c]","menu_cursos_fila",0],
  [".qa summary","faq_resaltado",0],[".shb,.bkc,.addc,.fup,.shf","botones_barra",0],[".mpvbtn","valoracion_botones",0],[".rib","boton_compartir_resultado",0],[".tg","tema_interruptor_hover",0],
  [".logo","logo_encabezado",0],["footer .lg-f","pie_logo",1],["footer .fl a.ig","pie_instagram",0],["footer .fl.fcm","pie_comentarios",0],
  ["footer .fl button","pie_enlaces_curso",1],["footer .fl","pie_titulos",1],["#simt","simulador_resaltado",0],["#mk","barra_marcador_hover",0],["#cbtn","menu_cursos_boton",0]];
 const find=t=>{for(const h of HV){const el=t.closest(h[0]);if(el)return[h,el]}return null};
 document.addEventListener("pointerover",e=>{
  if(e.pointerType==="touch")return;const t=e.target;if(!t||!t.closest)return;
  const f=find(t);if(!f)return;if(e.relatedTarget&&f[1].contains(e.relatedTarget))return;
  anim(f[0][1],{via:"hover"})},{passive:true});
 let hlSel=null,down=null;
 function hlPaint(){const tb=document.querySelector("#cb .sc tbody");if(!tb)return;tb.querySelectorAll("tr.hl").forEach(x=>x.classList.remove("hl"));tb.querySelectorAll("td.hc").forEach(x=>x.classList.remove("hc"));
  if(!hlSel)return;const tr=tb.parentNode.rows[hlSel.r];if(!tr||tr.cells.length<=hlSel.c||tr.cells[hlSel.c].tagName!=="TD")return;tr.classList.add("hl");tr.cells[hlSel.c].classList.add("hc")}
 document.addEventListener("pointerdown",e=>{
  const t=e.target;if(!t||!t.closest)return;
  const td=t.closest(".sc td");
  if(e.isPrimary)down={id:e.pointerId,x:e.clientX,y:e.clientY,t:Date.now(),td:!!td,r:td?td.parentNode.rowIndex:-1,c:td?td.cellIndex:-1};
  if(e.pointerType!=="touch")return;
  const f=find(t);if(f&&f[0][2])anim(f[0][1],{via:"toque"});
  if(RMq.matches)return;
  const st=t.closest(".strip");
  if(st){flash(st,900);let best=null,bd=1e9;[...st.children].forEach(i=>{const r=i.getBoundingClientRect(),d=e.clientX<r.left?r.left-e.clientX:e.clientX>r.right?e.clientX-r.right:0;if(d<bd){bd=d;best=i}});if(best)flash(best,900)}
  const w=t.closest("#v-welcome .wtop");if(w)flash(w,1300);
  const sm=t.closest("#sum");
  if(sm){const r=sm.getBoundingClientRect();sm.style.setProperty("--gx",(e.clientX-r.left)+"px");sm.style.setProperty("--gy",(e.clientY-r.top)+"px");flash(sm,900);anim("tarjeta_nota_brillo",{via:"toque"})}
  const b=t.closest(".upst li");
  if(b){const r=b.getBoundingClientRect();b.style.setProperty("--gx",(e.clientX-r.left)+"px");b.style.setProperty("--gy",(e.clientY-r.top)+"px");flash(b,650)}
  const lf=t.closest("footer .lg-f");if(lf)flash(lf,700);
  const fl=t.closest("footer .fl");if(fl)flash(fl,900)
 },{passive:true});
 document.addEventListener("pointerup",e=>{
  const d=down;down=null;if(!d||d.id!==e.pointerId)return;
  if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>10||Date.now()-d.t>900)return;
  if(d.td){hlSel={r:d.r,c:d.c};hlPaint();anim("tabla_fila_marcada",{via:e.pointerType==="touch"?"toque":"clic"})}
  else if(hlSel){hlSel=null;hlPaint()}
 },{passive:true});
 document.addEventListener("pointercancel",()=>{down=null},{passive:true});
 /* La tabla se vuelve a dibujar con cada cambio de notas (por ejemplo al salir de una casilla): se vuelve a marcar la fila elegida */
 const cb=document.getElementById("cb");
 if(cb&&window.MutationObserver)new MutationObserver(()=>{if(!cb.querySelector(".sc"))hlSel=null;if(hlSel)hlPaint()}).observe(cb,{childList:true});
})();
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}

/* ---- bloque 7 ---- */
try{
/* Bloques de notas en celular: la luz verde se enciende bajo el dedo, lo SIGUE mientras haces scroll (touchmove + scroll vuelven a buscar el bloque bajo el dedo) y se apaga un momento despues de soltar */
(function(){
 var tree=document.getElementById("tree");if(!tree||!window.matchMedia||!matchMedia("(hover:none)").matches||RMQ().matches)return;
 var cur=null,tx=0,ty=0,down=false,raf=0,off=0;
 function clr(){if(cur){cur.classList.remove("tapfx");cur=null}}
 function at(){raf=0;if(!down)return;var el=document.elementFromPoint(tx,ty),b=el&&el.closest&&el.closest(".blk");if(!b||!tree.contains(b))return;
  var r=b.getBoundingClientRect();b.style.setProperty("--gx",(tx-r.left)+"px");b.style.setProperty("--gy",(ty-r.top)+"px");
  if(cur!==b){clr();b.classList.add("tapfx");cur=b;try{anim("tarjeta_nota_brillo",{via:"toque"})}catch(_){}}}
 function kick(){if(!raf)raf=requestAnimationFrame(at)}
 document.addEventListener("touchstart",function(e){var t=e.touches[0];if(!t||!tree.contains(e.target))return;clearTimeout(off);down=true;tx=t.clientX;ty=t.clientY;at()},{passive:true});
 document.addEventListener("touchmove",function(e){if(!down)return;var t=e.touches[0];if(!t)return;tx=t.clientX;ty=t.clientY;kick()},{passive:true});
 window.addEventListener("scroll",function(){if(down)kick()},{passive:true});
 var end=function(){if(!down)return;down=false;clearTimeout(off);off=setTimeout(clr,1100)};
 document.addEventListener("touchend",end,{passive:true});document.addEventListener("touchcancel",end,{passive:true});
})();
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}

/* ---- bloque 8 ---- */
try{
document.addEventListener("input",function(e){var t=e.target;if(t&&t.matches&&t.matches('#sim input[type=range]')){var mx=parseFloat(t.max)||20;t.style.setProperty("--p",(parseFloat(t.value)/mx*100)+"%")}});
}catch(e){if(window.console)console.error("MyPonderUP efectos:",e)}
