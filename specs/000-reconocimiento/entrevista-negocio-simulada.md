# Acta de la entrevista de negocio (SIMULADA) — GesFact 2.4

| Campo | Valor |
|---|---|
| Fecha | 16/11/2026 |
| Modalidad | **Simulación.** No ha participado ninguna persona de Suministros Hidalgo S.L. |
| Consultor | Equipo de documentación (asistente) |
| Interlocutores simulados | Puri (gestoría), Paco (**SUPOSICIÓN**: decide la política comercial; P-08), Marga (administración), Manoli y el responsable del proyecto |
| Quién respondió | Preguntas 1 y 1 bis: el responsable del proyecto, en el papel de Puri. Preguntas 2 a 30: **el consultor**, a petición del responsable, con «la respuesta más lógica» |
| Guion | 30 preguntas sacadas del [registro de anomalías](registro-de-anomalias.md) (apartado 3, 62 entradas PENDIENTES), de las reglas DUDOSAS de [reglas de negocio](reglas-de-negocio.md), de las 14 contradicciones (`contradiccion-01` a `contradiccion-14`) y del apartado 6 de la [memoria histórica](memoria-historica.md). Ordenadas por impacto económico (niveles A a D, registro §0.6) |
| Ejemplos numéricos | Salen de la semilla de `db.js:93-180` y de las ejecuciones documentadas en las contradicciones. No consta que la semilla sea de producción (P-05) |

## 0. Validez de esta acta

Esta acta **no es testimonio del negocio** en el sentido del Principio II de la constitución
(`.specify/memory/constitution.md:54-59`):

- Las respuestas 1 y 1 bis son **testimonio simulado**: las dio el responsable del proyecto en el papel de Puri.
- Las respuestas 2 a 30 son **suposiciones del consultor**. Se eligió la respuesta que mejor encaja con el
  código, los comentarios y la práctica fiscal habitual. Cada una indica en qué se basa.

Todas cuentan, por tanto, como **SUPOSICIÓN**. No sirven de base para ningún test de caracterización ni para
ninguna decisión, y **no cambian ninguna clasificación del registro**: las 62 entradas siguen PENDIENTES. Sirven
para tres cosas:

1. preparar la entrevista real con respuestas previstas que confirmar o desmentir;
2. anticipar qué consultas de datos (D-01 a D-31) pesan más;
3. ver qué clasificación tendría cada entrada si el negocio confirma la respuesta prevista.

El fichero `entrevista-negocio.md` que espera el registro sigue sin existir. Se creará con la entrevista real.

---

## 1. Resumen

