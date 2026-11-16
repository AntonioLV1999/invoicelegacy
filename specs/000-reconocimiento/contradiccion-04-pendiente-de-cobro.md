# Contradicción 04 — Qué es una factura «pendiente de cobro»

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Semilla de `db.js` en una BD temporal, con el SQL literal de `server.js` (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-006, ANO-021, ANO-033 |
| Preguntas relacionadas | P-16; nueva P-50 |

No se decide qué definición es la correcta. No se corrige nada.

---

## 1. Implementaciones implicadas

El mismo concepto, «factura pendiente de cobro», se define de cuatro formas distintas:

| | Definición | Evidencia | Dónde se ve |
|---|---|---|---|
| **I1** | `estado = 'emitida'` (cualquier serie) | `server.js:23` | Panel de inicio: «Facturas pendientes de cobro» (`views/index.ejs:5`) |
| **I2** | `estado = 'emitida' AND serie = 'FA'` | `server.js:24` | Panel de inicio: «Importe pendiente de cobro» (`views/index.ejs:6`) |
| **I3** | `estado = 'emitida'` (cualquier serie), con los totales de cada factura | `routes/facturas.js:18-21`; `views/facturas.ejs:7` | Listado de facturas filtrado por «emitidas» |
| **I4** | Se puede marcar cobrada si `estado === 'emitida' && serie === 'FA'` (pantalla) o si `estado = 'emitida'`, de cualquier serie (servidor) | `views/factura_detalle.ejs:47`; `routes/facturas.js:117-122` | Botón «Marcar cobrada» del detalle |

## 2. Comparación paso a paso

| Criterio | I1 · número del panel | I2 · importe del panel | I3 · listado «emitidas» | I4 · cobrar (pantalla / servidor) |
|---|---|---|---|---|
| Estado `emitida` | Sí | Sí | Sí | Sí / Sí |
| Excluye la serie RE | **No** | **Sí** | **No** | **Sí** / **No** |
| Formato del importe | — | `toFixed(2)`, punto decimal (`views/index.ejs:6`) | `formatearImporte`, coma decimal (`views/facturas.ejs:19`) | — |

Una rectificativa nace `emitida` (`routes/facturas.js:142`) y la pantalla no ofrece ninguna acción para
sacarla de ese estado (`views/factura_detalle.ejs:47`), así que **sigue emitida para siempre**.

## 3. Ejemplo en el que dan resultados distintos (semilla)

Facturas `emitida` de la semilla: FA-2026-000105 (2.756,38 €), RE-2026-000001 (−122,23 €), FA-2026-000107
(122,23 €) y FA-2026-000108 (154,24 €).

| Lo que se pregunta | Respuesta |
|---|---|
| Panel: «Facturas pendientes de cobro» (I1) | **4** |
| Panel: «Importe pendiente de cobro» (I2) | **3032.85 €** (3 facturas) |
| Listado filtrado «emitidas» (I3) | **4 filas**, que suman **2.910,62 €** |
| Facturas con botón «Marcar cobrada» (I4, pantalla) | 3 |

El panel muestra 4 facturas pendientes junto a un importe que solo corresponde a 3. Quien sume el listado
obtiene 122,23 € menos que el panel.

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** mientras no haya ninguna rectificativa: las cuatro definiciones seleccionan las mismas FA.

**Divergen** desde la primera rectificativa, y la diferencia crece sola: cada RE suma 1 al número del panel
y resta su importe del listado **para siempre**, porque ninguna pantalla la saca del estado `emitida`. Desde
2020 todo error se corrige con una RE (`lib/numeracion.js:3-6`), así que en producción el desfase será tan
grande como el número de rectificativas emitidas desde entonces (cifra desconocida: no hay copia de la BD).

**Por qué no se ha detectado** (**SUPOSICIÓN**): el panel enseña dos cifras sueltas sin relación aparente, y
con pocas rectificativas la diferencia en el número es pequeña. El listado no muestra ningún total.

## 5. Historia probable

**SUPOSICIÓN** a partir de la cronología: el panel («cuatro números y a correr», `server.js:21`) cuenta
facturas por estado y no distingue series. La serie RE se generaliza con la regla de no borrar facturas de
2020 (H-13). Es plausible que, al aparecer las RE, se añadiera `serie = 'FA'` a la suma del importe porque un
importe negativo «pendiente» llamaba la atención, y que nadie tocara el contador ni el listado. Lo mismo
explicaría por qué el botón de cobro filtra la serie en la pantalla y no en el servidor (ANO-033). No hay
ningún comentario ni testimonio que lo confirme.

## 6. Pregunta de negocio (sin decidir)

¿Una rectificativa emitida está «pendiente» de algo, es decir, de devolver el dinero o de compensarla? ¿Debe
contar en el panel?

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-50 | En el panel de inicio, ¿qué cifra usa para saber lo que queda por cobrar: el número de facturas o el importe? ¿Sabía que el número incluye las rectificativas y el importe no? Cuando se emite una rectificativa, ¿queda algo pendiente (una devolución, una compensación) y cómo se cierra? | Marga | Contradicción 04; ANO-021. Relacionada con P-16 |

## 7. Para el registro de anomalías

No se proponen anomalías nuevas: es **ANO-021**. Se propone ampliar su descripción con la cuarta definición
(el listado filtrado, I3) y con la consecuencia de que el desfase crece con cada rectificativa, porque una RE
nunca sale del estado `emitida`.
