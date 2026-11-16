# Registro de anomalías — GesFact 2.4 (Suministros Hidalgo S.L.)

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `5f2e06e` (rama `master`). El código fuente no ha cambiado desde `1f35d01` |
| Fuentes consolidadas | [Mapa del sistema](mapa-sistema.md) (ANO-001 a 031, P-01 a 12), [ciclo de vida de una factura](flujo-factura.md) (ANO-032 a 042, P-13 a 16), [registro de riesgos](registro-riesgos.md) (R1 a R33, ANO-043 a 056, P-17 a 20), [memoria histórica](memoria-historica.md) (H-01 a H-27, ANO-057 y 058, P-21 a 41), [reglas de negocio](reglas-de-negocio.md) (RN-01 a RN-55, ANO-059 a 066, P-42 a 47) y las 14 contradicciones (`contradiccion-01` a `contradiccion-14`; ANO-067 a 071, P-48 a 58) |
| Fuentes pedidas que **no existen** | `entrevista-negocio.md` y cualquier resultado de arqueología de datos. Búsqueda de ficheros con «entrevista», «arqueolog» o «anomal» en todo el repositorio, sin resultados (16/11/2026). `datos/` solo contiene `migracion_mysql_2018.sql` |
| Datos reales consultados | **Ninguno.** No hay copia de `datos/gesfact.db` de producción |
| Testimonios del negocio recogidos | **Ninguno.** El [acta simulada del 16/11/2026](entrevista-negocio-simulada.md) se propagó el 16/11/2026, pero no aporta testimonio: ninguna persona de la empresa participó (acta §0). Ver apartado 5 |
| Alcance | Consolidación y clasificación. No se corrige nada (Principios I y III de la constitución) |

---

## 0. Cómo leer este registro

### 0.1 Resultado en una frase

**Las 62 anomalías quedan PENDIENTES.** Ninguna tiene testimonio del negocio ni veredicto de los datos, porque
todavía no se ha entrevistado a nadie ni se ha examinado una copia de la base de datos de producción. El
apartado 3 es, por tanto, la agenda de la próxima conversación con el negocio y de la primera sesión de
arqueología de datos.

**Actualización del 16/11/2026.** Se propagó al registro el [acta simulada](entrevista-negocio-simulada.md).
Sus respuestas son suposiciones del consultor o testimonio simulado, así que no cuentan como testigo NEGOCIO.
**No se cierra ninguna entrada: siguen 62 PENDIENTES.** Cada entrada afectada lleva ahora en su evidencia la
respuesta prevista, marcada como SUPOSICIÓN. El apartado 5 registra la revisión entrada por entrada.

### 0.2 Los tres testigos

| Testigo | Qué cuenta | Qué **no** cuenta |
|---|---|---|
| **CÓDIGO** | Fichero y líneas; comentarios del código; ejecuciones del código real en memoria o sobre una BD temporal creada con la semilla (método de la [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) | — |
| **DATOS** | Consulta sobre una **copia fechada de la BD de producción**, o un fichero real ya entregado (por ejemplo, un CSV recibido por la gestoría) | La semilla de `db.js:93-180`: no consta que sea de producción (ANO-013, P-05). Lo que se ejecuta sobre ella es verificación del código, así que cuenta como CÓDIGO |
| **NEGOCIO** | Testimonio con nombre, fecha y contenido (Principio II) | Lo que un comentario atribuye a alguien («Puri dixit», «acordado con Paco»). Lo escribió otra persona y no está fechado: cuenta como CÓDIGO hasta que la persona lo confirme ([memoria histórica](memoria-historica.md), convenciones) |

### 0.3 Clasificaciones y criterio de cierre

| Clasificación | Significado en este registro |
|---|---|
| **INTENCIONAL** | Decisión deliberada que el sistema debe conservar. Incluye las «anomalías positivas»: reglas protegidas con historia de incidente |
| **ACCIDENTAL** | Efecto colateral de cómo está programado, que nadie buscó, pero que no da un resultado incorrecto para el negocio |
| **BUG HISTÓRICO CON DEPENDIENTES** | Resultado incorrecto que ya ha producido documentos, ficheros o procesos de los que alguien depende |
| **BUG A SECAS** | Resultado incorrecto (o riesgo) del que no depende nadie |
| **PENDIENTE** | No se puede cerrar todavía. Se indica la hipótesis que apunta el código y la pregunta exacta que lo desbloquea |

**Criterio aplicado**, tal como se pidió:

1. Nada se clasifica como INTENCIONAL sin al menos dos de los tres testigos a favor.
2. Si falta el testimonio del negocio o el veredicto de los datos, la clasificación queda PENDIENTE. Distinguir
   entre «con dependientes» y «a secas» exige saber si ya hay documentos emitidos, así que la regla también se
   aplica a las clases de bug.
3. **Única excepción**: cuando el comportamiento no deja rastro en la BD (por ejemplo, una fila del formulario
   que se descarta y nunca se graba), el veredicto de los datos es imposible. En esos casos basta con CÓDIGO y
   NEGOCIO, y se indica en la entrada.

Como hoy ninguna entrada tiene NEGOCIO ni DATOS, **ninguna puede cerrarse**. La «hipótesis» de cada entrada es
lo que apunta el código y sirve para preparar la entrevista. **No es una clasificación y no autoriza nada.**

### 0.4 Tratamiento

En esta fase el tratamiento es el mismo para todas: **se caracteriza el comportamiento actual tal cual**, con
tests que citen su `ANO-NNN` (Principio III). El campo «Tratamiento propuesto» se refiere a la fase de
modernización y usa tres valores: **especificar tal cual**, **documentar sin especificar** o **corregir en fase
de modernización** (con precauciones y con indicación de si la corrección puede ser retroactiva). Es una
propuesta: **nada está acordado** mientras la clasificación siga PENDIENTE. Por la regla de no borrar facturas
(A-07), **ninguna corrección puede ser retroactiva sobre facturas ya emitidas**. Lo emitido solo se corrige con
una rectificativa, caso a caso y por decisión del negocio.

### 0.5 Identificadores

Cada entrada `A-NN` agrupa uno o varios `ANO-NNN` de los documentos anteriores. Los `ANO-NNN`, con su tipo y su
severidad, siguen siendo los identificadores que exige la constitución y que deben citar los tests. Las reglas
protegidas no tenían `ANO`: se identifican por su `RN-NN`. Las preguntas nuevas continúan desde **P-59** y las
consultas de datos se numeran **D-01** a **D-31** (apartado 3.2).

### 0.6 Orden por impacto económico

No hay datos de producción, así que el orden es una **estimación del analista** por magnitud, no por
probabilidad:

| Nivel | Criterio |
|---|---|
| **A** | Afecta a declaraciones fiscales, a la validez legal de la numeración o a todo el volumen facturado (incluida la pérdida de datos). En las reglas protegidas, el impacto es lo que costaría romperlas |
| **B** | Importe incorrecto en facturas concretas, de euros a la factura entera |
| **C** | Céntimos, casos raros o información de gestión |
| **D** | Sin efecto directo sobre importes: plazos, documentos, seguridad, operación y documentación |

Dentro de cada nivel, primero va lo que tiene un importe cuantificado mayor.

---

## 1. Registro

### Nivel A — Fiscal, legal o todo el volumen

#### A-01 · El IVA del periodo sale distinto en el informe y en el fichero de la gestoría

- **Descripción**: el resumen trimestral de IVA suma desde las líneas y el CSV para la gestoría desde las
  cabeceras, y nada comprueba que cuadren.
- **Origen**: ANO-014 (RIESGO, ALTA); contradicción 03; RN-44, RN-45; R3; reglas §12 n.º 10.
- **Evidencia**:
  - CÓDIGO: `routes/informes.js:14-30` frente a `:32-51`; `views/informe_iva.ejs:16` («los revisa la gestoría
    antes del modelo 303»). Cabecera y líneas se graban por separado: `routes/facturas.js:74-98`,
    `scripts/remesa_mensual.js:61-73`. Sobre la semilla (16/11/2026, contradicción 03 §3.2), el IVA de 2026 es
    de 647,98 € en el informe y de 783,78 € en el CSV (**+135,80 €**). La base difiere en 47,75 €.
  - DATOS: sin veredicto. Lo daría **D-01**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 1 y 1 bis; Puri (simulada por el responsable del proyecto)): respuesta prevista: el 303 se presenta con la cifra de la pantalla (suma por líneas) y nunca se cruza con Contaplus. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: sumar desde las líneas es intencional (comentario
  `routes/informes.js:21-22`). La divergencia sería BUG HISTÓRICO CON DEPENDIENTES si D-01 encuentra
  descuadres en producción, y solo un riesgo latente si no los encuentra.
  - Desbloquea: **P-49** (Puri): «Para el modelo 303, ¿usa la pantalla "Resumen de IVA", el CSV importado en
    Contaplus o las dos? ¿Ha visto alguna vez que no coincidan?», junto con **D-01**.
- **Dependientes**: la gestoría (modelo 303 y Contaplus) y las declaraciones de IVA ya presentadas.
- **Tratamiento propuesto**: especificar tal cual las dos salidas, que son un contrato con la gestoría, y
  documentar la divergencia. En modernización, corregir la causa (grabación atómica, A-05) y añadir un aviso de
  descuadre **sin cambiar ninguna de las dos fórmulas**. No retroactivo: las facturas descuadradas se corrigen
  con rectificativa y los 303 ya presentados, con la gestoría.
- **Decisión pendiente**: cuál es la cifra oficial del IVA repercutido. Responsable: Puri (gestoría) propone y
  el negocio decide (**SUPOSICIÓN**: Paco, P-08).
- **Impacto**: nivel A. Con la semilla, 135,80 € de IVA en un semestre, el 21 % del IVA del periodo.

#### A-02 · Regla protegida: redondeo línea a línea

- **Descripción**: cada línea redondea su base y su cuota al céntimo, y los totales son la suma de esas líneas
  redondeadas. Partir una cantidad en varias líneas puede cambiar el IVA.
- **Origen**: RN-01 a RN-04 (INTENCIONAL con incidente); H-12; memoria §3 («NO CAMBIAR LA FORMA DE REDONDEAR»).
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:2-7` (comentario sobre el incidente de 05/2019), `:25-31` y `:81-86`;
    `lib/util.js:5-7`. Verificado en memoria (reglas, apéndice A, casos 3, 4 y 6): el IVA de FA-2026-000103
    sale 205,81 € línea a línea y 205,80 € sobre la base total.
  - DATOS: sin veredicto. Lo daría **D-02** (líneas que no siguen este cálculo, incluidas las de 2019).
  - NEGOCIO: sin testimonio. El comentario atribuye la exigencia a la gestoría, pero eso cuenta como CÓDIGO.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 6; Puri (simulada por el consultor)): respuesta prevista: Contaplus exige el IVA como suma de cuotas redondeadas por línea. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**, candidata a INTENCIONAL (1 de 3 testigos).
  - Desbloquea: **P-30** y **P-25**, reformuladas para Puri: «¿Confirma que Contaplus exige que el IVA de cada
    factura sea la suma de las cuotas redondeadas línea a línea? ¿Qué trimestre devolvió en mayo de 2019 por
    no hacerlo así?», junto con **D-02**.
- **Dependientes**: la gestoría (Contaplus) y todas las facturas emitidas desde 05/2019.
- **Tratamiento propuesto**: especificar tal cual. Cualquier reescritura del cálculo debe reproducir los
  importes céntimo a céntimo con tests de caracterización.
- **Decisión pendiente**: ninguna, salvo la confirmación.
- **Impacto**: nivel A. Según el comentario, cambiar esta regla le costó a la empresa la devolución de un
  trimestre entero.

#### A-03 · El año del número sale del reloj, no de la fecha de la factura

- **Descripción**: la remesa de diciembre, lanzada el 1 de enero, emite facturas fechadas el 31/12 con número
  del año siguiente, que además abren la serie del año nuevo.
- **Origen**: ANO-002 (BUG, ALTA); contradicción 02; RN-28, RN-22; R1; reglas §12 n.º 20.
- **Evidencia**:
  - CÓDIGO: `lib/numeracion.js:15`; `scripts/remesa_mensual.js:5-7,59`; `routes/facturas.js:44,71`;
    `views/index.ejs:9-10`. Ejecutado el 16/11/2026 (contradicción 02 §3.1): la remesa `2026-12` con el reloj
    del 01/01/2027 emite `FA-2027-000001` a `000003` con fecha 31/12/2026. Salen en el CSV de 2026 y no en el
    de 2027.
  - DATOS: sin veredicto. Lo daría **D-03**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 2; Puri (simulada por el consultor)): respuesta prevista: el número debe llevar el año de la fecha de la factura, sin renumerar lo emitido. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG HISTÓRICO CON DEPENDIENTES. Si se ha seguido el
  procedimiento del script desde 2021, hay cinco cambios de año afectados (2021 a 2025).
  - Desbloquea: **P-06** (Marga): «¿Qué número recibieron las facturas de la remesa de diciembre lanzada el 1 de
    enero en años anteriores?»; **P-48** (Puri): «¿Hay algún problema legal o contable en que la serie de un año
    empiece con facturas fechadas el año anterior? ¿En qué ejercicio deben ir?»; y **D-03**.
- **Dependientes**: las facturas de diciembre ya emitidas (**SUPOSICIÓN** hasta D-03), la gestoría (CSV anual
  y correlatividad) y los clientes con contrato.
- **Tratamiento propuesto**: corregir en modernización, con decisión escrita. **No retroactivo**: las facturas
  emitidas conservan su número. La corrección cambia el primer número de cada año, así que debe entrar al
  empezar un ejercicio, nunca a mitad, y coordinada con la gestoría.
- **Decisión pendiente**: qué año debe llevar el número. Responsable: el negocio, con informe de Puri.
- **Impacto**: nivel A. Afecta a la correlatividad de la serie anual, la que se revisó en la inspección de 2020.

#### A-04 · Dos emisiones simultáneas pueden recibir el mismo número

- **Descripción**: el contador se lee y se escribe en dos pasos sin transacción y `facturas.numero` no es
  único.
- **Origen**: ANO-001 (RIESGO, ALTA); R2; RN-29 (en parte); H-14; reglas §12 n.º 11 y 12; memoria §5,
  patrones 1 y 2.
- **Evidencia**:
  - CÓDIGO: `lib/numeracion.js:8-10,14-36`; `db.js:52,77-81`. Ningún `BEGIN` en el código (búsqueda del
    13/11/2026). El comentario cuenta que el 02/01/2021 «salieron dos facturas con el mismo número» y que «no ha
    vuelto a pasar (creo)».
  - DATOS: sin veredicto. Lo daría **D-04**.
  - NEGOCIO: sin testimonio (lo del comentario no está confirmado).
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 4; Marga (simulada por el consultor)): respuesta prevista: no ha revisado la serie; «no ha vuelto a pasar, que yo sepa». Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG HISTÓRICO CON DEPENDIENTES, si las facturas
  duplicadas de 2021 siguen en la BD.
  - Desbloquea: **P-32** (Marga): «El 2 de enero de 2021 salieron dos facturas con el mismo número: ¿cuál era,
    cómo se corrigió y ha vuelto a pasar?», junto con **D-04**.
- **Dependientes**: las facturas duplicadas que existan y quienes emiten desde varios puestos (P-01).
- **Tratamiento propuesto**: corregir en modernización (numeración atómica). No renumerar nada que ya exista.
  Antes de añadir una restricción de unicidad, comprobar con D-04 que no quedan duplicados, porque si los hay la
  restricción no se podría crear. No retroactivo.
- **Decisión pendiente**: qué hacer con los duplicados que existan. Responsables: Marga y Puri.
- **Impacto**: nivel A. Dos facturas legales con el mismo número.

#### A-05 · Alta manual sin transacción: huecos y facturas a medias

- **Descripción**: el alta manual sube el contador, graba la cabecera y graba cada línea por separado. Si algo
  falla a mitad, se pierde el número o queda una factura con parte de sus líneas.
- **Origen**: ANO-003 (RIESGO, ALTA), ANO-004 (RIESGO, ALTA); R3; RN-29; H-21; reglas §12 n.º 8 y 11.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:71-98` (comentario `:81-82`: «se apañó en su día a mano en la BD»);
    `lib/numeracion.js:3-6,16-35`. Que un `NaN` haga fallar la grabación es una **SUPOSICIÓN** sin verificar
    (ANO-003).
  - DATOS: sin veredicto. Lo darían **D-01** (facturas sin líneas o con líneas que no suman) y **D-05**
    (huecos).
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 4; Marga (simulada por el consultor)): respuesta prevista: no ha revisado la serie. Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG HISTÓRICO CON DEPENDIENTES si D-05 encuentra huecos,
  que ya serían visibles para la gestoría y para una inspección.
  - Desbloquea: **P-38** (Marga): «¿Qué factura se quedó con las líneas a medias, qué se cambió a mano en la BD y
    quién puede editarla directamente?», junto con **D-01** y **D-05**.
- **Dependientes**: la gestoría (correlatividad), las facturas emitidas alrededor de un hueco y quien editó la
  BD a mano.
- **Tratamiento propuesto**: corregir en modernización (transacción única). Los huecos que ya existan no se
  pueden rellenar: habría que justificarlos por escrito con la gestoría. No retroactivo.
- **Decisión pendiente**: cómo justificar los huecos que aparezcan. Responsable: Puri.
- **Impacto**: nivel A. Huecos en la numeración legal y descuadre entre el IVA y el CSV (A-01).

#### A-06 · La remesa se puede duplicar o quedar a medias

- **Descripción**: la remesa no comprueba si el mes ya se facturó y, ante un error, se detiene a mitad.
  Relanzarla duplica todas las cuotas ya emitidas.