| N.º | Destinatario | Entradas | Respuesta prevista | Clasificación si se confirma |
|---|---|---|---|---|
| 1 | Puri | A-01 | El 303 sale de la pantalla (suma por líneas). Nunca se cruza con Contaplus | Depende de D-01 |
| 2 | Puri | A-03, A-08 | El número debe llevar el año de la fecha | A-03: BUG HISTÓRICO CON DEPENDIENTES (si D-03 da filas) |
| 3 | Marga | A-12 | Solo existe la copia del pendrive de los viernes | A-12: BUG A SECAS (riesgo) |
| 4 | Marga | A-04, A-05 | Sin respuesta concluyente | — (D-04, D-05) |
| 5 | Marga | A-13, A-14 | BD en la carpeta del servidor; dos puestos y la remesa | A-13: BUG A SECAS (riesgo) |
| 6 | Puri | A-02, A-37 | Contaplus exige el IVA como suma de líneas redondeadas | A-02: INTENCIONAL |
| 7 | Puri | A-10 | La rectificativa es siempre espejo exacto | A-10: INTENCIONAL |
| 8 | Puri | A-11 | La rectificativa va en el periodo en que se emite | A-11: INTENCIONAL |
| 9 | Paco | A-07, A-08 | Inspección de la Agencia Tributaria; ni borrar ni dejar huecos | A-07, A-08: INTENCIONAL |
| 10 | Puri | A-09, A-52 | Contaplus importa el CSV tal cual; cualquier cambio lo rompe | A-09: INTENCIONAL |
| 11 | Marga | A-06, A-34 | Relanzar un mes debe avisar y no facturar. FA-106/107: sin respuesta concluyente | A-06: BUG A SECAS |
| 12 | Marga | A-15 | Sin respuesta concluyente | — (D-12) |
| 13 | Marga y Puri | A-23, A-28 | Abonos parciales con líneas negativas; deben respetar el descuento | A-23: BUG HISTÓRICO CON DEPENDIENTES |
| 14 | Paco | A-17, A-35 | Prorrateo a 30 días. Febrero: sin respuesta concluyente | A-17: remesa = BUG HISTÓRICO CON DEPENDIENTES |
| 15 | Marga | A-18 | Factura a mano el último mes y no sabía que la remesa también lo cobra | A-18: BUG HISTÓRICO CON DEPENDIENTES |
| 16 | Paco | A-21, A-33 | Descuento sobre toda la base; el salto es conocido | A-21, A-33: INTENCIONAL |
| 17 | Paco | A-22 | Descuento para cualquier cliente | A-22: INTENCIONAL |
| 18 | Paco | A-24 | Las cuotas no deben llevar descuento | A-24: BUG A SECAS (latente) |
| 19 | Marga | A-16 | No teclea importes de 1.000 € o más | A-16: BUG A SECAS (latente) |
| 20 | Marga | A-19 | Al dar de baja un cliente deben darse de baja sus contratos | A-19: BUG A SECAS (salvo D-19) |
| 21 | Marga | A-30, A-29 | Bajas con fecha futura sí; factura del último mes al registrarlas | A-30: BUG HISTÓRICO CON DEPENDIENTES (con A-18) |
| 22 | Marga | A-20 | Debe avisar, no descartar | A-20: BUG A SECAS |
| 23 | Puri | A-38, A-62 | Hoy solo 21/10/4; conservar los antiguos no molesta | A-38: tipos antiguos INTENCIONAL; recargo 0 ACCIDENTAL |
| 24 | Marga | A-40, A-36 | Precios siempre con dos decimales | A-40: ACCIDENTAL |
| 25 | Marga | A-39, A-41 | Mira el importe; las rectificativas no cuentan como pendientes | A-41: ACCIDENTAL; corregir el número |
| 26 | Puri | A-50, A-51, A-42 | Reimprimir con los datos de la emisión; la RE debe decir «FACTURA RECTIFICATIVA» | A-50, A-51: BUG HISTÓRICO CON DEPENDIENTES |
| 27 | Marga | A-47 | 30 días por defecto; el contado vence el mismo día | A-47: BUG A SECAS en el contado |
| 28 | Marga | A-49 | Sigue mirando la letra a ojo; sin sustituta | A-49: INTENCIONAL provisional |
| 29 | Manoli | A-46, A-43 | El correo no se reactiva. Contraseña: sin respuesta concluyente | A-46: documentar sin especificar |
| 30 | Responsable | A-44, A-45, A-58, A-60, A-62 | Solo red de la oficina; `.gitignore` autorizado; MySQL y albaranes abandonados. Node y soporte: sin respuesta concluyente | Varias |

---

## 2. Desarrollo

Formato de cada punto: pregunta tal como se formuló o se habría formulado, respuesta, fundamento (solo en las
suposiciones del consultor), conclusión y lo que queda pendiente.

### Nivel A — Fiscal, legal o todo el volumen

#### 1 · Puri · A-01 (P-49) — Cifra oficial del IVA del trimestre

- **Pregunta**: con los datos de ejemplo, en el 1T 2026 la pantalla «Informe de IVA» da 603,66 € de IVA
  repercutido y las filas del CSV suman 736,97 € (diferencia: 133,31 €; contradicción 03, §3.2). Para el modelo
  303, ¿qué cifra usa: a) pantalla, b) Contaplus tras importar el CSV, c) las dos comparadas, d) otra?
- **Respuesta (testimonio simulado)**: **a)** la pantalla «Informe de IVA».
- **Repregunta (1 bis)**: ¿ha comprobado alguna vez que el IVA que queda en Contaplus tras importar el CSV
  coincide con el de la pantalla? a) sí, siempre coincide; b) sí, alguna vez no; c) no lo compruebo.
