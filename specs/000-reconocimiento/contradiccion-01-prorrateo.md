# Contradicción 01 — Prorrateo de la cuota de un contrato

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca` (rama `master`). El código fuente no ha cambiado desde `1f35d01` (`git diff --stat 1f35d01 HEAD` no muestra cambios fuera de `specs/` y `CLAUDE.md`, 16/11/2026) |
| Datos reales consultados | **Ninguno de producción.** No hay copia de `datos/gesfact.db`. Los ejemplos «semilla» salen de la semilla de `db.js:93-180`, que **no consta que sea de producción** (ANO-013, P-05) |
| Anomalías relacionadas | ANO-007, ANO-008, ANO-022, ANO-042, ANO-043 |
| Preguntas relacionadas | P-03, P-04, P-21, P-33, P-44 |

Este documento **no decide** cuál de las dos implementaciones es la correcta: es una pregunta de negocio. No se
corrige nada.

---

## Método de verificación (común a todas las contradicciones)

El 16/11/2026, con Node 26.13.0, se montó un arnés **fuera del repositorio** (en la carpeta temporal de la
sesión):

1. Un fichero de precarga (`node -r`) sustituye el módulo `sqlite3`, que no está instalado (no hay
   `node_modules`), por el módulo integrado `node:sqlite`. Opcionalmente fija la fecha «de hoy» del proceso
   para simular el reloj. **No se modifica ni una línea de GesFact.**
2. Con ese adaptador se ejecutan **el `db.js` real** (que crea el esquema y carga la semilla en una BD temporal
   nueva) y **el `scripts/remesa_mensual.js` real**, lanzados desde una carpeta temporal para que
   `./datos/gesfact.db` se cree allí (CLAUDE.md, «Aislar la BD al probar»).
3. Las consultas de los informes se lanzan copiando literalmente el SQL de `routes/informes.js` y
   `server.js` contra esa BD temporal, y se formatean con el `lib/util.js` real (Express no está instalado).
4. Los cálculos sin BD se hacen cargando directamente `services/calculo.js` y `lib/util.js`. Cuando hace falta
   la fórmula de la remesa fuera del script, se transcribe literalmente de `scripts/remesa_mensual.js:45-51`.

**Límites**: `node:sqlite` no es la librería `sqlite3` de producción. Para lo que se mide aquí (sumas,
filtros de texto, `lastID`) se comporta igual, pero eso es una **SUPOSICIÓN** que tendrán que confirmar los
tests de caracterización cuando haya `node_modules` (P-11). `git status` quedó limpio después de cada
ejecución.

---

## 1. Implementaciones implicadas

| | Implementación | Evidencia | Camino del sistema que la usa |
|---|---|---|---|
| **I1** | `calculo.calcularProrrateo(cuota, desde, hasta)`: «a lo comercial», mes de 30 días | `services/calculo.js:90-102` | **Baja de contrato** (`POST /contratos/:id/baja`): calcula el importe del último mes, del día 1 al día de la baja (`routes/contratos.js:37-39`), y lo deja en la barra de direcciones (`routes/contratos.js:40`). La oficina lo teclea a mano en una factura nueva (**camino A**, alta manual) según `routes/contratos.js:28-30` y `views/contratos.ejs:17` |
| **I2** | Cálculo en línea dentro de la remesa: días reales del mes | `scripts/remesa_mensual.js:43-51`, con `util.diasDelMes` (`lib/util.js:35-39`) | **Remesa mensual** (**camino B**): importe de la única línea de la factura de cuota de cada contrato cuyo alta o baja cae dentro del mes facturado |

La remesa **importa** `services/calculo.js` (`scripts/remesa_mensual.js:11`) y usa `calcularFactura`
(`:55`), pero no `calcularProrrateo`. `util.diasDelMes` solo se usa en la remesa (búsqueda en todo el
repositorio, 16/11/2026: `scripts/remesa_mensual.js:21,47`).

## 2. Comparación paso a paso

| Paso | I1 · `calcularProrrateo` | I2 · remesa | ¿Igual? |
|---|---|---|---|
| Primer día de servicio | El que se le pase. Desde la baja, siempre el día 1 del mes de la baja: `fechaBaja.slice(0, 8) + '01'` (`routes/contratos.js:38`) | El mayor entre el alta y el día 1 del mes (`scripts/remesa_mensual.js:45`) | Distinto: I1 no conoce el alta |
| Último día de servicio | El que se le pase (la fecha de baja) | El menor entre la baja y el último día del mes (`:46`) | Igual en la práctica |
| Lectura del día | `parseInt(fecha.split('-')[2])` (`services/calculo.js:96-97`) | La misma expresión (`scripts/remesa_mensual.js:48-49`) | **Igual** (mismo código) |
| Días de servicio | `d2 - d1 + 1`, los dos extremos incluidos (`services/calculo.js:98`) | `d2 - d1 + 1` (`scripts/remesa_mensual.js:50`) | **Igual** |
| **Divisor** | **30, siempre** (`services/calculo.js:101`) | **Días reales del mes: 28, 29, 30 o 31** (`scripts/remesa_mensual.js:47,51`) | **Distinto** |
| Tope superior | Más de 30 días → 30: «el día 31 no se cobra» (`services/calculo.js:99`) | Ninguno (no hace falta: los días nunca pasan de los del mes) | Distinto |
| Tope inferior | Menos de 0 → 0 (`services/calculo.js:100`) | Ninguno: con baja anterior al alta en el mismo mes salen días negativos (ANO-042) | Distinto |
| Orden de operaciones | `cuota / 30 * dias` y redondeo al céntimo al final (`services/calculo.js:101`) | `cuota / diasMes * diasServicio` y redondeo al final (`scripts/remesa_mensual.js:51`) | Igual |
| Febrero | 28 o 29 días entre 30: un febrero completo no llega a la cuota (ANO-043) | 28 entre 28: cuota entera | Distinto |
| Qué se hace con el resultado | Un número en la URL con `toFixed(2)` (`routes/contratos.js:40`) | Precio de una línea que pasa por `calcularFactura` (`scripts/remesa_mensual.js:54-55`) | — |

**Conclusión técnica**: el mismo concepto («cuota proporcional a los días de servicio») con la misma forma de
contar días y **dos divisores distintos**, más dos topes que solo tiene I1.

## 3. Ejemplos en los que dan resultados distintos

### 3.1 Altas de la semilla (remesa real ejecutada sobre BD temporal)

| Contrato (semilla) | Mes | I2 remesa (base) | I1 comercial (base) | Diferencia |
|---|---|---|---|---|
| 4 · Bar Nuevo Siglo, 90 €, alta 15/02/2026 (`db.js:119`) | 2026-02 | **45,00 €** (14/28). Remesa real: `FA-2026-000111`, total 54,45 € | **42,00 €** (14/30) | **+3,00 €** de base (+3,63 € con IVA) |
| 2 · Casa Ubaldo, 145 €, alta 15/01/2023 (`db.js:117`) | 2023-01 | **79,52 €** (17/31) | **82,17 €** (17/30) | −2,65 € |
| 3 · Hotel Vega Baja, 60 €, alta 16/06/2025, baja 15/09/2025 (`db.js:118`) | 2025-06 y 2025-09 | **30,00 €** cada mes. Remesas reales: total 36,30 € | **30,00 €** | 0,00 € (junio y septiembre tienen 30 días) |

### 3.2 Bajas: lo que indica la pantalla frente a lo que factura la remesa ese mismo mes

| Cuota | Fecha de baja | I1 pantalla de baja | I2 remesa del mes | Diferencia (I2 − I1) |
|---|---|---|---|---|
| 90 € | 15/03/2026 | 45,00 € | 43,55 € | −1,45 € |
| 145 € | 07/03/2026 | 33,83 € | 32,74 € | −1,09 € |
| 145 € | 30/03/2026 | 145,00 € | 140,32 € | −4,68 € |
| 145 € | 31/03/2026 | 145,00 € | 145,00 € | 0,00 € |
| 90 € | 01/03/2026 | 3,00 € | 2,90 € | −0,10 € |
| 90 € | 14/02/2026 | 42,00 € | 45,00 € | +3,00 € |
| 90 € | 28/02/2026 | 84,00 € | 90,00 € | +6,00 € |
| 90 € | 29/02/2028 | 87,00 € | 90,00 € | +3,00 € |
| 145 € | 30/04/2026 | 145,00 € | 145,00 € | 0,00 € |
| 90 € | baja 10/03/2026 con alta 20/03/2026 | 30,00 € | **−26,13 €** | −56,13 € (ANO-042) |

Además, según el comentario de `routes/contratos.js:28-30`, **las dos facturas se emiten**: la remesa factura
el mes de la baja (prorrateado) y la oficina emite a mano el importe de la pantalla (ANO-008). Con una baja el
15/03/2026 de una cuota de 90 €, el cliente recibiría 43,55 € + 45,00 € = 88,55 € de base por 15 días de
servicio. Que eso ocurra de verdad es una **SUPOSICIÓN** pendiente de P-03.

### 3.3 Cuantificación: todas las fechas de baja posibles de 2026

Barrido de las 365 fechas de baja de 2026 con las dos fórmulas (16/11/2026):

| Cuota | Fechas en las que coinciden | Diferencia máxima | Diferencia media (valor absoluto) |
|---|---|---|---|
| 90 € | 127 de 365 (35 %) | 6,00 € (28/02/2026) | 1,10 € |
| 145 € | 127 de 365 (35 %) | 9,67 € (28/02/2026) | 1,77 € |

Las 127 coincidencias son exactamente los 120 días de los cuatro meses de 30 días (abril, junio, septiembre y
noviembre) más el día 31 de los siete meses de 31 días. **En febrero no coinciden nunca.**

## 4. Cuándo divergen y cuándo coinciden

**Coinciden**:

- Siempre que el contrato cubre el mes entero: I2 cobra la cuota entera y la pantalla de baja no interviene.
  Es el caso de la inmensa mayoría de las facturas de remesa.
- En los meses de 30 días (abril, junio, septiembre, noviembre), para cualquier día de alta o baja.
- Con baja el día 31 de un mes de 31 días (I1 topa en 30 y cobra la cuota entera; I2 también).

**Divergen**:

- Altas o bajas dentro de un mes de 31 días (excepto el día 31) o de febrero.
- Baja anterior al alta en el mismo mes (I2 negativo, I1 cero).

**Por qué no se ha detectado** (**SUPOSICIÓN** razonada, sin testimonio):

- La divergencia solo afecta al mes de alta y al de baja de cada contrato: uno o dos meses en toda su vida.
  La semilla tiene 4 contratos (`db.js:116-119`).
- Las diferencias son de céntimos a pocos euros por contrato.
- El único caso de la semilla con alta **y** baja a mitad de mes (contrato 3) cae en junio y septiembre, dos
  meses de 30 días, así que coincide por casualidad.
- Los dos resultados nunca aparecen juntos: uno va a una factura de remesa y el otro a una URL que la oficina
  copia a otra factura. Nadie los pone uno al lado del otro.

## 5. Historia probable

1. **Antes de 2017**: Paco prorrateaba a mano en el Access «a lo comercial» y «así lo espera la gestoría»
   (`services/calculo.js:90-93`; memoria histórica, H-01).
2. **2017-2019**: Julián lleva esa regla a `calcularProrrateo`, con el caso de los meses de 31 días resuelto
   con un tope («el día 31 no se cobra», `:99`) pero sin tratar febrero (ANO-043). En ese momento la única
   que la usa es la pantalla de baja. **SUPOSICIÓN**: la fecha exacta no consta.
3. **Verano de 2021**: Roberto, becario, escribe la remesa (`scripts/remesa_mensual.js:6-7`; H-16). Importa
   `calculo` y reutiliza `calcularFactura`, pero escribe su propio prorrateo. Su bloque copia literalmente la
   forma de leer los días de `calcularProrrateo` (`split('-')[2]`, `d2 - d1 + 1`), lo que hace pensar que lo
   leyó y cambió el divisor a propósito. El comentario lo dice abiertamente: «se prorratea por los días reales
   del mes» (`:43-44`). **SUPOSICIÓN**: `util.diasDelMes` se añadió entonces para la remesa, porque es su
   único uso.
4. **Por qué no llamó a `calcularProrrateo`** (**SUPOSICIÓN**, tres hipótesis que no se excluyen): su firma
   está pensada para la baja (solo «dentro del MISMO mes», `:94`) y la remesa también necesita el alta; el
   resultado de febrero (28/30) quizá le pareció un error; o consideró que «días reales» era lo justo. Ningún
   comentario dice si se consultó a la gestoría (P-33).
5. **Desde 2021**: conviven las dos reglas. El procedimiento de baja («administración emite después a mano la
   factura del prorrateo», `routes/contratos.js:28-30`) parece anterior a la remesa y no se revisó cuando
   esta empezó a facturar también el mes de la baja (ANO-008; H-24).

## 6. Pregunta de negocio (sin decidir)

¿Qué prorrateo se aplica a las cuotas de contrato: mes de 30 días, días reales del mes, o uno distinto para
altas y para bajas? ¿Y qué pasa con febrero? Ya están formuladas como **P-04** (Puri), **P-21** (Paco),
**P-33** (responsable del proyecto) y **P-44** (si se cobran el día de alta y el de baja). Sobre la doble
factura del mes de baja, **P-03** (Marga).

## 7. Para el registro de anomalías

No se proponen anomalías nuevas: el hallazgo ya está registrado como **ANO-007**. Se propone **ampliar su
evidencia** con la cuantificación del apartado 3.3 (coinciden 127 de 365 fechas; diferencia máxima de 9,67 €
por contrato de 145 €) y con la ejecución real de la remesa de febrero de 2026 sobre la semilla
(`FA-2026-000111`, base 45,00 € frente a 42,00 € a lo comercial).