- **Origen**: ANO-009 (RIESGO, ALTA), ANO-010 (RIESGO, MEDIA); R4; RN-39 (en parte).
- **Evidencia**:
  - CÓDIGO: `scripts/remesa_mensual.js:14-31,33-41,57-72`. En la semilla, FA-2026-000106 está anotada como
    «ERROR cuota duplicada» (`db.js:156`), pero no consta que sea de producción (A-34).
  - DATOS: sin veredicto. Lo daría **D-06**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 11; Marga (simulada por el consultor)): respuesta prevista: relanzar un mes ya facturado debe avisar y no facturar sin confirmación. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS. Nadie depende de una cuota duplicada, pero
  hay que confirmar que las que existan ya se rectificaron.
  - Desbloquea: **P-20** (Marga): «¿Se ha interrumpido o lanzado dos veces alguna remesa? ¿Qué se hizo
    entonces?», junto con **D-06**.
- **Dependientes**: nadie identificado en el resultado. En el procedimiento, Marga, que es quien relanza.
- **Tratamiento propuesto**: corregir en modernización (control del mes facturado y transacción por contrato).
  El control no debe impedir las remesas legítimas de meses atrasados (contradicción 02 §3.2). No retroactivo.
- **Decisión pendiente**: qué debe pasar si se relanza un mes ya facturado. Responsable: Marga.
- **Impacto**: nivel A. Un relanzamiento duplica un mes entero de cuotas.

#### A-07 · Regla protegida: las facturas no se borran nunca

- **Descripción**: no se puede borrar ninguna factura ni ninguna línea. Un error se corrige con una
  rectificativa RE y, si hace falta, una factura nueva.
- **Origen**: RN-30 (INTENCIONAL con incidente); H-13; memoria §3.
- **Evidencia**:
  - CÓDIGO: `lib/numeracion.js:3-6` («desde la inspección de 2020»). Búsqueda de `DELETE` en todos los `.js`
    sin resultados (16/11/2026).
  - DATOS: sin veredicto. **D-05**: los huecos anteriores a 2020 indicarían borrados.
  - NEGOCIO: sin testimonio. No consta qué organismo hizo la inspección.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 9; Paco (simulado por el consultor)): respuesta prevista: la inspección de 2020 fue de la Agencia Tributaria; hay un requerimiento en la gestoría: no borrar facturas. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**, candidata a INTENCIONAL (1 de 3).
  - Desbloquea: **P-31** (Paco, o quien atendiera la inspección): «¿Qué organismo hizo la inspección de 2020 y
    qué detectó? ¿Hay un acta o requerimiento con obligaciones que el programa deba cumplir?», junto con
    **D-05**.
- **Dependientes**: la obligación legal que cita el comentario, la gestoría y la propia inspección.
- **Tratamiento propuesto**: especificar tal cual. Ninguna herramienta de la modernización (migraciones,
  limpiezas, scripts de prueba) puede borrar filas de `facturas` o `lineas`.
- **Decisión pendiente**: ninguna, salvo la confirmación.
- **Impacto**: nivel A (posible sanción).

#### A-08 · Regla protegida: numeración `SERIE-AAAA-NNNNNN` por serie y año

- **Descripción**: cada serie (FA normal, RE rectificativa) tiene su contador por año, que empieza en 1, con
  seis cifras rellenas de ceros. A partir de 999.999 pasaría a siete cifras sin aviso.
- **Origen**: RN-26, RN-27 (INTENCIONAL con incidente); H-13, H-14.
- **Evidencia**:
  - CÓDIGO: `lib/numeracion.js:3-4,14-28,38-42`; `db.js:77-81`.
  - DATOS: sin veredicto. Lo daría **D-05**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 2 y 9; Puri y Paco (simulados por el consultor)): respuesta prevista: numeración correlativa sin huecos por serie y año, exigida en la inspección de 2020. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**, candidata a INTENCIONAL (1 de 3).
  - Desbloquea: **P-31**, más esta pregunta a Puri: «¿El formato FA o RE-AAAA-NNNNNN, con numeración
    independiente por serie y año, es el que dieron por bueno la gestoría y la inspección?» (amplía P-48).
    También **D-05**.
- **Dependientes**: todas las facturas emitidas, la gestoría y los clientes.
- **Tratamiento propuesto**: especificar tal cual, incluido el paso a siete cifras, que se documenta.
- **Decisión pendiente**: ninguna, salvo la confirmación.
- **Impacto**: nivel A.

#### A-09 · Regla protegida: formato y contenido del fichero para la gestoría

- **Descripción**: el CSV anual lleva la clave de exportación en la primera línea y después la cabecera. Usa
  `;`, coma decimal, fechas `dd/mm/aaaa`, fin de línea CRLF y los importes de cabecera, e incluye todas las
  series y estados ordenados por número como texto.
- **Origen**: RN-48, RN-49 (INTENCIONAL, decisión de 2019); H-09; memoria §3 (la clave: «no cambiar»).
- **Evidencia**:
  - CÓDIGO: `routes/informes.js:32-51`; `config.js:36-37`. Este documento no reproduce el valor de la clave.
  - DATOS: sin veredicto. Lo daría **D-07**: un CSV real que haya recibido la gestoría.
  - NEGOCIO: sin testimonio. «Acordado con Puri en 2019» es un comentario.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 10; Puri (simulada por el consultor)): respuesta prevista: Contaplus importa el CSV tal cual; cualquier cambio de formato lo rompe; no hay especificación escrita. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**, candidata a INTENCIONAL (1 de 3).
  - Desbloquea: **P-28** (Puri): «¿Hay un documento con el formato del CSV acordado en 2019? ¿Contaplus lo
    importa directamente? ¿Qué pasaría si cambiara una columna o el orden?», junto con **D-07**.
- **Dependientes**: la gestoría (importación en Contaplus).
- **Tratamiento propuesto**: especificar tal cual, byte a byte. No se cambia el orden, el separador, el fin de
  línea ni la codificación sin una prueba previa con Puri. La clave no se copia a specs ni a tests (CLAUDE.md).
- **Decisión pendiente**: ninguna, salvo la confirmación.
- **Impacto**: nivel A. Es la entrada de la contabilidad de la empresa.

#### A-10 · Regla protegida: la rectificativa es el espejo exacto de la original

- **Descripción**: la rectificativa copia la cabecera y las líneas de la original con el signo cambiado, sin
  recalcular, y por tanto copia también sus errores.
- **Origen**: RN-34 (INTENCIONAL, decisión protegida); H-22; memoria §3.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:124-128,141-143,149-150` («Puri dixit»). En la semilla, RE-2026-000001 copia
    un IVA de 20,62 € que no cuadra con sus líneas, que suman 20,06 € (`db.js:156-162`).
  - DATOS: sin veredicto. Lo daría **D-08**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 7; Puri (simulada por el consultor)): respuesta prevista: la rectificativa es siempre espejo exacto, seguida de una factura nueva correcta. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**, candidata a INTENCIONAL (1 de 3).
  - Desbloquea: **P-39** (Puri): «¿Se admiten rectificativas parciales? Si la original estaba mal calculada, ¿la
    rectificativa debe seguir siendo su espejo exacto?», junto con **D-08**.
- **Dependientes**: la gestoría y las rectificativas ya emitidas.
- **Tratamiento propuesto**: especificar tal cual. Si el negocio decide que hay que recalcular cuando la
  original era errónea, se haría en modernización y sin retroactividad.
- **Decisión pendiente**: qué hacer con las originales mal calculadas. Responsable: Puri.
- **Impacto**: nivel A.

#### A-11 · La rectificativa lleva la fecha del día

- **Descripción**: la rectificativa lleva la fecha de hoy y número del año en curso, así que el abono resta en
  el trimestre y el año en que se emite, no en los de la factura original. Además no tiene vencimiento.
- **Origen**: RN-35 (DUDOSA); está relacionada con RN-45 y RN-48.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:141-143`; `lib/util.js:10-15`.
  - DATOS: sin veredicto. Lo daría **D-09**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 8; Puri (simulada por el consultor)): respuesta prevista: la rectificativa se declara en el periodo en que se emite. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. El código no da ninguna pista sobre la intención.
  - Desbloquea: **P-43** (Puri): «Cuando se rectifica una factura de un trimestre o un año ya cerrado, ¿la
    rectificativa debe ir con la fecha del día o con otra? ¿Cómo lo trata Contaplus?», junto con **D-09**.
- **Dependientes**: la gestoría y los modelos 303 ya presentados.
- **Tratamiento propuesto**: especificar tal cual hasta que haya respuesta.
- **Decisión pendiente**: la fecha fiscal del abono. Responsable: Puri.
- **Impacto**: nivel A. Decide en qué trimestre se declara cada abono.

#### A-12 · La única copia de seguridad es manual y semanal

- **Descripción**: Marga copia la BD a un pendrive los viernes. Se puede perder hasta una semana de facturas,
  no consta que la copia se haga con el programa cerrado y nunca se ha probado a restaurarla.
- **Origen**: ANO-047 (RIESGO, ALTA); R20; H-25.
- **Evidencia**:
  - CÓDIGO: `LEEME.txt:18` (es un procedimiento, no código).
  - DATOS: sin veredicto. Lo daría **D-10**, una prueba de restauración.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 3; Marga (simulada por el consultor)): respuesta prevista: no hay más copia que la del pendrive de los viernes. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS (nadie depende de que la copia sea semanal).
  - Desbloquea: **P-19** (Marga): «¿La copia de los viernes se hace con el programa cerrado? ¿Se ha intentado
    alguna vez restaurar una copia?», junto con **D-10**. También **P-40**: quién la hace cuando ella no está.
- **Dependientes**: Marga, como encargada del procedimiento.
- **Tratamiento propuesto**: documentar sin especificar (es un procedimiento operativo, no comportamiento del
  código). Mejorarlo en modernización. La retroactividad no aplica.
- **Decisión pendiente**: la política de copias. Responsable: el responsable del proyecto, con Marga.
- **Impacto**: nivel A. Facturas perdidas que legalmente no se pueden rehacer con otro número.

#### A-13 · Dos procesos escriben en el mismo SQLite, quizá en una carpeta de red

- **Descripción**: el servidor y la remesa abren el mismo fichero sin tiempo de espera ante bloqueos y sin
  transacciones. **SUPOSICIÓN**: si la BD está en `\\SERVIDOR`, SQLite no garantiza el bloqueo.
- **Origen**: ANO-046 (RIESGO, ALTA); R19; H-07 (datos corrompidos en 2018 por escrituras simultáneas).
- **Evidencia**:
  - CÓDIGO: `db.js:2-4,15`; `config.js:2-3`; `LEEME.txt:6`. No hay `configure` ni `busy` en el código
    (13/11/2026).
  - DATOS: sin veredicto. Lo daría **D-10** (`PRAGMA integrity_check` sobre una copia).
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 5; Marga (simulada por el consultor)): respuesta prevista: BD en la carpeta compartida del servidor; dos puestos graban; no sabe cuál de las dos rutas es la buena. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS (riesgo).
  - Desbloquea: **P-01** (Marga): «¿En qué equipo y carpeta está físicamente `gesfact.db`? ¿Se arranca
    `server.js` en un puesto o en varios?»; **P-26** (Marga): «En 2018, al pasar a SQLite, ¿se perdieron
    datos?»; y **D-10**.
- **Dependientes**: los puestos que trabajan contra la misma BD.
- **Tratamiento propuesto**: documentar ahora. Corregir en modernización cuando se sepa dónde está la BD y
  cuántos procesos la abren.
- **Decisión pendiente**: ninguna de negocio. Es técnica, del responsable del proyecto.
- **Impacto**: nivel A. En el peor caso, corrupción del único almacén de facturas.

#### A-14 · Desde otra carpeta se crea una BD nueva que repite números

- **Descripción**: la ruta de la BD es relativa al directorio de arranque. Desde otra carpeta se crea en
  silencio una BD con la semilla (contador `FA/2026 = 108`) y las facturas siguientes repiten números de
  producción. Además, la semilla se carga sin transacción y no se reintenta si falla.
- **Origen**: ANO-029 (RIESGO, MEDIA), ANO-055 (RAREZA, BAJA); R21, R32.
- **Evidencia**:
  - CÓDIGO: `config.js:20`; `db.js:11-15,83-87,93-180`; `db.js:176`.
  - DATOS: sin veredicto. Lo daría **D-11** (buscar otros `gesfact.db` en los equipos).
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 5; Marga (simulada por el consultor)): respuesta prevista: dos puestos graban y la remesa se lanza el día 1 desde su ordenador. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS en producción.
  - Desbloquea: **P-01** y **P-40** (Marga): «¿Desde qué carpeta arranca el acceso directo? ¿Cuál es la ruta
    real del programa?», junto con **D-11**.
- **Dependientes**: el acceso directo de la oficina (`LEEME.txt:9`) y **la estrategia de pruebas de esta
  fase**, que usa justo este comportamiento para aislar la BD (CLAUDE.md, «Aislar la BD al probar»).
- **Tratamiento propuesto**: especificar tal cual (los tests dependen de ello). En modernización, cualquier
  cambio debe mantener una forma explícita de apuntar a una BD de pruebas.
- **Decisión pendiente**: ninguna de negocio.
- **Impacto**: nivel A. Facturas grabadas en una BD que nadie mira, con números duplicados.

#### A-15 · Los datos de referencia no cuadran

- **Descripción**: la semilla, que según el código son «los que había en el sistema» y que administración usa
  de referencia, tiene cabeceras que no suman sus líneas y líneas que no son cantidad × precio. El caso «base
  1000 justa», recalculado, da 1.000,02 €, y las facturas de remesa no tienen la forma que produce el script.
- **Origen**: ANO-013 (RAREZA, ALTA), ANO-039 (RAREZA, MEDIA); H-20; reglas §12 n.º 17 y 18; memoria §3 (no
  tocar la semilla).
- **Evidencia**:
  - CÓDIGO: `db.js:91-92,122-171`; mapa del sistema, apéndice A; contradicción 03 §3.1.
  - DATOS: sin veredicto. Lo daría **D-12** (buscar esas facturas en producción).
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 12; Marga (simulada por el consultor)): respuesta prevista: no sabe si la semilla son facturas reales; la preparó Julián. Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: si están en producción, BUG HISTÓRICO CON DEPENDIENTES
  (facturas emitidas que no cuadran). Si no, ACCIDENTAL (datos de ejemplo mal hechos).
  - Desbloquea: **P-05** (Marga y Puri): «¿Las facturas FA-2026-000101 a 000108 y RE-2026-000001 existen en
    producción con esos importes?»; **P-15** (Marga): «¿Cómo se añadieron líneas de artículos a facturas de
    remesa?»; **P-37** (Marga): «¿Cuándo y quién hizo la copia de la semilla y para qué la usa?»; y **D-12**.
- **Dependientes**: administración, que la usa de referencia (`db.js:91-92`), y los tests de caracterización,
  que no deben tomarla como resultado esperado.
- **Tratamiento propuesto**: documentar sin especificar. La semilla no se toca (Principio I) ni se usa como
  oráculo.
- **Decisión pendiente**: si los datos son reales, qué se hace con las facturas descuadradas. Responsable: Puri.
- **Impacto**: nivel A, si son de producción. Explican la mayor parte de la divergencia de A-01.

### Nivel B — Importes incorrectos en facturas concretas

#### A-16 · Un importe con punto de miles se lee mil veces menor

- **Descripción**: cantidades, precios y cuotas se leen cambiando solo la primera coma por un punto, así que
  «1.234,50» se graba como 1,234. Además, la aplicación muestra los importes en tres formatos distintos y el
  único que no se puede volver a teclear es el de las facturas.
- **Origen**: ANO-032 (RIESGO, ALTA), ANO-068 (RAREZA, MEDIA); contradicción 08; RN-19; R5.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:59-60`; `routes/contratos.js:19`; `routes/articulos.js:19`;
    `lib/util.js:50-58`; `views/index.ejs:6`. Verificado el 16/11/2026: «2.756,38» → 2,756 (contradicción 08
    §3).
  - DATOS: sin veredicto. Lo daría **D-13**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 19; Marga (simulada por el consultor)): respuesta prevista: no teclea importes de 1.000 € o más. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS. Nadie quiere un importe mil veces menor; las
  facturas emitidas así se habrán rectificado (hay que confirmarlo).
  - Desbloquea: **P-13** (Marga): «¿Se escribe alguna vez el punto de miles al teclear? ¿Se ha visto alguna
    factura por un importe absurdamente bajo?»; **P-53** (Marga): «¿Copia importes de una pantalla a otra?»; y
    **D-13**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización. Hay que decidir el formato admitido, porque «1.234» es
  ambiguo (hoy el panel y el autorrelleno usan el punto como separador decimal). No retroactivo.
- **Decisión pendiente**: formato de entrada de los importes. Responsable: Marga.
- **Impacto**: nivel B. La línea se factura por el 0,1 % de su importe.

#### A-17 · El prorrateo de cuotas se calcula de dos maneras

- **Descripción**: la pantalla de baja prorratea «a lo comercial» (cuota / 30 × días, máximo 30) y la remesa
  por los días reales del mes. En los dos casos se cobran el día de alta y el de baja.
- **Origen**: ANO-007 (RAREZA, ALTA); contradicción 01; RN-36 (INTENCIONAL, H-01), RN-40 (DUDOSA), RN-39 (el
  día de baja se cobra, DUDOSA); R7; H-01, H-16; reglas §12 n.º 6.
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:90-102` frente a `scripts/remesa_mensual.js:43-51`. Remesa real sobre la
    semilla: contrato 4 en febrero de 2026, base de 45,00 € (`FA-2026-000111`) frente a 42,00 € a lo
    comercial. Barrido de 2026: las dos fórmulas coinciden en 127 de 365 fechas, con una diferencia máxima de
    9,67 € en una cuota de 145 € (contradicción 01 §3).
  - DATOS: sin veredicto. Lo daría **D-14**.
  - NEGOCIO: sin testimonio. El comentario dice «así lo espera la gestoría», pero eso cuenta como CÓDIGO.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 14; Paco (simulado por el consultor)): respuesta prevista: prorrateo a 30 días; febrero y el día 31 sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: una de las dos fórmulas es INTENCIONAL y la otra, BUG
  HISTÓRICO CON DEPENDIENTES (cuotas parciales emitidas desde 2021).
  - Desbloquea: **P-04** (Puri): «¿Qué prorrateo espera la gestoría para las cuotas: mes de 30 días o días
    reales?»; **P-21** (Paco): «¿Cómo trataba febrero y el día 31 cuando prorrateaba a mano?»; **P-33**
    (responsable del proyecto): «¿Quién decidió los días reales en la remesa?»; **P-44** (Marga y Paco): «¿Se
    cobran el día de alta y el de baja?»; y **D-14**.
