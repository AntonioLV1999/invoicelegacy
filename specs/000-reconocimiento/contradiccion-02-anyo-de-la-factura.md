# Contradicción 02 — A qué año pertenece una factura

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Semilla de `db.js` en una BD temporal (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)), con el reloj del proceso fijado al 01/01/2027 09:00 |
| Anomalías relacionadas | ANO-002, ANO-049 |
| Preguntas relacionadas | P-06, P-43; nueva P-48 |

No se decide cuál de las dos fuentes del año es la correcta. No se corrige nada.

---

## 1. Implementaciones implicadas

El año de una factura se obtiene de **dos fuentes distintas** según quién lo pregunte:

| | Fuente del año | Evidencia | Quién la usa |
|---|---|---|---|
| **I1** | **Reloj del equipo** en el momento de numerar: `new Date().getFullYear()` | `lib/numeracion.js:15`; contador por serie y año, `:16-27` | El **número legal** (`FA-AAAA-NNNNNN`, `RE-AAAA-NNNNNN`) de los tres caminos: alta manual (`routes/facturas.js:71`), remesa (`scripts/remesa_mensual.js:57`) y rectificación (`routes/facturas.js:138`) |
| **I2** | **Campo `fecha` de la factura** (texto `AAAA-MM-DD`) | Alta manual: la tecleada o `util.hoy()` (`routes/facturas.js:44`). Remesa: el último día del mes facturado (`scripts/remesa_mensual.js:20-21,59`). Rectificación: `util.hoy()` (`routes/facturas.js:142`) | El **informe de IVA** por trimestre (`routes/informes.js:18-25`), el **CSV anual para la gestoría** (`routes/informes.js:35-38`, `fecha LIKE 'AAAA-%'`) y la fecha impresa (`views/factura_detalle.ejs`, con `util.fechaBonita`) |

## 2. Comparación paso a paso

| Paso | I1 · número | I2 · fecha |
|---|---|---|
| Origen | `new Date()` del proceso que graba (`lib/numeracion.js:15`) | Dato de la factura: formulario, cálculo de la remesa o `util.hoy()` |
| Zona horaria | Hora local del equipo | En la rectificación y en el alta sin fecha, también la hora local (`lib/util.js:10-15`); en el resto, la fecha calculada o tecleada, sin zona |
| ¿Se puede elegir? | No | Sí en el alta manual (`views/factura_nueva.ejs`, campo `fecha`); sí en la remesa (el mes es un argumento, `scripts/remesa_mensual.js:14`) |
| Validación cruzada | Ninguna: nada comprueba que el año del número coincida con el de la fecha | — |

Son dos algoritmos distintos para el mismo concepto («el año de la factura») y nada los obliga a coincidir.

## 3. Ejemplos en los que dan resultados distintos

### 3.1 Remesa de diciembre lanzada el 1 de enero (ejecutada, 16/11/2026)

Se ejecutó `scripts/remesa_mensual.js 2026-12` sobre la semilla con el reloj del proceso fijado al
**01/01/2027 09:00**, que es el día en que se lanza según `scripts/remesa_mensual.js:5-7` y `views/index.ejs`.
Resultado:

| Número (I1) | Fecha (I2) | Cliente | Total |
|---|---|---|---|
| `FA-2027-000001` | 31/12/2026 | Cafetería La Parada | 108,90 € |
| `FA-2027-000002` | 31/12/2026 | Casa Ubaldo | 175,45 € |
| `FA-2027-000003` | 31/12/2026 | Bar Nuevo Siglo | 108,90 € |

Consecuencias observadas en la misma BD temporal:

- Se abre el contador `FA/2027` y queda en 3. La primera factura **fechada** en 2027 será `FA-2027-000004`.
- El **CSV de 2026** (SQL de `routes/informes.js:36-38`) incluye las tres. Como se ordena por número, aparecen
  entre `FA-2026-000108` y `RE-2026-000001`.
- El **CSV de 2027** no las incluye: el fichero de 2027 empezaría en `FA-2027-000004`.
- El **informe de IVA del 4T de 2026** sí las suma: 3 líneas y 68,25 € de cuota.

### 3.2 Otros casos

- **Remesa de un mes atrasado**: la remesa de `2025-06` ejecutada en 2026 (contradicción 01, apartado 3.1)
  numeró `FA-2026-000112` con fecha 30/06/2025.
- **Factura manual con fecha de otro año**: una factura tecleada en enero con fecha de diciembre recibe número
  del año nuevo (`routes/facturas.js:44,71`). Sale de leer el código; no se ha ejecutado porque Express no está
  instalado.
- **Rectificativa**: la fecha y el número salen del mismo reloj y coinciden, salvo que la grabación cruce la
  medianoche del 31 de diciembre entre las dos llamadas a `new Date()` (`lib/numeracion.js:15` y
  `routes/facturas.js:142`). Es teórico.

**Cuantificación**: cada año, todas las facturas de la remesa de diciembre (3 con la semilla; en producción,
una por contrato activo, cifra desconocida) llevan número de un año y fecha de otro.

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** cuando la factura se fecha en el mismo año natural en que se graba: el alta manual sin fecha o con
fecha del año en curso, todas las rectificativas y las remesas de enero a noviembre lanzadas el día 1 del mes
siguiente.

**Divergen** una vez al año, el día 1 de enero, con la remesa de diciembre, y en cualquier factura con fecha
de otro año.

**Por qué no se ha detectado** (**SUPOSICIÓN**): la semilla solo tiene datos de 2026 y ninguna remesa de
diciembre. El número se mira poco al lado de la fecha, y el CSV del año anterior incluye esas facturas (por
fecha), así que a la gestoría no le falta ninguna. Lo que cambia es el número que llevan. No consta si alguien
lo ha visto (P-06).

## 5. Historia probable

1. Hasta el verano de 2021 todas las facturas se tecleaban a mano y casi siempre con la fecha del día. Fecha y
   reloj iban juntos (**SUPOSICIÓN** a partir de `routes/facturas.js:44`).
2. **Enero de 2021**: tras los números duplicados del 2 de enero, Julián rehace la numeración leyendo el
   contador justo antes de grabar (`lib/numeracion.js:8-10`; H-14). El contador «se abre a cero» con el año del
   reloj («año nuevo», `:19`). Era razonable si todas las facturas eran del día.
3. **Verano de 2021**: Roberto añade la remesa, que fecha cada factura el último día del mes facturado y se
   lanza al mes siguiente (`scripts/remesa_mensual.js:5-7,59`; H-16). A partir de ahí fecha y reloj pueden
   separarse, y la numeración no se revisó.

## 6. Pregunta de negocio (sin decidir)

¿El año del número de factura debe ser el de la fecha de la factura o el del día en que se emite? Ya existe
**P-06** (Marga: qué números recibieron las remesas de diciembre de otros años). Se propone añadir:

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-48 | Las cuotas de diciembre salen con fecha 31/12 y número del año siguiente (`FA-2027-000001` con fecha 31/12/2026). ¿Se ha visto esto en el CSV de algún año? ¿Hay algún problema legal o contable en que la serie de un año empiece con facturas fechadas el año anterior? ¿En qué ejercicio deben ir? | Puri (gestoría) | Contradicción 02; ANO-002 |

## 7. Para el registro de anomalías

No se proponen anomalías nuevas. Se propone **ampliar la evidencia de ANO-002** con la ejecución del apartado
3.1 (remesa real con reloj del 01/01/2027) y con dos efectos que no recoge su descripción: el CSV de un año
contiene números del año siguiente, ordenados entre los suyos, y la serie del año nuevo empieza con facturas
fechadas el año anterior.