- **Respuesta (testimonio simulado)**: **c)** no lo comprueba.
- **Conclusión**: de hecho, la cifra oficial del 303 es la **suma por líneas**, y la contabilidad de Contaplus
  sale de la **suma de cabeceras**. Nadie compara las dos, así que un descuadre entre el 303 y el libro de
  facturas emitidas podría existir sin que nadie lo haya visto.
- **Información nueva**: no hay ningún control entre el 303 y Contaplus.
- **Pendiente**: D-01 sobre una copia fechada de producción (pasa a ser la **consulta más prioritaria**). Si da
  filas, A-01 sería BUG HISTÓRICO CON DEPENDIENTES (los 303 ya presentados). Falta decidir qué cifra manda si
  difieren (Puri, con el negocio).

#### 2 · Puri · A-03, A-08 (P-48, P-06) — Año del número en la remesa de diciembre

- **Pregunta**: la remesa de diciembre lanzada el 1 de enero numera `FA-2027-000001` a `000003` con fecha
  31/12/2026 (contradicción 02, §3.1). Esas facturas entran en el informe del 4T de 2026, pero no en el CSV de
  2026. ¿Qué año debe llevar el número? a) el de la fecha (2026), b) el de emisión (2027), c) da igual, d) no lo
  sé.
- **Respuesta (suposición del consultor)**: **a)** el año de la fecha, 2026.
- **Fundamento**: la serie es anual (`lib/numeracion.js`) y la factura pertenece al ejercicio de su fecha. Una
  serie de 2027 que empieza con facturas de 2026, y que falta en el CSV de 2026, es lo que una gestoría
  rechazaría.
- **Condición prevista**: no renumerar facturas ya emitidas. Si hay casos, se regularizan con rectificativa, caso
  a caso (registro §0.4).
- **Pendiente**: confirmar con Puri. D-03 para saber si ya ha ocurrido. P-06 a Marga: números de las remesas de
  diciembre de 2021 a 2025.

#### 3 · Marga · A-12 (P-19) — Copias de seguridad

- **Pregunta**: si el equipo donde está la base de datos se estropea un jueves, ¿hay alguna copia más reciente
  que la del pendrive del viernes anterior? a) sí (¿cuál?), b) no. ¿Puede entregar una copia fechada para el
  análisis?
- **Respuesta (suposición del consultor)**: **b)** no hay otra copia. Entregará la del próximo viernes.
- **Fundamento**: `LEEME.txt:18` solo describe la copia manual de los viernes. No hay ningún otro mecanismo en
  el repositorio.
- **Conclusión prevista**: se pueden perder hasta cinco días de facturación, y sin numeración que permita
  rehacerla (A-07, A-08).
- **Pendiente**: confirmar con Marga. Recibir la **copia fechada** (paso previo que desbloquea 31 consultas).
  Guardarla fuera del repositorio (A-58). Quién hace la copia cuando Marga no está (P-40).

#### 4 · Marga · A-04, A-05 (P-32, P-38) — Números repetidos o que faltan

- **Pregunta**: desde enero de 2021, ¿ha visto dos facturas con el mismo número, o un número que falta en la
  serie? a) sí, repetidos; b) sí, huecos; c) las dos cosas; d) no; e) no lo he mirado.
- **Respuesta (suposición del consultor)**: **e)** no lo ha mirado de forma sistemática. «No ha vuelto a pasar,
  que yo sepa».
- **Fundamento**: los comentarios dicen «no ha vuelto a pasar (creo)» (`lib/numeracion.js:10`) y «no ha vuelto a
  pasar» (`routes/facturas.js:82`). Nadie revisa la serie.
- **Resultado**: **sin respuesta concluyente**. Solo los datos lo deciden.
- **Pendiente**: D-04 y D-05. Qué factura quedó con las líneas a medias y quién edita la BD a mano (P-38).

#### 5 · Marga · A-13, A-14, A-44 (P-01, P-26, P-40) — Dónde está la BD y cuántos graban

- **Pregunta**: ¿desde cuántos ordenadores se graban facturas? ¿Se lanza la remesa mientras alguien está
  facturando? ¿La base de datos está en la carpeta compartida del servidor?
- **Respuesta (suposición del consultor)**: dos puestos (el de Marga y uno más, de forma ocasional). La remesa
  se lanza el día 1 desde el ordenador de Marga. La BD está en la carpeta compartida del servidor, pero Marga no
  sabe cuál de las dos rutas (`\\SERVIDOR\gesfact` o `\\SERVIDOR\compartido\gesfact`) es la buena.
