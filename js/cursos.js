/* My PonderUP - datos de los cursos (constante C: pesos y evaluaciones) y colores de las barras. Se carga ANTES de app.js */
const T=100/3,SC=["#0A5CFF","#00F03C","#F000F0","#FFFFFF"],WB=[["#0A5CFF","#fff"],["#00F03C","#061F47"],["#F000F0","#061F47"],["#FFC400","#061F47"],["#00D1FF","#061F47"]],wbc=i=>WB[i%WB.length];
const C={
mat:{n:"Matemáticas",rf:1,i:"La Nota de Trabajo (50%) sale de PC1 a PC4, que valen 10%, 10%, 15% y 15% del curso. El examen parcial pesa 20% y el final 30%. Las prácticas no se redondean; la Nota de Trabajo, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:50,r:1,ch:[{id:"pc1",n:"PC1",w:20},{id:"pc2",n:"PC2",w:20},{id:"pc3",n:"PC3",w:30},{id:"pc4",n:"PC4",w:30}]},
 {id:"pa",n:"Examen Parcial",w:20,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
len:{n:"Lenguaje",rf:1,i:"El promedio de prácticas pesa 40% y se forma con PC1, PC2 y PC3, que valen lo mismo (13.33% cada una). El examen parcial y el final pesan 30% cada uno. El parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"pr",n:"Prácticas",w:40,ch:[{id:"pc1",n:"PC1",w:T},{id:"pc2",n:"PC2",w:T},{id:"pc3",n:"PC3",w:T}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
inf:{n:"Informática",rf:1,i:"La Nota de Trabajo (35%) mezcla PC1 (12.25%), PC2 (15.75%) y el promedio de 3 controles (7% en total), y se redondea al entero antes de entrar al promedio final. El parcial pesa 30% y el final 35%; ambos y el promedio final también se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:35,r:1,ch:[{id:"pc1",n:"PC1",w:35},{id:"pc2",n:"PC2",w:45},
  {id:"co",n:"Controles",w:20,ch:[{id:"c1",n:"Control 1",s:"C1",w:T},{id:"c2",n:"Control 2",s:"C2",w:T},{id:"c3",n:"Control 3",s:"C3",w:T}]}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:35,r:1}]}},
con:{n:"Fundamentos de Contabilidad",pre:"",rf:1,i:"Trabajos pesa 40% y se arma con Prácticas Calificadas (28%), Controles de Lectura (10%) y Participación (2%). El parcial y el final pesan 30% cada uno. Trabajos, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"tr",n:"Trabajos",w:40,r:1,ch:[
  {id:"pc",n:"Prácticas Calificadas",w:70,ch:[{id:"pc1",n:"PC1",w:20},{id:"pc2",n:"PC2",w:20},{id:"pc3",n:"PC3",w:20},{id:"pc4",n:"PC4",w:20},{id:"pc5",n:"PC5",w:20}]},
  {id:"cl",n:"Controles de Lectura",w:25,ch:[{id:"cl1",n:"CL1",w:50},{id:"cl2",n:"CL2",w:50}]},
  {id:"ap",n:"Participación",s:"P",w:5,b:1}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
fce:{n:"Fundamentos de Ciencias Empresariales",pre:"",rf:1,i:"Los porcentajes de cada nota son sobre el 100% del curso. La Nota de Trabajo (40%) reúne 4 controles de lectura (20%), 5 notas de participación (10%) y 3 avances del trabajo final (10%). El Examen Final (35%) se compone del trabajo final escrito (5%), la exposición (10%) y el examen final escrito (20%). La Nota de Trabajo, el Examen Parcial, el Examen Final y la nota final se redondean al entero, y el .5 sube.",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:40,r:1,ch:[
  {id:"cl",n:"Controles de Lectura",w:50,ch:[{id:"c1",n:"Control 1",s:"C1",w:25},{id:"c2",n:"Control 2",s:"C2",w:25},{id:"c3",n:"Control 3",s:"C3",w:25},{id:"c4",n:"Control 4",s:"C4",w:25}]},
  {id:"pr",n:"Participación en Clase",w:25,ch:[{id:"pe",n:"Participación 1",s:"P1",w:20},{id:"ca",n:"Participación 2",s:"P2",w:20},{id:"e3",n:"Participación 3",s:"P3",w:20},{id:"e4",n:"Participación 4",s:"P4",w:20},{id:"e5",n:"Participación 5",s:"P5",w:20}]},
  {id:"av",n:"Avances del Trabajo Final",w:25,ch:[{id:"a1",n:"Avance 1",s:"A1",w:T},{id:"a2",n:"Avance 2",s:"A2",w:T},{id:"a3",n:"Avance 3",s:"A3",w:T}]}]},
 {id:"pa",n:"Examen Parcial",w:25,r:1},
 {id:"ef",n:"Examen Final",w:35,r:1,ch:[{id:"tf",n:"Trabajo Final",w:100/7},{id:"ex",n:"Exposición",w:200/7},{id:"fe",n:"Examen Escrito",w:400/7}]}]}},
