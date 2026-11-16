# Contradicción 12 — Fecha de hoy y suma de días: dos formas de interpretar una fecha

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** `lib/util.js` real ejecutado con la zona horaria del proceso fijada a cinco valores y el reloj fijado al 29/03/2026 23:30 UTC (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-030 |
| Preguntas relacionadas | P-12 |

No se decide qué interpretación es la correcta. No se corrige nada.

---

## 1. Implementaciones implicadas

| | Implementación | Evidencia | Qué interpreta | Quién la usa |
|---|---|---|---|---|
| **I1** | `util.hoy()` | `lib/util.js:9-15` | El instante actual en **hora local** (`new Date()` y `getFullYear/getMonth/getDate`) | Fecha por defecto de la factura manual (`routes/facturas.js:44`), fecha de la rectificativa (`:142`), alta y baja de contratos (`routes/contratos.js:21,32`) |
| **I2** | `util.sumarDias(fecha, dias)` | `lib/util.js:17-26` | Convierte `'AAAA-MM-DD'` con `new Date(fecha)`, que para ese formato toma **medianoche UTC**, suma `dias × 24 h` y vuelve a texto con los métodos de **hora local** | Vencimiento de la factura manual (`routes/facturas.js:69`) y de la remesa (`scripts/remesa_mensual.js:60`) |
| **I3** | `util.diasDelMes(fecha)` | `lib/util.js:35-39` | Construye la fecha con año, mes y día (`new Date(a, m, 0)`), en hora local | Remesa (`scripts/remesa_mensual.js:21,47`) |
| **I4** | Cadenas de texto | `scripts/remesa_mensual.js:20-21`; `routes/contratos.js:38` | `mes + '-01'`, `fechaBaja.slice(0, 8) + '01'`: no hay interpretación horaria | Remesa y baja de contratos |

Además, el código que pasa una fecha a texto `AAAA-MM-DD` con ceros a la izquierda está **duplicado
literalmente** en I1 y en I2 (`lib/util.js:11-14` y `:22-25`).

## 2. Comparación paso a paso

| Paso | I1 · `hoy()` | I2 · `sumarDias()` |
|---|---|---|
| Origen | Reloj del equipo | Texto `AAAA-MM-DD` |
| Interpretación | Hora local | **UTC** (regla de `Date` para cadenas que solo tienen fecha) |
| Aritmética | — | Milisegundos (`dias × 86.400.000`) |
| Vuelta a texto | Hora local | Hora local |
| Coherencia interna | Total | Lee en UTC y escribe en hora local |

## 3. Ejemplos en los que dan resultados distintos (16/11/2026)

| Zona horaria del proceso | `hoy()` | `sumarDias('2026-01-31', 30)` | `sumarDias('2026-03-01', 0)` | `sumarDias('2026-03-02', 30)` |
|---|---|---|---|---|
| Europe/Madrid | 30/03/2026 | 02/03/2026 | 01/03/2026 | 01/04/2026 |
| Atlantic/Canary | 30/03/2026 | 02/03/2026 | 01/03/2026 | 01/04/2026 |
| UTC | 29/03/2026 | 02/03/2026 | 01/03/2026 | 01/04/2026 |
| Pacific/Auckland (UTC+13) | 30/03/2026 | 02/03/2026 | 01/03/2026 | 01/04/2026 |
| **America/New_York** (UTC−4/−5) | 29/03/2026 | **01/03/2026** | **28/02/2026** | **31/03/2026** |

En las zonas al oeste de UTC, `sumarDias` devuelve **siempre un día menos**, incluso sumando 0 días. `hoy()` es
correcta en todas, porque lee y escribe en hora local.

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** en cualquier zona horaria igual o al este de UTC, que incluye la península, Baleares y Canarias.
El cambio de hora de marzo no influye: la suma se hace en UTC, que no tiene cambio de hora (con
`Europe/Madrid` no se reproduce el fallo, ANO-030).

**Divergen** si el equipo que ejecuta GesFact tiene configurada una zona al oeste de UTC. Todos los
vencimientos saldrían un día antes. **SUPOSICIÓN**: es un mecanismo compatible con el incidente de marzo de 2019
(«el vencimiento de una factura salió un día menos», `lib/util.js:18-19`; H-10), pero no hay ninguna
evidencia de que la zona del equipo estuviera mal entonces. La explicación de Julián (el cambio de hora) no se
sostiene con la zona correcta.

**Por qué no se ha detectado**: con la zona horaria de España no se manifiesta.

## 5. Historia probable

`hoy()` y `sumarDias()` están en `util.js`, que «viene del gesfact 1.x en Access» en parte (`lib/util.js:2`). El
comentario de I1 dice que «la BD guarda así desde 2018» (`:9`; H-07). `sumarDias` copia el código de formato de
`hoy()` y añade la conversión con `new Date(fecha)`, sin advertir que esa conversión interpreta la fecha en
UTC (**SUPOSICIÓN** a partir del código duplicado). El TODO de 2019 muestra que se notó un síntoma y no se
encontró la causa.

## 6. Pregunta de negocio (sin decidir)

Es sobre todo una pregunta de entorno: ya existe **P-12** (Marga: registro de la factura de marzo de 2019 y
zona horaria del equipo). Se propone añadir a P-12 una comprobación concreta: anotar la zona horaria que
muestra Windows en el equipo de la oficina y en el que lanza la remesa, y si se ha cambiado desde 2019.

## 7. Para el registro de anomalías

No se proponen anomalías nuevas. Se propone **precisar ANO-030**: verificado el 16/11/2026 que `sumarDias`
interpreta la fecha en UTC y la devuelve en hora local. En zonas al oeste de UTC resta un día a todos los
vencimientos; en España no se manifiesta. El código de formato está duplicado en `lib/util.js:11-14` y
`:22-25`.