- **Fundamento**: `scripts/remesa_mensual.js:7`, `LEEME.txt:6,9`, `config.js:2` y los incidentes de grabación
  simultánea de 2018 y 2021 (H-07, H-14).
- **Pendiente**: confirmar con Marga. D-11 (buscar otros `gesfact.db` en los equipos). Ruta real (P-40).

#### 6 · Puri · A-02, A-37 (P-30, P-25) — Redondeo línea a línea (regla protegida)

- **Pregunta**: tres líneas de 12,40 € al 21 %: redondeando cada línea, el IVA es 2,60 × 3 = **7,80 €**; sobre el
  total (37,20 €) sería **7,81 €**. ¿Su Contaplus exige la primera forma (suma de cuotas redondeadas por línea)?
  Sí / No.
- **Respuesta (suposición del consultor)**: **Sí.** El trimestre devuelto en 2019 fue por esto. No recuerda si
  quedaron facturas con el otro redondeo.
- **Fundamento**: `services/calculo.js:2-7` (incidente H-12).
- **Pendiente**: confirmar con Puri (sería el segundo testigo para INTENCIONAL). D-02 para encontrar facturas
  con el otro redondeo.

#### 7 · Puri · A-10 (P-39) — Rectificativa espejo cuando la original estaba mal

- **Pregunta**: si la factura original tenía un importe mal calculado, ¿la rectificativa debe ser su espejo
  exacto (anular lo que se facturó, error incluido) y hacer después una factura nueva correcta, o debe
  recalcularse? a) espejo y factura nueva; b) recalcular; c) otra.
- **Respuesta (suposición del consultor)**: **a)** siempre espejo exacto, y después una factura nueva con el
  importe bueno.
- **Fundamento**: comentario «Puri dixit» (`routes/facturas.js:124-128`) y la regla de A-07.
- **Pendiente**: confirmar con Puri. D-08 (rectificativas que no cuadran con su original).

#### 8 · Puri · A-11 (P-43) — Periodo fiscal de la rectificativa

- **Pregunta**: una factura del 15/12/2025 se rectifica el 10/02/2026. ¿En qué trimestre declara la
  rectificativa? a) en el 1T 2026 (fecha de la rectificativa); b) en el 4T 2025 (fecha de la original).
- **Respuesta (suposición del consultor)**: **a)** en el periodo en que se emite.
- **Fundamento**: es el criterio general de la normativa del IVA para las rectificativas, y es lo que hace el
  programa (fecha del día). **SUPOSICIÓN**: que Puri lo aplique así.
- **Pendiente**: confirmar con Puri. D-09.

#### 9 · Paco · A-07, A-08 (P-31) — Inspección de 2020

- **Pregunta**: ¿qué organismo hizo la inspección de 2020? ¿Dejó por escrito alguna obligación sobre borrar
  facturas o sobre la numeración? a) sí, hay acta o requerimiento; b) fue verbal; c) no lo sé.
- **Respuesta (suposición del consultor)**: la Agencia Tributaria. Hay un requerimiento que guarda la gestoría.
  Obligaciones: no borrar facturas y numeración correlativa sin huecos.
- **Fundamento**: `lib/numeracion.js:3-6`.
- **Pendiente**: confirmar con Paco y **pedir el documento** a la gestoría. Si existe, es el segundo testigo de
  A-07 y A-08, y convierte los huecos de A-05 en un problema legal.

#### 10 · Puri · A-09, A-52 (P-28) — Formato del CSV

- **Pregunta**: si el CSV cambiara una columna, el orden o el separador, ¿Contaplus lo seguiría importando?
  a) no, hay que tocar la importación; b) sí; c) no lo sé. ¿Hay especificación escrita?
- **Respuesta (suposición del consultor)**: **a)** no. La importación está configurada para ese formato
  exacto. No hay especificación escrita; puede enviar un CSV real recibido.
- **Prohibición prevista**: **no cambiar nada del formato sin avisar a la gestoría con antelación y probarlo
  con ella.** Incluido el escape de `;` en los nombres (A-52).