int:{n:"Introducción a la Ingeniería",pre:"",rf:1,i:"La Nota de Trabajo (45%) reúne el Proyecto Empresarial (18%, nota grupal), Trabajos de Clase (9%, con PC1 y PC2 de 4.5% cada una) y Laboratorios (18%). Cada laboratorio y la Presentación Final valen 3.6% del curso y su nota es la suma de sus partes. El parcial pesa 25% y el final 30%. El parcial, el final y el promedio final se redondean al entero (el .5 sube); lo demás no se redondea.",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:45,ch:[
  {id:"pe",n:"Proyecto Empresarial",s:"Proyecto",w:40,b:1},
  {id:"tc",n:"Trabajos de Clase",w:20,ch:[{id:"pc1",n:"PC1",w:50},{id:"pc2",n:"PC2",w:50}]},
  {id:"lb",n:"Laboratorios",w:40,ch:[
   {id:"l1",n:"Laboratorio 1",s:"L1",z:1,w:20,ch:[{id:"pz",n:"Pinza",mx:2.5,w:12.5,d:""},{id:"ga",n:"Gancho",mx:3.5,w:17.5,d:""},{id:"tz",n:"Taza",mx:4,w:20,d:""},{id:"fm",n:"Fase Empatizar",mx:10,w:50,d:""}]},
   {id:"l2",n:"Laboratorio 2",s:"L2",z:1,w:20,ch:[{id:"gu",n:"Guía de Impresión 3D",mx:5,w:25,d:""},{id:"ei",n:"Evaluación Individual",mx:5,w:25,d:""},{id:"fd",n:"Fase Definir",mx:10,w:50,d:""}]},
   {id:"l3",n:"Laboratorio 3",s:"L3",z:1,w:20,ch:[{id:"rb",n:"Robot",mx:6,w:30,d:""},{id:"hg",n:"Hongo",mx:4,w:20,d:""},{id:"fid",n:"Fase Idear",mx:10,w:50,d:""}]},
   {id:"l4",n:"Laboratorio 4",s:"L4",z:1,w:20,ch:[{id:"di",n:"Dinosaurio",mx:10,w:50,d:""},{id:"fp",n:"Fase Prototipar",mx:10,w:50,d:""}]},
   {id:"pf",n:"Presentación Final",s:"PF",w:20,b:1}]}]},
 {id:"pa",n:"Examen Parcial",w:25,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
mat1:{n:"Matemáticas I",pre:"",rf:1,i:"Trabajos pesa 40% y se arma con 2 controles (2% cada uno, 4% en total) y 4 prácticas calificadas (9% cada una, 36% en total). Los controles se califican sobre 10 y el sistema los pasa solo a la escala de 20. El examen parcial y el final pesan 30% cada uno. Trabajos, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"tr",n:"Trabajos",w:40,r:1,ch:[
  {id:"ct",n:"Controles",w:10,ch:[{id:"c1",n:"Control 1",s:"C1",w:50,mx:10},{id:"c2",n:"Control 2",s:"C2",w:50,mx:10}]},
  {id:"pc",n:"Prácticas Calificadas",w:90,ch:[{id:"pc1",n:"PC1",w:25},{id:"pc2",n:"PC2",w:25},{id:"pc3",n:"PC3",w:25},{id:"pc4",n:"PC4",w:25}]}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
len1:{n:"Lenguaje I",pre:"",rf:1,i:"Trabajos pesa 35% y está formado por 3 prácticas calificadas que valen lo mismo (11.67% cada una). El examen parcial pesa 30% y el final 35%. El reglamento no indica pesos distintos para las prácticas, por eso se asume que pesan igual. Trabajos, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"tr",n:"Trabajos",w:35,r:1,ch:[
  {id:"pc",n:"Prácticas Calificadas",w:100,ch:[{id:"pc1",n:"PC1",w:T},{id:"pc2",n:"PC2",w:T},{id:"pc3",n:"PC3",w:T}]}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:35,r:1}]}},
