# Contradicción 03 — Base e IVA repercutidos de un periodo: suma de líneas frente a suma de cabeceras

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Semilla de `db.js` cargada por el propio `db.js` en una BD temporal; consultas con el SQL literal de `routes/informes.js` (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-004, ANO-013, ANO-014, ANO-049 |
| Preguntas relacionadas | P-05, P-28, P-38; nueva P-49 |

No se decide cuál de las dos cifras es la buena. No se corrige nada.

---

## 1. Implementaciones implicadas

La gestoría recibe de GesFact **dos totales de base e IVA** del mismo periodo, calculados desde tablas
distintas:

| | Implementación | Evidencia | Camino |
|---|---|---|---|
| **I1** | **Resumen de IVA trimestral**: suma las **líneas** (`lineas.base`, `cuota_iva`, `cuota_recargo`) agrupadas por tipo de IVA; el total lo suma la vista en JavaScript | `routes/informes.js:14-30`; `views/informe_iva.ejs:5-14` | Pantalla `GET /informes/iva`. «Estos importes los revisa la gestoría antes del modelo 303» (`views/informe_iva.ejs:16`) |
| **I2** | **CSV anual para la gestoría**: una fila por factura con la **cabecera** (`facturas.base`, `iva`, `recargo`, `total`) | `routes/informes.js:32-51` | Descarga `GET /informes/export-gestoria`, que se importa en Contaplus (**SUPOSICIÓN**, P-28) |

Las dos cifras deberían ser la misma porque la cabecera se calcula como suma de las líneas: `calcularFactura`
acumula base, IVA y recargo línea a línea (`services/calculo.js:81-86`). Pero la cabecera y las líneas se
graban por separado y sin transacción (`routes/facturas.js:74-98`; `scripts/remesa_mensual.js:61-73`), y la
rectificativa copia la cabecera desde la cabecera y las líneas desde las líneas (`routes/facturas.js:142,150`).
Nada comprueba que cuadren.

## 2. Comparación paso a paso

| Paso | I1 · informe de IVA | I2 · CSV |
|---|---|---|
| Tabla de origen | `lineas`, unida a `facturas` solo para filtrar por fecha (`routes/informes.js:23-25`) | `facturas`, unida a `clientes` (`:36-38`) |
| Periodo | Trimestre: `fecha >= 'AAAA-MM-01' AND fecha <= 'AAAA-MM-31'` (`:17-19,25`) | Año: `fecha LIKE 'AAAA-%'` (`:38`) |
| Estados incluidos | Todos (también `rectificada`) | Todos |
| Rectificativas | Restan con sus líneas negativas | Restan con su cabecera negativa |
| Factura sin líneas | No aparece | Aparece |
| Agrupación | Por tipo de IVA | Por factura |
| Suma | `SUM()` de SQLite por tipo y `tb += x.base` en la vista, sin redondear (`views/informe_iva.ejs:5`) | La hace la gestoría |
| Formato | `util.formatearImporte` | `util.formatearImporte` |

## 3. Ejemplos en los que dan resultados distintos (semilla)

### 3.1 Por factura (cabecera menos suma de líneas)

| Factura | Fecha | Diferencia de base | Diferencia de IVA |
|---|---|---|---|
| FA-2026-000101 | 31/01/2026 | 0,00 € | **+3,70 €** (27,97 frente a 24,27) |
| FA-2026-000105 | 31/03/2026 | **−47,75 €** (2.287,75 frente a 2.335,50) | **+129,61 €** (468,63 frente a 339,02) |
| FA-2026-000106 | 30/04/2026 | 0,00 € | +0,56 € |
| RE-2026-000001 | 06/05/2026 | 0,00 € | −0,56 € (espejo de la anterior) |
| FA-2026-000107 | 06/05/2026 | 0,00 € | +0,56 € |
| FA-2026-000108 | 31/05/2026 | 0,00 € | +1,93 € |
| FA-102, 103 y 104 | — | 0,00 € | 0,00 € |

### 3.2 Por periodo (lo que ve la gestoría)

| Periodo | I1 · informe (líneas): base / IVA / recargo | I2 · CSV (cabeceras): base / IVA / recargo | Diferencia de IVA (I2 − I1) |
|---|---|---|---|
| 1T 2026 | 3.736,60 / 603,66 / 6,77 | 3.688,85 / 736,97 / 6,77 | **+133,31 €** |
| 2T 2026 | 229,66 / 44,32 / 0,00 | 229,66 / 46,81 / 0,00 | +2,49 € |
| Año 2026 | 3.966,26 / 647,98 / 6,77 | 3.918,51 / 783,78 / 6,77 | **+135,80 €** (+21 %) |

Con la semilla, la gestoría vería en pantalla 647,98 € de IVA repercutido del primer semestre y recibiría un
CSV cuyas filas suman 783,78 €. La base también difiere en 47,75 €. Si estos datos son de producción no
consta (P-05).

### 3.3 Diferencias de periodo (fechas mal formadas)

Con fechas válidas `AAAA-MM-DD`, los dos filtros seleccionan las mismas facturas: `'2026-06-31'` sirve de tope
porque la comparación es de texto. Con fechas mal formadas, que el servidor no impide (ANO-049), no
coinciden. Se comprobó con SQLite el 16/11/2026:

| Fecha grabada | ¿Entra en el CSV de 2026? | ¿En qué trimestre del informe? |
|---|---|---|
| `2026-1-5` | Sí | **En ninguno** |
| `2026-13-01` | Sí | **En ninguno** |
| `2026-02-30` | Sí | 1T |
| `05/01/2026` | No | En ninguno |

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** en toda factura creada por el código actual que haya grabado la cabecera y todas sus líneas,
siempre que nadie la haya tocado después en la BD. En esos casos la cabecera es la suma de las líneas
redondeadas y las dos sumas dan lo mismo. En 200.000 sumas aleatorias de 30 importes al céntimo, la suma sin
redondear de la vista y la suma redondeada paso a paso de `calcularFactura` se mostraron igual en todos los
casos ([contradicción 07](contradiccion-07-redondeo-al-centimo.md), apartado 3).

**Divergen** cuando:

- falla la grabación de alguna línea (ANO-004). Según `routes/facturas.js:81-82` ya pasó una vez y «se apañó a
  mano en la BD» (H-21, P-38);
- se edita la BD a mano;
- hay facturas de versiones anteriores del cálculo. **SUPOSICIÓN**: las del trimestre de mayo de 2019,
  calculadas con redondeo sobre la base total (H-12), si siguen en la BD;
- se rectifica una factura que ya no cuadraba: la RE hereda el descuadre con el signo cambiado;
- se graban fechas mal formadas (apartado 3.3).

**Por qué no se ha detectado** (**SUPOSICIÓN**): la pantalla de IVA y el CSV no se miran juntos. El CSV no trae
totales y la gestoría suma en su programa. Si la gestoría cuadra con el CSV, nunca mira la pantalla.

## 5. Historia probable

Las dos salidas nacen juntas en la versión 2.3 de 2019 (`server.js:5`; H-09). El informe suma las líneas «para
tener el desglose por tipo» (`routes/informes.js:21-22`), porque la cabecera no guarda el desglose por tipo de
IVA (`db.js:50-63`). El CSV, en cambio, tiene una fila por factura y lo natural era leer la cabecera. El
comentario «las rectificativas entran con signo negativo y cuadran solas» (`routes/informes.js:21-22`) da por
hecho que cabecera y líneas siempre cuadran. Ninguna de las dos implementaciones está mal escrita por
separado: la contradicción está en suponer que las dos tablas son siempre coherentes.

## 6. Pregunta de negocio (sin decidir)

¿Cuál es la cifra oficial del IVA repercutido de un periodo: la suma de las líneas (pantalla) o la de las
cabeceras (CSV)?

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-49 | Para el modelo 303, ¿usa la pantalla «Resumen de IVA» de GesFact, el CSV importado en Contaplus o las dos? ¿Ha visto alguna vez que no coincidan? Con los datos de referencia del programa, en el primer semestre de 2026 la pantalla da 647,98 € de IVA y el CSV 783,78 € | Puri (gestoría) | Contradicción 03; ANO-014 |

## 7. Para el registro de anomalías

No se proponen anomalías nuevas: es **ANO-014**. Se propone ampliar su evidencia con la cuantificación del
apartado 3.2 (135,80 € de IVA y 47,75 € de base de diferencia en 2026 con la semilla) y con el caso de fechas
mal formadas del apartado 3.3, que hace que una factura entre en el CSV pero en ningún trimestre (complementa
ANO-049).