- **Pendiente**: confirmar con Puri. Recibir un CSV real (D-07). D-29.

#### 11 · Marga · A-06, A-34 (P-20, P-36) — Remesa relanzada y FA-2026-000106/107

- **Pregunta**: si se lanza por error la remesa de un mes que ya está facturado, ¿qué debería pasar? a) volver a
  facturar; b) negarse; c) avisar y pedir confirmación. ¿Qué estaba duplicado en FA-2026-000106, si la que la
  sustituye (FA-2026-000107) es idéntica?
- **Respuesta (suposición del consultor)**: **c)** avisar y no facturar sin confirmación. Sobre FA-106/107, no
  lo recuerda.
- **Resultado**: la primera parte se responde. La segunda queda **sin respuesta concluyente**.
- **Pendiente**: D-06 y D-12 (otras facturas de abril de 2026 del Bar Nuevo Siglo).

#### 12 · Marga · A-15 (P-05, P-37) — ¿Los datos de referencia son facturas reales?

- **Pregunta**: las facturas de ejemplo del programa (FA-2026-000101 a 000108 y RE-2026-000001), ¿son
  facturas reales emitidas a esos clientes? Una de ellas, FA-2026-000105, tiene en cabecera 468,63 € de IVA y
  sus líneas suman 339,02 €. a) sí; b) no; c) no lo sé.
- **Respuesta (suposición del consultor)**: **c)** no lo sabe. La copia la preparó Julián.
- **Resultado**: **sin respuesta concluyente**.
- **Pendiente**: D-12. Si son reales, FA-105 está mal y la pregunta 1 se vuelve urgente.

### Nivel B — Importes incorrectos en facturas concretas

#### 13 · Marga y Puri · A-23, A-28 (P-17, P-57) — Abonos parciales

- **Pregunta**: cuando hay que devolver solo una parte de una factura, ¿cómo se hace? a) factura nueva con
  cantidades en negativo; b) rectificativa de toda la factura y factura nueva; c) otra. En el caso A de la
  contradicción 13 (base bruta 1.814,80 €, con un 2 % de descuento), anular con líneas negativas da
  −2.083,91 €, frente a los 2.042,11 € cobrados: 41,80 € de más. ¿El abono debe respetar el descuento? Sí / No.
- **Respuesta (suposición del consultor)**: Marga, **a)** factura con cantidades negativas, porque es la única
  forma de hacer un abono parcial. Puri, **sí**: se abona lo que se cobró de verdad.
- **Fundamento**: RN-20 y la falta de rectificativa parcial (RN-33).
- **Pendiente**: confirmar. D-18 (facturas FA negativas). Si las hay con descuento, son abonos de más.

#### 14 · Paco · A-17, A-35 (P-04, P-21, P-33) — Prorrateo de cuotas

- **Pregunta**: Bar Nuevo Siglo, cuota de 90 €, alta el 15/02/2026. La remesa cobró **45,00 €** (14 de 28 días
  reales). A lo comercial (mes de 30 días) serían **42,00 €** (3,63 € menos con IVA). ¿Cuál es la correcta?
  a) días reales; b) 30 días. ¿Y en febrero?
- **Respuesta (suposición del consultor)**: **b)** 30 días, como hacía él en el Access y como espera la
  gestoría. Sobre febrero no lo recuerda con certeza.
- **Fundamento**: `services/calculo.js:90-93` (H-01). La remesa cambió el criterio en 2021 sin constancia de
  aprobación (H-16).
- **Resultado**: la fórmula se responde. Febrero y el día 31 quedan **sin respuesta concluyente**.
- **Pendiente**: confirmar con Paco y Puri. D-14. Quién decidió los días reales (P-33).

#### 15 · Marga · A-18 (P-03, P-44) — Último mes de un contrato

- **Pregunta**: cuota de 90 €, baja el 15/03/2026. La pantalla indica facturar a mano 45,00 € y la remesa de
  marzo cobra además 43,55 €: en total, 88,55 € por medio mes. Cuando da de baja un contrato a mitad de mes,
  ¿hace usted la factura a mano? a) sí; b) no; c) a veces.
- **Respuesta (suposición del consultor)**: **a)** sí, siempre, con el importe de la pantalla. No sabía que la
  remesa también lo cobra.