eco1:{n:"Economía General I",pre:"",rf:1,i:"Trabajos pesa 40% y está formado por 4 prácticas calificadas de 10% cada una. El examen parcial y el final pesan 30% cada uno. El reglamento no indica pesos distintos para las prácticas, por eso se asume que pesan igual. Trabajos, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"tr",n:"Trabajos",w:40,r:1,ch:[
  {id:"pc",n:"Prácticas Calificadas",w:100,ch:[{id:"pc1",n:"PC1",w:25},{id:"pc2",n:"PC2",w:25},{id:"pc3",n:"PC3",w:25},{id:"pc4",n:"PC4",w:25}]}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
der1:{n:"Introducción al Derecho",pre:"",rf:1,i:"No hay examen parcial ni final: el curso se compone de Controles de Lectura (30%), Prácticas Calificadas (40%) y Evaluación Continua (30%). Los 3 controles valen lo mismo (10% del curso cada uno), las 4 prácticas calificadas también (10% cada una) y las 3 actividades calificadas de la Evaluación Continua también (10% cada una). El promedio final se redondea al entero (el .5 sube).",root:{ch:[
 {id:"cl",n:"Controles de Lectura",w:30,ch:[{id:"c1",n:"Control 1",s:"C1",w:T},{id:"c2",n:"Control 2",s:"C2",w:T},{id:"c3",n:"Control 3",s:"C3",w:T}]},
 {id:"pc",n:"Prácticas Calificadas",w:40,ch:[{id:"pc1",n:"PC1",w:25},{id:"pc2",n:"PC2",w:25},{id:"pc3",n:"PC3",w:25},{id:"pc4",n:"PC4",w:25}]},
 {id:"ec",n:"Evaluación Continua",w:30,ch:[{id:"a1",n:"Actividad 1",s:"A1",w:T},{id:"a2",n:"Actividad 2",s:"A2",w:T},{id:"a3",n:"Actividad 3",s:"A3",w:T}]}]}},
cfi:{n:"Contabilidad Financiera Intermedia",pre:"",rf:1,i:"Trabajos pesa 40% y se arma con Prácticas Calificadas (28%, cinco prácticas que valen lo mismo: 5.6% cada una), Controles de Lectura (9%) y Participación en Clase (3%). El examen parcial y el final pesan 30% cada uno. Controles de Lectura y Participación se ingresan como una sola nota cada uno. Trabajos, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"tr",n:"Trabajos",w:40,r:1,ch:[
  {id:"pc",n:"Prácticas Calificadas",w:70,ch:[{id:"pc1",n:"PC1",w:20},{id:"pc2",n:"PC2",w:20},{id:"pc3",n:"PC3",w:20},{id:"pc4",n:"PC4",w:20},{id:"pc5",n:"PC5",w:20}]},
  {id:"cl",n:"Controles de Lectura",s:"CL",w:22.5,b:1},
  {id:"ap",n:"Participación en Clase",s:"P",w:7.5,b:1}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
mat3:{n:"Matemáticas III",pre:"",rf:1,i:"La Nota de Trabajo pesa 40% y es el promedio de 4 prácticas calificadas que valen lo mismo (10% del curso cada una). El examen parcial y el final pesan 30% cada uno. La Nota de Trabajo, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:40,r:1,ch:[{id:"pc1",n:"PC1",w:25},{id:"pc2",n:"PC2",w:25},{id:"pc3",n:"PC3",w:25},{id:"pc4",n:"PC4",w:25}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
mac1:{n:"Macroeconomía I",pre:"",rf:1,i:"La Nota de Trabajo pesa 40% y es el promedio de 4 prácticas calificadas que valen lo mismo (10% del curso cada una). El examen parcial y el final pesan 30% cada uno. La Nota de Trabajo, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:40,r:1,ch:[{id:"pc1",n:"PC1",w:25},{id:"pc2",n:"PC2",w:25},{id:"pc3",n:"PC3",w:25},{id:"pc4",n:"PC4",w:25}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
hee:{n:"Historia Económica y Empresarial",pre:"",gp:2,rf:1,i:"El curso no tiene parcial ni final. El proyecto de investigación se entrega en 4 partes (5%, 10%, 20% y 25% del curso) y las actividades en clase calificables pesan 40%. El promedio final se redondea al entero (el .5 sube).",root:{ch:[
 {id:"e1",n:"Entrega 1",s:"Entrega 1",w:5},
 {id:"e2",n:"Entrega 2",s:"Entrega 2",w:10},
 {id:"e3",n:"Entrega 3",s:"Entrega 3",w:20},
 {id:"e4",n:"Entrega 4",s:"Entrega 4",w:25},
 {id:"ac",n:"Actividades en Clase",s:"Actividades",w:40}]}},
inv:{n:"Investigación Académica",pre:"",gp:2,rf:1,i:"El curso se evalúa con 3 entregas: la Entrega 1 pesa 30%, la Entrega 2 30% y la Entrega 3 40%. El promedio final se redondea al entero (el .5 sube).",root:{ch:[
 {id:"e1",n:"Entrega 1",s:"E1",w:30},{id:"e2",n:"Entrega 2",s:"E2",w:30},{id:"e3",n:"Entrega 3",s:"E3",w:40}]}},
est1:{n:"Estadística I",pre:"",rf:1,i:"La Nota de Trabajo pesa 40% y es el promedio de 4 prácticas calificadas que valen lo mismo (10% del curso cada una). El examen parcial y el final pesan 30% cada uno. La Nota de Trabajo, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:40,r:1,ch:[{id:"pc1",n:"PC1",w:25},{id:"pc2",n:"PC2",w:25},{id:"pc3",n:"PC3",w:25},{id:"pc4",n:"PC4",w:25}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
ctd:{n:"Contabilidad para la Toma de Decisiones",pre:"",rf:1,i:"La Nota de Trabajo pesa 40% (Evaluaciones Parciales 20% y Controles de Lectura 20% del curso). La Actividad Examen Final pesa 60% (Participación Efectiva 10%, Trabajo Integral 25% y Evaluación Integral 25% del curso). Las evaluaciones parciales y los controles de lectura se ingresan cada uno como una sola nota. La Nota de Trabajo, la Actividad Examen Final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:40,r:1,ch:[{id:"ep",n:"Evaluaciones Parciales",s:"E. Parciales",w:50},{id:"cl",n:"Controles de Lectura",s:"Controles",w:50}]},
 {id:"fi",n:"Actividad Examen Final",s:"Examen Final",w:60,r:1,ch:[{id:"pe",n:"Participación Efectiva",s:"Participación",w:100*10/60},{id:"tg",n:"Trabajo Integral",s:"Trabajo Integral",w:100*25/60},{id:"ei",n:"Evaluación Integral",s:"Ev. Integral",w:100*25/60}]}]}},
dcg:{n:"Derecho Constitucional General",pre:"",rf:1,i:"Controles de Lectura (promedio) pesan 20%, Prácticas Calificadas (promedio) 20%, Participación 15%, Presentación Final (ensayo o video) 20% y Examen Final 25%. El examen final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"cl",n:"Controles de Lectura",s:"Controles",w:20},
 {id:"pc",n:"Prácticas Calificadas",s:"Prácticas",w:20},
 {id:"pa",n:"Participación",s:"P",w:15},
 {id:"pf",n:"Presentación Final",s:"Presentación",w:20},
 {id:"fi",n:"Examen Final",w:25,r:1}]}},
gct:{n:"Gestión del Cambio y Transformación Cultural",pre:"",rf:1,i:"La Nota de Trabajo pesa 45%, el Examen Parcial 20% y el Examen Final 35%. Dentro de cada una, los porcentajes que ves son sobre esa parte. En el Parcial, el avance del trabajo es grupal y el examen oral es individual. En el Final, el trabajo y el examen oral son grupales y la exposición es individual. La Nota de Trabajo, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:45,r:1,ch:[
  {id:"c1",n:"Control 1",s:"C1",w:20},
  {id:"io",n:"Informes Orales",s:"Informes",w:25},
  {id:"ex",n:"Exposición",s:"Exposición",w:15},
  {id:"ig",n:"Informes y Casos",s:"Informes y Casos",w:20},
  {id:"pp",n:"Participación y Asistencia",s:"Participación",w:20}]},
 {id:"pa",n:"Examen Parcial",w:20,r:1,ch:[
  {id:"av",n:"Avance del Trabajo",s:"Avance",w:20},
  {id:"eo",n:"Examen Oral",s:"Oral",w:80}]},
 {id:"fi",n:"Examen Final",w:35,r:1,ch:[
  {id:"tr",n:"Trabajo de Investigación",s:"Trabajo",w:40},
  {id:"ep",n:"Exposición",s:"Exposición",w:10},
  {id:"eo",n:"Examen Oral",s:"Oral",w:50}]}]}},
