# Memoria histórica — GesFact 2.4

| Campo | Valor |
|---|---|
| Fecha de elaboración | 13/11/2026 |
| Versión del código analizada | commit `393c211` (rama `master`). El código fuente no ha cambiado desde `1f35d01` |
| Fuentes | Todos los comentarios de los `.js`, `.ejs`, `.css` y `.sql`; `LEEME.txt`; `package.json`; textos de ayuda visibles en las vistas (`class="nota"`, pie); observaciones de las facturas de la semilla (`db.js`) |
| Datos reales consultados | **Ninguno.** No se ha abierto ninguna base de datos |
| Alcance | Solo registro. No se propone ni se corrige nada (Principio III de la constitución) |
| Documentos relacionados | [Mapa del sistema](mapa-sistema.md) (ANO-001 a 031, P-01 a 12), [ciclo de vida de una factura](flujo-factura.md) (ANO-032 a 042, P-13 a 16), [registro de riesgos](registro-riesgos.md) (ANO-043 a 056, P-17 a 20) |

**Convenciones.**

- **Lo que prueba un comentario.** Un comentario demuestra que alguien escribió esa frase en ese sitio, pero
  no que el hecho ocurriera tal como lo cuenta. Por eso todos los hechos de este documento son **«según el
  comentario»**. Pasarán a ser testimonio del negocio cuando alguien con nombre los confirme, con fecha, en
  respuesta a la pregunta de su entrada.
- **Fecha aproximada**: la que da el propio comentario. Cuando no da ninguna, se deduce de otra fuente
  (se indica cuál) o se marca **SUPOSICIÓN** o «sin fecha».
- **Tipo**: **INCIDENTE** (algo salió mal), **DECISIÓN** (regla de negocio o técnica atribuida a alguien),
  **NO TOCAR** (advertencia explícita), **ABANDONADO** (trabajo empezado o pendiente que no se terminó),
  **HITO** (versión o cambio de tecnología) y **PROCEDIMIENTO** (tarea manual que el sistema da por hecha).
- **Pregunta**: las preguntas nuevas continúan la numeración de los documentos anteriores, de **P-21 a
  P-41** (apartado 6). Si la pregunta ya existe, se cita su número.
- No se copia ningún valor de `config.js` (credenciales ni clave de la gestoría), aunque haya comentarios al
  lado.

---

## 1. Personas que aparecen en los comentarios

Los papeles se deducen de lo que dicen los comentarios. Lo que no consta se marca **SUPOSICIÓN**.

| Persona | Papel según los comentarios | Evidencia | Lo que no consta |
|---|---|---|---|
| **Julián** | Autor del programa (de la 2.0 en 2017 en adelante) y del `LEEME.txt`. También grababa facturas (en 2018 y en 2021, a la vez que Marga). El pie de todas las pantallas lo da como contacto de soporte (ext. 22) | `package.json:9`; `server.js:7`; `LEEME.txt:20`; `db.js:2-3`; `lib/numeracion.js:8-10`; `views/pie.ejs:2` | Si sigue en la empresa y da soporte (P-08) |
| **Marga** | Administración. Graba facturas, da de alta clientes y revisa los NIF a ojo, lanza la remesa el día 1 desde su ordenador, envía las facturas por su Outlook y hace la copia de seguridad de los viernes | `db.js:3`; `lib/util.js:42-43`; `routes/clientes.js:16`; `scripts/remesa_mensual.js:7`; `views/index.ejs:9-10`; `services/email.js:4-5`; `LEEME.txt:18` | Quién la sustituye (P-40) |
| **Puri** | Gestoría (lleva el Contaplus). Impuso el redondeo línea a línea, el descuento desglosado por línea, el formato del CSV y la rectificativa «espejo» | `services/calculo.js:3-6,63-64`; `routes/informes.js:32-33`; `routes/facturas.js:127-128` | — |
| **Paco** | Acordó el descuento por volumen en 2018 y prorrateaba las cuotas a mano en el Access. **SUPOSICIÓN**: es quien decide la política comercial (¿gerente, propietario?) | `services/calculo.js:38,91-92` | Su cargo (P-08) |
| **Roberto** | Becario. En verano de 2021 hizo la remesa mensual, el autorrelleno de precios y retoques de estilo, y empezó el módulo de albaranes, que quedó a medias en su ordenador | `scripts/remesa_mensual.js:6`; `public/js/factura.js:2`; `public/css/estilos.css:1`; `LEEME.txt:15-16` | Si vuelve «en campaña» y qué es la campaña (P-09, P-41) |
| **Manoli** | Hay que hablar con ella antes de tocar el correo. El motivo no consta | `config.js:27-28`; `services/email.js:6` | Su cargo y por qué decide sobre el correo (P-08, P-33) |
| Terceros | La gestoría (sin nombre de empresa), Arsys (proveedor de correo) y «la inspección de 2020» (organismo sin identificar) | `services/calculo.js:4`; `services/email.js:3`; `lib/numeracion.js:4` | Qué organismo hizo la inspección (P-30) |

