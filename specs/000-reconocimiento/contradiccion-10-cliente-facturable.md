# Contradicción 10 — A qué clientes se puede facturar

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Remesa real de noviembre de 2026 sobre la semilla en una BD temporal, con el Bar Nuevo Siglo (cliente 6) dado de baja (`activo = 0`) y el reloj del proceso fijado al 01/12/2026 (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-011, ANO-031 |
| Preguntas relacionadas | P-07; nueva P-55 |

No se decide qué criterio es el correcto. No se corrige nada.

---

## 1. Implementaciones implicadas

El indicador `clientes.activo` (`db.js:29`) se pone a 0 con la baja de cliente (`routes/clientes.js:32-37`).
Cada camino lo trata a su manera:

| | Criterio | Evidencia | Camino |
|---|---|---|---|
| **I1** | Solo clientes activos | `routes/facturas.js:31` | Desplegable de «Nueva factura» (A, pantalla) |
| **I2** | Cualquier cliente que exista | `routes/facturas.js:46-47` | Grabación de la factura manual (A, servidor) |
| **I3** | Cualquier cliente con un contrato vigente en el mes; no mira `activo` | `scripts/remesa_mensual.js:26-29` | Remesa (B) |
| **I4** | Cualquier cliente | `routes/facturas.js:130` | Rectificación (C) |
| **I5** | Solo activos, para contarlos | `server.js:25` | Panel: «Clientes activos» |

La baja de un cliente no toca sus contratos (`routes/clientes.js:32-37`).

## 2. Comparación

| Pregunta | I1 | I2 | I3 | I4 |
|---|---|---|---|---|
| ¿Mira `activo`? | Sí | No | No | No |
| ¿Se puede facturar a un cliente de baja? | No se ofrece | Sí (con una petición que no venga del desplegable) | **Sí, todos los meses** | Sí |

## 3. Ejemplo en el que dan resultados distintos (ejecutado)

Con el cliente 6 (Bar Nuevo Siglo) dado de baja en la BD temporal, la remesa real de `2026-11` emitió
**`FA-2026-000111`** para él: «Alquiler máquina de café Futurmat F3 (noviembre 2026)», base 90,00 €, total
108,90 €. En la misma situación, la pantalla «Nueva factura» no lo ofrece en el desplegable (I1) y el panel no
lo cuenta entre los clientes activos (I5).

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** para los clientes de baja que no tienen contratos vivos: la única forma de facturarles es la
pantalla, que no los ofrece.

**Divergen** para un cliente dado de baja con un contrato sin `fecha_baja`: la remesa le sigue facturando la
cuota cada mes, indefinidamente, hasta que alguien dé de baja también el contrato.

Para la rectificación (I4), no filtrar es probablemente necesario: hay que poder abonar una factura de un
cliente que ya se dio de baja. Se deja anotado sin valorarlo.

**Por qué no se ha detectado** (**SUPOSICIÓN**): en la semilla ningún cliente está de baja (`db.js:95-102`).
Quien da de baja un cliente seguramente da de baja también sus contratos, y si no lo hace, la remesa factura
sin avisar.

## 5. Historia probable

El indicador `activo` existe desde que hay clientes y artículos, para no borrarlos (**SUPOSICIÓN**: por la
regla de no borrar, `lib/numeracion.js:3-6`). Se aplicó donde se elige un cliente en pantalla (I1), no donde se
graba (I2). La remesa de 2021 (H-16) trata el contrato como la unidad que decide si se factura y solo une la
tabla de clientes para leer nombre, recargo y días de pago (`scripts/remesa_mensual.js:26`). Nadie conectó
«cliente de baja» con «contrato vivo».

## 6. Pregunta de negocio (sin decidir)

¿Dar de baja a un cliente debe impedir que se le facturen las cuotas de sus contratos? ¿O un cliente con
contrato vivo no debería poder darse de baja?

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-55 | Cuando se da de baja a un cliente que tiene contratos (alquiler de máquinas, mantenimientos), ¿se dan de baja también sus contratos? ¿Le ha llegado alguna vez a un cliente de baja una cuota de la remesa? | Marga | Contradicción 10; ANO-011 |

## 7. Para el registro de anomalías

No se proponen anomalías nuevas: es **ANO-011** (remesa) y **ANO-031** (grabación manual). Se propone ampliar la
evidencia de ANO-011 con la ejecución del apartado 3 y con el dato de que la baja del cliente no toca sus
contratos (`routes/clientes.js:32-37`).