psc:{n:"Pensamiento Social Contemporáneo",pre:"",gp:2,rf:1,i:"Las Notas de Trabajos pesan 50%, el Examen Parcial 20% y el Examen Final 30%. Las Notas de Trabajos se ingresan como una sola nota. La nota de trabajos, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Trabajos",s:"Trabajos",w:50,r:1},
 {id:"pa",n:"Examen Parcial",w:20,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}},
lid:{n:"Liderazgo",pre:"",gp:2,rf:1,i:"No hay examen parcial ni final. El curso se compone de Análisis de Casos (20%), Trabajo de Reflexión Personal (20%), Participación (30%) y Proyecto Final (30%). El promedio final se redondea al entero (el .5 sube).",root:{ch:[
 {id:"ac",n:"Análisis de Casos",w:20},
 {id:"tr",n:"Reflexión Personal",w:20},
 {id:"pa",n:"Participación",w:30},
 {id:"pf",n:"Proyecto Final",w:30}]}},
fil:{n:"Filosofía",pre:"",gp:2,nz:1,rf:1,i:"No hay examen parcial ni final. El curso tiene 3 unidades: la Unidad 1 pesa 25% (PC1 15% y Nota de Trabajo 10%), la Unidad 2 pesa 35% (PC2 25% y Nota de Trabajo 10%) y la Unidad 3 pesa 40% (PC3 30% y Nota de Trabajo 10%). Los porcentajes que ves en cada evaluación son sobre el total del curso. El promedio final se redondea al entero (el .5 sube).",root:{ch:[
 {id:"u1",n:"Unidad 1",w:25,ch:[{id:"pc1",n:"PC1",w:60},{id:"nt1",n:"Nota de Trabajo 1",s:"NT1",w:40}]},
 {id:"u2",n:"Unidad 2",w:35,ch:[{id:"pc2",n:"PC2",w:2500/35},{id:"nt2",n:"Nota de Trabajo 2",s:"NT2",w:1000/35}]},
 {id:"u3",n:"Unidad 3",w:40,ch:[{id:"pc3",n:"PC3",w:75},{id:"nt3",n:"Nota de Trabajo 3",s:"NT3",w:25}]}]}},
