# Contradicción 13 — Dos formas de abonar una factura: rectificativa espejo o factura con líneas negativas

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Cálculos con el `services/calculo.js` real; la rectificativa se reproduce con la inversión de signos literal de `routes/facturas.js:142,150` (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-005, ANO-034, ANO-059, ANO-061; nueva ANO-071 |
| Preguntas relacionadas | P-17, P-39, P-46; nueva P-57 |

No se decide qué forma de abonar es la correcta ni cuál de los dos importes es el bueno. No se corrige nada.

---

## 1. Implementaciones implicadas

| | Implementación | Evidencia | Camino |
|---|---|---|---|
| **I1** | **Rectificativa espejo**: copia la cabecera y las líneas de la original con los signos cambiados, **sin recalcular** («Puri dixit: la rectificativa tiene que ser espejo exacto de la original») | `routes/facturas.js:124-164` | Rectificación (C), botón «Rectificar (abono total)». Serie RE |
| **I2** | **Factura nueva con cantidades negativas**, que pasa por `calcularFactura` como cualquier otra | `routes/facturas.js:42-102`; `services/calculo.js:48-88`. El servidor admite cantidades negativas (reglas de negocio, RN-20) | Alta manual (A). Serie FA. Es la única forma de hacer un abono **parcial**, porque I1 solo abona la factura entera (P-39) |

Que la oficina use I2 para abonar es una **SUPOSICIÓN**: el programa lo permite, pero no consta que se haga
(P-17).

## 2. Comparación paso a paso

| Paso | I1 · espejo | I2 · líneas negativas |
|---|---|---|
| Precio unitario | El de la original, ya rebajado si hubo descuento | El que se teclee (normalmente el de catálogo) |
| Descuento por volumen | Se hereda tal cual | **No se aplica**: la base bruta es negativa y no supera 1.000 (`services/calculo.js:39-43,60`) |
| Cuota de IVA y recargo de cada línea | `−cuota_original` | `redondear2(−base × tipo / 100)`: en las mitades exactas redondea hacia cero (ANO-059) |
| Cabecera | `−cabecera_original`, aunque no cuadre con las líneas (contradicción 03) | Suma de las líneas recalculadas |
| Serie y número | `RE-AAAA-NNNNNN` | `FA-AAAA-NNNNNN` |
| Vencimiento | `NULL` | Fecha + días de pago |
| Estado de la original | Pasa a `rectificada` | Sin cambios |
| Panel «Importe pendiente» (`server.js:24`) | No cuenta (serie RE) | **Resta** (serie FA, estado `emitida`) |
| Informe de IVA y CSV | Resta | Resta |

## 3. Ejemplos en los que dan resultados distintos

Cada caso compara el abono total de la misma factura por los dos caminos.

| Factura original | Original | I1 · espejo | I2 · líneas negativas | Diferencia |
|---|---|---|---|---|
| **A** · 40 platos × 28,90 € + 24 aceites × 27,45 € (21 % y 4 %), sin recargo. Base bruta 1.814,80 € → descuento del 2 % | 2.042,11 € | −2.042,11 € | **−2.083,91 €** (sin descuento) | **41,80 € más de abono** |
| **B** · 4 desengrasantes × 18,50 € + portes 2,50 € (21 %), cliente en recargo | 96,55 € | −96,55 € | −96,54 € | 0,01 € (portes: IVA 0,53 € frente a −0,52 €) |
| **C** · 2,50 € al 21 % + 1,25 € al 10 % | 4,41 € | −4,41 € | −4,39 € | 0,02 € |

### Cuantificación de las diferencias de redondeo

Barrido de todas las bases de 0,01 € a 999,99 € en una línea de cantidad 1 frente a −1 (16/11/2026):

| Tipo de IVA | Sin recargo: líneas cuya cuota no es el espejo exacto | Con recargo |
|---|---|---|
| 21 % | 890 de 99.999 (0,89 %) | 1.246 (1,25 %) |
| 10 % | **8.853 (8,85 %)** | **9.014 (9,01 %)** |
| 4 % | 0 | 432 (0,43 %) |

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** cuando la factura original no tuvo descuento por volumen y ninguna de sus cuotas cae en una
mitad exacta de céntimo. Es el caso de la mayoría de las facturas pequeñas al 21 % o al 4 %.

**Divergen**:

- en euros, siempre que la original tuvo descuento: base bruta de más de 1.000 € (ANO-061). Con la semilla,
  FA-2026-000105 tiene «Descuento volumen 2 % aplicado» (`db.js:149`);
- en céntimos, en casi 1 de cada 11 líneas al 10 % y en alrededor de 1 de cada 100 al 21 %;
- en los informes internos, porque la FA negativa resta del importe pendiente del panel y la RE no
  (contradicción 04), y la original solo queda marcada como rectificada con I1.

**Por qué no se ha detectado** (**SUPOSICIÓN**): el botón de rectificar (I1) es el camino previsto para los
abonos totales y no hay constancia de que se usen líneas negativas (P-17). Si se usan, las diferencias de
céntimos se pierden entre las demás, y las de euros solo aparecen al abonar facturas grandes.

## 5. Historia probable

Antes de 2020 los errores se corregían, según parece, borrando facturas (**SUPOSICIÓN**, H-13). Tras la
inspección de 2020 se prohíbe borrar y se crea la rectificativa de serie RE. Puri pide que sea un «espejo
exacto» (`routes/facturas.js:127-128`; H-22), lo que garantiza que el abono anula la original céntimo a céntimo
sin depender de cómo se calcule. El alta manual nunca prohibió cantidades negativas, que ya existían como forma
de restar algo dentro de una factura (RN-20). Así quedaron dos formas de abonar: una pensada para el abono total
y otra que el programa permite sin haberla diseñado para eso.

## 6. Pregunta de negocio (sin decidir)

¿Un abono debe devolver exactamente lo que se cobró, con el descuento y los redondeos de la original, o debe
calcularse de nuevo? ¿Qué se hace con los abonos parciales? Ya existen **P-17** (si se usan líneas negativas),
**P-39** (rectificativas parciales) y **P-46** (diferencias de un céntimo). Se propone añadir:

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-57 | Cuando hay que devolver solo una parte de una factura (una caja rota, un portes mal cobrado), ¿cómo se hace hoy: una factura nueva con cantidades en negativo, otra cosa? Si la factura original tenía descuento por volumen, ¿el abono debe llevar también el descuento? | Marga y Puri (gestoría) | Contradicción 13; ANO-071 |

## 7. Para el registro de anomalías (propuesta)

| ID | Tipo | Sev. | Descripción | Evidencia | Impacto estimado |
|---|---|---|---|---|---|
| ANO-071 | RAREZA | ALTA | Hay dos formas de abonar una factura y dan importes distintos. La rectificativa (RE) es el espejo de la original. La factura FA con cantidades negativas recalcula: pierde el descuento por volumen (41,80 € más de abono en el caso A) y redondea las mitades hacia cero (hasta un 9 % de las líneas al 10 % difieren en un céntimo). Además, la FA negativa resta del importe pendiente del panel y no marca la original | `routes/facturas.js:124-164` frente a `:42-102`; `services/calculo.js:39-43,60`; `lib/util.js:5-7`; `server.js:24`; apartado 3 | Abonos que no anulan la factura original; diferencias con la gestoría. Preguntas P-17, P-39 y P-57 |