- **Dependientes**: los clientes con altas o bajas a mitad de mes desde 2021 y la gestoría.
- **Tratamiento propuesto**: especificar tal cual los dos caminos. Unificar en modernización según la decisión.
  No retroactivo: si se quiere regularizar alguna diferencia pasada, se haría con rectificativa, caso a caso.
- **Decisión pendiente**: qué prorrateo se aplica. Responsable: Paco, con informe de Puri.
- **Impacto**: nivel B. Hasta 9,67 € por contrato en su mes de alta y en el de baja.

#### A-18 · El último mes de un contrato puede cobrarse dos veces

- **Descripción**: la remesa ya factura, prorrateado, el mes en que cae la baja, y la pantalla de baja manda a
  la oficina emitir a mano otra factura del prorrateo de ese mismo mes. El importe solo aparece en la barra de
  direcciones.
- **Origen**: ANO-008 (RIESGO, ALTA), ANO-022 (RAREZA, MEDIA); RN-38; R8; H-24; reglas §12 n.º 19.
- **Evidencia**:
  - CÓDIGO: `routes/contratos.js:28-30,37-40`; `views/contratos.ejs:17`; `scripts/remesa_mensual.js:28,46`.
    Ejemplo: una baja el 15/03/2026 de una cuota de 90 € daría 43,55 € (remesa) + 45,00 € (a mano) = 88,55 € de
    base por 15 días de servicio (contradicción 01 §3.2).
  - DATOS: sin veredicto. Lo daría **D-15**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 15; Marga (simulada por el consultor)): respuesta prevista: hace siempre la factura del último mes a mano y no sabía que la remesa también lo cobra. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG HISTÓRICO CON DEPENDIENTES, si la oficina sigue el
  procedimiento de la pantalla.
  - Desbloquea: **P-03** (Marga): «Al dar de baja un contrato a mitad de mes, ¿se emite a mano la factura del
    prorrateo además de la que genera la remesa ese mes?», junto con **D-15**.
- **Dependientes**: Marga (el procedimiento) y los clientes dados de baja.
- **Tratamiento propuesto**: corregir en modernización, en el procedimiento o en la remesa. El texto de la
  pantalla es comportamiento observable y cambiarlo exige decisión. No retroactivo: si se encuentran dobles
  facturas, se abonan con rectificativa por decisión del negocio.
- **Decisión pendiente**: quién factura el último mes. Responsable: Marga, con Paco.
- **Impacto**: nivel B. Hasta una cuota mensual de más por cada baja.

#### A-19 · Se facturan cuotas a clientes dados de baja

- **Descripción**: la remesa factura los contratos de clientes dados de baja y la grabación manual no
  comprueba que el cliente esté activo (solo lo hace el desplegable).
- **Origen**: ANO-011 (RAREZA, MEDIA), ANO-031 (RAREZA, BAJA); contradicción 10; RN-23, RN-39; R28.
- **Evidencia**:
  - CÓDIGO: `scripts/remesa_mensual.js:26-29`; `routes/facturas.js:31,46-47`; `routes/clientes.js:32-37` (la
    baja del cliente no toca sus contratos). Ejecutado: con el cliente 6 de baja, la remesa de 2026-11 emitió
    `FA-2026-000111` por 108,90 € (contradicción 10 §3).
  - DATOS: sin veredicto. Lo daría **D-19**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 20; Marga (simulada por el consultor)): respuesta prevista: al dar de baja un cliente deben darse de baja sus contratos; no le consta ningún caso. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS, salvo que haya contratos que deban seguir
  vivos después de la baja del cliente.
  - Desbloquea: **P-55** (Marga): «Cuando se da de baja a un cliente con contratos, ¿se dan de baja también sus
    contratos? ¿Le ha llegado alguna vez una cuota a un cliente de baja?»; **P-07** (Marga): «¿Cómo se corrigen
    los datos de un cliente o un contrato si no hay pantalla?»; y **D-19**.
- **Dependientes**: la rectificación, que debe poder seguir abonando facturas de clientes de baja.
- **Tratamiento propuesto**: corregir en modernización la remesa o la baja de cliente, sin quitar la
  posibilidad de rectificar a clientes de baja. No retroactivo: las cuotas ya emitidas se rectifican caso a
  caso.
- **Decisión pendiente**: qué hacer con los contratos al dar de baja un cliente. Responsable: Marga.
- **Impacto**: nivel B. Una cuota completa por mes y contrato, indefinidamente.

#### A-20 · Una fila con precio pero sin descripción no se factura

- **Descripción**: en la factura manual se descarta sin aviso cualquier fila sin descripción, aunque tenga
  precio. El comentario habla solo de «filas vacías».
- **Origen**: ANO-064 (RIESGO, ALTA); RN-17; reglas §12 n.º 7.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:55-56`. Ejemplo: una fila de 50 € sin descripción no se factura (RN-17).
  - DATOS: **imposible**, porque lo descartado nunca se graba. Se aplica la excepción del apartado 0.3.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 22; Marga (simulada por el consultor)): respuesta prevista: el programa debe avisar y no grabar. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE** (se cierra con CÓDIGO y NEGOCIO). Hipótesis: BUG A SECAS.
  - Desbloquea: **P-47** (Marga): «¿Se ha dado el caso de teclear una línea con precio pero sin descripción?
    ¿Se revisa la factura impresa antes de enviarla?».
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización: avisar en lugar de descartar. No retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B. El importe entero de la línea queda sin facturar.

#### A-21 · El descuento por volumen da un salto en cada umbral

- **Descripción**: al pasar de 1.000 € (o de 5.000 €) de base, el porcentaje se aplica a toda la base, de modo
  que justo por encima del umbral comprar más sale más barato.
- **Origen**: ANO-061 (RAREZA, ALTA); RN-13.
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:39-43,60-71`. Con una base de 1.000,00 € el total es de 1.210,00 €; con
    1.000,01 €, de 1.185,81 € (**−24,19 €**). Con 5.000,00 € es de 5.929,00 €; con 5.000,01 €, de 5.747,51 €
    (**−181,49 €**) (reglas, apéndice A, caso 5).
  - DATOS: sin veredicto. Lo daría **D-16**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 16; Paco (simulado por el consultor)): respuesta prevista: descuento sobre toda la base; el salto es conocido y aceptado. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. El comentario «a partir de 1.000» encaja con las dos lecturas.
  - Desbloquea: **P-45** (Paco): «El descuento, ¿se aplica a toda la factura al pasar de 1.000 € o solo a lo que
    pasa del umbral? ¿Se sabe que con 1.000,01 € el cliente paga menos que con 1.000 €?», junto con **D-16**.
- **Dependientes**: los clientes con pedidos cerca de los umbrales y la política comercial.
- **Tratamiento propuesto**: especificar tal cual. Cambiarlo es una decisión comercial, no técnica. No
  retroactivo.
- **Decisión pendiente**: el diseño del descuento. Responsable: Paco.
- **Impacto**: nivel B. Hasta 24,19 € o 181,49 € por factura cerca de los umbrales.

#### A-22 · El descuento «para hostelería» se aplica a todos los clientes

- **Descripción**: el acuerdo de 2018 era «para fidelizar hostelería», pero el código lo aplica a cualquier
  cliente, también a los minoristas en recargo de equivalencia, a todos los tipos de IVA y a las líneas
  negativas.
- **Origen**: ANO-066 (RAREZA, ALTA); RN-15; H-05; reglas §12 n.º 2.
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:38-43,48-60`. Ejemplo: Ferretería El Tornillo, en recargo, con una línea de
    1.200 € → precio de 1.176,00 € y total de 1.484,11 € (reglas, apéndice A, caso 9).
  - DATOS: sin veredicto. Lo daría **D-16**, agrupando por cliente.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 17; Paco (simulado por el consultor)): respuesta prevista: el descuento se aplica a cualquier cliente que supere el umbral. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-24** (Paco): «¿Sigue vigente el descuento por volumen de 2018? ¿Es solo para hostelería?»,
    junto con **D-16**.
- **Dependientes**: los clientes que no son de hostelería y ya reciben el descuento, si D-16 encuentra alguno.
  Quitárselo les cambia el precio.
- **Tratamiento propuesto**: especificar tal cual. Si se restringe, se hace en modernización, sin
  retroactividad y con aviso comercial a los clientes afectados.
- **Decisión pendiente**: a quién se aplica el descuento. Responsable: Paco.
- **Impacto**: nivel B. Entre el 2 % y el 5 % de cada factura de más de 1.000 € a esos clientes.

#### A-23 · Hay dos formas de abonar y dan importes distintos

- **Descripción**: la rectificativa RE es el espejo de la original. Una factura FA con cantidades negativas
  recalcula: pierde el descuento por volumen, redondea las mitades hacia cero, resta del pendiente del panel y
  no marca la original.
- **Origen**: ANO-071 (RAREZA, ALTA); contradicción 13; RN-20 (en parte); RN-33 (no hay abono parcial).
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:124-164` frente a `:42-102`; `services/calculo.js:39-43,60`;
    `lib/util.js:5-7`. En el caso A de la contradicción 13, el abono con líneas negativas es **41,80 € mayor**.
    Barrido: el 8,85 % de las líneas al 10 % difieren en un céntimo.
  - DATOS: sin veredicto. Lo daría **D-18**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 13; Marga y Puri (simuladas por el consultor)): respuesta prevista: los abonos parciales se hacen con FA en negativo y deben respetar el descuento cobrado. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG HISTÓRICO CON DEPENDIENTES, si la oficina abona con
  líneas negativas.
  - Desbloquea: **P-17** (Marga): «¿Se meten alguna vez líneas con cantidad o precio negativos en una factura
    normal?»; **P-57** (Marga y Puri): «Cuando hay que devolver solo una parte de una factura, ¿cómo se hace hoy?
    Si la original tenía descuento, ¿el abono también debe llevarlo?»; **P-39** (Puri); y **D-18**.
- **Dependientes**: los clientes abonados con líneas negativas y la gestoría.
- **Tratamiento propuesto**: especificar tal cual las dos formas. En modernización, decidir si se crea un abono
  parcial con rectificativa. No retroactivo.
- **Decisión pendiente**: cómo se hacen los abonos parciales. Responsables: Puri y Marga.
- **Impacto**: nivel B. Del 2 % al 5 % de más en los abonos de facturas con descuento.

#### A-24 · Las cuotas de contrato también llevan descuento por volumen

- **Descripción**: la remesa aplica el descuento a una cuota de más de 1.000 € al mes: una cuota de 1.200 € se
  factura a 1.176 €.
- **Origen**: ANO-035 (RAREZA, ALTA); RN-41.
- **Evidencia**:
  - CÓDIGO: `scripts/remesa_mensual.js:54-55`; `services/calculo.js:36-43`. En la semilla todas las cuotas son
    de 145 € o menos (`db.js:116-119`).
  - DATOS: sin veredicto. Lo daría **D-17**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 18; Paco (simulado por el consultor)): respuesta prevista: las cuotas no deben llevar descuento; ninguna llega hoy a 1.000 €. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Si D-17 sale vacía, el riesgo es latente.
  - Desbloquea: **P-14** (Paco y Marga): «¿El descuento debe aplicarse también a las cuotas de la remesa? ¿Hay
    o ha habido contratos de más de 1.000 € al mes?», junto con **D-17**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: especificar tal cual hasta que haya respuesta.
- **Decisión pendiente**: si las cuotas llevan descuento. Responsable: Paco.
- **Impacto**: nivel B, solo si existen contratos así: un 2 % de la cuota cada mes.

#### A-25 · Una rectificación que falla deja abonos incompletos

- **Descripción**: la rectificación hace cuatro pasos sin transacción e ignora los errores de los dos últimos.
  Si la original no tiene líneas, la petición se queda colgada y la original sigue `emitida`, así que se puede
  volver a rectificar.
- **Origen**: ANO-005 (BUG, ALTA); R17; reglas §12 n.º 9.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:124-128,138-159`.
  - DATOS: sin veredicto. Lo daría **D-08**.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-65** (nueva, Marga): «¿Se ha quedado alguna vez colgada una rectificación o una factura? ¿Se
    ha rectificado dos veces la misma factura? ¿Se ha grabado una factura dos veces por un doble clic o al
    repetirla tras un error?», junto con **D-08**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización (transacción). No retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B. Abonos dobles o incompletos, y descuadre entre el IVA y el CSV.

#### A-26 · Dos rectificaciones simultáneas abonan dos veces la misma factura

- **Descripción**: la rectificación comprueba el estado al principio y marca la original al final, sin
  condición sobre el estado anterior.
- **Origen**: ANO-044 (RIESGO, ALTA); R18.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:130-133` frente a `:154`.
  - DATOS: sin veredicto. Lo daría **D-08** (más de una RE por factura original).
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-65** y **D-08**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización. No retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B. Se abona el doble.

#### A-27 · Un doble clic graba dos facturas

- **Descripción**: el alta manual no tiene control de duplicados. Un doble envío, o repetir la factura tras un
  error que sí llegó a grabar algo, crea dos facturas con números distintos.
- **Origen**: ANO-045 (RIESGO, MEDIA); R12.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:42-102`; `views/factura_nueva.ejs`.
  - DATOS: sin veredicto. Lo daría **D-21**.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-65** y **D-21**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización. No retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B. Una factura duplicada al cliente.

#### A-28 · Las líneas de la factura manual no se validan

- **Descripción**: se admiten cantidades y precios cero, negativos o no numéricos (con `NaN` en el cálculo) y
  cualquier tipo de IVA si llega por POST. Una factura FA puede salir con total cero o negativo.
- **Origen**: RN-20 (DUDOSA); R6; ANO-003 (la parte del `NaN`), ANO-040 (la parte del tipo de IVA, ver A-38).
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:43-44,55-64`; `services/calculo.js:26-34`. Verificado: −5 × 10,00 € → FA de
    −60,50 € (registro de riesgos, apéndice A, caso 3). Qué graba `sqlite3` con un `NaN` sigue sin comprobar.
  - DATOS: sin veredicto. Lo daría **D-18**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 13; Marga (simulada por el consultor)): respuesta prevista: teclea cantidades negativas para abonos parciales. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: si las líneas negativas se usan a propósito, son una
  práctica INTENCIONAL de hecho y con dependientes (A-23). El `NaN` sería BUG A SECAS.
  - Desbloquea: **P-17** (Marga) y **D-18**.
- **Dependientes**: los que tenga A-23, si la práctica existe.
- **Tratamiento propuesto**: especificar tal cual los negativos hasta conocer P-17. Corregir en modernización
  el `NaN` y el texto no numérico. No retroactivo.
- **Decisión pendiente**: si se permiten líneas negativas en la serie FA. Responsables: Puri y Marga.
- **Impacto**: nivel B. Facturas con importes sin sentido y número legal consumido.

#### A-29 · Las bajas de contrato no se validan

- **Descripción**: no se comprueba que la baja sea posterior al alta, y un segundo envío sobrescribe la baja
  anterior. Con una baja anterior al alta en el mismo mes, la remesa emite una FA negativa.
- **Origen**: ANO-042 (RIESGO, MEDIA), ANO-053 (RAREZA, BAJA); R24.
- **Evidencia**:
  - CÓDIGO: `routes/contratos.js:31-36`; `scripts/remesa_mensual.js:28,45-51`. Baja el 10/03 con alta el 20/03
    y cuota de 90 € → **−26,13 €** de base (contradicción 01 §3.2).
  - DATOS: sin veredicto. Lo daría **D-20**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 21; Marga (simulada por el consultor)): respuesta prevista: registra bajas con fecha futura y hace la factura del último mes al registrarlas. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-56** (Marga) y **P-65**, junto con **D-20**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización. No retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B. Una FA negativa con número legal consumido.

#### A-30 · Un contrato con baja futura parece de baja y se sigue facturando

- **Descripción**: la pantalla de contratos considera de baja cualquier contrato con fecha de baja, aunque sea
  futura, y le quita el botón; la remesa lo sigue facturando completo hasta ese mes. El prorrateo «a facturar a
  mano» se calcula al registrar la baja, meses antes. Un contrato con alta futura sale como activo y no se
  factura.
- **Origen**: ANO-070 (RAREZA, MEDIA); contradicción 11.
- **Evidencia**:
  - CÓDIGO: `views/contratos.ejs:6,10,12`; `routes/contratos.js:31-40`; `scripts/remesa_mensual.js:26-29`.
    Ejecutado: el contrato 1, con baja el 15/12/2026, se facturó completo en noviembre (`FA-2026-000109`).
  - DATOS: sin veredicto. Lo daría **D-20**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 21; Marga (simulada por el consultor)): respuesta prevista: registra bajas con fecha futura y hace la factura del último mes al registrarlas. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: lo accidental es la pantalla; la remesa calcula bien la
  vigencia.
  - Desbloquea: **P-56** (Marga): «¿Se da de baja alguna vez un contrato con fecha futura? En ese caso, ¿la
    factura del último mes se hace al registrar la baja o al llegar la fecha?», junto con **D-20**.
- **Dependientes**: Marga (lectura de la pantalla).
- **Tratamiento propuesto**: especificar tal cual la remesa. Corregir la pantalla en modernización: no afecta a
  importes salvo por A-18.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B, a través del doble cobro de A-18.

#### A-31 · Las fechas son texto sin validar y los filtros comparan texto

- **Descripción**: el servidor no comprueba el formato de la fecha de factura ni de las fechas de los
  contratos. Una fecha mal formada queda fuera del informe de IVA, del CSV o de la remesa sin aviso, y se
  imprime descolocada.
