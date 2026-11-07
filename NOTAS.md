# My PonderUP - notas para quien edite el proyecto

(Antes estas notas eran un comentario dentro de index.html; se movieron aqui para que la pagina pese menos. Donde diga "este archivo" o
"el JavaScript", mira la tabla de ESTRUCTURA DE ARCHIVOS.)

## ESTRUCTURA DE ARCHIVOS (ronda 9)
Los scripts son "clasicos" (sin modulos) y se cargan con `defer` en este orden; comparten variables globales como antes:

    index.html          HTML de la pagina, meta tags, scripts de tema y analiticas, y el ajuste window.MP (ver abajo)
    css/base.css        fuente, variables de color, estructura, encabezado, resultados, barras, tabla, preguntas
    css/welcome.css     bienvenida (logo, brillos, particulas), logos, interruptor de tema, pantallas pequenas
    css/screens.css     factor de inscripcion, compartir, agrega tu curso, elige tu curso, simulador, hovers
    css/effects.css     efectos de cursor, pie de pagina y, al final, el MODO LIGERO (html.lite)
    js/rendimiento.js   RMQ() (reducir movimiento) y deteccion automatica del modo ligero. Se carga primero
    js/cursos.js        datos de los cursos: constante C (pesos y evaluaciones) y colores de barras (SC, WB)
    js/fi-datos.js      datos del Factor de Inscripcion: PLN (12 carreras), FI_NV, FI_BL, FI_BON
    js/app.js           logica principal (analiticas, calculadora, simulador, compartir, sugerencias, buscador, agrega tu curso, FI)
    js/efectos.js       nota fuera de rango, tarjetas de "Elige tu curso", campo de numeros del pie, cursor propio
    js/tactil.js        nota minima, hovers en celular, fila resaltada de la tabla, bloques de notas en celular

El ORDEN de los archivos importa (el orden de los CSS tambien: los ultimos ganan la cascada). Cada bloque de efectos.js y tactil.js va dentro de
un try/catch: si uno falla, los demas siguen funcionando (igual que cuando eran <script> sueltos).
Para AGREGAR UN CURSO: editar solo js/cursos.js (constante C) y agregar su clave en KS (js/app.js).

## RONDA 9 - ANIMACIONES EN LAPTOPS DE LA UNIVERSIDAD Y RENDIMIENTO
- Causa de que las animaciones no se vieran: el CSS tenia  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  y el JavaScript tambien se apagaba con ese ajuste. Muchas laptops de universidades (y PCs con ahorro de energia o escritorio remoto) tienen
  "Mostrar animaciones" desactivado en Windows, y el navegador lo informa asi. Ahora esa regla solo se activa con la clase html.rm.
- window.MP.respetarReducirMovimiento (en el <head> de index.html): false (actual) = las animaciones se ven siempre. true = se respeta el ajuste
  del sistema (se pone la clase html.rm y vuelven las reglas de "reducir movimiento"). Todo el JS usa RMQ() en vez de matchMedia(...reduce...).
- MODO LIGERO: js/rendimiento.js mide los fotogramas por segundo un momento despues de cargar; si bajan de ~28 pone la clase html.lite y la
  guarda en localStorage (mp-lite). css/effects.css apaga solo los efectos decorativos mas caros (brillos en bucle del logo y del texto,
  desenfoques, aurora, particulas, anillos, franjas del pie). Se conservan entradas, hover, barras, salto de letras y confeti.
  Probar a mano: ?lite=1 (forzar) / ?lite=0 (quitar). Evento PostHog nuevo: modo_ligero (propiedad fps) para saber cuantos equipos lo activan.
- update() de la calculadora: al escribir una nota los eventos input y change del mismo fotograma se calculan una sola vez (updSoon()).
- Se quito el comentario largo de index.html (unos 17 KB que viajaban en cada visita) y se separo el codigo en archivos cacheables.

---

## NOTAS ANTERIORES (rondas 1 a 8)
=====================================================================
MY PONDERUP  (por @matiastf_ y @fabi_mvi)  -  NOTAS PARA QUIEN EDITE ESTE ARCHIVO
=====================================================================
Este comentario no se ve en la web. Resume todo lo que se le explico a Claude para armarla,
asi que otro chat o persona puede continuar sin volver a pasar la informacion.

