# Contradicción 14 — Qué facturas se pueden cobrar o rectificar: pantalla frente a servidor

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Estados de la semilla de `db.js`, cargada por el propio `db.js` en una BD temporal (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)). Las rutas no se han ejecutado porque Express no está instalado: el análisis es de lectura del código |
| Anomalías relacionadas | ANO-006, ANO-033, ANO-034, ANO-044 |
| Preguntas relacionadas | P-16; nueva P-58 |

No se decide qué criterio es el correcto. No se corrige nada.

---

## 1. Implementaciones implicadas

La misma validación («¿se puede cobrar o rectificar esta factura?») está escrita dos veces, en la vista y en el
servidor, con criterios distintos:

| | Validación | Evidencia | Camino |
|---|---|---|---|
| **V1** | Se muestran los botones «Marcar cobrada» y «Rectificar» solo si `estado === 'emitida' && serie === 'FA'` | `views/factura_detalle.ejs:47-52` | Pantalla de detalle |
| **V2** | Cobrar: `UPDATE … WHERE id = ? AND estado = 'emitida'`, de cualquier serie. Si no coincide, no hace nada y no avisa | `routes/facturas.js:117-122` | `POST /facturas/:id/cobrar` |
| **V3** | Rectificar: se rechaza si `estado === 'rectificada'` o `serie === 'RE'`. **Admite** `cobrada` | `routes/facturas.js:132-133` | `POST /facturas/:id/rectificar` (camino C) |

## 2. Comparación

| Estado y serie de la factura | V1 · ¿botones? | V2 · ¿el servidor cobra? | V3 · ¿el servidor rectifica? |
|---|---|---|---|
| FA `emitida` | Sí | Sí | Sí |
| FA `cobrada` | **No** | No (sin aviso) | **Sí** |
| FA `rectificada` | No | No (sin aviso) | No (error 400) |
| RE `emitida` | **No** | **Sí** | No (error 400) |

## 3. Ejemplos en los que dan resultados distintos

**Con la semilla**: FA-2026-000101 a 000104 están `cobrada` (`db.js:126-145`). La pantalla no permite
rectificarlas, pero el servidor sí lo haría. RE-2026-000001 está `emitida` (`db.js:160`). La pantalla no
permite cobrarla, pero el servidor la pasaría a `cobrada`.

**Sin preparar ninguna petición, solo con dos pestañas** (lectura del código, sin ejecutar):

1. Se abre el detalle de una FA emitida en dos pestañas (o en dos puestos).
2. En la primera se pulsa «Marcar cobrada». La factura pasa a `cobrada`.
3. La segunda pestaña sigue mostrando los dos botones, porque se pintó antes. Si en ella se pulsa
   «Rectificar», el servidor lo admite (V3): se emite la RE y la original pasa de `cobrada` a `rectificada`,
   **y se pierde la constancia del cobro** (ANO-034).
4. Al revés, si se rectifica en la primera y se pulsa «Marcar cobrada» en la segunda, el servidor no hace nada
   y vuelve al detalle sin avisar (V2).

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** siempre que cada acción se haga sobre una pantalla recién cargada: V1 solo ofrece lo que V2 y V3
admiten.

**Divergen** con pantallas desactualizadas (otra pestaña, otro puesto, el botón «atrás» del navegador), con
reenvíos del formulario o con peticiones que no vienen de la pantalla. En esos casos manda el servidor, que es
más permisivo que la pantalla en dos de los cuatro casos.

**Por qué no se ha detectado** (**SUPOSICIÓN**): con un solo usuario y una sola pestaña no pasa. El resultado
(una factura cobrada que aparece como rectificada) no da ningún error.

## 5. Historia probable

La rectificación y la serie RE llegan después de la inspección de 2020 (H-13). Las comprobaciones del servidor
(V3) se escribieron para impedir lo que sería un error legal evidente, rectificar dos veces o rectificar una
rectificativa, y no se pensó en el estado `cobrada`. La vista (V1) se escribió con la idea de que solo se actúa
sobre facturas emitidas de la serie normal. El cobro (V2) es probablemente anterior a las RE y solo comprueba
el estado (**SUPOSICIÓN** por la cronología; sin comentario que lo confirme).

## 6. Pregunta de negocio (sin decidir)

¿Se puede rectificar una factura que ya está cobrada? ¿Una rectificativa se «cobra» (o se paga)? Ya existe
**P-16** (cómo se controla la devolución al rectificar una cobrada). Se propone añadir:

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-58 | ¿Hay que poder rectificar una factura ya cobrada? Si es así, ¿debe seguir constando que se cobró? ¿Tiene sentido marcar como «cobrada» una rectificativa, por ejemplo cuando se devuelve el dinero al cliente? | Marga y Puri (gestoría) | Contradicción 14; ANO-006, ANO-033, ANO-034 |

## 7. Para el registro de anomalías

No se proponen anomalías nuevas: son **ANO-006** (rectificar) y **ANO-033** (cobrar). Se propone ampliar
ANO-006 con el escenario de las dos pestañas del apartado 3, que provoca la divergencia sin preparar ninguna
petición y desemboca en ANO-034.
