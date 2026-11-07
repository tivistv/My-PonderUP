/* My PonderUP - ajustes de movimiento y rendimiento. Se carga PRIMERO (antes que cursos.js y app.js).
   1) RMQ(): reemplaza a matchMedia("(prefers-reduced-motion: reduce)") en todo el codigo. Mientras MP.respetarReducirMovimiento sea false
      (ver el <script> del <head> de index.html) devuelve "no reducir", asi las animaciones se ven tambien en laptops con ese ajuste activado.
   2) Modo ligero (clase "lite" en <html>): si el equipo va lento (menos de ~30 fotogramas por segundo en la bienvenida) se apagan SOLO los
      efectos que mas cuestan (desenfoques, brillos en bucle sobre texto/logo, aurora, particulas); la pagina, los hover y las animaciones de
      entrada siguen igual. Se recuerda en este navegador (mp-lite). Para probarlo a mano: abrir la pagina con ?lite=1 (forzar) o ?lite=0 (quitar). */
function RMQ(){
 return (window.MP&&window.MP.respetarReducirMovimiento&&window.matchMedia)?matchMedia("(prefers-reduced-motion: reduce)"):{matches:false,addEventListener:function(){},removeEventListener:function(){}};
}
(function(){
 var root=document.documentElement,K="mp-lite";
 try{var q=new URLSearchParams(location.search).get("lite");
  if(q==="1"){localStorage.setItem(K,"1");root.classList.add("lite");return}
  if(q==="0"){localStorage.removeItem(K);root.classList.remove("lite");return}}catch(_){}
 if(root.classList.contains("lite")||!window.requestAnimationFrame||!window.performance)return;
 var n=0,t0=0,last=0,worst=0,started=false;
 function done(slow){
  if(!slow)return;
  root.classList.add("lite");
  try{localStorage.setItem(K,"1")}catch(_){}
  try{if(typeof track==="function")track("modo_ligero",{fps:Math.round(n/((last-t0)/1000))})}catch(_){}
 }
 function tick(t){
  if(document.hidden){started=false;n=0;setTimeout(begin,1000);return}
  if(!started){started=true;t0=last=t;n=0;requestAnimationFrame(tick);return}
  n++;last=t;
  if(t-t0>=2000||n>=120){var fps=n/((t-t0)/1000);done(fps<28);return}
  requestAnimationFrame(tick)
 }
 function begin(){requestAnimationFrame(tick)}
 /* se mide un poco despues de cargar, con la bienvenida ya en pantalla */
 function go(){setTimeout(begin,900)}
 if(document.readyState==="complete")go();else window.addEventListener("load",go);
})();