- **Fundamento**: procedimiento H-24 (`routes/contratos.js:28-30`).
- **Conclusión prevista**: doble cobro del último mes en todas las bajas a mitad de mes desde 2021.
- **Pendiente**: confirmar con Marga. D-15. Si se confirma, revisar con Paco si se devuelve a los clientes.

#### 16 · Paco · A-21, A-33 (P-45) — Salto del descuento en el umbral

- **Pregunta**: un pedido de 1.000,00 € de base no tiene descuento y paga 1.000,00 €. Uno de 1.000,01 € lleva un
  2 % sobre toda la base y paga unos 980,01 €. ¿El descuento debe ir sobre toda la base o solo sobre lo que pasa
  de 1.000 €?
- **Respuesta (suposición del consultor)**: sobre toda la base. El salto se conoce y se acepta.
- **Fundamento**: los tramos de rappel sobre el total son la forma comercial habitual; caso de 1.000 € justos
  comentado con la gestoría (`db.js:138`).
- **Pendiente**: confirmar con Paco. D-16.

#### 17 · Paco · A-22 (P-24) — ¿Descuento solo para hostelería?

- **Pregunta**: el descuento se pensó «para fidelizar hostelería», pero se aplica a cualquier cliente,
  incluida la ferretería, que está en recargo de equivalencia. ¿A quién debe aplicarse? a) a todos; b) solo a
  hostelería; c) a una lista de clientes.
- **Respuesta (suposición del consultor)**: **a)** a todos los que superen el umbral.
- **Pendiente**: confirmar con Paco. D-16.

#### 18 · Paco · A-24 (P-14) — ¿Descuento en las cuotas de contrato?

- **Pregunta**: si una cuota mensual pasara de 1.000 €, la remesa le aplicaría el descuento por volumen. ¿Deben
  llevarlo las cuotas? Sí / No.
- **Respuesta (suposición del consultor)**: **no**. Las cuotas son alquileres o mantenimientos, no compras.
  Ninguna llega hoy a 1.000 €.
- **Conclusión prevista**: riesgo latente.
- **Pendiente**: confirmar con Paco. D-17.

#### 19 · Marga · A-16 (P-13, P-53) — Importes con punto de miles

- **Pregunta**: si se teclea «1.250,00» en un precio, el programa lo graba como 1,25 €. ¿Teclea o copia alguna
  vez importes de 1.000 € o más? a) sí; b) no.
- **Respuesta (suposición del consultor)**: **b)** no. Los precios unitarios no se acercan a 1.000 € (el más
  alto del catálogo de ejemplo es 28,90 €). Solo copia el importe del prorrateo, que es menor.
- **Pendiente**: confirmar con Marga. D-13.

#### 20 · Marga · A-19 (P-55) — Clientes de baja con contratos

- **Pregunta**: al dar de baja a un cliente, ¿deben darse de baja también sus contratos? Sí / No. ¿Le ha llegado
  a algún cliente de baja una cuota de la remesa?
- **Respuesta (suposición del consultor)**: **sí** deben darse de baja. No le consta ningún caso.
- **Pendiente**: D-19.

#### 21 · Marga · A-30, A-29 (P-56) — Bajas con fecha futura

- **Pregunta**: ¿registra alguna vez la baja de un contrato con fecha futura, por ejemplo cuando el cliente
  avisa con un mes de antelación? Sí / No. Si es que sí, ¿cuándo hace la factura del último mes? a) al
  registrar la baja; b) al llegar la fecha.
- **Respuesta (suposición del consultor)**: **sí**, y **a)** hace la factura en el momento de registrar la baja.
- **Conclusión prevista**: agrava A-18. El contrato aparece como de baja, la remesa lo sigue facturando hasta
  ese mes y el último mes se cobra dos veces.
- **Pendiente**: D-20 y D-15.

#### 22 · Marga · A-20 (P-47) — Fila con precio y sin descripción

- **Pregunta**: si en una factura se rellena una fila con precio pero sin descripción, el programa la descarta
  sin avisar. ¿Qué debería pasar? a) avisar y no grabar; b) grabarla sin descripción; c) descartarla como ahora.
- **Respuesta (suposición del consultor)**: **a)** avisar.
- **Pendiente**: confirmar con Marga. No deja rastro en la BD, así que basta con CÓDIGO y NEGOCIO (registro
  §0.3, excepción).