- **Origen**: ANO-049 (RIESGO, ALTA); R23; RN-22, RN-51 (formato INTENCIONAL desde 2018, H-07);
  contradicción 03 §3.3.
- **Evidencia**:
  - CÓDIGO: `routes/informes.js:18-25,38`; `routes/facturas.js:44`; `routes/contratos.js:16-21`;
    `lib/util.js:9,28-33`. Comprobado con SQLite: `2026-1-5` entra en el CSV y en ningún trimestre
    (contradicción 03 §3.3).
  - DATOS: sin veredicto. Lo daría **D-22**.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: el formato `AAAA-MM-DD` es INTENCIONAL y la falta de
  validación, BUG A SECAS.
  - Desbloquea: **P-38** (Marga): «¿Quién puede editar la BD directamente y con qué herramienta?», junto con
    **D-22**.
- **Dependientes**: el informe de IVA, el CSV y la remesa, que dependen del formato de texto.
- **Tratamiento propuesto**: especificar tal cual el formato guardado. Validar en modernización sin cambiar ese
  formato. No retroactivo: las fechas mal formadas que se encuentren se tratan caso a caso.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B. Facturas que no llegan al modelo 303.

#### A-32 · La remesa acepta meses imposibles o futuros

- **Descripción**: la remesa solo comprueba la forma `AAAA-MM`. Con `2026-13` graba facturas con fecha
  «2026-13-31» y observaciones «Remesa undefined 2026». También acepta cualquier mes futuro.
- **Origen**: ANO-048 (BUG, MEDIA); RN-43; R22.
- **Evidencia**:
  - CÓDIGO: `scripts/remesa_mensual.js:14-21,53,59,80-84`; `lib/util.js:36-39` (registro de riesgos,
    apéndice A, caso 4).
  - DATOS: sin veredicto. Lo daría **D-22**.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-20** (Marga) y **D-22**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización sin impedir las remesas legítimas de meses atrasados. No
  retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel B. Una remesa entera con fecha imposible, aunque exige un error al teclear.

### Nivel C — Céntimos, casos raros e información de gestión

#### A-33 · Regla protegida: tramos de descuento «estrictamente mayor que»

- **Descripción**: el descuento solo se aplica con una base de más de 1.000 € o de más de 5.000 €; una base de
  1.000 € justos no lleva descuento. La base se mide como suma de líneas ya redondeadas, así que el redondeo de
  una línea puede hacer cruzar el umbral. El comentario dice «a partir de».
- **Origen**: RN-11 (INTENCIONAL, H-05), RN-12 (ACCIDENTAL); ANO-023 (RAREZA, BAJA); reglas §12 n.º 1 y 18;
  memoria §3; R31.
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:37-43,53-60`; `db.js:138` («comentado con la gestoría: base 1000 justa NO lleva
    descuento»). Recalculada con el código actual, FA-2026-000103 suma 1.000,02 € y **sí** lleva el 2 %.
  - DATOS: sin veredicto. Lo daría **D-16**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 16; Paco (simulado por el consultor)): respuesta prevista: descuento sobre toda la base con «estrictamente mayor que»; el caso de 1.000 € justos es conocido. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: RN-11 candidata a INTENCIONAL (1 de 3) y RN-12,
  ACCIDENTAL.
  - Desbloquea: **P-24** y **P-45** (Paco), más esta pregunta a Puri: «¿Confirma que una base de 1.000,00 €
    justos no lleva descuento y que el umbral se mide sobre la suma de las líneas ya redondeadas?». También
    **D-16**.
- **Dependientes**: la gestoría (el caso «comentado») y los clientes cerca del umbral.
- **Tratamiento propuesto**: especificar tal cual. El comentario no se corrige (el código es de solo lectura):
  la discrepancia queda documentada aquí.
- **Decisión pendiente**: ninguna, salvo la confirmación.
- **Impacto**: nivel C. Un 2 % en las facturas que caen justo en el umbral.

#### A-34 · La factura que sustituye a una «cuota duplicada» es idéntica a ella

- **Descripción**: FA-2026-000106 se rectificó por «cuota duplicada» y FA-2026-000107, que la sustituye, tiene
  las mismas líneas e importes. Si lo duplicado era otra factura de abril, esa podría seguir viva.
- **Origen**: ANO-057 (RAREZA, MEDIA); H-19.
- **Evidencia**:
  - CÓDIGO: `db.js:156-158,164-166`.
  - DATOS: sin veredicto. Lo darían **D-12** y **D-06** (facturas de abril de 2026 del Bar Nuevo Siglo).
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 11; Marga (simulada por el consultor)): respuesta prevista: no recuerda qué estaba duplicado en FA-2026-000106. Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-36** (Marga): «¿Qué estaba duplicado? ¿Se lanzó dos veces la remesa de abril? ¿Hay otra
    factura de abril de 2026 para el Bar Nuevo Siglo?», junto con D-12 y D-06.
- **Dependientes**: el cliente (Bar Nuevo Siglo) y la gestoría.
- **Tratamiento propuesto**: documentar sin especificar (es un dato, no una regla). Si se confirma un duplicado
  vivo, se rectifica por decisión del negocio.
- **Decisión pendiente**: si hay que abonar alguna factura. Responsable: Marga.
- **Impacto**: nivel C. 122,23 € si existe el duplicado.

#### A-35 · El prorrateo comercial no aplica los 30 días en febrero

- **Descripción**: `calcularProrrateo` solo mira el número del día. Un febrero completo da 28/30 de la cuota, y
  si el inicio y el fin caen en meses distintos devuelve 0 sin avisar (desde la pantalla no ocurre).
- **Origen**: ANO-043 (BUG, ALTA); RN-37; R7; reglas §12 n.º 4 y 5.
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:91-101`. Una cuota de 90 € con baja el 28/02/2026 da **84,00 €**
    (reglas, apéndice A, caso 12).
  - DATOS: sin veredicto. Lo daría **D-14**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 14; Paco (simulado por el consultor)): respuesta prevista: no recuerda con certeza cómo trataba febrero. Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS, o con dependientes si hay bajas en febrero
  facturadas así.
  - Desbloquea: **P-21** (Paco): «¿Cómo trataba febrero cuando prorrateaba a mano? ¿Cobraba (cuota / 30) × días
    también en febrero?», junto con **D-14**.
- **Dependientes**: los clientes con baja en febrero, si los hay.
- **Tratamiento propuesto**: especificar tal cual. Se decide junto con A-17. No retroactivo.
- **Decisión pendiente**: se resuelve con la de A-17. Responsable: Paco.
- **Impacto**: nivel C. Hasta 6,00 € en una cuota de 90 € y hasta 9,67 € en una de 145 €, por cada baja en
  febrero.

#### A-36 · El descuento se aplica al precio unitario redondeado

- **Descripción**: el descuento rebaja y redondea el precio unitario antes de multiplicar por la cantidad, así
  que el error se multiplica con cantidades grandes. Por debajo de 0,25 € (2 %) o de 0,10 € (5 %) el precio no
  baja, y la factura no muestra el descuento desglosado.
- **Origen**: ANO-062 (RAREZA, ALTA); RN-14; H-06; reglas §12 n.º 3.
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:63-80`; `views/factura_detalle.ejs:28`. 20 platos a 28,90 € dan 566,40 €,
    frente a 566,44 € aplicando el 2 % a la base de la línea (reglas, apéndice A, caso 6).
  - DATOS: sin veredicto. Lo daría **D-23**.
  - NEGOCIO: sin testimonio. «Para que la gestoría lo vea desglosado» es un comentario.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 24; Marga (simulada por el consultor)): respuesta prevista: los precios se teclean siempre con dos decimales; ninguna queja. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-25** (Puri): «El programa rebaja el precio unitario de cada línea, lo redondea y recalcula
    la línea. ¿Es así como pidió en 2018 ver el descuento desglosado?», junto con **D-23**.
- **Dependientes**: la gestoría (si así lo pidió) y las facturas con descuento ya emitidas.
- **Tratamiento propuesto**: especificar tal cual.
- **Decisión pendiente**: ninguna, salvo la confirmación.
- **Impacto**: nivel C. Céntimos por línea.

#### A-37 · Regla protegida: redondeo en coma flotante, con las mitades negativas hacia cero

- **Descripción**: `redondear2` redondea sobre coma flotante (1,005 → 1,00) y sube las mitades exactas hacia
  +∞, así que en negativos las acerca a cero (−0,525 → −0,52).
- **Origen**: ANO-025 (RAREZA, ALTA), ANO-059 (RAREZA, ALTA); RN-05 (ACCIDENTAL); R15; reglas §12 n.º 14;
  memoria §3 (utilidades del Access).
- **Evidencia**:
  - CÓDIGO: `lib/util.js:2-7`; reglas, apéndice A, casos 1 y 2.
  - DATOS: sin veredicto. Lo daría **D-02**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 6; Puri (simulada por el consultor)): respuesta prevista: Contaplus exige la suma de cuotas redondeadas por línea. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG HISTÓRICO CON DEPENDIENTES. Es incorrecto
  aritméticamente, pero es lo que «cuadra hoy con la gestoría» según `services/calculo.js:3-6`.
  - Desbloquea: **P-46** (Puri y Marga): «¿Se han detectado diferencias de un céntimo en abonos hechos con
    líneas negativas frente a la factura original?»; **P-30** (Puri); y **D-02**.
- **Dependientes**: la gestoría (Contaplus) y todas las facturas emitidas.
- **Tratamiento propuesto**: especificar tal cual. No se corrige sin una prueba de cuadre con Contaplus sobre
  un trimestre real. No retroactivo.
- **Decisión pendiente**: ninguna, salvo la confirmación.
- **Impacto**: nivel C. Un céntimo en las líneas afectadas.

#### A-38 · Los tipos de IVA admitidos y el tipo por defecto no coinciden entre sitios

- **Descripción**: las pantallas ofrecen 21, 10 y 4 %. El cálculo del recargo conoce además 18, 16, 8 y 7 %
  («no borrar»), el servidor acepta cualquier entero y un tipo desconocido lleva recargo 0 sin aviso. El 21 por
  defecto está en cuatro sitios y solo uno, inalcanzable, lee `IVA_DEFECTO`.
- **Origen**: ANO-040 (RAREZA, BAJA), ANO-067 (RAREZA, MEDIA); contradicción 06; RN-09 (INTENCIONAL con NO
  TOCAR, H-02), RN-10 (DUDOSA), RN-08 y RN-21 (contexto); reglas §12 n.º 16; memoria §3; R31.
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:11-23`; `views/factura_nueva.ejs:18`; `views/articulos.ejs:18`;
    `db.js:36,46`; `config.js:24-25`; `routes/articulos.js:16`; `routes/contratos.js:20`;
    `routes/facturas.js:61`. Con un 5 % y un cliente en recargo, el recargo sale a 0,00 € (contradicción 06
    §3).
  - DATOS: sin veredicto. Lo daría **D-24**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 23; Puri (simulada por el consultor)): respuesta prevista: hoy solo 21/10/4 con recargos 5,2/1,4/0,5; nunca se ha reabierto un ejercicio del Access; conservar los antiguos no molesta. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: los tipos antiguos son INTENCIONALES (1 de 3) y el recargo
  0 para tipos desconocidos es ACCIDENTAL.
  - Desbloquea: **P-22** (Paco y Puri): «¿Se ha reabierto alguna vez un ejercicio antiguo con IVA del 16, 18, 7
    u 8 %?»; **P-42** (Puri): «Entre 2023 y 2024, ¿se vendió con tipos temporales del 0, 2 o 5 %? ¿Siguen
    vigentes los recargos del 5,2, el 1,4 y el 0,5 %?»; **P-51** (Marga y responsable del proyecto): «¿Qué
    vale `IVA_DEFECTO` en el servidor?»; y **D-24**.
- **Dependientes**: los ejercicios antiguos, si se reabren.
- **Tratamiento propuesto**: especificar tal cual la tabla de recargos, incluidos los tipos antiguos. Si
  aparecen tipos temporales en D-24, decidir con Puri. No retroactivo.
- **Decisión pendiente**: qué tipos admite el sistema. Responsable: Puri.
- **Impacto**: nivel C. Recargo no cobrado en las líneas con un tipo no previsto.

#### A-39 · Lo que se puede cobrar o rectificar depende de la pantalla

- **Descripción**: el servidor rectifica facturas `cobrada` y deja cobrar rectificativas, cosas que la pantalla
  no ofrece. Al rectificar una cobrada se pierde la constancia del cobro, y el cobro es todo o nada, sin fecha.
- **Origen**: ANO-006 (RAREZA, BAJA), ANO-033 (RAREZA, BAJA), ANO-034 (RAREZA, MEDIA); contradicción 14; RN-31,
  RN-32 (DUDOSAS).
- **Evidencia**:
  - CÓDIGO: `views/factura_detalle.ejs:47-52`; `routes/facturas.js:117-122,132-133,154`. El escenario de las
    dos pestañas lleva a ANO-034 sin preparar ninguna petición (contradicción 14 §3).
  - DATOS: sin veredicto. Lo daría **D-26**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 25; Marga y Puri (simuladas por el consultor)): respuesta prevista: una cobrada debe poder rectificarse sin perder la constancia del cobro; la devolución se hace por transferencia fuera del programa. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-16** (Marga y Puri): «Cuando se rectifica una factura cobrada, ¿cómo se controla la
    devolución?»; **P-58** (Marga y Puri): «¿Hay que poder rectificar una factura cobrada? ¿Tiene sentido
    marcar como cobrada una rectificativa?»; y **D-26**.
- **Dependientes**: Marga, que controla los cobros y las devoluciones.
- **Tratamiento propuesto**: especificar tal cual el servidor. Decidir en modernización el modelo de cobro. No
  retroactivo.
- **Decisión pendiente**: el modelo de estados y cobros. Responsables: Marga y Puri.
- **Impacto**: nivel C. Devoluciones que no se controlan.

#### A-40 · Lo que se muestra no siempre se redondea igual que lo que se calcula

- **Descripción**: `formatearImporte` y los `toFixed(2)` de las vistas redondean de otra forma que
  `redondear2`. Solo se nota con precios unitarios de más de dos decimales (por ejemplo, «1,11» en precio
  frente a «1,12» en base) y con sumas que se muestran «-0,00».
- **Origen**: ANO-060 (RAREZA, BAJA); contradicción 07; RN-47, RN-50 (ACCIDENTALES).
- **Evidencia**:
  - CÓDIGO: `lib/util.js:50-58`; `views/informe_iva.ejs:5,11-14`; `views/factura_detalle.ejs:28`. Barridos:
    43.412 de 1.000.000 importes con tres decimales difieren y ninguno de los importes al céntimo
    (contradicción 07 §3.1).
  - DATOS: sin veredicto. Lo daría **D-13** (precios con más de dos decimales).
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 24; Marga (simulada por el consultor)): respuesta prevista: precios siempre con dos decimales. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: ACCIDENTAL.
  - Desbloquea: **P-52** (Marga y Puri): «¿Se teclean precios unitarios con más de dos decimales? ¿Ha protestado
    algún cliente porque cantidad × precio no da la base impresa?», junto con **D-13**.
- **Dependientes**: los clientes que reciben facturas con esos precios.
- **Tratamiento propuesto**: especificar tal cual. Es un formato visible en documentos.
- **Decisión pendiente**: con cuántos decimales se imprime el precio. Responsable: Puri.
- **Impacto**: nivel C. Un céntimo visible en la línea.

#### A-41 · «Pendiente de cobro» tiene cuatro definiciones

- **Descripción**: el panel cuenta las rectificativas emitidas como pendientes, pero su importe solo suma FA, y
  el listado «emitidas» incluye las RE. El desfase crece con cada rectificativa, porque una RE nunca sale de
  `emitida`.
- **Origen**: ANO-021 (RAREZA, BAJA); contradicción 04.
- **Evidencia**:
  - CÓDIGO: `server.js:22-31`; `views/index.ejs:5-6`; `routes/facturas.js:18-21`. Con la semilla: 4
    facturas pendientes, 3.032,85 € en el panel y 2.910,62 € en el listado (contradicción 04 §3).
  - DATOS: sin veredicto. Lo daría **D-26**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 25; Marga (simulada por el consultor)): respuesta prevista: usa el importe pendiente; una rectificativa no es algo pendiente de cobrar. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: ACCIDENTAL.
  - Desbloquea: **P-50** (Marga): «En el panel, ¿qué cifra usa para saber lo que queda por cobrar? ¿Sabía que el
    número incluye las rectificativas y el importe no?», junto con **D-26**.
- **Dependientes**: Marga (seguimiento de cobros).
- **Tratamiento propuesto**: especificar tal cual. Corregir en modernización según la respuesta (es
  información interna).
- **Decisión pendiente**: qué significa «pendiente». Responsable: Marga.
- **Impacto**: nivel C (información de gestión).

#### A-42 · El indicador de recargo se lee con dos criterios

- **Descripción**: el cálculo exige el valor 1 y las vistas aceptan cualquier valor «verdadero». Además, el
  cálculo usa la ficha del cliente al emitir y la leyenda impresa la ficha al imprimir.
- **Origen**: ANO-069 (RAREZA, BAJA); contradicción 09; RN-07 (contexto).
- **Evidencia**:
  - CÓDIGO: `services/calculo.js:49`; `views/factura_detalle.ejs:20,32,39`; `views/clientes.ejs:9`;
    `routes/clientes.js:24`. Solo se puede provocar tocando la BD (contradicción 09 §4).
  - DATOS: sin veredicto. Lo daría **D-25**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 26; Puri (simulada por el consultor)): respuesta prevista: la factura reimpresa debe salir con los datos de la emisión. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: ACCIDENTAL.
  - Desbloquea: **P-54** (Marga y Puri): «¿Algún cliente ha entrado o salido del recargo después de tener
    facturas? ¿Cómo se cambió? Al reimprimir, ¿qué debería decir?»; **P-07**; y **D-25**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: especificar tal cual. Se decide junto con A-50.