---

## 2. Cronología

Ordenada por fecha aproximada. Las entradas sin fecha van al final (H-21 a H-27).

| ID | Fecha aprox. | Tipo | Qué pasó o qué se decidió (según el comentario) | Quién | Dónde | Pregunta al negocio |
|---|---|---|---|---|---|---|
| H-01 | Antes de 2017 | HITO / DECISIÓN | Existía un GesFact 1.x en Access. Paco prorrateaba las cuotas a mano «a lo comercial» (mes de 30 días), «y así lo espera la gestoría». Algunas utilidades de la 2.x se trajeron de aquel Access | Paco, la gestoría, Julián | `services/calculo.js:90-93`; `server.js:7`; `lib/util.js:2` | **P-21** (Paco): cómo prorrateaba exactamente (febrero, día 31). Relacionada con P-04, ANO-007 y ANO-043 |
| H-02 | Antes de 2017. **SUPOSICIÓN**: ejercicios con tipos de IVA del 16/18 % y del 7/8 %, ya derogados | NO TOCAR | Se conservan los recargos de esos tipos antiguos «por si hay que reabrir ejercicios viejos del Access». No borrar | No consta | `services/calculo.js:15-21` | **P-22** (Paco y Puri): si el Access y sus datos siguen existiendo y si alguna vez se ha reabierto un ejercicio |
| H-03 | 2017 | HITO | Versión 2.0: Julián reescribe el programa en Node | Julián | `server.js:7`; `public/css/estilos.css:1`; `package.json:9` | **P-22**: si los datos del Access pasaron a la 2.0 |
| H-04 | 11/2017 | DECISIÓN / ABANDONADO | El NIF solo se valida por longitud. La letra de control queda pendiente («de momento») porque los clientes los da de alta Marga y los mira ella. Nunca se completó | Julián, Marga | `lib/util.js:41-43`; `routes/clientes.js:16` | **P-23** (Marga): si sigue comprobando la letra y quién da de alta clientes cuando ella no está. Relacionada con ANO-018 |
| H-05 | 2018 | DECISIÓN | Descuento por volumen: 2 % por encima de 1.000 € de base y 5 % por encima de 5.000 €, «acordado con Paco para fidelizar hostelería». Sin fecha, y comentado con la gestoría: una base de 1.000 € justos **no** lleva descuento | Paco, la gestoría | `services/calculo.js:36-38`; `db.js:138` | **P-24** (Paco): si sigue vigente y si es solo para hostelería (el código lo aplica a todos los clientes). Relacionadas: ANO-023 y P-14 |
| H-06 | 2018 | DECISIÓN | El descuento se aplica línea a línea, «para que la gestoría lo vea desglosado igual» | Puri | `services/calculo.js:63-64` | **P-25** (Puri): si la forma actual de calcularlo es la que se pidió |
| H-07 | 03/2018 | INCIDENTE / HITO | Los datos, guardados en ficheros `.json`, «se corrompían» cuando Marga y Julián grababan a la vez. Se pasa a SQLite (v2.2). Desde entonces las fechas se guardan como `AAAA-MM-DD` | Julián, Marga | `db.js:2-4`; `server.js:6`; `lib/util.js:9`; `config.js:19` | **P-26** (Marga): si se perdieron datos y si todo lo de 2017-2018 pasó a SQLite |
| H-08 | 10/2018 | ABANDONADO | Volcado de prueba para migrar a MySQL «del servidor nuevo». «NUNCA SE LLEGÓ A EJECUTAR». El esquema está desfasado (sin recargo ni rectificativas). «SIN PRISA, sqlite va bien» | Julián | `datos/migracion_mysql_2018.sql:1-3`; `LEEME.txt:12-13`; `db.js:3-4`; `config.js:19` | **P-27** (responsable del proyecto): si el servidor nuevo existe y si la migración se da por abandonada |
| H-09 | 2019 | HITO / DECISIÓN / NO TOCAR | v2.3: informes de IVA y exportación para la gestoría. Formato del CSV «acordado con Puri en 2019»: punto y coma, coma decimal y la clave en la primera línea. La clave que pide la gestoría: «no cambiar» | Puri, Julián | `server.js:5`; `routes/informes.js:32-33`; `config.js:36` | **P-28** (Puri): si hay especificación escrita del formato y cómo lo importa Contaplus |
| H-10 | 03/2019 | INCIDENTE | El vencimiento de una factura salió con un día menos. Julián lo atribuye al cambio de hora y no lo reprodujo. Sigue como TODO | Julián | `lib/util.js:17-19` | **P-12** (ya existe). Relacionada con ANO-030 y R27 |
| H-11 | 11/03/2019 «(aprox)» | HITO | Fecha de la última actualización del `LEEME.txt` firmada por Julián. **Contradicción**: el mismo fichero cita hechos de 2021 (albaranes) y 2022 (Arsys), así que alguien lo editó después sin cambiar la fecha | Julián, ¿otra persona? | `LEEME.txt:14-16,20` | **P-29** (responsable del proyecto): quién lo actualizó y si hay otra documentación |
| H-12 | 05/2019 | INCIDENTE / NO TOCAR | Julián cambia el redondeo para hacerlo sobre la base total y Puri devuelve «todo el trimestre», porque su Contaplus cuadra línea a línea. Se deshace el cambio: «NO CAMBIAR LA FORMA DE REDONDEAR» | Julián, Puri | `services/calculo.js:2-7,25` | **P-30** (Puri): qué trimestre fue, cómo se rehicieron las facturas y si quedan en la BD facturas con el otro redondeo |
| H-13 | 2020 | INCIDENTE / DECISIÓN / NO TOCAR | Tras «la inspección de 2020», las facturas «NO SE BORRAN NUNCA». Los errores se corrigen con una rectificativa de serie RE y una factura nueva. **SUPOSICIÓN**: antes de 2020 sí se borraban facturas | No consta (¿Hacienda?) | `lib/numeracion.js:3-6` | **P-31** (Paco o quien atendió la inspección): qué organismo, qué se detectó y si hay huecos de numeración anteriores |
| H-14 | 02/01/2021 | INCIDENTE | Salieron dos facturas con el mismo número porque Marga y Julián grababan a la vez. Julián «puso el último+1 leyendo justo antes de grabar» y «no ha vuelto a pasar (creo)». El código actual sigue sin transacción (ANO-001) | Julián, Marga | `lib/numeracion.js:8-10` | **P-32** (Marga): qué números se duplicaron, cómo se resolvió y si ha vuelto a pasar. Comprobar en una copia de la BD |
| H-15 | 2021 | ABANDONADO / HITO | Roberto empieza un módulo de albaranes que queda «a medias en su ordenador» («preguntarle si vuelve en campaña»). Ese año también añade el autorrelleno de precio e IVA (antes se copiaba a mano) y retoca los estilos | Roberto | `LEEME.txt:15-16`; `public/js/factura.js:2`; `public/css/estilos.css:1` | **P-09** (ya existe) y **P-41** (Paco / Marga): qué debía hacer y cómo se gestionan hoy los albaranes |
| H-16 | Verano de 2021 | HITO / DECISIÓN / PROCEDIMIENTO | v2.4: Roberto añade la remesa mensual «para no meter las cuotas a mano cada mes». Prorratea por días reales del mes, no a 30 días como Paco (H-01). Se lanza el día 1 desde el ordenador de Marga | Roberto, Marga | `scripts/remesa_mensual.js:1-7,43-44`; `server.js:4`; `views/index.ejs:9-10` | **P-33** (responsable del proyecto / Roberto): quién decidió los días reales y si se contrastó con la gestoría. Relacionadas: P-04, P-06 y ANO-007 |
| H-17 | 2022 | INCIDENTE / NO TOCAR / ABANDONADO | Arsys cambió su servidor de correo y dejó de autenticar. El envío por email queda «FUERA DE SERVICIO» y las facturas se mandan a mano desde el Outlook de Marga, imprimiendo la vista a PDF. «Hablar con Manoli antes de tocar nada de esto». Arreglarlo sigue en PENDIENTE | Arsys, Marga, Manoli | `services/email.js:3-6`; `config.js:27-28`; `LEEME.txt:14` | **P-34** (Manoli): qué cambió y por qué hay que consultarla. Relacionadas: P-18 y ANO-054 |
| H-18 | 2023 | DECISIÓN | Se desinstala `nodemailer` porque «daba un aviso de seguridad». El código de envío se deja comentado | No consta | `services/email.js:8,12-25` | **P-35** (responsable del proyecto): quién lo hizo y si el puesto de la oficina tiene otros cambios que no están en el repositorio. Relacionadas: P-11 y ANO-027 |
| H-19 | 30/04/2026 – 06/05/2026 (fechas de la semilla) | INCIDENTE | FA-2026-000106 (remesa de abril) queda anotada como «ERROR cuota duplicada». El 06/05/2026 se rectifica con RE-2026-000001 y se emite FA-2026-000107, «Sustituye a FA-2026-000106». **Rareza**: FA-107 es idéntica a FA-106 (mismas líneas e importes), así que no se ve qué se corrigió (ANO-057, propuesta) | No consta (**SUPOSICIÓN**: administración) | `db.js:156-166` | **P-36** (Marga). Relacionadas: P-05, P-15, P-20, ANO-009 y ANO-039 |
| H-20 | Después del 31/05/2026 (**SUPOSICIÓN**: fecha de la última factura de la semilla) | NO TOCAR | Los datos semilla son «los que había en el sistema cuando se hizo la copia». No tocarlos, porque «administración los usa de referencia» | Administración | `db.js:91-92,168` | **P-37** (Marga): cuándo y quién hizo la copia y para qué la usa |
| H-21 | Sin fecha | INCIDENTE | Al grabar una factura falló una línea a mitad. «Ya se apañó en su día a mano en la BD, no ha vuelto a pasar» | No consta | `routes/facturas.js:81-82` | **P-38** (Marga): qué factura fue, qué se cambió a mano y quién puede editar la BD directamente. Relacionada con ANO-004 |
| H-22 | Sin fecha (**SUPOSICIÓN**: igual o posterior a 2020, por H-13) | DECISIÓN / NO TOCAR | La rectificativa no recalcula nada: invierte lo que hay, porque «tiene que ser espejo exacto de la original» («Puri dixit») | Puri | `routes/facturas.js:124-128` | **P-39** (Puri): si se admiten rectificativas parciales y qué hacer cuando la original estaba mal calculada |
| H-23 | Sin fecha | NO TOCAR / PROCEDIMIENTO | `config.js` «se copia a mano al servidor de la oficina» cada vez que se cambia algo. «NO RENOMBRAR». **Contradicción**: la ruta es `\\SERVIDOR\gesfact` y el `LEEME.txt` da `\\SERVIDOR\compartido\gesfact` (ANO-058, propuesta) | No consta | `config.js:1-3`; `LEEME.txt:6` | **P-40** (Marga): cuál es la ruta real, quién copia el fichero y si coincide con el repositorio. Relacionada con P-01 |
| H-24 | Sin fecha (**SUPOSICIÓN**: igual o posterior a 2021, ya con la remesa) | PROCEDIMIENTO | Si un contrato se da de baja a mitad de mes, administración emite después a mano la factura del prorrateo, con el importe que aparece en la barra de direcciones | Administración | `routes/contratos.js:28-30`; `views/contratos.ejs:17` | **P-03** (ya existe). Relacionadas: ANO-008 y ANO-022 |
| H-25 | Sin fecha (`LEEME.txt` fechado en 2019) | PROCEDIMIENTO | Copia de seguridad: Marga copia `datos/gesfact.db` a un pendrive los viernes | Marga | `LEEME.txt:18` | **P-19** (ya existe). Relacionada con ANO-047 |
| H-26 | Sin fecha | ABANDONADO | `routes/facturas.js` «se ha ido haciendo grande, algún día habría que partirlo. "Algún día"» | Julián | `routes/facturas.js:1-3` | Ninguna (deuda técnica, sin decisión de negocio) |
| H-27 | Sin fecha | PROCEDIMIENTO | «Ante cualquier problema llamar a Julián (ext. 22)», en el pie de todas las pantallas | Julián | `views/pie.ejs:2` | **P-08** (ya existe) |