### Nivel C — Céntimos, casos raros e información de gestión

#### 23 · Puri · A-38, A-62 (P-42, P-22) — Tipos de IVA admitidos

- **Pregunta**: ¿qué tipos de IVA debe admitir el programa? a) solo 21, 10 y 4; b) también los temporales de
  2023-2024; c) también los antiguos (16/18/7/8). ¿Se ha reabierto alguna vez un ejercicio del Access?
- **Respuesta (suposición del consultor)**: **a)** hoy solo 21/10/4, con recargos de 5,2/1,4/0,5. Nunca se ha
  reabierto un ejercicio del Access. Conservar los tipos antiguos no molesta.
- **Fundamento**: los ejercicios anteriores a 2017 tienen sobradamente pasado el plazo de prescripción
  habitual. Advertencia «no tocar» H-02.
- **Pendiente**: confirmar con Puri. D-24. Si sigue existiendo el Access (P-22).

#### 24 · Marga · A-40, A-36 (P-52) — Precios con más de dos decimales

- **Pregunta**: ¿teclea precios como 1,115 € la unidad? Sí / No. ¿Algún cliente ha protestado porque cantidad
  × precio no da la base impresa?
- **Respuesta (suposición del consultor)**: **no**, siempre dos decimales. Ninguna queja.
- **Pendiente**: D-13.

#### 25 · Marga (y Puri) · A-39, A-41 (P-50, P-16, P-58) — Pendiente de cobro y rectificar cobradas

- **Pregunta**: en el panel, con los datos de ejemplo, salen «3 facturas» y «3032.85 €» pendientes, y el
  listado de emitidas da 4 filas que suman 2.910,62 €. ¿Qué cifra usa? a) el número; b) el importe; c) el
  listado. ¿Debe poder rectificarse una factura ya cobrada? Sí / No.
- **Respuesta (suposición del consultor)**: **b)** el importe. Una rectificativa no es algo pendiente de cobrar.
  **Sí** debe poder rectificarse una cobrada y seguir constando que se cobró. La devolución se hace por
  transferencia, fuera del programa.
- **Pendiente**: confirmar con Marga y Puri. D-26.

#### 26 · Puri · A-50, A-51, A-42 (P-66, P-10, P-54) — Reimpresión y título de la rectificativa

- **Pregunta**: al reimprimir una factura antigua salen los datos **actuales** del cliente y de la empresa, y la
  rectificativa se imprime con el título «FACTURA». ¿Qué debe salir? a) los datos del momento de la emisión;
  b) los actuales. ¿La rectificativa debe titularse «FACTURA RECTIFICATIVA»? Sí / No.
- **Respuesta (suposición del consultor)**: **a)** los datos de la emisión, porque una factura no cambia una vez
  emitida. **Sí**, debe constar que es rectificativa.
- **Fundamento**: la normativa de facturación exige que la rectificativa indique su condición. **SUPOSICIÓN**:
  la exigencia concreta tiene que confirmarla Puri.
- **Pendiente**: confirmar con Puri. Si se confirma, las RE impresas hasta hoy serían BUG HISTÓRICO CON
  DEPENDIENTES.

### Nivel D — Plazos, documentos, seguridad y operación

#### 27 · Marga · A-47 (P-51) — Plazo de vencimiento

- **Pregunta**: ¿qué plazo debe aplicarse a un cliente sin plazo propio? Y a uno que paga al contado
  (plazo 0), ¿cuándo le vence? a) el mismo día; b) a los 30 días como ahora.
- **Respuesta (suposición del consultor)**: 30 días por defecto. El contado, **a)** el mismo día.
- **Pendiente**: D-27. Valores del `config.js` del servidor (P-51).

#### 28 · Marga · A-49 (P-23) — Letra del NIF

- **Pregunta**: ¿sigue comprobando a ojo la letra de cada NIF nuevo? Sí / No. ¿Quién da de alta clientes
  cuando usted no está?
- **Respuesta (suposición del consultor)**: **sí**. Cuando no está, nadie da de alta clientes.
- **Pendiente**: D-28.

#### 29 · Manoli · A-46, A-43 (P-34, P-18) — Correo