0) ESTADO ACTUAL DEL FACTOR DE INSCRIPCION: OCULTO
  La seccion de FI esta terminada pero DESACTIVADA a pedido del autor (falta mejorarla). Nadie la ve ni puede abrirla.
  Todo su codigo (HTML de #v-fi, CSS, JavaScript) y sus datos (planes de las 12 carreras, bonificaciones, reglas) siguen aqui.
  Para ACTIVARLA: en js/app.js (primeras lineas) cambiar  const FI_ACTIVO=false;  por  true.  Eso muestra el boton "Calcular mi FI"
  (pantalla de eleccion, lista de cursos y pie) y cambia el titulo a "Elige tu cálculo".
  Opcional al activar: cambiar los dos meta description (description y og:description) por
  "Calcula tu ponderado, mira qué notas necesitas para aprobar y calcula tu factor de inscripción."

1) QUE ES
Una pagina estatica sin librerias, ahora repartida en index.html + css/ + js/ (ver ESTRUCTURA DE ARCHIVOS abajo). Pantallas: bienvenida, elegir calculo,
calculadora de ponderado por curso y calculadora de FACTOR DE INSCRIPCION (FI).
Fuera de este archivo usa: la fuente Montserrat alojada en /fonts/ (ya no depende de Google Fonts), logos en /img/ (WebP),
el script de Vercel Insights, PostHog y la API propia /api/sugerencia (carpeta api/).

2) FORMULA DEL FI
  Desde el 2do ciclo:  FI = (promedio del ultimo semestre x 10) + creditos academicos acumulados + bonificaciones
  Primer ciclo:        FI = (promedio del semestre x 10) + creditos matriculados + bonificaciones
  - Creditos matriculados = suma de los creditos de los cursos con nota de ese semestre.
  - Promedio semestral = suma(nota x creditos) / suma(creditos). Ponderado por creditos.
  - El promedio NO se redondea al entero ni antes de multiplicar por 10. Se muestra con 2 decimales.
    El FI tampoco se redondea al entero: solo muestra decimales si los tiene (max. 2).
    Interruptor en el codigo: FI_REDONDEA_PROMEDIO (false = 143.33, true = 143.3).
  - Ejemplo oficial corregido: promedio 14.33 x 10 = 143.33, mas 32 creditos acumulados, mas 16 de bonificacion = 191.33.
    (En el video salia 143.80 y era un error. Tambien salia 37 creditos acumulados en la tabla: esos 37 incluian
    cursos EFE, y para el FI se usan 32.)
  - Ejemplo de primer ciclo: Nivelacion en Informatica 12 (3 cr), Lenguaje I 15 (4), Matematicas I 14 (5),
    Sociologia 16 (4): suma de creditos 16, suma N x C 230, promedio 14.375 (se muestra 14.38).

3) CURSOS EFE (Experiencias Formativas Estudiantiles)
  Todos los cursos EFE (arte, cultura, deporte, servicio social, innovacion e investigacion, taller de
  competencias profesionales) NO cuentan para el FI: no entran al promedio ni a los creditos acumulados.
  Solo sirven porque la universidad exige minimo 4 creditos EFE y los cobra.
  Decision del autor: NO mencionar EFE en la web. Por eso la web solo dice que se escriban "los creditos que cuentan para el FI".

4) NIVELACIONES
  Tienen 0 creditos academicos en los planes, pero para el FI valen como creditos administrativos:
  Nivelacion en Matematicas = 4, Nivelacion en Lenguaje = 3, Nivelacion en Informatica = 3.
  En la web se usan solo como peso en el promedio ponderado.

5) BONIFICACIONES (el alumno marca solo las que tiene; no hay tope; se suman)
  Encuesta (de docentes y encargados de practica) = 16 | Intercambio = 16 | Matricula preventiva = 16 |
  Deportista = 16 | REA = 8 | REDA = 8.

6) CREDITOS DE REFERENCIA
  Economia General I = 5 | Fundamentos de las Ciencias Empresariales = 4 | Fundamentos de Contabilidad = 4 |
  Introduccion a la Ingenieria = 4 | Matematicas I = 5 | Lenguaje I = 4 (Lenguaje II tambien 4).