- **Decisión pendiente**: se resuelve con la de A-50.
- **Impacto**: nivel C. Una leyenda fiscal que no corresponde a lo cobrado.

### Nivel D — Plazos, documentos, seguridad y operación

#### A-43 · Credenciales en claro, en el historial de git y en el remoto

- **Descripción**: el usuario y la contraseña del correo de facturas y la clave de la gestoría están en claro en
  `config.js`, versionado desde el primer commit y presente en `origin/master`. La clave sale además en la
  primera línea del CSV, que se descarga sin autenticación.
- **Origen**: ANO-016 (RIESGO, ALTA), ANO-051 (RIESGO, ALTA); R9.
- **Evidencia**:
  - CÓDIGO: `config.js:27-37`; `git log -- config.js` y `git branch -r` (13/11/2026); `routes/informes.js:40`.
    Este documento no reproduce los valores.
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 29; Manoli (simulada por el consultor)): respuesta prevista: no sabe si se cambió la contraseña del buzón. Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS (riesgo de seguridad).
  - Desbloquea: **P-18** (responsable del proyecto y Manoli): «¿El repositorio de GitHub es privado? ¿Quién
    tiene acceso? ¿La contraseña del buzón sigue activa o se usa en otro servicio?».
- **Dependientes**: la gestoría, porque la clave en el CSV es parte del contrato (A-09).
- **Tratamiento propuesto**: corregir en modernización: cambiar la contraseña (Manoli) y sacar los secretos del
  código. Reescribir el historial de git es irreversible y necesita decisión expresa. La clave del CSV no se
  toca sin Puri. **No puede ser retroactiva**: lo publicado sigue en el historial y en cualquier copia.
- **Decisión pendiente**: cambio de la contraseña y visibilidad del repositorio. Responsables: Manoli y
  responsable del proyecto.
- **Impacto**: nivel D (sin efecto directo en importes; gravedad alta).

#### A-44 · No hay autenticación ni protección de formularios

- **Descripción**: cualquiera que llegue al puerto 3000 puede emitir, cobrar o rectificar facturas.
  **SUPOSICIÓN**: el servidor escucha en todas las interfaces y una web cualquiera podría enviar formularios a
  `localhost:3000`.
- **Origen**: ANO-017 (RIESGO, MEDIA), ANO-052 (RIESGO, MEDIA); R25.
- **Evidencia**:
  - CÓDIGO: `server.js:16-18,38-42,49`.
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 5 y 30; Marga y responsable del proyecto (simulados por el consultor)): respuesta prevista: dos puestos; uso solo desde la red de la oficina. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-60** (nueva, Marga y responsable del proyecto): «¿Desde qué ordenadores se entra en GesFact?
    ¿Se puede llegar al puerto 3000 desde la wifi de la oficina u otras redes?», y **P-01**.
- **Dependientes**: los puestos que hoy entran sin credenciales. Añadir autenticación les cambia la forma de
  trabajar.
- **Tratamiento propuesto**: corregir en modernización, con un plan de acceso para cada puesto.
- **Decisión pendiente**: quién debe poder facturar y desde dónde. Responsable: el negocio.
- **Impacto**: nivel D (riesgo de facturas emitidas o anuladas por terceros).

#### A-45 · El programa no se puede reinstalar de forma reproducible

- **Descripción**: `LEEME.txt` manda instalar Node 8, que es incompatible con el lockfile y con `sqlite3` 5. La
  entrada de `sqlite3` del lockfile no tiene `resolved` ni `integrity`, y no se sabe qué versión de Node hay en
  la oficina.
- **Origen**: ANO-027 (RIESGO, MEDIA); R10; TODO(VERSION_NODE) de la constitución.
- **Evidencia**:
  - CÓDIGO: `LEEME.txt:5,7`; `package.json:1-17`; `package-lock.json:4,853-855`.
  - DATOS: no aplica. El veredicto es `node --version` y `npm ls` en el equipo de la oficina.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 30; Responsable del proyecto (simulado por el consultor)): respuesta prevista: no sabe la versión de Node del servidor. Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-02** (Marga o responsable del proyecto): «¿Qué muestra `node --version` en el puesto de la
    oficina?»; **P-11**: «¿Cómo se instaló (con `npm install` o copiando la carpeta con `node_modules`)?»;
    y **P-35**: «¿Se ha cambiado algo en ese equipo que no esté en el repositorio?».
- **Dependientes**: toda la oficina, porque si el equipo falla no se puede facturar.
- **Tratamiento propuesto**: documentar ahora. La validez de los tests de esta fase depende de P-02
  (constitución). En modernización, fijar versiones; mientras dure esta fase está prohibido tocar las
  dependencias (Principio IV).
- **Decisión pendiente**: qué versión de Node es la oficial. Responsable: el responsable del proyecto.
- **Impacto**: nivel D (riesgo de paralizar la facturación).

#### A-46 · El envío por correo está desactivado y el aviso se pierde

- **Descripción**: desde 2022 las facturas se envían a mano desde Outlook. El único aviso es una línea en la
  consola del servidor y solo sale en el alta manual. Según el código, hay que hablar con Manoli antes de tocar
  el correo.
- **Origen**: ANO-054 (RIESGO, MEDIA); R13; H-17; memoria §3.
- **Evidencia**:
  - CÓDIGO: `services/email.js:3-6,26-28`; `routes/facturas.js:93`; `LEEME.txt:14`.
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 29; Manoli (simulada por el consultor)): respuesta prevista: el envío por correo no se reactiva por ahora. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-34** (Manoli): «¿Qué cambió en Arsys en 2022? ¿Por qué hay que consultarle antes de
    reactivar el correo? ¿Hay planes de volver a enviar facturas desde el programa?».
- **Dependientes**: Marga (envío manual desde su Outlook) y los clientes.
- **Tratamiento propuesto**: documentar sin especificar el envío roto. No tocarlo sin Manoli.
- **Decisión pendiente**: si se reactiva el envío. Responsable: Manoli.
- **Impacto**: nivel D. Facturas que no llegan y se cobran tarde.

#### A-47 · El plazo de vencimiento por defecto está en dos sitios y el pago al contado se ignora

- **Descripción**: la factura manual usa `VENCIMIENTO_DIAS` y la remesa un 30 escrito en el código. Un
  `dias_pago` de 0 (contado) se trata como «sin dato» y se convierte en 30 días.
- **Origen**: ANO-012 (RAREZA, BAJA), ANO-041 (RAREZA, BAJA); contradicción 05; RN-24, RN-42 (en parte); R31;
  reglas §12 n.º 15.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:68-69`; `scripts/remesa_mensual.js:9-12,60`; `config.js:39-40`; `db.js:28`.
    Hoy coinciden porque los dos valen 30 (contradicción 05 §3).
  - DATOS: sin veredicto. Lo daría **D-27**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 27; Marga (simulada por el consultor)): respuesta prevista: 30 días por defecto; el contado vence el mismo día. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: ACCIDENTAL.
  - Desbloquea: **P-51** (Marga y responsable del proyecto): «En el `config.js` del servidor, ¿qué valores
    tienen `VENCIMIENTO_DIAS` e `IVA_DEFECTO`? ¿Se han cambiado alguna vez?», junto con **D-27**.
- **Dependientes**: los clientes al contado, si los hay.
- **Tratamiento propuesto**: especificar tal cual. No retroactivo.
- **Decisión pendiente**: si el plazo por defecto es configurable. Responsable: Marga.
- **Impacto**: nivel D (plazo de cobro).

#### A-48 · `sumarDias` lee en UTC y escribe en hora local

- **Descripción**: en un equipo con zona horaria al oeste de UTC, todos los vencimientos saldrían un día antes.
  En España no se manifiesta, y el desfase de marzo de 2019 sigue sin explicar.
- **Origen**: ANO-030 (RIESGO, BAJA); contradicción 12; H-10; R27; reglas §12 n.º 13; memoria §3 (utilidades
  del Access).
- **Evidencia**:
  - CÓDIGO: `lib/util.js:17-26`. Ejecutado con cinco zonas horarias: con `America/New_York`,
    `sumarDias('2026-03-01', 0)` da 28/02/2026 (contradicción 12 §3).
  - DATOS: sin veredicto. Lo daría **D-27** (vencimientos que no son fecha + días).
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS latente.
  - Desbloquea: **P-12** (Marga): «¿Hay registro de la factura de marzo de 2019 cuyo vencimiento salió un día
    menos? ¿Qué zona horaria muestra Windows en el equipo de la oficina y en el que lanza la remesa?», junto
    con **D-27**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: especificar tal cual con la zona `Europe/Madrid`. Corregir en modernización. No
  retroactivo.
- **Decisión pendiente**: ninguna de negocio.
- **Impacto**: nivel D.

#### A-49 · El NIF solo se valida por longitud

- **Descripción**: el NIF es opcional y solo se comprueba que tenga 9 caracteres. Se guarda tal como se
  teclea. La letra se iba a comprobar «de momento» a mano.
- **Origen**: ANO-018 (RIESGO, MEDIA); RN-53 (INTENCIONAL provisional, H-04); R11.
- **Evidencia**:
  - CÓDIGO: `lib/util.js:41-48` (Julián, 11/2017); `routes/clientes.js:16-22`; `db.js:101`. «ABCDEFGHI» se
    acepta (reglas, apéndice A, caso 21).
  - DATOS: sin veredicto. Lo daría **D-28**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 28; Marga (simulada por el consultor)): respuesta prevista: sigue comprobando la letra a ojo; cuando no está, nadie da de alta clientes. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**, candidata a INTENCIONAL como solución provisional (1 de 3).
  - Desbloquea: **P-23** (Marga): «¿Sigue comprobando a mano la letra de cada NIF nuevo? ¿Quién da de alta
    clientes cuando usted no está?», junto con **D-28**.
- **Dependientes**: los clientes que ya tienen guardado un NIF con guiones, espacios o minúsculas, que así sale
  en sus facturas y en el CSV.
- **Tratamiento propuesto**: especificar tal cual. En modernización, validar los NIF nuevos sin reescribir los
  ya guardados. No retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel D. Facturas que el cliente no puede deducir y que hay que rectificar.

#### A-50 · La factura reimpresa usa los datos actuales del cliente y de la empresa

- **Descripción**: al reimprimir una factura se toman el nombre, el NIF, la dirección y la marca de recargo
  actuales del cliente y los datos actuales de la empresa.
- **Origen**: ANO-019 (RIESGO, MEDIA); RN-54 (DUDOSA); R29.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:106,111`; `views/factura_detalle.ejs:5-7,18-20,43`; `db.js:50-63` (la factura no
    guarda esos datos).
  - DATOS: **imposible**, porque la BD no guarda los datos del cliente en la fecha de emisión. Se aplica la
    excepción del apartado 0.3.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 26; Puri (simulada por el consultor)): respuesta prevista: la reimpresión debe llevar los datos del momento de la emisión. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE** (se cierra con CÓDIGO y NEGOCIO).
  - Desbloquea: **P-66** (nueva, Puri): «Al reimprimir una factura antigua, ¿deben salir los datos del cliente y
    de la empresa de la fecha de emisión? ¿Se ha reimprimido alguna después de un cambio de domicilio o de
    datos registrales?», y **P-54**.
- **Dependientes**: el CSV, que también usa el nombre y el NIF actuales (RN-49).
- **Tratamiento propuesto**: especificar tal cual. Si se decide guardar los datos de emisión, se hace en
  modernización y solo para las facturas nuevas.
- **Decisión pendiente**: con qué datos se reimprime. Responsable: Puri.
- **Impacto**: nivel D. El documento reimpreso es distinto del emitido.

#### A-51 · La rectificativa se imprime con el título «FACTURA»

- **Descripción**: la rectificativa impresa se titula «FACTURA» seguido del número, con un «Rectifica a:»
  añadido. Las cantidades salen con punto decimal y los botones solo se muestran en las FA emitidas.
- **Origen**: ANO-020 (RAREZA, MEDIA); RN-55 (DUDOSA).
- **Evidencia**:
  - CÓDIGO: `views/factura_detalle.ejs:10-14,27,32,37-43,47-52`.
  - DATOS: no aplica. Lo que pide la norma es una **SUPOSICIÓN**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 26; Puri (simulada por el consultor)): respuesta prevista: la rectificativa debe titularse «FACTURA RECTIFICATIVA». **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-10** (Puri): «¿Basta con "Rectifica a: …" o la rectificativa debe titularse expresamente
    "factura rectificativa"?».
- **Dependientes**: las rectificativas ya enviadas a los clientes.
- **Tratamiento propuesto**: especificar tal cual. Si la norma exige otro título, se corrige en modernización
  sin retroactividad.
- **Decisión pendiente**: el formato de la rectificativa impresa. Responsable: Puri.
- **Impacto**: nivel D (requisito formal).

#### A-52 · El CSV no escapa el `;` ni los saltos de línea del nombre del cliente

- **Descripción**: un nombre de cliente con `;` o con un salto de línea desplaza las columnas del fichero que
  importa Contaplus.
- **Origen**: ANO-015 (RIESGO, MEDIA); R30.
- **Evidencia**:
  - CÓDIGO: `routes/informes.js:43-45`; `routes/clientes.js:21-22`.
  - DATOS: sin veredicto. Lo daría **D-29**.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 10; Puri (simulada por el consultor)): respuesta prevista: no cambiar nada del formato del CSV, tampoco el escape del `;`, sin avisar a la gestoría y probarlo con ella. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-28** (Puri), junto con **D-29**.
- **Dependientes**: la gestoría (A-09).
- **Tratamiento propuesto**: corregir en modernización **solo con Puri**, porque cualquier escape cambia el
  contrato del fichero.
- **Decisión pendiente**: cómo escapar. Responsable: Puri.
- **Impacto**: nivel D.

#### A-53 · El informe de IVA toma el 1T por defecto y el menú solo ofrece el año en curso

- **Descripción**: un trimestre vacío, 0 o no numérico muestra el 1T sin avisar, y uno de 5 en adelante da error
  500. En enero, el menú no enlaza el 4T ni el fichero del año anterior.
- **Origen**: ANO-026 (RAREZA, BAJA), ANO-063 (RAREZA, BAJA); RN-46.
- **Evidencia**:
  - CÓDIGO: `routes/informes.js:9-11,15-18`; `views/informes.ejs:4-8`.
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: ACCIDENTAL.
  - Desbloquea: **P-64** (nueva, Marga y Puri): «En enero, ¿cómo obtiene el resumen del 4T y el fichero del año
    anterior, si el menú solo ofrece el año en curso?».
- **Dependientes**: quien prepara la entrega trimestral a la gestoría.
- **Tratamiento propuesto**: especificar tal cual. Corregir el menú en modernización.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel D (riesgo de entregar el trimestre equivocado).

#### A-54 · El orden de numeración de la remesa no está definido

- **Descripción**: los contratos de la remesa, y con ellos el orden de los números, y las líneas que copia la
  rectificativa salen en el orden que devuelva SQLite, porque las consultas no tienen `ORDER BY`.
- **Origen**: ANO-037 (RAREZA, BAJA); RN-39 (en parte).
- **Evidencia**:
  - CÓDIGO: `scripts/remesa_mensual.js:26-28`; `routes/facturas.js:135` (frente a `:109`).
  - DATOS: sin veredicto. Lo daría **D-30**.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: ACCIDENTAL.
  - Desbloquea: **P-59** (nueva, Marga y Puri): «¿Importa en qué orden se numeran las cuotas de la remesa? ¿La
    gestoría espera algún orden?», junto con **D-30**.
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: especificar el orden que se observe en D-30. Al modernizar, fijarlo de forma
  explícita para que no cambie sin querer.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel D.

#### A-55 · Textos automáticos de las observaciones y las líneas

- **Descripción**: sin observaciones, el aviso de descuento se graba con un espacio inicial. La remesa no añade
  ese aviso. La línea de un mes parcial dice «(N dias)» sin el mes. Sin motivo, una rectificativa termina en
  «. ».