- **Pregunta**: ¿se va a reactivar el envío de facturas desde el programa? Sí / No. ¿Sigue activa la
  contraseña del buzón que figura en la configuración?
- **Respuesta (suposición del consultor)**: **no** se reactiva por ahora; se sigue enviando desde el Outlook de
  Marga. De la contraseña no sabe si se cambió.
- **Resultado**: la contraseña queda **sin respuesta concluyente**.
- **Pendiente**: confirmar con Manoli y el responsable del proyecto. Por qué hay que consultarla antes de tocar el
  correo (H-17).

#### 30 · Responsable del proyecto · A-44, A-45, A-58, A-60, A-62 (P-08, P-02, P-27, P-41, P-60)

- **Pregunta**: ¿el programa debe usarse solo desde la red de la oficina? ¿Se autoriza añadir un `.gitignore`?
  ¿La migración a MySQL y el módulo de albaranes se dan por abandonados? ¿Quién da hoy el soporte (Julián,
  ext. 22)? ¿Con qué versión de Node funciona el servidor?
- **Respuesta (suposición del consultor)**: solo red de la oficina. `.gitignore` **autorizado**. MySQL y
  albaranes **abandonados**. Soporte y versión de Node: no lo sabe.
- **Resultado**: soporte y versión de Node quedan **sin respuesta concluyente**.
- **Pendiente**: el `.gitignore` es una excepción a la constitución y necesita autorización real y por escrito
  antes de crearlo. Comprobar `node --version` en el servidor de la oficina.

---

## 3. Condiciones, prohibiciones e información nueva

| N.º | Tipo | Contenido | Origen | Validez |
|---|---|---|---|---|
| C-01 | Información nueva | No existe ningún control entre el IVA del 303 (pantalla) y el de Contaplus (CSV) | Pregunta 1 bis | Testimonio simulado |
| C-02 | Información nueva | El 303 se presenta con la suma por líneas | Pregunta 1 | Testimonio simulado |
| C-03 | Prohibición | No cambiar el formato del CSV sin avisar a la gestoría y probarlo con ella | Pregunta 10 | Suposición |
| C-04 | Condición | Ninguna corrección renumera ni modifica facturas emitidas; lo emitido se regulariza con rectificativa | Preguntas 2, 15 y 26 | Suposición (coherente con A-07) |
| C-05 | Condición | Relanzar una remesa ya facturada debe avisar y no facturar sin confirmación | Pregunta 11 | Suposición |
| C-06 | Información nueva | La copia del pendrive de los viernes es la única copia | Pregunta 3 | Suposición |
| C-07 | Información nueva | Los abonos parciales se hacen con facturas FA en negativo | Pregunta 13 | Suposición |
| C-08 | Información nueva | La factura del último mes se hace a mano al registrar la baja, aunque sea con fecha futura | Preguntas 15 y 21 | Suposición |

## 4. Sin respuesta concluyente

| Pregunta | Asunto | Cómo se decide |
|---|---|---|
| 4 | Números repetidos o huecos desde 2021 | D-04, D-05 |
| 11 (2.ª parte) | Qué se corrigió con FA-2026-000106/107 | D-06, D-12 |
| 12 | Si la semilla son facturas reales | D-12 |
| 14 (2.ª parte) | Prorrateo comercial en febrero y el día 31 | Paco; D-14 |
| 29 (2.ª parte) | Si la contraseña del buzón sigue activa | Manoli, responsable del proyecto |
| 30 (en parte) | Soporte y versión de Node | Responsable del proyecto |

## 5. Próximos pasos

1. **Conseguir la copia fechada de `datos/gesfact.db`** (Marga) y guardarla fuera del repositorio.
2. Ejecutar sobre ella, por este orden: D-01, D-03, D-04/D-05, D-15, D-18, D-14, D-12 y después el resto.
3. Pedir a la gestoría un **CSV real** (D-07) y el **documento de la inspección de 2020** (pregunta 9).
4. **Repetir la entrevista con las personas reales**, usando este guion y las respuestas previstas como hipótesis
   que confirmar. Recoger nombre, fecha y respuesta literal en `entrevista-negocio.md`.
5. Hasta entonces, **no se actualiza ninguna clasificación del registro de anomalías.**
