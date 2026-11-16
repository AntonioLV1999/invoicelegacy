# Contradicción 07 — Redondeo al céntimo: `redondear2` frente a `toFixed(2)`

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Barridos y casos con el `lib/util.js` y el `services/calculo.js` reales (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-025, ANO-059, ANO-060 |
| Preguntas relacionadas | P-30, P-46; nueva P-52 |

No se decide qué redondeo es el correcto. En particular, **no se toca la regla de redondeo línea a línea**
(`services/calculo.js:2-7`), que es otra cosa: esa regla decide *dónde* se redondea y este documento compara
*cómo* se redondea. No se corrige nada.

---

## 1. Implementaciones implicadas

| | Implementación | Evidencia | Dónde se usa |
|---|---|---|---|
| **I1** | `redondear2(x) = Math.round(x * 100) / 100`, el redondeo «de toda la vida» | `lib/util.js:4-7` | **Todo el cálculo de importes que se graban**: base, IVA y recargo de cada línea, acumulados de la factura y precio con descuento (`services/calculo.js:27-31,57,69,81-86`); prorrateo (`services/calculo.js:101`; `scripts/remesa_mensual.js:51`) |
| **I2** | `Number.prototype.toFixed(2)` | Dentro de `formatearImporte` (`lib/util.js:54`), y directamente en `views/index.ejs:6`, `views/articulos.ejs:8`, `views/contratos.ejs:8`, `routes/contratos.js:40` y `scripts/remesa_mensual.js:71` | **Todo lo que se muestra o se exporta**: factura impresa, listado, informe de IVA y **CSV para la gestoría** (`routes/informes.js:44-45`), panel, artículos, contratos y prorrateo de baja |

## 2. Comparación paso a paso

| Paso | I1 · `redondear2` | I2 · `toFixed(2)` |
|---|---|---|
| Sobre qué número trabaja | Sobre `x * 100` calculado en coma flotante, que puede quedar un poco por encima o por debajo | Sobre el valor exacto del número en coma flotante |
| Mitades exactas | Hacia +∞: 0,525 → 0,53; −0,525 → **−0,52** (ANO-059) | Alejándose de cero: −0,525 → **−0,53** (`formatearImporte` trabaja sobre el valor absoluto, `lib/util.js:53-54`) |
| Valores que en binario quedan justo por debajo de la mitad | Depende de cómo quede `x * 100`: 2,675 → **2,68**; 1,115 → **1,12**; 1,005 → 1,00 | Redondea hacia abajo: 2,675 → **2,67**; 1,115 → **1,11**; 1,005 → 1,00 |
| Negativos muy pequeños | −1e-14 → `-0` | `formatearImporte(-1e-14)` → **«-0,00»** |
| Resultado | Un número | Un texto |

## 3. Ejemplos en los que dan resultados distintos

### 3.1 Barridos (16/11/2026)

| Conjunto de entrada | Casos | `formatearImporte(x)` ≠ `formatearImporte(redondear2(x))` |
|---|---|---|
| Importes con 3 decimales, de 0,000 a 999,999 | 1.000.000 | **43.412** (el 43 % de los 100.000 que acaban en 5). En todos, I1 da el céntimo superior |
| Importes ya redondeados al céntimo, de 0,00 a 99.999,99 | 10.000.000 | **0** |
| Sumas de 30 importes al céntimo sin redondear, como `SUM()` o `tb +=` del informe de IVA | 200.000 | **0** |

### 3.2 Donde se ve en una factura impresa

El precio unitario se graba **tal como se teclea**, sin redondear (`routes/facturas.js:60`;
`services/calculo.js:67`), y la factura lo imprime con `formatearImporte` (`views/factura_detalle.ejs:28`). La
base sí pasa por `redondear2`:

| Cantidad × precio tecleado | Precio impreso (I2) | Base impresa (I1) | ¿Cuadra la línea a la vista? |
|---|---|---|---|
| 1 × 1,115 | **1,11** | **1,12** | No: 1 × 1,11 ≠ 1,12 |
| 1 × 2,675 | **2,67** | **2,68** | No |
| 3 × 1,005 | 1,00 | 3,01 | No (además, la base exacta 3,015 se queda en 3,01 en lugar de subir a 3,02; ANO-025) |
| 1 × 0,125 | 0,13 | 0,13 | Sí |

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** siempre que I2 recibe un importe que ya pasó por I1 o una suma de importes así. Son todos los
importes de cabecera y línea que calcula el código, el CSV, el informe de IVA, el panel y el prorrateo. Por eso
la gestoría nunca ha recibido una cifra distinta de la grabada (**SUPOSICIÓN** razonada: no hay copia de
producción para confirmarlo).

**Divergen** solo cuando I2 formatea un valor que no pasó por I1:

- el **precio unitario** tecleado con 3 o más decimales (apartado 3.2) y el precio de un artículo con más de 2
  decimales en la lista de artículos (`views/articulos.ejs:8`);
- los negativos muy pequeños producidos por sumas en coma flotante, que se verían como «-0,00».

**Por qué no se ha detectado**: los precios de la semilla tienen como mucho 2 decimales (`db.js:105-112`) y con
2 decimales las dos funciones coinciden siempre.

## 5. Historia probable

`redondear2` viene del GesFact 1.x en Access («de toda la vida», `lib/util.js:2,4`; H-01). `formatearImporte`
y los `toFixed(2)` de las vistas son la forma habitual de mostrar dos decimales en JavaScript y se escribieron
para la pantalla en la reescritura de 2017 o después (**SUPOSICIÓN** por el estilo). Nadie pensó en ellas como
dos redondeos, porque una «calcula» y la otra «solo formatea». El incidente de mayo de 2019 (H-12) trató sobre
*dónde* se redondea y dejó `redondear2` como estaba.

## 6. Pregunta de negocio (sin decidir)

Si el precio unitario tiene más de dos decimales, ¿qué debe figurar en la factura: el precio redondeado de una
manera, de otra, o con todos sus decimales?

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-52 | ¿Se teclean alguna vez precios unitarios con más de dos decimales (por ejemplo, 1,115 € la unidad en productos a granel)? ¿Alguna vez un cliente ha protestado porque en una línea cantidad × precio no da la base impresa? | Marga (y Puri, por si le ha llegado alguna queja) | Contradicción 07; ANO-060 |

## 7. Para el registro de anomalías

No se proponen anomalías nuevas: es **ANO-060**. Se propone ampliar su evidencia con los barridos del apartado
3.1 (43 % de las mitades con 3 decimales; ninguna diferencia con importes al céntimo) y con el caso de la
factura impresa del apartado 3.2, que es el único sitio donde la divergencia llega a un documento.