rce:{n:"Religiones, Culturas y Economía",pre:"",gp:2,rf:1,i:"Trabajos pesa 50% y se arma con Controles (20%, dos controles que valen lo mismo: 10% cada uno), Trabajos Colaborativos (20%) y Asistencia y Participación (10%). El Examen Parcial pesa 20% y el Examen Final 30%. Trabajos Colaborativos y Asistencia y Participación se ingresan como una sola nota cada uno. Trabajos, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"tr",n:"Trabajos",w:50,r:1,ch:[
  {id:"ct",n:"Controles",w:40,ch:[{id:"c1",n:"Control 1",s:"C1",w:50},{id:"c2",n:"Control 2",s:"C2",w:50}]},
  {id:"tc",n:"Trabajos Colaborativos",s:"Colaborativos",w:40,b:1},
  {id:"ap",n:"Asistencia y Participación",s:"Asist. y Part.",w:20,b:1}]},
 {id:"pa",n:"Examen Parcial",w:20,r:1},{id:"fi",n:"Examen Final",w:30,r:1}]}}
,
ipfe:{n:"Introducción a la Política, Filosofía y Economía",pre:"",rf:1,i:"El Examen Parcial y el Examen Final pesan 35% cada uno. Los tres análisis de casos (filosófico, político y económico) pesan 10% cada uno. El parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"pa",n:"Examen Parcial",w:35,r:1},{id:"fi",n:"Examen Final",w:35,r:1},
 {id:"af",n:"Análisis Filosófico de Casos",s:"Filosófico",w:10},
 {id:"ap",n:"Análisis Político de Casos",s:"Político",w:10},
 {id:"ae",n:"Análisis Económico de Casos",s:"Económico",w:10}]}}
