# Contradicción 09 — ¿Está el cliente en recargo de equivalencia?

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** `calcularFactura` real con distintos valores del indicador; comportamiento de la columna `INTEGER` comprobado con SQLite (`node:sqlite`) el 16/11/2026 (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-019; nueva ANO-069 |
| Preguntas relacionadas | P-07; nueva P-54 |

No se decide qué criterio es el correcto. No se corrige nada.

---

## 1. Implementaciones implicadas

| | Criterio | Evidencia | Dónde |
|---|---|---|---|
| **I1** | `cliente.recargo_equivalencia == 1` (igualdad no estricta), con la ficha **del momento de emitir** | `services/calculo.js:49` | Cálculo del recargo en el alta manual (`routes/facturas.js:46,66`) y en la remesa (`scripts/remesa_mensual.js:26,55`) |
| **I2** | `if (f.recargo_equivalencia)` (cualquier valor que JavaScript considere verdadero), con la ficha **del momento de imprimir** | `views/factura_detalle.ejs:20`; consulta en `routes/facturas.js:106` | Leyenda «Cliente en régimen de recargo de equivalencia» en la factura impresa |
| **I3** | `c.recargo_equivalencia ? 'SÍ' : ''` | `views/clientes.ejs:9` | Columna «R.E.» del listado de clientes |
| **I4** | `if (f.recargo)` / `l.cuota_recargo ?`: si **la factura** tiene recargo | `views/factura_detalle.ejs:32,39` | Fila «Recargo equivalencia» de los totales y columna de recargo de las líneas |

El alta de clientes solo graba 0 o 1 (`routes/clientes.js:24`), y no hay pantalla para modificar un cliente
(P-07).

## 2. Comparación paso a paso

| Valor guardado | I1 · ¿se cobra recargo? | I2 · ¿la factura dice «en régimen»? | I3 · ¿listado «SÍ»? |
|---|---|---|---|
| `1` | Sí | Sí | Sí |
| `0` | No | No | No |
| `NULL` | No | No | No |
| `2` | **No** | **Sí** | **Sí** |
| `'S'` o `'sí'` (texto) | **No** | **Sí** | **Sí** |

Comprobado con SQLite el 16/11/2026: la columna `INTEGER` convierte `'0'`, `'1'` y `' 1'` en números, pero
guarda `'S'` y `'sí'` como texto. Por eso un `'0'` de texto no llega nunca a la aplicación, pero un `'S'` sí.

Además, I1 e I2 **no miran el mismo momento**. I1 usa la ficha del cliente al emitir; I2 la vuelve a leer al
imprimir (ANO-019). I4 no mira al cliente, sino los importes grabados en la factura.

## 3. Ejemplos en los que dan resultados distintos

| Caso | Recargo calculado (I1) | Leyenda impresa (I2) | Fila de recargo (I4) |
|---|---|---|---|
| Cliente con `recargo_equivalencia = 2`, línea de 100 € al 21 % | 0,00 € | «Cliente en régimen de recargo de equivalencia» | No aparece |
| Factura emitida a un cliente sin recargo al que después se marca con 1 en la BD | 0,00 € (al emitir) | Aparece la leyenda (al reimprimir) | No aparece |
| Factura emitida con recargo (5,20 € por 100 € al 21 %) a un cliente que después se desmarca | 5,20 € | **No** aparece la leyenda | Aparece |
| Cliente con 1 y línea con un tipo de IVA desconocido (ANO-040) | 0,00 € | Aparece la leyenda | No aparece |

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** para todo cliente dado de alta desde la pantalla (solo 0 o 1) y cuya ficha no se haya cambiado
después de facturarle. En la semilla, los dos clientes en recargo (`db.js:97,99`) tienen sus facturas con
recargo (FA-2026-000102: 6,01 €; FA-2026-000104: 0,76 €) y la leyenda coincide.

**Divergen** solo si alguien escribe en la BD un valor distinto de 0 o 1, o cambia el indicador de un cliente
que ya tiene facturas. Como no hay pantalla para editar clientes, las dos cosas exigen tocar la BD
directamente.

**Por qué no se ha detectado**: desde la aplicación no se puede provocar.

## 5. Historia probable

El esquema documenta el indicador como «1 = minorista en recargo» (`db.js:27`) y el cálculo compara con 1 al
pie de la letra. Las vistas usan la forma habitual de EJS, un `if` sobre el valor. Son dos lecturas razonables
del mismo campo, escritas con criterios distintos (**SUPOSICIÓN**: sin fecha; probablemente desde la
reescritura de 2017). Que la factura se imprima con los datos actuales del cliente es una decisión general de
diseño (ANO-019), no propia de este campo.

## 6. Pregunta de negocio (sin decidir)

¿La leyenda de recargo de una factura debe reflejar la situación del cliente al emitirla, la de hoy o lo que
realmente se le cobró?

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-54 | ¿Algún cliente ha entrado o salido del recargo de equivalencia después de tener facturas? ¿Cómo se cambió, si no hay pantalla para editar clientes? Al reimprimir una factura antigua de ese cliente, ¿qué debería decir? | Marga (y Puri, sobre lo que exige la factura) | Contradicción 09; ANO-069, ANO-019 |

## 7. Para el registro de anomalías (propuesta)

| ID | Tipo | Sev. | Descripción | Evidencia | Impacto estimado |
|---|---|---|---|---|---|
| ANO-069 | RAREZA | BAJA | El indicador de recargo se interpreta con dos criterios: el cálculo exige el valor 1 y las vistas aceptan cualquier valor «verdadero» (2, `'S'`…). Además, el cálculo usa la ficha al emitir y la leyenda impresa la ficha al imprimir, así que una factura puede decir «en régimen de recargo» sin llevar recargo, o al revés | `services/calculo.js:49`; `views/factura_detalle.ejs:20,32,39`; `views/clientes.ejs:9`; `routes/facturas.js:106`; `routes/clientes.js:24`; `db.js:27` | Factura impresa con una leyenda fiscal que no corresponde a lo cobrado. Solo si se toca la BD directamente. Pregunta P-54 |