---

## 3. Advertencias «no tocar»

| Advertencia | Motivo declarado | Entrada | Evidencia | ¿El código actual la cumple? |
|---|---|---|---|---|
| No cambiar la forma de redondear (línea a línea) | El Contaplus de la gestoría cuadra por línea. Un cambio en 2019 provocó la devolución de un trimestre | H-12 | `services/calculo.js:3-7` | Sí, en el cálculo. Pero `redondear2` usa coma flotante (ANO-025) y el informe de IVA y el CSV suman de fuentes distintas (ANO-014) |
| Facturas que no se borran nunca; numeración correlativa y sin huecos | Obligación legal, a raíz de la inspección de 2020 | H-13 | `lib/numeracion.js:3-6` | No hay ninguna ruta de borrado. Sí puede haber huecos y duplicados (ANO-001, ANO-002, ANO-003) |
| La rectificativa no se recalcula, se invierte | «Espejo exacto de la original» (Puri) | H-22 | `routes/facturas.js:127-128` | Sí (`routes/facturas.js:142,150`) |
| No cambiar la clave de exportación de la gestoría | La exige la gestoría | H-09 | `config.js:36` | Sí. La clave está en claro (ANO-016, ANO-051) |
| No renombrar `config.js` | Se copia a mano al servidor de la oficina | H-23 | `config.js:2-3` | Sí. Hay dos rutas de servidor distintas (ANO-058) |
| Hablar con Manoli antes de tocar el correo | No consta | H-17 | `config.js:27-28`; `services/email.js:6` | El envío sigue desactivado |
| No borrar los tipos de IVA antiguos (16/18/7/8) | Reabrir ejercicios viejos del Access | H-02 | `services/calculo.js:15-17` | Sí, pero la pantalla solo ofrece 21/10/4 (`views/factura_nueva.ejs:18`) |
| No tocar los datos semilla | Administración los usa de referencia | H-20 | `db.js:91-92` | Sí. Las cabeceras no cuadran con sus líneas (ANO-013) |
| Cuidado al tocar las utilidades | Vienen del Access 1.x | H-01 | `lib/util.js:2` | — |
| Base de 1.000 € justos sin descuento | Caso comentado con la gestoría | H-05 | `db.js:138` | Sí (`services/calculo.js:40-41`). El comentario de la función dice «a partir de» (ANO-023) |

