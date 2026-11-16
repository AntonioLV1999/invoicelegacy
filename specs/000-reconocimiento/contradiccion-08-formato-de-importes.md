# Contradicción 08 — Cómo se escriben y cómo se leen los importes

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Conversiones con el `lib/util.js` real y la expresión literal de las rutas (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)); importes de la semilla de `db.js` |
| Anomalías relacionadas | ANO-021, ANO-022, ANO-032; nueva ANO-068 |
| Preguntas relacionadas | P-13; nueva P-53 |

No se decide qué convención es la correcta. No se corrige nada. El formato del CSV es un contrato con la
gestoría (`routes/informes.js:32-33`) y aquí solo se documenta.

---

## 1. Implementaciones implicadas

### 1.1 Al mostrar un importe

| | Convención | Evidencia | Dónde |
|---|---|---|---|
| **E1** | Punto de miles y coma decimal: `1.234,50` | `util.formatearImporte`, `lib/util.js:50-58` | Factura impresa (`views/factura_detalle.ejs:28-40`), listado (`views/facturas.ejs:19`), informe de IVA (`views/informe_iva.ejs:7-14`), **CSV de la gestoría** (`routes/informes.js:44-45`) |
| **E2** | Sin miles y punto decimal: `1234.50` | `toFixed(2)` | Panel de inicio (`views/index.ejs:6`), artículos (`views/articulos.ejs:8`), contratos (`views/contratos.ejs:8`), **prorrateo de baja en la URL** (`routes/contratos.js:40`), consola de la remesa (`scripts/remesa_mensual.js:71`) |
| **E3** | El número tal cual, con los decimales que tenga: `21.6` | `data-precio="<%= a.precio %>"` (`views/factura_nueva.ejs:23`), que el autorrelleno copia al campo precio (`public/js/factura.js:9`) | Precio que se pone solo al elegir un artículo |

### 1.2 Al leer un importe tecleado

| | Convención | Evidencia | Dónde |
|---|---|---|---|
| **L1** | `parseFloat(texto.replace(',', '.'))`: cambia **solo la primera** coma por un punto y lee hasta el primer carácter que no sea un número | `routes/facturas.js:59-60`; `routes/contratos.js:19`; `routes/articulos.js:19` | Cantidad y precio de cada línea, cuota de contrato y precio de artículo |

## 2. Comparación

L1 es la misma expresión, copiada en cuatro sitios, y entiende bien **E2** y **E3** (punto decimal) y la coma
decimal **sin** miles. **No entiende E1** cuando hay punto de miles: el formato con el que la aplicación muestra
las facturas es el único que, si se vuelve a teclear, se lee mal.

## 3. Ejemplos en los que dan resultados distintos (16/11/2026)

| Texto tecleado | De dónde podría venir | Valor leído por L1 | Valor que se ve en pantalla |
|---|---|---|---|
| `2.756,38` | Total de FA-2026-000105 en la factura o el listado (E1) | **2,756** | 2.756,38 |
| `1.000,00` | Base de FA-2026-000103 (E1) | **1** | 1.000,00 |
| `1.234` | Mil doscientos treinta y cuatro con punto de miles, sin decimales | **1,234** | — |
| `3032.85` | Importe pendiente del panel (E2) | 3.032,85 | 3032.85 |
| `45.00` | Prorrateo de baja en la URL (E2) | 45 | 45.00 |
| `21.6` | Autorrelleno de un artículo (E3) | 21,6 | 21.6 |
| `2756,38` | Tecleado a mano, sin miles | 2.756,38 | — |
| `12,5` | Cantidad con coma decimal | 12,5 | — |
| `1,234.50` | Formato inglés | **1,234** | — |

Además, el mismo importe se ve de dos formas según la pantalla: la cuota de 145 € es «145.00» en Contratos
(E2) y «145,00» en la factura de remesa (E1). El panel muestra «3032.85 €» y el listado, «2.756,38 €».

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** con cualquier importe inferior a 1.000 €, porque E1 no pone punto de miles y L1 lo lee bien.
También cuando el texto viene de E2 o E3, de cualquier tamaño.

**Divergen** cuando se teclea un importe de 1.000 € o más con punto de miles, por ejemplo copiado de una
factura, del listado o del informe de IVA. El resultado es un importe 1.000 veces menor, sin ningún aviso, en
una factura con número legal (ANO-032).

**Por qué no se ha detectado** (**SUPOSICIÓN**): lo que se teclea son precios unitarios y cantidades, casi
siempre por debajo de 1.000 (el precio más alto de la semilla es 28,90 €, `db.js:106`). El único importe que el
procedimiento manda copiar de una pantalla a otra es el prorrateo de baja (`views/contratos.ejs:17`), que sale
con E2 y se lee bien.

## 5. Historia probable

E1 es el formato español que se pactó con Puri para el CSV en 2019 («decimales con coma»,
`routes/informes.js:32-33`; H-09) y que se usa en lo que se imprime. E2 aparece en pantallas internas y en el
procedimiento de baja: `toFixed(2)` es lo inmediato en JavaScript (**SUPOSICIÓN** por el estilo). L1 se pensó
para que se pudiera teclear con coma decimal desde un teclado español, sin prever el punto de miles. E3 llega
con el autorrelleno de Roberto en 2021 (H-15). Cada pieza se escribió para su pantalla y nadie comprobó que un
importe mostrado pudiera volver a teclearse.

## 6. Pregunta de negocio (sin decidir)

¿En qué formato debe mostrarse y teclearse un importe en las pantallas internas? ¿Debe aceptarse el punto de
miles al teclear? Ya existe **P-13** (si se teclea el punto de miles). Se propone añadir:

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-53 | ¿Copia alguna vez importes de una pantalla de GesFact a otra (de la factura, del listado, del panel o de la barra de direcciones tras dar de baja un contrato) para meterlos en una factura nueva? ¿De cuáles? ¿Le resulta extraño que unas pantallas usen punto decimal y otras coma? | Marga | Contradicción 08; ANO-032, ANO-068 |

## 7. Para el registro de anomalías (propuesta)

| ID | Tipo | Sev. | Descripción | Evidencia | Impacto estimado |
|---|---|---|---|---|---|
| ANO-068 | RAREZA | MEDIA | Conviven tres formas de mostrar importes (`1.234,50` en factura, listado, informe y CSV; `1234.50` en panel, artículos, contratos y prorrateo; `21.6` sin formato en el autorrelleno) y una sola forma de leerlos, que solo entiende bien las dos últimas. El formato de las facturas es el único que no se puede volver a teclear sin error (complementa ANO-032) | `lib/util.js:50-58`; `views/index.ejs:6`; `views/articulos.ejs:8`; `views/contratos.ejs:8`; `routes/contratos.js:40`; `views/factura_nueva.ejs:23`; `public/js/factura.js:9`; `routes/facturas.js:59-60`; `routes/contratos.js:19`; `routes/articulos.js:19` | Confusión en las pantallas internas; un importe de 1.000 € o más copiado de una factura se graba 1.000 veces menor. Preguntas P-13 y P-53 |