7) DATOS DE LAS CARRERAS (constante PLN en el JavaScript)
  Fuente: los PDFs de planes de estudio de las 12 carreras: Administracion (2022), Contabilidad (2022), Derecho (2022),
  Economia (2022-II), Finanzas (2022-II), Humanidades Digitales (2024), Ingenieria de la Informacion (2022),
  Ingenieria Empresarial (2022), Ingenieria en Innovacion y Diseno (2024), Marketing (2022),
  Negocios Internacionales (2022), Politica, Filosofia y Economia (2024-I).
  Formato de cada curso: "nombre|creditos|codigo|horas teoricas (T)|horas practicas (P)".
  Se ignora el D.A. (departamento academico). Los creditos de cada ciclo se verificaron contra los totales de cada PDF.
  Los cursos de bloque (Sello UP: ciencias sociales, pensamiento critico, procesos sociales, quehacer cientifico,
  desarrollo personal) son 15 cursos de 4 creditos, comunes a todas las carreras (constante FI_BL).
  Cuando un PDF difiere de los demas se respeto el PDF de esa carrera:
    - Derecho: Investigacion Academica 3 T / 0 P; Historia Critica del Peru figura con codigo 124022 (los demas usan 122005).
    - Derecho: las nivelaciones salen con horas T/P distintas a las otras carreras (probable error de extraccion del PDF);
      aqui se usan las de las demas carreras.
    - Negocios Internacionales: Fundamentos de Contabilidad 2 T / 3 P y Analisis Multivariado 3 T / 2 P.
    - Ingenieria de la Informacion: Ingenieria de Datos 4 T / 3 P.
    - Humanidades Digitales: Tecnologia y Medios de Comunicacion figura con codigo 170346 (en Innovacion y Diseno es 170456).
      Su PDF no trae total de creditos.
    - Derecho: 24 creditos electivos (15 de derecho y 9 de otras carreras); no hay lista de electivos, se usa "Otro curso".
    - Ingenieria Empresarial: las concentraciones (analitica de negocios, sistemas de informacion, finanzas corporativas)
      estan en la lista de electivos. En las otras ingenierias las concentraciones estan en un documento aparte.

8) NOTAS TECNICAS PARA EDITAR
  - Los inputs del FI NO deben usar la clase "g": el manejador global del ponderado la usa y fallaria.
  - Ids y clases del FI empiezan con "fi" o "f" (v-fi, fi-main, fisum, fimini, fbar...). El estado del FI esta en FS.
  - localStorage: mp-theme (modo claro/oscuro) y mp-progress (notas, nota minima y redondeos de cada curso). Solo se guardan
    los datos que el alumno cambio; los pesos salen siempre de la constante C. Si hay notas guardadas, al abrir la pagina se
    vuelve directo al curso donde estaba (funciones save() y load()).
  - Los % que se ven en cada evaluacion son sobre el TOTAL del curso (modelo A) y se calculan solos a partir de w (c.a).
    d:"" en un nodo oculta su % (partes medidas en puntos, como los laboratorios de Introduccion a la Ingenieria).
  - Todos los cursos redondean parcial, final y promedio final al entero (el .5 sube).
  - Grupos del menu de cursos (constante GR): Nivelacion (pre distinto de ""), Cursos y "Cursos Sellos UP". Un curso va a Sellos UP con gp:2 en su
    entrada de C (Liderazgo y Filosofia). Sin gp, el grupo sale de pre (pre:"" = Cursos).
  - nz:1 en un curso apaga la barra de zoom de la primera seccion (se usa en Filosofia, donde las unidades no son "trabajos").
  - La barra de pesos (WB) tiene 5 colores: un curso admite hasta 5 evaluaciones principales (Derecho Constitucional General e Historia Economica y Empresarial usan 5). Si un curso trae mas, wbc() repite colores en vez de romper la pagina. IMPORTANTE: si setCourse() lanza un error, el titulo cambia pero el resto de la pagina se queda con el curso anterior.
  - Contabilidad Financiera Intermedia: Controles de Lectura (9%) y Participacion (3%) son una sola nota cada uno (no se indico cuantos controles hay).
  - Combinaciones para aprobar: filas en escalera (primeras evaluaciones mas altas, ultimas mas bajas) con diferencia D = 0, 3, 6, 9, 12.
  - Compartir: boton en la barra superior y en el pie (menu de compartir en celular, copiar enlace en computadora).
  - Sugerencias: formulario en el pie que envia JSON con fetch a /api/sugerencia (funcion de Vercel, ver punto 9). La funcion lo valida y lo reenvia
    a Formspree o Resend; la direccion de Formspree ya NO esta en este archivo (vive en la variable de entorno FORMSPREE_ENDPOINT).
  - Analiticas: PostHog (constantes PH_KEY y PH_REGION al inicio del script). Eventos con track(nombre, datos): pantalla, empezar_click,
    curso_elegido, primera_nota, nota_ingresada, calculo_actualizado, combos_vistos, resumen_visto, faq_abierta, compartir_*, sugerencia_*,
    tema_cambiado, nota_escribiendo, nota_fuera_de_rango, meta_cambiada, instagram_click (lugar: resultado|pie), etc. Todos los eventos llevan tema_actual (claro|oscuro) para saber que modo ve cada visita, no solo quien toca el interruptor.
    Nunca se envian los valores de las notas. Las grabaciones enmascaran todos los campos.
  - Rendimiento: la fuente Montserrat (variable, solo latin, 38 KB) se sirve desde /fonts/ con preload y una fuente de respaldo con las mismas
    medidas ("Montserrat Fallback") para que el texto no salte al cargar. El logo de bienvenida tiene preload y prioridad alta; los demas logos
    prioridad baja. PostHog y favicon se cargan al final (idle()). vercel.json da cache de 365 dias a /fonts y agrega cabeceras de seguridad.
    404.html es la pagina de error (Vercel la usa sola si esta junto a index).
  - Formulario: protecciones en el navegador (trampa _gotcha, tiempo minimo, sin enlaces, sin repetidos, 3 al dia: clave mp-sg).
    Son solo comodidad: cualquiera puede saltarselas. Las protecciones reales estan en el servidor (api/sugerencia.js), ver punto 9.
  - No se guardan notas en ningun servidor; lo unico que sale del navegador es el mensaje que el alumno envia por el formulario.