---

## 4. Trabajos abandonados o pendientes

| Trabajo | Desde | Quién | Estado en el repositorio | Evidencia | Pregunta |
|---|---|---|---|---|---|
| Migración a MySQL | 10/2018 | Julián | Volcado de prueba con dos tablas, nunca ejecutado y desfasado | `datos/migracion_mysql_2018.sql:1-5`; `LEEME.txt:12-13` | P-27 |
| Validar la letra del NIF | 11/2017 | Julián | TODO. Solo se comprueba la longitud | `lib/util.js:42-43` | P-23 |
| Desfase de un día en el vencimiento | 03/2019 | Julián | TODO. No se reprodujo | `lib/util.js:18-19` | P-12 |
| Módulo de albaranes | 2021 | Roberto | No hay ni una línea en el repositorio. «A medias en su ordenador» | `LEEME.txt:15-16` | P-09, P-41 |
| Envío de facturas por email | 2022 | — | Desactivado. Código comentado y dependencia desinstalada en 2023 | `services/email.js:3-8,12-28`; `LEEME.txt:14` | P-34, P-35 |
| Partir `routes/facturas.js` | Sin fecha | Julián | Solo la intención | `routes/facturas.js:2-3` | — |

---

## 5. Patrones y contradicciones de la cronología

1. **La concurrencia se repite como causa de incidentes.** En 2018 se corrompieron los datos (H-07) y en
   2021 salieron números duplicados (H-14), las dos veces «porque Marga y yo grabamos a la vez». Ninguna de
   las dos soluciones que cuentan los comentarios elimina el problema de fondo (ANO-001, ANO-046). Hoy la
   remesa y la web pueden escribir a la vez (R19).