- **Origen**: ANO-024, ANO-036, ANO-038, ANO-065 (RAREZAS, BAJA); RN-16, RN-42 (las partes ACCIDENTALES).
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:76,143`; `scripts/remesa_mensual.js:53,62`.
  - DATOS: sin veredicto. Lo daría **D-31**.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: ACCIDENTAL.
  - Desbloquea: **P-62** (nueva, Marga): «¿Algún cliente ha preguntado por una cuota con "(N dias)" sin el mes,
    o por una factura con descuento sin explicación? ¿El motivo de la rectificativa debería ser obligatorio?»,
    junto con **D-31**.
- **Dependientes**: los clientes que leen esas facturas.
- **Tratamiento propuesto**: especificar tal cual (son textos de documentos emitidos). No retroactivo.
- **Decisión pendiente**: ninguna más allá de la clasificación.
- **Impacto**: nivel D.

#### A-56 · El programa tiene dos rutas en el servidor y `config.js` se copia a mano

- **Descripción**: `config.js` da la ruta `\\SERVIDOR\gesfact` y `LEEME.txt`, `\\SERVIDOR\compartido\gesfact`.
  Además, `config.js` «se copia a mano al servidor» y no se puede renombrar, así que no se sabe qué valores
  tiene en producción.
- **Origen**: ANO-058 (RAREZA, BAJA); H-23; memoria §3 («NO RENOMBRAR»).
- **Evidencia**:
  - CÓDIGO: `config.js:1-3`; `LEEME.txt:6`.
  - DATOS: no aplica. El veredicto es comparar el `config.js` del servidor con el del repositorio, sin copiar sus
    secretos.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-40** (Marga): «¿Cuál es la ruta real del programa en el servidor? ¿Quién copia `config.js`
    y cuándo lo hizo por última vez?», y **P-51**.
- **Dependientes**: el procedimiento de copia manual de `config.js` y todo lo que lee su configuración (A-47,
  A-38).
- **Tratamiento propuesto**: especificar tal cual el nombre `config.js`. Documentar la ruta real cuando se
  conozca.
- **Decisión pendiente**: ninguna de negocio.
- **Impacto**: nivel D.

#### A-57 · Avisos de seguridad en las dependencias fijadas

- **Descripción**: `npm audit` del 13/11/2026 da cuatro avisos: `proxy-addr` (crítico, aunque solo afecta si se
  configura `trust proxy`, y no se configura), `body-parser` (alto), `brace-expansion` (alto) y `qs`
  (moderado). `nodemailer` se desinstaló en 2023 por un aviso.
- **Origen**: ANO-050 (RIESGO, MEDIA); R26; H-18.
- **Evidencia**:
  - CÓDIGO: `package-lock.json:49-50,73-74,651-652,664-665`; registro de riesgos, apéndice A, caso 9.
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS (riesgo).
  - Desbloquea: **P-35** (responsable del proyecto): «¿Quién desinstaló `nodemailer` en 2023 y por qué aviso?
    ¿Se ha cambiado algo más en el equipo de la oficina?».
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización. En esta fase está prohibido tocar las dependencias
  (Principio IV), así que `npm audit fix` no se ejecuta.
- **Decisión pendiente**: ninguna de negocio.
- **Impacto**: nivel D (posible denegación de servicio desde la red local).

#### A-58 · No hay `.gitignore`

- **Descripción**: sin `.gitignore`, una BD con datos de clientes se puede subir al repositorio por accidente.
- **Origen**: ANO-028 (RIESGO, MEDIA).
- **Evidencia**:
  - CÓDIGO: listado de la raíz (13/11/2026 y 16/11/2026).
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 30; Responsable del proyecto (simulado por el consultor)): respuesta prevista: `.gitignore` autorizado (no vale como autorización: hace falta por escrito). **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-18** (visibilidad del repositorio).
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir cuanto antes, porque es un fichero nuevo y no toca código. Sin embargo, la
  constitución solo permite crear ficheros de documentación, especificación y test, así que necesita
  aprobación expresa del responsable del proyecto. Hasta entonces, las copias de la BD se guardan fuera del
  repositorio.
- **Decisión pendiente**: autorizar el `.gitignore`. Responsable: el responsable del proyecto.
- **Impacto**: nivel D (riesgo de exponer datos de clientes).

#### A-59 · Datos personales en la consola y errores internos en pantalla

- **Descripción**: el aviso de correo escribe el email del cliente en la consola, y todas las rutas devuelven al
  navegador el mensaje de error interno de la BD.
- **Origen**: ANO-056 (RIESGO, BAJA); R33.
- **Evidencia**:
  - CÓDIGO: `services/email.js:26-27`; `routes/facturas.js:24,72,78,92` (`'Error BD: ' + err.message`).
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**. Hipótesis: BUG A SECAS.
  - Desbloquea: **P-61** (nueva, responsable del proyecto): «¿Se guarda en algún sitio la salida de la consola
    del servidor? ¿Quién puede verla?».
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: corregir en modernización. Los mensajes de error son comportamiento observable:
  se caracterizan antes de cambiarlos.
- **Decisión pendiente**: ninguna de negocio.
- **Impacto**: nivel D.

#### A-60 · Documentación y comentarios que ya no describen el sistema

- **Descripción**: el `LEEME.txt`, fechado en 2019, cita hechos de 2021 y 2022 y manda instalar Node 8. El pie
  de página remite a Julián para soporte. Varios comentarios dan una seguridad que el código no respalda («no ha
  vuelto a pasar», «cuadran solas», «correlativa y sin huecos»).
- **Origen**: R14, R31; H-11, H-27; memoria §5, patrones 2 y 5. Cada discrepancia concreta está además en su
  propia entrada (apartado 4.4).
- **Evidencia**:
  - CÓDIGO: `LEEME.txt:5,13-16,20`; `views/pie.ejs:2`; `lib/numeracion.js:3-10`; `routes/facturas.js:81-82`;
    `routes/informes.js:21-22`.
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 30; Responsable del proyecto (simulado por el consultor)): respuesta prevista: no sabe quién da hoy el soporte. Sin respuesta concluyente. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-29** (responsable del proyecto): «¿Quién ha editado el `LEEME.txt` después de 2019? ¿Hay
    otra documentación?»; **P-08** (responsable del proyecto): «¿Quién da soporte ahora que Julián no está?
    ¿Qué decisiones corresponden a Paco y a Manoli?».
- **Dependientes**: la oficina, que sigue el pie de página y el `LEEME.txt`.
- **Tratamiento propuesto**: documentar sin especificar. Los comentarios no se corrigen (el código es de solo
  lectura): este registro deja constancia de la discrepancia.
- **Decisión pendiente**: quién es el contacto de soporte. Responsable: el responsable del proyecto.
- **Impacto**: nivel D.

#### A-61 · Deuda técnica: ningún test y lógica duplicada

- **Descripción**: no hay ni un test. El `INSERT` de cabecera está copiado en tres sitios, hay dos prorrateos y
  cada camino trata los errores de una forma. El propio autor dice que `routes/facturas.js` «habría que
  partirlo».
- **Origen**: R16; H-26.
- **Evidencia**:
  - CÓDIGO: `routes/facturas.js:2-3,74,86,141,149`; `scripts/remesa_mensual.js:61,67`; CLAUDE.md («Aún no
    existen tests»).
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-63** (nueva, responsable del proyecto): «¿Se acepta que la modernización no empiece hasta
    que los tests de caracterización cubran todas las anomalías de este registro?».
- **Dependientes**: cualquier cambio futuro.
- **Tratamiento propuesto**: documentar sin especificar. Es la razón de ser de los tests de esta fase.
- **Decisión pendiente**: la condición de entrada de la modernización. Responsable: el responsable del
  proyecto.
- **Impacto**: nivel D.

#### A-62 · Partes abandonadas: migración a MySQL, albaranes y datos del Access

- **Descripción**: hay un volcado de MySQL de 2018 que nunca se ejecutó y está desfasado. El módulo de albaranes
  de Roberto está «a medias en su ordenador» y no hay ni una línea en el repositorio. No consta si los datos del
  Access 1.x pasaron a la 2.0.
- **Origen**: H-03, H-08, H-15; memoria §4; CLAUDE.md (partes rotas o a medias).
- **Evidencia**:
  - CÓDIGO: `datos/migracion_mysql_2018.sql:1-5`; `LEEME.txt:12-16`.
  - DATOS: no aplica.
  - NEGOCIO: sin testimonio.
  - NEGOCIO, acta simulada del 16/11/2026 ([entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), pregunta 23 y 30; Puri y responsable del proyecto (simulados por el consultor)): respuesta prevista: MySQL y albaranes abandonados; el Access nunca se ha reabierto. **SUPOSICIÓN: no cuenta como testigo** (acta §0; Principio II). Clasificación sin cambio (apartado 5).
- **Clasificación final**: **PENDIENTE**.
  - Desbloquea: **P-27** (responsable del proyecto): «¿La migración a MySQL se da por abandonada?»; **P-09** y
    **P-41** (Paco y Marga): «¿Qué tenía que hacer el módulo de albaranes? ¿Se sigue necesitando?»; y **P-22**
    (Paco y Puri): «¿Los datos del Access pasaron a la 2.0?».
- **Dependientes**: nadie identificado.
- **Tratamiento propuesto**: documentar sin especificar. Fuera del alcance de las specs de comportamiento.
- **Decisión pendiente**: si alguna de estas líneas sigue viva. Responsable: el responsable del proyecto.
- **Impacto**: nivel D.

---

## 2. Tabla resumen

| ID | Anomalía | Nivel | Clasificación | Hipótesis del código | Tratamiento propuesto | Decisión pendiente (responsable) |
|---|---|---|---|---|---|---|
| A-01 | IVA del periodo: líneas frente a cabeceras | A | PENDIENTE | Bug con dependientes | Especificar tal cual + control | Cifra oficial del IVA (Puri / negocio) |
| A-02 | Redondeo línea a línea (protegida) | A | PENDIENTE | Intencional | Especificar tal cual | — |
| A-03 | Año del número = reloj | A | PENDIENTE | Bug con dependientes | Corregir, no retroactivo | Qué año manda (negocio / Puri) |
| A-04 | Números duplicados | A | PENDIENTE | Bug con dependientes | Corregir, no retroactivo | Duplicados existentes (Marga, Puri) |
| A-05 | Alta sin transacción: huecos | A | PENDIENTE | Bug con dependientes | Corregir, no retroactivo | Justificar huecos (Puri) |
| A-06 | Remesa duplicada o a medias | A | PENDIENTE | Bug a secas | Corregir | Relanzar un mes (Marga) |
| A-07 | No se borran facturas (protegida) | A | PENDIENTE | Intencional | Especificar tal cual | — |
| A-08 | Numeración por serie y año (protegida) | A | PENDIENTE | Intencional | Especificar tal cual | — |
| A-09 | Formato del CSV (protegida) | A | PENDIENTE | Intencional | Especificar tal cual | — |
| A-10 | Rectificativa espejo (protegida) | A | PENDIENTE | Intencional | Especificar tal cual | Originales mal calculadas (Puri) |
| A-11 | Fecha de la rectificativa | A | PENDIENTE | Sin indicio | Especificar tal cual | Fecha fiscal del abono (Puri) |
| A-12 | Copia de seguridad semanal | A | PENDIENTE | Bug a secas | Documentar sin especificar | Política de copias (responsable) |
| A-13 | Concurrencia SQLite / red | A | PENDIENTE | Bug a secas | Documentar; corregir | — |
| A-14 | BD relativa al directorio | A | PENDIENTE | Bug a secas | Especificar tal cual | — |
| A-15 | Semilla de referencia descuadrada | A | PENDIENTE | Depende de P-05 | Documentar sin especificar | Facturas descuadradas (Puri) |
| A-16 | Importes con punto de miles | B | PENDIENTE | Bug a secas | Corregir, no retroactivo | Formato de entrada (Marga) |
| A-17 | Dos prorrateos | B | PENDIENTE | Uno intencional, otro bug | Especificar; unificar | Qué prorrateo (Paco / Puri) |
| A-18 | Doble cobro del último mes | B | PENDIENTE | Bug con dependientes | Corregir, no retroactivo | Quién factura el último mes (Marga, Paco) |
| A-19 | Cuotas a clientes de baja | B | PENDIENTE | Bug a secas | Corregir, no retroactivo | Contratos al dar de baja (Marga) |
| A-20 | Filas sin descripción descartadas | B | PENDIENTE | Bug a secas | Corregir | — |
| A-21 | Salto del descuento en el umbral | B | PENDIENTE | Sin indicio | Especificar tal cual | Diseño del descuento (Paco) |
| A-22 | Descuento a todos los clientes | B | PENDIENTE | Sin indicio | Especificar tal cual | A quién se aplica (Paco) |
| A-23 | Dos formas de abonar | B | PENDIENTE | Bug con dependientes | Especificar tal cual | Abono parcial (Puri, Marga) |
| A-24 | Descuento en cuotas de remesa | B | PENDIENTE | Sin indicio | Especificar tal cual | Si las cuotas llevan descuento (Paco) |
| A-25 | Rectificación sin transacción | B | PENDIENTE | Bug a secas | Corregir | — |
| A-26 | Doble rectificación simultánea | B | PENDIENTE | Bug a secas | Corregir | — |
| A-27 | Doble envío del alta | B | PENDIENTE | Bug a secas | Corregir | — |
| A-28 | Líneas sin validar | B | PENDIENTE | Depende de P-17 | Especificar; corregir el `NaN` | Negativos en FA (Puri, Marga) |
| A-29 | Bajas de contrato sin validar | B | PENDIENTE | Bug a secas | Corregir | — |
| A-30 | Baja futura: pantalla frente a remesa | B | PENDIENTE | Accidental (pantalla) | Especificar la remesa; corregir la pantalla | — |
| A-31 | Fechas de texto sin validar | B | PENDIENTE | Formato intencional; validación bug | Especificar formato; validar | — |
| A-32 | Mes de remesa sin validar | B | PENDIENTE | Bug a secas | Corregir | — |
| A-33 | Tramos «estrictamente mayor» (protegida) | C | PENDIENTE | Intencional (RN-11); accidental (RN-12) | Especificar tal cual | — |
| A-34 | FA-107 idéntica a FA-106 | C | PENDIENTE | Sin indicio | Documentar sin especificar | Abonar un duplicado vivo (Marga) |
| A-35 | Prorrateo comercial en febrero | C | PENDIENTE | Bug | Especificar tal cual | Con A-17 (Paco) |
| A-36 | Descuento sobre precio unitario | C | PENDIENTE | Sin indicio | Especificar tal cual | — |
| A-37 | Coma flotante, mitades negativas (protegida) | C | PENDIENTE | Bug con dependientes | Especificar tal cual | — |
| A-38 | Tipos de IVA desalineados | C | PENDIENTE | Antiguos intencionales; recargo 0 accidental | Especificar tal cual | Tipos admitidos (Puri) |
| A-39 | Cobrar o rectificar: pantalla frente a servidor | C | PENDIENTE | Sin indicio | Especificar tal cual | Modelo de cobros (Marga, Puri) |
| A-40 | `toFixed` frente a `redondear2` | C | PENDIENTE | Accidental | Especificar tal cual | Decimales del precio (Puri) |
| A-41 | Cuatro «pendiente de cobro» | C | PENDIENTE | Accidental | Especificar; corregir | Qué es «pendiente» (Marga) |
| A-42 | Indicador de recargo con dos criterios | C | PENDIENTE | Accidental | Especificar tal cual | Con A-50 |
| A-43 | Credenciales en claro y en git | D | PENDIENTE | Bug a secas | Corregir (no retroactivo) | Contraseña y repositorio (Manoli, responsable) |
| A-44 | Sin autenticación | D | PENDIENTE | Bug a secas | Corregir | Quién factura y desde dónde (negocio) |
| A-45 | Reinstalación no reproducible | D | PENDIENTE | Sin indicio | Documentar | Versión de Node (responsable) |
| A-46 | Correo desactivado | D | PENDIENTE | Sin indicio | Documentar sin especificar | Reactivar el envío (Manoli) |
| A-47 | Vencimiento por defecto duplicado | D | PENDIENTE | Accidental | Especificar tal cual | Plazo configurable (Marga) |
| A-48 | `sumarDias` en UTC | D | PENDIENTE | Bug latente | Especificar tal cual | — |
| A-49 | NIF por longitud | D | PENDIENTE | Intencional provisional | Especificar tal cual | — |
| A-50 | Reimpresión con datos actuales | D | PENDIENTE | Sin indicio | Especificar tal cual | Datos de reimpresión (Puri) |
| A-51 | Rectificativa titulada «FACTURA» | D | PENDIENTE | Sin indicio | Especificar tal cual | Formato de la RE (Puri) |
| A-52 | CSV sin escape | D | PENDIENTE | Bug a secas | Corregir solo con Puri | Cómo escapar (Puri) |
| A-53 | Menú e informe de IVA por defecto | D | PENDIENTE | Accidental | Especificar; corregir el menú | — |
| A-54 | Orden sin `ORDER BY` | D | PENDIENTE | Accidental | Especificar el orden observado | — |
| A-55 | Textos automáticos | D | PENDIENTE | Accidental | Especificar tal cual | — |
| A-56 | Rutas del servidor y `config.js` | D | PENDIENTE | Sin indicio | Especificar tal cual el nombre | — |
| A-57 | Avisos de dependencias | D | PENDIENTE | Bug a secas | Corregir en modernización | — |
| A-58 | Sin `.gitignore` | D | PENDIENTE | Bug a secas | Corregir con autorización | Autorizarlo (responsable) |
| A-59 | Datos personales en la consola | D | PENDIENTE | Bug a secas | Corregir | — |
| A-60 | Documentación obsoleta | D | PENDIENTE | Sin indicio | Documentar sin especificar | Contacto de soporte (responsable) |
| A-61 | Sin tests, lógica duplicada | D | PENDIENTE | Sin indicio | Documentar sin especificar | Condición de entrada (responsable) |
| A-62 | Partes abandonadas | D | PENDIENTE | Sin indicio | Documentar sin especificar | Si siguen vivas (responsable) |

**Recuento**: 62 entradas (15 de nivel A, 17 de B, 10 de C y 20 de D). **PENDIENTES: 62.** INTENCIONAL: 0.
ACCIDENTAL: 0. BUG HISTÓRICO CON DEPENDIENTES: 0. BUG A SECAS: 0. Sin cambios tras la propagación del acta
simulada del 16/11/2026 (apartado 5).

---

## 3. Clasificaciones PENDIENTES: agenda de la próxima conversación con el negocio

**La lista no está vacía: tiene 62 entradas, de A-01 a A-62.** Hasta que no lo esté, no se deben escribir las
specs formales. Para vaciarla hacen falta dos cosas, y la segunda depende de un paso previo:

- **Paso previo (bloquea 31 consultas)**: conseguir una **copia fechada** de `datos/gesfact.db` de producción,
  por ejemplo la del pendrive del viernes. Se trata como confidencial y se guarda **fuera del repositorio**,
  porque no hay `.gitignore` (A-58). Las consultas se ejecutan sobre la copia, nunca sobre el fichero de
  producción (Principio I).
- Las entrevistas del apartado 3.1 y las consultas del apartado 3.2.

**Estado tras el acta simulada del 16/11/2026**: la lista sigue teniendo **62 entradas**. El acta no ha cerrado
ninguna. Su §2 da una respuesta prevista para cada pregunta, que sirve de hipótesis que confirmar o desmentir,
y su §6 recoge lo que queda sin respuesta y las preguntas nuevas **P-67 a P-74**, que se han añadido abajo. La
entrevista tiene que repetirse con las personas reales y quedar en `entrevista-negocio.md`, con nombre, fecha y
respuesta.

### 3.1 Preguntas por interlocutor

En cada grupo, primero las que desbloquean más impacto. «Reformulada» indica que la pregunta original se ha
concretado en la entrada correspondiente.

**Puri (gestoría)**

| Pregunta | Desbloquea |
|---|---|
| P-49: para el 303, ¿pantalla, CSV o las dos? ¿Ha visto que no coincidan? | A-01 |
| P-30 y P-25 (reformuladas): ¿Contaplus exige el IVA como suma de cuotas por línea? ¿Qué trimestre devolvió en 2019? ¿El descuento por precio unitario es el desglose que pidió? | A-02, A-36, A-37 |
| P-48: ¿en qué ejercicio van las cuotas de diciembre numeradas con el año siguiente? ¿El formato `SERIE-AAAA-NNNNNN` es el que se dio por bueno? | A-03, A-08 |
| P-28: ¿hay especificación escrita del CSV? ¿Qué pasa si cambia? (y pedir un CSV real recibido, D-07) | A-09, A-52 |
| P-39: ¿rectificativas parciales? ¿Espejo aunque la original esté mal? | A-10, A-23 |
| P-43: ¿con qué fecha va la rectificativa de un periodo cerrado? | A-11 |
| P-04: ¿prorrateo de 30 días o días reales? | A-17 |
| P-05: ¿las facturas de la semilla existen en producción? (con Marga) | A-15 |
| P-57, P-16, P-58: abonos parciales, devoluciones, rectificar facturas cobradas (con Marga) | A-23, A-39 |
| P-42 y P-22: tipos temporales y antiguos, porcentajes de recargo vigentes | A-38, A-62 |
| P-46 y P-52: céntimos en abonos negativos y precios con más de dos decimales (con Marga) | A-37, A-40 |
| Confirmación de A-33: base de 1.000 € justos y umbral medido con las líneas redondeadas | A-33 |
| P-10: título de la rectificativa impresa | A-51 |
| **P-66** (nueva): ¿con qué datos del cliente y de la empresa se reimprime una factura antigua? | A-50 |
| **P-59** (nueva, con Marga): ¿importa el orden de numeración de la remesa? | A-54 |
| **P-64** (nueva, con Marga): ¿cómo se obtienen en enero el 4T y el fichero del año anterior? | A-53 |
| P-54: leyenda de recargo al reimprimir (con Marga) | A-42, A-50 |
| **P-67** (nueva, acta simulada; con el negocio): si la pantalla y Contaplus no coinciden, ¿qué cifra manda y cómo se regularizan los 303 ya presentados? | A-01 |
| **P-68** (nueva, acta simulada): ¿hay algún cuadre, aunque sea anual (390, libro de facturas emitidas), entre el IVA declarado y el de Contaplus? | A-01 |
| **P-70** (nueva, acta simulada): entregar copia del requerimiento de la inspección de 2020, si existe | A-05, A-07, A-08 |
| **P-72** (nueva, acta simulada; con Marga): abonos parciales con FA en negativo: ¿desde cuándo, cuántos, cómo los identifica Contaplus? | A-23, A-28 |

**Paco** (**SUPOSICIÓN**: quien decide la política comercial; P-08)

| Pregunta | Desbloquea |
|---|---|
| P-31: organismo y conclusiones de la inspección de 2020 | A-07, A-08 |
| P-45: ¿el descuento va sobre toda la base o solo sobre el exceso? | A-21, A-33 |
| P-24: ¿sigue vigente el descuento? ¿Solo para hostelería? | A-22, A-33 |
| P-14: ¿descuento en las cuotas? ¿Hay cuotas de más de 1.000 €? (con Marga) | A-24 |
| P-21: ¿cómo prorrateaba febrero y el día 31? | A-17, A-35 |
| P-44: ¿se cobran el día de alta y el de baja? (con Marga) | A-17 |
| P-41 y P-09: módulo de albaranes (con Marga) | A-62 |
| **P-69** (nueva, acta simulada; con Puri): si se confirma el doble cobro del último mes, ¿se devuelve a los clientes y cómo? | A-18, A-30 |

**Marga (administración)**

| Pregunta | Desbloquea |
|---|---|
| **Entregar una copia fechada de la BD** (paso previo) | 31 consultas del apartado 3.2 |
| P-06: números de las remesas de diciembre de años anteriores | A-03 |
| P-32: duplicado del 02/01/2021 | A-04 |
| P-38: factura con las líneas a medias; quién edita la BD y cómo | A-05, A-31 |
| P-20: remesas interrumpidas o repetidas | A-06, A-32 |
| P-19 y P-40: copia de los viernes, restauración, sustitutos, ruta real y `config.js` | A-12, A-14, A-56 |
| P-01 y P-26: dónde está la BD, cuántos puestos, pérdidas en 2018 | A-13, A-14, A-44 |
| P-36, P-15 y P-37: FA-106/107, líneas de artículos en remesas, origen de la semilla | A-15, A-34 |
| P-13 y P-53: punto de miles y copias entre pantallas | A-16 |
| P-03: doble factura del último mes | A-18 |
| P-55 y P-07: clientes de baja con contratos; cómo se corrigen fichas sin pantalla | A-19, A-42 |
| P-47: filas con precio y sin descripción | A-20 |
| P-17: líneas negativas en facturas FA | A-23, A-28 |
| **P-65** (nueva): rectificaciones colgadas o repetidas; facturas grabadas dos veces | A-25, A-26, A-27, A-29 |
| P-56: bajas o altas de contrato con fecha futura | A-29, A-30 |
| P-50: qué cifra del panel usa para lo pendiente de cobro | A-41 |
| P-51 (con el responsable del proyecto): valores de `config.js` en el servidor | A-38, A-47, A-56 |
| P-12: factura de marzo de 2019 y zona horaria del equipo | A-48 |
| P-23: comprobación de la letra del NIF | A-49 |
| **P-62** (nueva): textos «(N dias)», descuento sin explicación, motivo de la RE | A-55 |
| **P-60** (nueva, con el responsable del proyecto): puestos y redes con acceso al puerto 3000 | A-44 |
| **P-71** (nueva, acta simulada): con una baja futura, ¿qué fecha y qué periodo lleva la factura del último mes hecha a mano? | A-29, A-30 |
| **P-73** (nueva, acta simulada): devoluciones por transferencia fuera del programa: ¿dónde queda constancia y quién las autoriza? | A-39 |

**Manoli**

| Pregunta | Desbloquea |
|---|---|
| P-34: qué cambió en Arsys y si se reactiva el correo | A-46 |
| P-18 (con el responsable del proyecto): si la contraseña del buzón sigue activa | A-43 |

**Responsable del proyecto**

| Pregunta | Desbloquea |
|---|---|
| P-08: papeles de Paco y Manoli; quién da soporte | A-60 y todas las decisiones atribuidas a Paco |
| P-18: visibilidad del repositorio y accesos | A-43, A-58 |
| P-02, P-11 y P-35: versión de Node, forma de instalación y cambios no versionados | A-45, A-57 |
| P-33: quién decidió los días reales en la remesa | A-17 |
| P-29: ediciones del `LEEME.txt` y otra documentación | A-60 |
| P-27: migración a MySQL | A-62 |
| **P-61** (nueva): dónde va la salida de la consola | A-59 |
| **P-63** (nueva): condición de entrada a la modernización | A-61 |
| Autorizar un `.gitignore` (excepción a la constitución) | A-58 |
| **P-74** (nueva, acta simulada): fecha y asistentes de la entrevista real; que Puri traiga un CSV real y el requerimiento de 2020 | Todas las entradas |

### 3.2 Consultas de arqueología de datos

Las ejecuta el equipo de documentación sobre la copia fechada. En el resultado se anota la fecha de la copia y
la de la consulta (Principio II), y no se copian datos de clientes al repositorio. El SQL es de SQLite.

| ID | Consulta | Desbloquea |
|---|---|---|
| D-01 | Cabeceras que no cuadran con sus líneas o no tienen líneas: `SELECT f.numero, f.base, ROUND(TOTAL(l.base),2) AS base_l, f.iva, ROUND(TOTAL(l.cuota_iva),2) AS iva_l, f.recargo, ROUND(TOTAL(l.cuota_recargo),2) AS rec_l, COUNT(l.id) AS n FROM facturas f LEFT JOIN lineas l ON l.factura_id = f.id GROUP BY f.id HAVING n = 0 OR ABS(f.base - base_l) > 0.005 OR ABS(f.iva - iva_l) > 0.005 OR ABS(f.recargo - rec_l) > 0.005;` | A-01, A-05, A-15 |
| D-02 | Líneas que no salen del cálculo actual: `SELECT f.numero, f.fecha, l.* FROM lineas l JOIN facturas f ON f.id = l.factura_id WHERE f.serie = 'FA' AND (ABS(l.base - l.cantidad * l.precio) > 0.0051 OR ABS(l.cuota_iva - l.base * l.tipo_iva / 100.0) > 0.0051);`. Las mitades exactas se revisan después con `redondear2` en JavaScript, porque `ROUND` de SQLite no redondea igual | A-02, A-15, A-37 |
| D-03 | Año del número distinto del año de la fecha: `SELECT numero, fecha FROM facturas WHERE substr(numero, 4, 4) <> substr(fecha, 1, 4);` | A-03 |
| D-04 | Números repetidos: `SELECT numero, COUNT(*) FROM facturas GROUP BY numero HAVING COUNT(*) > 1;` | A-04 |
| D-05 | Huecos y contadores: `SELECT serie, substr(numero, 4, 4) AS anyo, COUNT(*) AS n, MAX(CAST(substr(numero, 9) AS INTEGER)) AS maximo FROM facturas GROUP BY serie, anyo;`, comparado con `SELECT * FROM contadores;` (si n < máximo, hay huecos; si `ultimo` > máximo, hay números consumidos sin factura) | A-05, A-07, A-08 |
| D-06 | Cuotas de remesa repetidas: `SELECT cliente_id, observaciones, COUNT(*) FROM facturas WHERE observaciones LIKE 'Remesa %' GROUP BY cliente_id, observaciones HAVING COUNT(*) > 1;`. Se descartan a mano los clientes con dos contratos | A-06, A-34 |
| D-07 | Pedir a la gestoría un CSV real recibido y compararlo byte a byte con el que genera el código sobre la copia del mismo año | A-09, A-52 |
| D-08 | Coherencia entre cada rectificativa y su original: `SELECT r.numero, o.numero AS original, o.estado, ROUND(r.total + o.total, 2) AS descuadre, (SELECT COUNT(*) FROM lineas WHERE factura_id = r.id) AS lineas_re FROM facturas r LEFT JOIN facturas o ON o.numero = r.rectifica_a WHERE r.serie = 'RE';` y `SELECT rectifica_a, COUNT(*) FROM facturas WHERE serie = 'RE' GROUP BY rectifica_a HAVING COUNT(*) > 1;` | A-10, A-25, A-26 |
| D-09 | Rectificativas en otro trimestre o año que su original: `SELECT r.numero, r.fecha, o.fecha FROM facturas r JOIN facturas o ON o.numero = r.rectifica_a WHERE r.serie = 'RE' AND (substr(r.fecha,1,4) <> substr(o.fecha,1,4) OR (CAST(substr(r.fecha,6,2) AS INTEGER) + 2) / 3 <> (CAST(substr(o.fecha,6,2) AS INTEGER) + 2) / 3);` | A-11 |
| D-10 | Restaurar la última copia del pendrive en una carpeta temporal, ejecutar `PRAGMA integrity_check;` y comparar la última factura con la de producción | A-12, A-13 |
| D-11 | Buscar otros ficheros `gesfact.db` en los equipos de la oficina y comparar sus `contadores` | A-14 |
| D-12 | Facturas de la semilla en producción: `SELECT * FROM facturas WHERE numero BETWEEN 'FA-2026-000101' AND 'FA-2026-000108' OR numero = 'RE-2026-000001';`, junto con sus líneas, comparadas con `db.js:126-171`. Añadir las facturas de abril de 2026 del Bar Nuevo Siglo | A-15, A-34 |
| D-13 | Precios con más de dos decimales: `SELECT f.numero, l.descripcion, l.cantidad, l.precio FROM lineas l JOIN facturas f ON f.id = l.factura_id WHERE ABS(l.precio * 100 - ROUND(l.precio * 100)) > 1e-6;`. Revisar a mano los precios mil veces inferiores al del catálogo | A-16, A-40 |
| D-14 | Líneas de remesa parcial (`descripcion LIKE '%dias)'`): recalcular cada una en JavaScript con las dos fórmulas (`calcularProrrateo` y la de `scripts/remesa_mensual.js:51`) y ver cuál se usó | A-17, A-35 |
| D-15 | Doble factura en el mes de la baja: `SELECT c.id, c.fecha_baja, f.numero, f.fecha, f.base, f.observaciones FROM contratos c JOIN facturas f ON f.cliente_id = c.cliente_id WHERE c.fecha_baja IS NOT NULL AND f.serie = 'FA' AND substr(f.fecha, 1, 7) BETWEEN substr(c.fecha_baja, 1, 7) AND substr(date(c.fecha_baja, '+1 month'), 1, 7);`, con revisión manual | A-18 |
| D-16 | Facturas con descuento: `SELECT f.numero, c.nombre, c.recargo_equivalencia, f.base, f.observaciones FROM facturas f JOIN clientes c ON c.id = f.cliente_id WHERE f.observaciones LIKE '%Descuento volumen%' OR (f.observaciones LIKE 'Remesa %' AND f.base > 980);`, agrupando por cliente y por franja cercana a los umbrales | A-21, A-22, A-33 |
| D-17 | `SELECT * FROM contratos WHERE cuota > 1000;` | A-24 |
| D-18 | Facturas FA negativas, nulas o con líneas raras: `SELECT f.numero, f.fecha, f.total FROM facturas f WHERE f.serie = 'FA' AND (f.total <= 0 OR typeof(f.total) NOT IN ('real', 'integer') OR EXISTS (SELECT 1 FROM lineas l WHERE l.factura_id = f.id AND (l.cantidad <= 0 OR l.precio < 0 OR typeof(l.base) NOT IN ('real', 'integer'))));` | A-23, A-28 |
| D-19 | `SELECT f.numero, f.fecha FROM facturas f JOIN clientes c ON c.id = f.cliente_id WHERE c.activo = 0 AND f.serie = 'FA' ORDER BY f.fecha DESC;` y `SELECT co.* FROM contratos co JOIN clientes c ON c.id = co.cliente_id WHERE c.activo = 0 AND co.fecha_baja IS NULL;` | A-19 |
| D-20 | `SELECT * FROM contratos WHERE fecha_baja < fecha_alta OR fecha_baja > '<fecha de la copia>' OR fecha_alta > '<fecha de la copia>';` | A-29, A-30 |
| D-21 | `SELECT cliente_id, fecha, total, COUNT(*) FROM facturas WHERE serie = 'FA' GROUP BY cliente_id, fecha, total HAVING COUNT(*) > 1;` | A-27 |
| D-22 | Fechas mal formadas: `SELECT numero, fecha, vencimiento FROM facturas WHERE date(fecha) IS NOT fecha OR (vencimiento IS NOT NULL AND date(vencimiento) IS NOT vencimiento);` y lo mismo con `contratos.fecha_alta` y `fecha_baja` | A-31, A-32 |
| D-23 | Precio grabado frente al de catálogo en facturas con descuento: `SELECT f.numero, l.descripcion, l.precio, a.precio FROM lineas l JOIN facturas f ON f.id = l.factura_id JOIN articulos a ON a.nombre = l.descripcion WHERE f.observaciones LIKE '%Descuento volumen%';` (el precio de catálogo puede haber cambiado desde la emisión) | A-36 |
| D-24 | Tipos de IVA fuera de 21, 10 y 4 en `lineas`, `articulos` y `contratos`: `SELECT tipo_iva, COUNT(*) FROM lineas WHERE tipo_iva NOT IN (21, 10, 4) GROUP BY tipo_iva;`, y lo mismo en las otras dos tablas | A-38 |
| D-25 | `SELECT id, nombre, recargo_equivalencia FROM clientes WHERE recargo_equivalencia IS NULL OR recargo_equivalencia NOT IN (0, 1);` y `SELECT f.numero FROM facturas f JOIN clientes c ON c.id = f.cliente_id WHERE (f.recargo <> 0) <> (c.recargo_equivalencia = 1);` | A-42 |
| D-26 | `SELECT serie, estado, COUNT(*), ROUND(TOTAL(total), 2) FROM facturas GROUP BY serie, estado;` | A-39, A-41 |
| D-27 | `SELECT id, nombre FROM clientes WHERE dias_pago = 0;` y `SELECT f.numero, f.fecha, f.vencimiento, c.dias_pago FROM facturas f JOIN clientes c ON c.id = f.cliente_id WHERE f.serie = 'FA' AND julianday(f.vencimiento) - julianday(f.fecha) <> IFNULL(NULLIF(c.dias_pago, 0), 30);` (con los `dias_pago` actuales, que pueden haber cambiado) | A-47, A-48 |
| D-28 | Validar en JavaScript, sobre la copia, la letra de control de todos los `clientes.nif` | A-49 |
| D-29 | `SELECT id FROM clientes WHERE nombre LIKE '%;%' OR instr(nombre, char(10)) > 0 OR instr(nombre, char(13)) > 0 OR nif LIKE '%;%';` | A-52 |
| D-30 | Orden de numeración de cada remesa frente al `id` de contrato: `SELECT f.observaciones, f.numero, f.cliente_id FROM facturas f WHERE f.observaciones LIKE 'Remesa %' ORDER BY f.observaciones, f.numero;` | A-54 |
| D-31 | `SELECT numero, observaciones FROM facturas WHERE serie = 'RE' AND observaciones LIKE '%. ';` y recuento de líneas «(N dias)» | A-55 |

Las entradas que **no dependen de ninguna consulta** y se cierran solo con testimonio son A-11 (en parte),
A-20, A-43 a A-46, A-50, A-51, A-53, A-56 y A-58 a A-62.

---

## 4. Trazabilidad: ninguna fuente queda huérfana

### 4.1 Anomalías ANO-001 a ANO-071

| ANO | A | ANO | A | ANO | A | ANO | A |
|---|---|---|---|---|---|---|---|
| 001 | A-04 | 019 | A-50 | 037 | A-54 | 055 | A-14 |
| 002 | A-03 | 020 | A-51 | 038 | A-55 | 056 | A-59 |
| 003 | A-05, A-28 | 021 | A-41 | 039 | A-15 | 057 | A-34 |
| 004 | A-05 | 022 | A-18 | 040 | A-38, A-28 | 058 | A-56 |
| 005 | A-25 | 023 | A-33 | 041 | A-47 | 059 | A-37 |
| 006 | A-39 | 024 | A-55 | 042 | A-29 | 060 | A-40 |
| 007 | A-17 | 025 | A-37 | 043 | A-35 | 061 | A-21 |
| 008 | A-18 | 026 | A-53 | 044 | A-26 | 062 | A-36 |
| 009 | A-06 | 027 | A-45 | 045 | A-27 | 063 | A-53 |
| 010 | A-06 | 028 | A-58 | 046 | A-13 | 064 | A-20 |
| 011 | A-19 | 029 | A-14 | 047 | A-12 | 065 | A-55 |
| 012 | A-47 | 030 | A-48 | 048 | A-32 | 066 | A-22 |
| 013 | A-15 | 031 | A-19 | 049 | A-31 | 067 | A-38 |
| 014 | A-01 | 032 | A-16 | 050 | A-57 | 068 | A-16 |
| 015 | A-52 | 033 | A-39 | 051 | A-43 | 069 | A-42 |
| 016 | A-43 | 034 | A-39 | 052 | A-44 | 070 | A-30 |
| 017 | A-44 | 035 | A-24 | 053 | A-29 | 071 | A-23 |
| 018 | A-49 | 036 | A-55 | 054 | A-46 | | |

### 4.2 Reglas de negocio

| Regla | Clasificación en el documento de reglas | A |
|---|---|---|
| RN-01, RN-02, RN-03, RN-04 | INTENCIONAL con incidente (H-12) | A-02 |
| RN-05 | ACCIDENTAL | A-37 |
| RN-09 | INTENCIONAL con NO TOCAR (H-02) | A-38 |
| RN-10 | DUDOSA | A-38 |
| RN-11 | INTENCIONAL (H-05, caso «comentado con la gestoría») | A-33 |
| RN-12 | ACCIDENTAL | A-33 |
| RN-13 | DUDOSA | A-21 |
| RN-14 | DUDOSA | A-36 |
| RN-15 | DUDOSA | A-22 |
| RN-16 | INTENCIONAL; espacio y ausencia en la remesa, ACCIDENTALES | A-55 |
| RN-17 | DUDOSA | A-20 |
| RN-19 | ACCIDENTAL | A-16 |
| RN-20 | DUDOSA | A-28, A-23 |
| RN-22 | DUDOSA | A-31, A-03 |
| RN-23 | DUDOSA | A-19 |
| RN-24 | INTENCIONAL (con el incidente de 2019, H-10); el caso de 0 días, ACCIDENTAL | A-47, A-48 |
| RN-26, RN-27 | INTENCIONAL con incidente (H-13, H-14) | A-08 |
| RN-28 | ACCIDENTAL | A-03 |
| RN-29 | ACCIDENTAL | A-05, A-04 |
| RN-30 | INTENCIONAL con incidente (H-13) | A-07 |
| RN-31 | INTENCIONAL; rectificar una cobrada, DUDOSA | A-39 |
| RN-32 | DUDOSA | A-39 |
| RN-33 | INTENCIONAL (el abono parcial está en P-39) | A-23 (contexto) |
| RN-34 | INTENCIONAL con NO TOCAR (H-22) | A-10 |
| RN-35 | DUDOSA | A-11 |
| RN-36 | INTENCIONAL (H-01) | A-17 |
| RN-37 | ACCIDENTAL | A-35 |
| RN-38 | DUDOSA | A-18 |
| RN-39 | INTENCIONAL; partes ACCIDENTALES y DUDOSA | A-17, A-19, A-06, A-54 |
| RN-40 | DUDOSA | A-17 |
| RN-41 | DUDOSA | A-24 |
| RN-42 | INTENCIONAL; partes ACCIDENTALES | A-47, A-55 |
| RN-43 | ACCIDENTAL | A-32 |
| RN-44, RN-45 | INTENCIONAL (decisión de 2019, H-09) | A-01 |
| RN-46 | ACCIDENTAL | A-53 |
| RN-47 | ACCIDENTAL | A-40 |
| RN-48, RN-49 | INTENCIONAL con NO TOCAR (H-09) | A-09 |
| RN-50 | ACCIDENTAL | A-40 |
| RN-51 | INTENCIONAL (desde 2018, H-07); fechas mal guardadas, ACCIDENTAL | A-31 |
| RN-53 | INTENCIONAL provisional (H-04) | A-49 |
| RN-54 | DUDOSA | A-50 |
| RN-55 | DUDOSA | A-51 |
| RN-06, RN-07, RN-08, RN-18, RN-21, RN-25, RN-52 | INTENCIONAL sin historia de incidente: **fuera del alcance pedido**. RN-07, RN-08 y RN-21 aparecen como contexto en A-42 y A-38 | — |

### 4.3 Contradicciones y riesgos

| Contradicción | A | | Riesgo | A | | Riesgo | A |
|---|---|---|---|---|---|---|---|
| 01 · Prorrateo | A-17 | | R1 | A-03 | | R18 | A-26 |
| 02 · Año de la factura | A-03 | | R2 | A-04 | | R19 | A-13 |
| 03 · IVA del periodo | A-01 | | R3 | A-05, A-01 | | R20 | A-12 |
| 04 · Pendiente de cobro | A-41 | | R4 | A-06 | | R21 | A-14 |
| 05 · Vencimiento por defecto | A-47 | | R5 | A-16 | | R22 | A-32 |
| 06 · Tipos de IVA | A-38 | | R6 | A-28 | | R23 | A-31 |
| 07 · Redondeo al céntimo | A-40 | | R7 | A-17, A-35 | | R24 | A-29 |
| 08 · Formato de importes | A-16 | | R8 | A-18 | | R25 | A-44 |
| 09 · Recargo de equivalencia | A-42 | | R9 | A-43 | | R26 | A-57 |
| 10 · Cliente facturable | A-19 | | R10 | A-45 | | R27 | A-48 |
| 11 · Contrato vigente | A-30 | | R11 | A-49 | | R28 | A-19 |
| 12 · Fechas y zona horaria | A-48 | | R12 | A-27 | | R29 | A-50 |
| 13 · Abono | A-23 | | R13 | A-46 | | R30 | A-52 |
| 14 · Acciones permitidas | A-39 | | R14 | A-60 | | R31 | A-60, A-47, A-38, A-33 |
| | | | R15 | A-37 | | R32 | A-14 |
| | | | R16 | A-61 | | R33 | A-59 |
| | | | R17 | A-25 | | R34 | A-01 |
| | | | | | | R35 | A-05, A-07, A-08 |
| | | | | | | R36 | A-39 |

### 4.4 Memoria histórica: advertencias «no tocar», discrepancias y cronología

| Advertencia «no tocar» (memoria §3) | A |
|---|---|
| No cambiar la forma de redondear | A-02 |
| Las facturas no se borran; numeración correlativa y sin huecos | A-07, A-08 |
| La rectificativa no se recalcula, se invierte | A-10 |
| No cambiar la clave de exportación | A-09 |
| No renombrar `config.js` | A-56 |
| Hablar con Manoli antes de tocar el correo | A-46 |
| No borrar los tipos de IVA antiguos | A-38 |
| No tocar los datos semilla | A-15 |
| Cuidado con las utilidades del Access | A-37, A-48 |
| Base de 1.000 € justos sin descuento | A-33 |

| Discrepancia comentario-código (reglas §12) | A | | Discrepancia | A |
|---|---|---|---|---|
| 1 · «a partir de 1.000» | A-33 | | 11 · «correlativa y sin huecos» | A-04, A-05 |
| 2 · «para fidelizar hostelería» | A-22 | | 12 · «leyendo justo antes de grabar» | A-04 |
| 3 · «desglosado igual» | A-36 | | 13 · «el cambio de hora» | A-48 |
| 4 · «el mes son siempre 30 días» | A-35 | | 14 · redondeo «de toda la vida» | A-37 |
| 5 · «dentro del MISMO mes» | A-35 | | 15 · `dias_pago` «NULL → el de config» | A-47 |
| 6 · «así lo espera la gestoría» | A-17 | | 16 · tipos «21 / 10 / 4» | A-38 |
| 7 · «filas vacías» | A-20 | | 17 · semilla «tal cual quedaron grabadas» | A-15 |
| 8 · «no ha vuelto a pasar» | A-05 | | 18 · «base 1000 justa NO lleva descuento» | A-15, A-33 |
| 9 · «deja la original en rectificada» | A-25 | | 19 · prorrateo de baja «a mano» | A-18 |
| 10 · «cuadran solas» | A-01 | | 20 · «el mes que acaba de terminar» | A-03 |

| Entradas de la cronología | A |
|---|---|
| H-01 | A-17 |
| H-02 | A-38 |
| H-03, H-08, H-15 | A-62 |
| H-04 | A-49 |
| H-05 | A-33, A-22 |
| H-06 | A-36 |
| H-07 | A-13, A-31 |
| H-09 | A-09 |
| H-10 | A-48 |
| H-11, H-27 | A-60 |
| H-12 | A-02 |
| H-13 | A-07, A-08 |
| H-14 | A-04 |
| H-16 | A-17 |
| H-17 | A-46 |
| H-18 | A-57 |
| H-19 | A-34 |
| H-20 | A-15 |
| H-21 | A-05 |
| H-22 | A-10 |
| H-23 | A-56 |
| H-24 | A-18 |
| H-25 | A-12 |
| H-26 | A-61 |
| H-28 (acta simulada) | A-01 |
| H-29 (acta simulada) | A-18, A-29, A-30 |
| H-30 (acta simulada) | A-23, A-28 |
| H-31 (acta simulada) | A-39 |
| H-32 (acta simulada) | A-05, A-07, A-08 |

Patrones de la memoria §5: el 1 (concurrencia) está en A-04 y A-13; el 2 («no ha vuelto a pasar») en A-04, A-05
y A-60; el 3 (la gestoría manda sobre el cálculo) en A-02, A-09, A-10, A-17 y A-36; el 4 (dependencia de Marga)
en P-40, que figura en la agenda; el 5 (documentación) en A-60; el 6 (H-19) en A-34; y el 7 (hueco entre 2023 y
2026) en P-35 (A-57, A-45). TODO(VERSION_NODE) de la constitución: A-45.

### 4.5 Preguntas

Las 58 preguntas anteriores (P-01 a P-58) figuran en la agenda del apartado 3.1. Este documento añade **P-59 a
P-66**. El acta simulada del 16/11/2026 añade **P-67 a P-74** (acta §6.3), que también están en el apartado 3.1.

---

## 5. Historial de clasificaciones

Las clasificaciones no se sobrescriben. Cada revisión deja aquí, para cada entrada, la clasificación anterior,
la nueva y el motivo.

### 5.1 Revisión del 16/11/2026: propagación del acta simulada

| Campo | Valor |
|---|---|
| Fuente | [entrevista-negocio-simulada.md](entrevista-negocio-simulada.md), acta del 16/11/2026, preguntas 1 a 30 |
| Quién respondió | Preguntas 1 y 1 bis: el responsable del proyecto en el papel de Puri. Preguntas 2 a 30: el consultor, con «la respuesta más lógica» (acta, cabecera y §0) |
| Valor como testigo | **Ninguno.** No respondió ninguna persona de Suministros Hidalgo S.L. en su propio nombre. Según el Principio II (`.specify/memory/constitution.md:54-59`) y el apartado 0.2 de este registro, NEGOCIO exige el testimonio de una persona identificada, con fecha. Las respuestas cuentan como **SUPOSICIÓN** y no pueden basar ninguna decisión ni ningún test |
| Cambios en la evidencia | Se añade a 49 entradas una viñeta «NEGOCIO, acta simulada…» con la pregunta, el interlocutor simulado y la respuesta prevista. La viñeta original «NEGOCIO: sin testimonio» se mantiene |
| Cambios de clasificación | **Ninguno.** Antes, 62 PENDIENTES; después, 62 PENDIENTES |
| Entradas nuevas | Ninguna en este registro: lo que el acta revela no tiene evidencia propia. Se anota como SUPOSICIÓN en el [registro de riesgos](registro-riesgos.md) (R34 a R36) y en la [memoria histórica](memoria-historica.md) (H-28 a H-32), vinculado a las entradas A del apartado 4 |

«Si se confirma» es la clasificación que propone el acta (§1) para cuando la persona real dé esa respuesta. Para
INTENCIONAL bastaría con CÓDIGO y NEGOCIO reales. Para el resto, salvo la excepción del apartado 0.3 (A-20),
hace falta además la consulta D indicada.

| Entrada | Pregunta del acta | Antes | Después | Motivo | Si se confirma (propuesta del acta) |
|---|---|---|---|---|---|
| A-01 | 1, 1 bis | PENDIENTE | PENDIENTE | Testimonio simulado | Según D-01; BUG HISTÓRICO CON DEPENDIENTES si da filas |
| A-02 | 6 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-03 | 2 | PENDIENTE | PENDIENTE | Suposición | BUG HISTÓRICO CON DEPENDIENTES si D-03 da filas |
| A-04 | 4 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | Según D-04 |
| A-05 | 4 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | Según D-05 |
| A-06 | 11 | PENDIENTE | PENDIENTE | Suposición | BUG A SECAS |
| A-07 | 9 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL (y documento de la inspección, P-70) |
| A-08 | 2, 9 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-09 | 10 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-10 | 7 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-11 | 8 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-12 | 3 | PENDIENTE | PENDIENTE | Suposición | BUG A SECAS (riesgo) |
| A-13 | 5 | PENDIENTE | PENDIENTE | Suposición | BUG A SECAS (riesgo) |
| A-14 | 5 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta; D-11 |
| A-15 | 12 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | Según D-12 |
| A-16 | 19 | PENDIENTE | PENDIENTE | Suposición | BUG A SECAS (latente) |
| A-17 | 14 | PENDIENTE | PENDIENTE | Suposición; febrero sin respuesta concluyente | Remesa: BUG HISTÓRICO CON DEPENDIENTES |
| A-18 | 15 | PENDIENTE | PENDIENTE | Suposición | BUG HISTÓRICO CON DEPENDIENTES |
| A-19 | 20 | PENDIENTE | PENDIENTE | Suposición | BUG A SECAS, salvo que D-19 dé filas |
| A-20 | 22 | PENDIENTE | PENDIENTE | Suposición. Le basta con CÓDIGO y NEGOCIO (apartado 0.3), pero NEGOCIO falta | BUG A SECAS |
| A-21 | 16 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-22 | 17 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-23 | 13 | PENDIENTE | PENDIENTE | Suposición | BUG HISTÓRICO CON DEPENDIENTES si D-18 da abonos con descuento |
| A-24 | 18 | PENDIENTE | PENDIENTE | Suposición | BUG A SECAS (latente) |
| A-25 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-65) |
| A-26 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-65) |
| A-27 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-65) |
| A-28 | 13 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta; D-18 |
| A-29 | 21 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta; D-20 |
| A-30 | 21 | PENDIENTE | PENDIENTE | Suposición | BUG HISTÓRICO CON DEPENDIENTES (con A-18) |
| A-31 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-38) |
| A-32 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-20) |
| A-33 | 16 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL |
| A-34 | 11 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | Según D-06 y D-12 |
| A-35 | 14 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | Según Paco y D-14 |
| A-36 | 24 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta; D-13 |
| A-37 | 6 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta (va con A-02) |
| A-38 | 23 | PENDIENTE | PENDIENTE | Suposición | Tipos antiguos: INTENCIONAL; recargo 0: ACCIDENTAL |
| A-39 | 25 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta; D-26 |
| A-40 | 24 | PENDIENTE | PENDIENTE | Suposición | ACCIDENTAL |
| A-41 | 25 | PENDIENTE | PENDIENTE | Suposición | ACCIDENTAL (corregir el número) |
| A-42 | 26 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta |
| A-43 | 29 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | — |
| A-44 | 5, 30 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta |
| A-45 | 30 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | — |
| A-46 | 29 | PENDIENTE | PENDIENTE | Suposición | Sin clasificación propuesta; tratamiento: documentar sin especificar |
| A-47 | 27 | PENDIENTE | PENDIENTE | Suposición | BUG A SECAS en el contado (D-27) |
| A-48 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-12) |
| A-49 | 28 | PENDIENTE | PENDIENTE | Suposición | INTENCIONAL, de forma provisional (D-28) |
| A-50 | 26 | PENDIENTE | PENDIENTE | Suposición | BUG HISTÓRICO CON DEPENDIENTES |
| A-51 | 26 | PENDIENTE | PENDIENTE | Suposición | BUG HISTÓRICO CON DEPENDIENTES |
| A-52 | 10 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta; D-29 |
| A-53 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-64) |
| A-54 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-59) |
| A-55 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-62) |
| A-56 | — | PENDIENTE | PENDIENTE | El acta no la trata (la ruta del servidor sale en la pregunta 5, sin respuesta) | — (P-40) |
| A-57 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-11, P-35) |
| A-58 | 30 | PENDIENTE | PENDIENTE | Suposición. La autorización del `.gitignore` tiene que ser real y por escrito | — |
| A-59 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-61) |
| A-60 | 30 | PENDIENTE | PENDIENTE | Suposición; sin respuesta concluyente | — |
| A-61 | — | PENDIENTE | PENDIENTE | El acta no la trata | — (P-63) |
| A-62 | 23, 30 | PENDIENTE | PENDIENTE | Suposición | Sin propuesta |

**Resultado**: 49 entradas tratadas por el acta, 13 no tratadas, **0 cierres**. Lista PENDIENTE: **62 entradas,
de A-01 a A-62** (apartado 3).