9) ARCHIVOS DEL PROYECTO (todos en la raiz del proyecto de Vercel)
  index.html          esta pagina (HTML, meta tags y ajustes MP)
  css/ y js/          estilos y logica de la pagina (ver ESTRUCTURA DE ARCHIVOS)
  404.html            pagina de error personalizada (Vercel la usa sola y responde con estado 404)
  vercel.json         cabeceras de seguridad y cache largo para /fonts
  fonts/montserrat-latin-wght-normal.woff2    fuente Montserrat variable (solo latin) alojada en el propio sitio
  api/sugerencia.js   funcion de Vercel: recibe el formulario, lo valida y lo reenvia
  Variables de entorno (Vercel > Settings > Environment Variables):
    obligatoria, UNA de estas dos:  FORMSPREE_ENDPOINT (https://formspree.io/f/xxxx)  |  RESEND_API_KEY + CONTACT_TO (correo que recibe)
    opcionales: TURNSTILE_SECRET | UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (o KV_REST_API_URL + KV_REST_API_TOKEN)
                | GLOBAL_DAILY_CAP (def. 20) | GLOBAL_MONTHLY_CAP (def. 45) | IP_DAILY_MAX (def. 10) | ALLOWED_ORIGINS | SITE_URL
  Capas contra spam y abuso, de afuera hacia adentro:
    1) Regla de Vercel Firewall (Rate Limit por IP sobre /api/sugerencia). Se crea en el panel, sin codigo.
    2) La funcion: solo POST con JSON, origen permitido, trampa _gotcha, largo, sin enlaces, captcha Turnstile (si hay TURNSTILE_SECRET),
       espera entre envios y maximo por dia por IP, mensaje repetido, y tope global por dia y por mes (protege el limite mensual de Formspree).
    3) El navegador (solo comodidad): tiempo minimo y 3 al dia.
  Sin Upstash los contadores viven en la memoria de cada instancia de la funcion: sirven de freno, pero no son estrictos.
  Para activar Turnstile: poner la clave del sitio en TS_SITEKEY (bloque "Comentarios o sugerencias" del JavaScript) y TURNSTILE_SECRET en Vercel.
  Logos: alojados en /img/ (WebP). La vista previa del enlace usa /img/og.png (1200x630) con URL absoluta en og:image y og:url.