2. **«No ha vuelto a pasar»** aparece dos veces sin registro que lo respalde (`lib/numeracion.js:10`, con
   «creo», y `routes/facturas.js:82`). Esas frases no pueden usarse como evidencia de que el riesgo no
   existe.
3. **La gestoría manda sobre el cálculo.** Cuatro decisiones de Puri (H-06, H-09, H-12, H-22) fijan
   redondeo, desglose, formato de exportación y rectificativas. La regla del prorrateo «que espera la
   gestoría» (H-01) es la única que el código incumple en un camino (la remesa, H-16; ANO-007).
4. **Muchas tareas dependen de Marga**: revisar los NIF, lanzar la remesa, enviar las facturas, emitir los
   prorrateos de baja y hacer las copias (H-04, H-16, H-17, H-24, H-25). Ningún comentario dice quién la
   sustituye (P-40).
5. **Documentación con fechas que no encajan**: el `LEEME.txt`, fechado en 2019, cita hechos de 2021 y 2022
   (H-11). Además da dos rutas distintas para la carpeta del servidor (H-23) y manda instalar Node 8, que es
   incompatible con las dependencias actuales (R10).
6. **El único incidente con datos (H-19) no se explica solo.** La factura que sustituye a la errónea es
   idéntica a ella.
7. **Hay un hueco entre 2023 y 2026**: ningún comentario fechado cubre ese periodo. **SUPOSICIÓN**: no se ha
   tocado el código desde 2023, o se tocó sin dejar comentarios (P-35).

