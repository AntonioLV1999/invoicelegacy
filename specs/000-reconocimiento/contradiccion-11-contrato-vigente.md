# Contradicción 11 — Cuándo está vigente un contrato

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Remesa real de noviembre de 2026 sobre la semilla en una BD temporal, con el contrato 1 dado de baja con fecha futura (15/12/2026) y el reloj del proceso fijado al 01/12/2026 (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-008, ANO-042, ANO-053; nueva ANO-070 |
| Preguntas relacionadas | P-03, P-44; nueva P-56 |

No se decide qué criterio es el correcto. No se corrige nada.

---

## 1. Implementaciones implicadas

| | Criterio de «vigente» | Evidencia | Dónde |
|---|---|---|---|
| **I1** | Alta como muy tarde el último día del mes y sin baja, o con baja el día 1 del mes o después | `scripts/remesa_mensual.js:26-29` | Remesa: qué contratos se facturan |
| **I2** | Vigente si **no tiene** `fecha_baja`, sea cual sea su valor | `views/contratos.ejs:6,10` | Pantalla de contratos: la fila sale como «baja» (clase `baja`) y desaparece el botón de baja |
| **I3** | La baja es la fecha tecleada (o la de hoy), sin comprobarla contra el alta ni contra la fecha actual | `routes/contratos.js:31-35`; `views/contratos.ejs:12` (campo `type="date"`) | Acción de baja |

## 2. Comparación

| Contrato | I1 · remesa del mes M | I2 · pantalla |
|---|---|---|
| Sin `fecha_baja` | Se factura | Activo |
| Con `fecha_baja` anterior al mes M | No se factura | De baja |
| Con `fecha_baja` dentro del mes M | Se factura prorrateado | De baja |
| Con `fecha_baja` **posterior** al mes M | **Se factura completo** | **De baja** |
| Con `fecha_alta` posterior al mes M | No se factura | **Activo** |

## 3. Ejemplo en el que dan resultados distintos (ejecutado)

En la BD temporal se dio de baja el contrato 1 (Cafetería La Parada, 90 €) con fecha **15/12/2026**. Desde ese
momento la pantalla lo muestra como de baja y sin botón (I2). La remesa de **noviembre de 2026** lo facturó
igualmente completo: «Alquiler máquina de café Futurmat F3 (noviembre 2026)», base 90,00 € (`FA-2026-000109`).

Lo que pasaría después, calculado con las fórmulas reales (contradicción 01):

| Momento | Qué indica el programa |
|---|---|
| Al dar de baja (en noviembre) | La URL muestra `prorrateo=45.00`: 15 de 30 días de **diciembre**, para facturarlo a mano (`routes/contratos.js:37-40`) |
| Remesa de diciembre de 2026 | Factura además 15 de 31 días: **43,55 €** de base |

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** cuando la baja se da con fecha del mes en curso o pasada, que es lo que ocurre si se deja el
campo vacío (`util.hoy()`, `routes/contratos.js:32`). El único contrato de baja de la semilla, el 3, tiene
baja el 15/09/2025, en el pasado (`db.js:118`).

**Divergen** con una baja anunciada con antelación (fecha futura) o con un contrato dado de alta con fecha
futura. Durante los meses intermedios la pantalla y la remesa dicen cosas opuestas, y el prorrateo del último
mes se calcula meses antes y con otra regla (ANO-007, ANO-008).

**Por qué no se ha detectado** (**SUPOSICIÓN**): las bajas se suelen registrar cuando ya han ocurrido. Una fila
gris en la pantalla no llama la atención aunque la remesa siga facturando.

## 5. Historia probable

La pantalla y la acción de baja se escribieron pensando en la baja «de hoy»: el comentario habla de que «la
baja cae a mitad de mes» y de emitir «después» la factura del prorrateo (`routes/contratos.js:28-30`), y la
fecha por defecto es la del día (`:32`). Para ese uso basta con preguntar si hay `fecha_baja`. La remesa de
2021 (H-16) compara las fechas con el mes facturado, que es más preciso. **SUPOSICIÓN**: no consta que la
pantalla sea anterior a la remesa, aunque el comentario del procedimiento de baja lo sugiere (H-24).

## 6. Pregunta de negocio (sin decidir)

¿Se registran bajas de contrato con antelación? Si es así, ¿qué debe pasar en los meses que faltan hasta la
fecha de baja y cuándo se factura el último mes?

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-56 | ¿Se da de baja alguna vez un contrato con una fecha futura (por ejemplo, cuando el cliente avisa con un mes de antelación)? ¿Y de alta con fecha futura? En ese caso, ¿la factura del prorrateo del último mes se hace en el momento de la baja o al llegar la fecha? | Marga | Contradicción 11; ANO-070. Relacionada con P-03 |

## 7. Para el registro de anomalías (propuesta)

| ID | Tipo | Sev. | Descripción | Evidencia | Impacto estimado |
|---|---|---|---|---|---|
| ANO-070 | RAREZA | MEDIA | La pantalla de contratos considera de baja todo contrato con `fecha_baja`, aunque sea futura, y le quita el botón de baja. La remesa sigue facturándolo completo hasta el mes de la baja. Con fecha futura, el prorrateo «a facturar a mano» se calcula al registrar la baja, meses antes de que ocurra. Un contrato con alta futura sale como activo y no se factura | `views/contratos.ejs:6,10,12`; `routes/contratos.js:31-40`; `scripts/remesa_mensual.js:26-29`; ejecución del apartado 3 | Contratos que parecen de baja y siguen facturándose; posible doble cobro del último mes (ANO-008). Pregunta P-56 |