10) AGREGA TU CURSO (boton arriba a la derecha en "Elige tu curso", tambien en celular; a la izquierda esta el boton "Atras" (#pickback) que vuelve a la bienvenida. Pantalla de envio: #v-up)
  El alumno envia el silabo o reglamento de un curso que falta. Maximo 3 archivos, 3 MB en total, solo PDF, Word (.docx), PNG y JPG
  (se excluyen Excel y .doc antiguo porque pueden llevar macros). El navegador revisa extension, tipo y firma del archivo; el servidor
  (api/subir-curso.js) lo repite, rechaza PDFs con JavaScript/Launch y .docx con macros, y envia los archivos por correo con Resend a
  myponderup@gmail.com. Los archivos nunca se publican en la web. Variables de entorno: RESEND_API_KEY (obligatoria), CONTACT_TO (def. myponderup@gmail.com),
  RESEND_FROM (def. onboarding@resend.dev), ALLOWED_ORIGINS | SITE_URL, UP_GLOBAL_DAILY_CAP (def. 30), UP_IP_DAILY_MAX (def. 5).
  Tambien aparece DENTRO del curso (pantalla #v-tool): boton en la barra superior (data-add="barra"; solo icono + en celular), entrada fija al final del
  desplegable de cursos (data-add="lista", .caddw) y enlace en el pie (data-add="pie").
  Todos usan el atributo data-add. Al salir de la pantalla de envio, leaveUp() vuelve al curso (misma posicion de scroll) si se vino de uno, o a la lista de cursos si no.

11) NOVEDADES (ronda 3)
  - Analitica por tu dominio: PostHog se carga desde /_u/ (reglas "rewrites" en vercel.json, ver vercel-rewrites-posthog.json) para que los bloqueadores no la
    confundan con publicidad. Orden: /_u/ -> PostHog directo -> "modo ligero" (POST pequeno con track()). Siempre se respeta "No rastrear" (DNT).
  - Pie del curso: Comentarios/sugerencias debajo de "Compartir pagina", "Agrega tu curso" entre los comentarios e Instagram, y listas de cursos con "Ver mas" (3 visibles; Nivelacion no lleva).
  - Modo claro/oscuro: solo el interruptor sol/luna (sin boton Auto ni horario). Sin eleccion guardada sigue al sistema.
  - Se quito la barra Anterior/Siguiente/Listo del iPhone. Enter / Siguiente sigue funcionando en teclados que lo traen.
  - Aviso de aprobado con 4 estados (funciones outlook() y vtxt()): ya aprobaste | aun puedes aprobar (promedio necesario en lo pendiente) |
    ya no se puede llegar a la minima | aprobado/desaprobado solo cuando no queda nada por rendir.
    Evento estado_aprobacion (una vez por curso y estado) y propiedad estado en calculo_actualizado. Nunca se envian las notas.
  - Compartir mi resultado (#rib, modal #rim): imagen PNG hecha con canvas en el navegador, formatos Historia 9:16 y Publicacion 4:5, notas ocultas por defecto
    (casilla #rin). En celular usa el menu de compartir con archivo; en PC descarga o copia. Lleva SITE_HOST al pie. Eventos resultado_imagen_abierta y resultado_compartido.
  - Simulador "¿Y si saco...?" (#sim, funciones simR() y simU()): deslizadores por evaluacion pendiente; "Usar" copia el valor a la casilla real.
  - Valoracion "¿Te ayudo a planificar tus notas?" (#mpv, funciones fbSync() y fbPaint()): aparece con la primera nota; 1 voto por curso y navegador (localStorage mp-fb).
    Eventos valoracion_vista, resultado_util (valor si|no) y resultado_util_comentar (el "No mucho" lleva al cuadro de comentarios #sgm).
  - Visitante nuevo/recurrente (constante VIS): localStorage mp-vis (primera visita y n de visitas = sesiones). Propiedades en TODOS los eventos: visitante, visitas,
    dias_desde_primera_visita. before_send en posthog.init tambien fija app, interno y etapa en el primer $pageview.

12) ANIMACIONES, TABLA Y MEDICION (ronda 4)
  - Titulo del curso (#ctitle): cada letra es un <span class="ltr"> (setLetters()); solo salta la letra tocada (hopLetter(), Web Animations API). "Calcula tu ponderado de" no se anima.
    El brillo es uno solo para todo el titulo: la propiedad --sp (0 a 1) la anima .t2 y cada letra lo dibuja segun su posicion (--ox) y el ancho total (--tw, measureLetters()).
  - Version tactil de varios hovers: clase .tapfx unos instantes (bloque final "AL TOCAR"). Franjas, "Bienvenido a", tarjetas, logo y titulos del pie.
  - Tabla de combinaciones: tocar o hacer clic en una nota deja la fila resaltada (.hl) y la celda (.hc) hasta tocar/hacer clic FUERA de las celdas. Mover el dedo (scroll) o arrastrar NO la quita:
    solo cuenta un toque corto (menos de 10 px de movimiento). Se vuelve a marcar sola cuando la tabla se redibuja.
  - Indicadores de animaciones: UN evento "animacion" con propiedades nombre, dispositivo (mouse|tactil), via (hover|toque|clic, si aplica), vista y curso. Funcion anim(nombre,extra),
    maximo una vez cada 8 s por animacion y 60 por visita. En PostHog: Trends > evento "animacion" > desglosar por "nombre" (y por "dispositivo").
    Nombres: titulo_letra_salto, bienvenida_titulo, franja_bienvenida, franja_curso, bienvenida_inclinar_logo, bienvenida_estrellitas, bienvenida_explosion, boton_onda, boton_empezar,
    bienvenida_instagram, tarjeta_elegir_curso, tarjeta_nota_brillo, paso_agregar_curso, tabla_resaltado, tabla_fila_marcada, menu_cursos_fila, menu_cursos_despliegue, faq_resaltado, faq_despliegue,
    botones_barra, boton_compartir_resultado, tema_interruptor, tema_interruptor_hover, logo_encabezado, pie_logo, pie_instagram, pie_comentarios, pie_titulos, simulador_resaltado,
    simulador_despliegue, buscador_lista, subir_zona_arrastre, barra_nota_minima, barra_agua, confeti_aprobar, nota_temblor,
    (ronda 5) nota_minima_temblor, boton_principal_hover, subir_zona_icono, valoracion_botones, valoracion_gracias, pie_enlaces_curso, barra_marcador_hover, menu_cursos_boton,
    zona_barra_pop, aviso_emergente, mini_resumen_aparece y mini_resumen_fi_aparece (estas dos solo una vez por visita).
    Ronda 7: pie_notas_cursor (entra el cursor o el dedo al pie) y pie_notas_ola (clic o toque en el pie): campo de numeros del 0 al 20 que solo aparece cerca del cursor o del dedo, donde cuenta hacia 20; en blanco, sin colores. tarjeta_elegir_curso ahora cuenta solo con movimiento real del mouse.
    La propiedad nombre de curso_elegido, primera_nota y resultado_util lleva el nombre completo (cname), p. ej. "Nivelación en Matemáticas"; la propiedad curso sigue siendo la clave corta (mat, len, inf...).
    Las animaciones que corren solas (aurora, brillo de barras, flotar) no se pueden medir porque no dependen de la persona.
13) RONDA 8
  - Cursos nuevos: Comportamiento del Consumidor (cdc) y Gestion de Personas (gdp). En gdp los pesos de la Nota de Trabajo suman 95 y no 100 (40+25+10+10+10); el codigo los
    reparte sobre 95 (w:4000/95...) para que el maximo siga siendo 20. Si el silabo corrige algun peso, cambiar solo esos w. Redondeos de cdc: Trabajo y Participacion, Parcial,
    Trabajo Final y promedio final (no indicados por el autor: se asumio lo habitual).
  - Elige tu curso: las tarjetas terminan de aparecer a los 0.89 s (animation-duration .45s + delay maximo 440ms en "#v-pick .pl button.rv").
  - Mi promedio hasta ahora: sin brillo verde que pasa; el brillo verde sale con el cursor (hover) como los otros bloques (#sum). En celular el texto va en dos lineas
    ("Mi promedio" / "hasta ahora"). El aviso dice "No puedes llegar a X". La barra dice "4.4 de 11". Se quito el cuadro "Ya tienes el X asegurado...".
  - Las notas no pasan del maximo de la casilla (20, o 10 en los controles sobre 10): el ultimo digito se rechaza y sale "Maximo 20". Tambien la nota minima.
  - Simulador: sin los textos "Estas a X puntos..." ni "Pasas justo...". Quedan la etiqueta Aprobarias/Desaprobarias y el promedio simulado.
  - "Restablecer redondeos" (pregunta 2) solo vuelve los redondeos a los del curso (defR); ya no borra notas ni la nota minima.
  - Preguntas 03 y 04 rediseñadas (tarjetas .q3c y .q4t). Pregunta 04: "Solo en tu navegador y en tu dispositivo...".
  - "Agrega tu curso" usa el mismo puntero propio (punto + aro) de la bienvenida; en los campos de texto vuelve el cursor de escribir.
  - Interruptor claro/oscuro: flota apenas (keyframes tgf).
=====================================================================