### 5.1 Hallazgos nuevos para el registro de anomalías (propuestos)

| ID | Tipo | Severidad | Descripción | Evidencia | Impacto |
|---|---|---|---|---|---|
| ANO-057 | RAREZA | MEDIA | FA-2026-000107, que «sustituye» a FA-2026-000106 por «cuota duplicada», tiene las mismas líneas, importes y concepto «(abril)» que la factura rectificada. La corrección no cambió nada visible | `db.js:156-158,164-166` | No se puede saber qué error se corrigió. Si la duplicada era otra factura del mismo mes, podría seguir viva (**SUPOSICIÓN**; P-36) |
| ANO-058 | RAREZA | BAJA | Dos rutas distintas para la carpeta del programa en el servidor: `\\SERVIDOR\gesfact` y `\\SERVIDOR\compartido\gesfact` | `config.js:2`; `LEEME.txt:6` | Riesgo de copiar `config.js` o instalar desde una copia que no es la buena |

---

## 6. Preguntas para el negocio

Continúan desde P-21. Cuando se respondan, cada respuesta se incorpora como testimonio (nombre y fecha) y
sustituye al «según el comentario» de su entrada.

| ID | Pregunta | Destinatario | Entradas / ANO |
|---|---|---|---|
| P-21 | Cuando prorrateaba las cuotas a mano en el Access, ¿cómo trataba febrero y el día 31? ¿Cobraba (cuota / 30) × días también en febrero? | Paco | H-01; ANO-007, ANO-043 |
| P-22 | ¿Sigue existiendo el GesFact 1.x en Access con sus datos? ¿Hay que conservarlo? ¿Se ha reabierto alguna vez un ejercicio antiguo (IVA 16/18/7/8)? ¿Los datos del Access pasaron a la versión 2.0 en 2017? | Paco y Puri (gestoría) | H-02, H-03 |
| P-23 | ¿Sigue comprobando a mano la letra de cada NIF nuevo? ¿Quién da de alta clientes cuando usted no está? | Marga | H-04; ANO-018 |
| P-24 | ¿Sigue vigente el descuento por volumen de 2018? ¿Es solo para hostelería? El programa lo aplica a cualquier cliente, incluidos los de recargo de equivalencia, como la ferretería | Paco | H-05; ANO-023, P-14 |
| P-25 | El programa rebaja el precio unitario de cada línea, lo redondea y recalcula la línea. ¿Es así como pidió en 2018 ver el descuento desglosado? | Puri (gestoría) | H-06 |
| P-26 | En marzo de 2018, al pasar de ficheros a SQLite, ¿se perdieron facturas o clientes? ¿Se pasó todo lo de 2017-2018? | Marga | H-07 |
| P-27 | ¿Existe todavía el «servidor nuevo» con MySQL? ¿La migración sigue en los planes o se da por abandonada? | Responsable del proyecto | H-08 |
| P-28 | ¿Hay un documento con el formato del CSV que se acordó en 2019? ¿Contaplus lo importa directamente? ¿Qué pasaría si cambiara una columna o el orden? | Puri (gestoría) | H-09 |
| P-29 | ¿Quién ha editado el `LEEME.txt` después de 2019? ¿Hay otra documentación (notas de Julián, manual de administración)? | Responsable del proyecto | H-11 |
| P-30 | En mayo de 2019 devolvió un trimestre por el redondeo: ¿cuál? ¿Cómo se rehicieron esas facturas? ¿Quedan en la base de datos facturas calculadas con el otro redondeo? | Puri (gestoría) | H-12; ANO-013 |
| P-31 | ¿Qué organismo hizo la inspección de 2020 y qué detectó? ¿Se habían borrado facturas antes? ¿Hay un acta o requerimiento con obligaciones que el programa deba cumplir? | Paco (o quien atendiera la inspección) | H-13; ANO-001 a 003 |
| P-32 | El 2 de enero de 2021 salieron dos facturas con el mismo número: ¿cuál era? ¿Cómo se corrigió? ¿Ha vuelto a pasar desde entonces? | Marga (y comprobar en una copia de la BD) | H-14; ANO-001 |
| P-33 | ¿Quién decidió que la remesa prorratee por días reales del mes y no a 30 días? ¿Se contrastó con la gestoría? | Responsable del proyecto (para trasladar a Roberto) | H-16; P-04, ANO-007 |
| P-34 | ¿Qué cambió exactamente en Arsys en 2022? ¿Por qué hay que consultarle antes de reactivar el correo? ¿Hay planes de volver a enviar facturas desde el programa? | Manoli | H-17; P-18, ANO-054 |
| P-35 | ¿Quién desinstaló `nodemailer` en 2023 y por qué aviso? ¿Se ha cambiado algo más en el equipo de la oficina que no esté en el repositorio? | Responsable del proyecto | H-18; P-11, ANO-027 |
| P-36 | FA-2026-000106 se rectificó por «cuota duplicada», pero la que la sustituye, FA-2026-000107, es idéntica. ¿Qué estaba duplicado? ¿Se lanzó dos veces la remesa de abril? ¿Hay otra factura de abril de 2026 para el Bar Nuevo Siglo? | Marga | H-19; ANO-057, ANO-009, P-20 |
| P-37 | ¿Cuándo y quién hizo la copia de datos que se usa como semilla? ¿Para qué la usa administración «de referencia»? | Marga | H-20; P-05 |
| P-38 | ¿Qué factura se quedó con las líneas a medias y qué se cambió a mano en la base de datos? ¿Quién tiene acceso para editarla directamente y con qué herramienta? | Marga | H-21; ANO-004 |
| P-39 | ¿Se admiten rectificativas parciales (por ejemplo, de una sola línea)? Si la original estaba mal calculada, ¿la rectificativa debe seguir siendo su espejo exacto? | Puri (gestoría) | H-22; ANO-005, ANO-020 |
| P-40 | ¿Cuál es la ruta real del programa en el servidor? ¿Quién copia `config.js` y cuándo lo hizo por última vez? ¿Y quién lanza la remesa, envía las facturas, emite los prorrateos de baja y hace la copia de los viernes cuando Marga no está? | Marga | H-23, H-04, H-16, H-17, H-24, H-25; ANO-058, P-01 |
| P-41 | ¿Qué tenía que hacer el módulo de albaranes de Roberto? ¿Se sigue necesitando? ¿Cómo se llevan hoy los albaranes? ¿Qué es «la campaña» en la que podría volver Roberto? | Paco y Marga | H-15; P-09 |