,
cdc:{n:"Comportamiento del Consumidor",pre:"",rf:1,i:"Trabajo y Participación pesa 50% y se forma con Casos Prácticos (25% del curso), Participación y dinámicas en clase (15%) y 2 controles (5% cada uno, 10% en total). El Examen Parcial pesa 30% y el Trabajo Final 20%. Trabajo y Participación, el parcial, el trabajo final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Trabajo y Participación",s:"Trabajo",w:50,r:1,ch:[
  {id:"cp",n:"Casos Prácticos",s:"Casos",w:50},
  {id:"pd",n:"Participación y Dinámicas en Clase",s:"Particip.",w:30},
  {id:"ct",n:"Controles",w:20,ch:[{id:"c1",n:"Control 1",s:"C1",w:50},{id:"c2",n:"Control 2",s:"C2",w:50}]}]},
 {id:"pa",n:"Examen Parcial",w:30,r:1},
 {id:"tf",n:"Trabajo Final",w:20,r:1}]}},
gdp:{n:"Gestión de Personas",pre:"",rf:1,i:"La Nota de Trabajo pesa 45%, el Examen Parcial 20% y el Examen Final 35%. La Nota de Trabajo reúne Participación (40%), Casos y trabajos en clase (25%), Exposición de temas (10%), Trabajo de investigación individual (10%) y grupal (15%). El Examen Final se forma con el trabajo final escrito, la exposición del trabajo final y el examen oral. La Nota de Trabajo, el parcial, el final y el promedio final se redondean al entero (el .5 sube).",root:{ch:[
 {id:"nt",n:"Nota de Trabajo",w:45,r:1,ch:[
  {id:"pp",n:"Participación",s:"Participación",w:40},
  {id:"ca",n:"Casos y Trabajos en Clase",s:"Casos",w:25},
  {id:"ex",n:"Exposición de Temas",s:"Expo",w:10},
  {id:"ti",n:"Trabajo de Investigación (Individual)",s:"TI",w:10},
  {id:"tg",n:"Trabajo de Investigación (Grupal)",s:"TG",w:15}]},
 {id:"pa",n:"Examen Parcial",w:20,r:1},
 {id:"fi",n:"Examen Final",w:35,r:1,ch:[
  {id:"tw",n:"Trabajo Final Escrito",s:"Trabajo",w:30},
  {id:"ef",n:"Exposición del Trabajo Final",s:"Exposición",w:20},
  {id:"eo",n:"Examen Oral",s:"Oral",w:50}]}]}}
};
