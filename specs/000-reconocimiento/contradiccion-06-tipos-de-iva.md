# Contradicción 06 — Tipos de IVA admitidos y tipo por defecto

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Cálculos con el `services/calculo.js` real (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-040; nueva ANO-067 |
| Preguntas relacionadas | P-22, P-42; P-51 |

No se decide qué lista de tipos ni qué valor por defecto son los correctos. No se corrige nada.

---

## 1. Implementaciones implicadas

### 1.1 Qué tipos de IVA existen

| | Lista | Evidencia | Camino |
|---|---|---|---|
| **L1** | 21, 10 y 4 | `views/factura_nueva.ejs:18` | Desplegable de cada línea en «Nueva factura» (A) |
| **L2** | 21, 10 y 4 | `views/articulos.ejs:18` | Alta de artículo |
| **L3** | 21, 10, 4 **y** 18, 16, 8, 7 («tipos antiguos […] por si hay que reabrir ejercicios viejos del Access»). Cualquier otro: recargo 0 | `services/calculo.js:11-23` | Recargo de equivalencia en A y B |
| **L4** | «21 / 10 / 4» | Comentario del esquema, `db.js:36` | Documentación interna |
| **L5** | Cualquier entero (`parseInt`), sin validar | `routes/facturas.js:61` (ANO-040); `routes/contratos.js:20`; `routes/articulos.js:16` | Lo que de verdad acepta el servidor |

### 1.2 Qué tipo se usa si no se indica

| | Valor por defecto | Evidencia | Camino |
|---|---|---|---|
| **D1** | `config.IVA_DEFECTO` (21) | `config.js:24-25`; `routes/articulos.js:16` | Alta de artículo. Inalcanzable desde la pantalla, porque el desplegable siempre envía un valor (`views/articulos.ejs:18`) |
| **D2** | `21` escrito en el código | `routes/contratos.js:20` | Alta de contrato (no tiene pantalla; P-07) |
| **D3** | `DEFAULT 21` del esquema | `db.js:46` | Contratos insertados sin tipo |
| **D4** | Primera opción del desplegable (21) | `views/factura_nueva.ejs:18` | Cada línea nueva de factura |

## 2. Comparación

- **Lista**: las pantallas ofrecen 3 tipos, el cálculo del recargo conoce 7 y el servidor acepta cualquiera. Un
  tipo que no esté en L3 se factura con su IVA y **recargo 0** sin avisar (`services/calculo.js:22`).
- **Valor por defecto**: el mismo 21 aparece en cuatro sitios y solo uno lee `config.js`. Cambiar
  `IVA_DEFECTO` no tendría ningún efecto visible: D1 es inalcanzable y D2-D4 no lo leen.
- **Autorrelleno**: al elegir un artículo, el navegador copia su tipo en el desplegable de la línea
  (`public/js/factura.js:10`). Si el artículo tuviera un tipo que no está en L1 (por ejemplo, 5), el
  desplegable no tiene esa opción. **SUPOSICIÓN** sobre el navegador: según la norma HTML, el desplegable
  quedaría sin opción seleccionada y no se enviaría. Entonces la lista `iva[]` llegaría con un elemento menos y
  los tipos de las líneas siguientes se desplazarían (`routes/facturas.js:53,61`). Hay que comprobarlo con un
  navegador sobre una copia.

## 3. Ejemplos en los que dan resultados distintos

| Entrada | Lo que ofrecen las pantallas | Lo que calcula el servidor |
|---|---|---|
| Línea de 100 € al 18 % (tipo antiguo) para un cliente en recargo | No se puede elegir | IVA 18,00 €, recargo **4,00 €** (`services/calculo.js:18`) |
| Línea de 100 € al 5 % para un cliente en recargo | No se puede elegir | IVA 5,00 €, recargo **0,00 €** (`services/calculo.js:22`) |
| Alta de artículo sin tipo (petición sin el campo) | — | `IVA_DEFECTO` (21) |
| Alta de contrato sin tipo | — | 21 literal, aunque `IVA_DEFECTO` cambie |

**SUPOSICIÓN** (sin evidencia en el proyecto): entre 2023 y 2024 hubo tipos temporales del 5 % y del 2 %, que
llevaban su propio recargo de equivalencia. Si se facturó alguno, L3 le habría aplicado recargo 0. Ya está
preguntado en **P-42**.

## 4. Cuándo divergen y cuándo coinciden

**Coinciden** con los tres tipos actuales (21, 10 y 4), que son los únicos de la semilla (`db.js:105-119`) y los
únicos que ofrecen las pantallas. **Divergen** con cualquier otro tipo, que solo puede llegar por una petición
que no venga del formulario, por un artículo o contrato grabado directamente en la BD o, si se confirma la
suposición del apartado 2, por un artículo con un tipo que no está en el desplegable.

**Por qué no se ha detectado**: con los tipos actuales todo coincide y las pantallas no dejan elegir otros.

## 5. Historia probable

L3 es la lista más antigua: conserva los tipos «del Access» (anteriores a 2017; H-02). Al reescribir en Node en
2017, Julián puso en las pantallas solo los tipos vigentes y dejó el cálculo del recargo con todos
(**SUPOSICIÓN**: por el comentario de `services/calculo.js:16-17`). `IVA_DEFECTO` se definió en `config.js`,
pero el alta de contratos (sin fecha conocida) y el esquema repiten el 21 por su cuenta. El autorrelleno de
2021 (`public/js/factura.js:1-2`; H-15) da por hecho que todo artículo tiene uno de los tres tipos del
desplegable.

## 6. Pregunta de negocio (sin decidir)

¿Qué tipos de IVA debe admitir GesFact y con qué recargo? ¿Se necesitan los antiguos (P-22) o los temporales
de 2023-2024 (P-42)? ¿El tipo por defecto es un valor de configuración (P-51)?

## 7. Para el registro de anomalías (propuesta)

| ID | Tipo | Sev. | Descripción | Evidencia | Impacto estimado |
|---|---|---|---|---|---|
| ANO-067 | RAREZA | MEDIA | La lista de tipos de IVA y el tipo por defecto están repetidos y no coinciden. Las pantallas ofrecen 21/10/4, el recargo conoce además 18/16/8/7, el servidor acepta cualquier entero y los tipos desconocidos llevan recargo 0. El 21 por defecto está en cuatro sitios y solo uno, inalcanzable, lee `IVA_DEFECTO`. **SUPOSICIÓN**: un artículo con un tipo que no está en el desplegable desalinea los tipos de las líneas | `views/factura_nueva.ejs:18`; `views/articulos.ejs:18`; `services/calculo.js:11-23`; `db.js:36,46`; `config.js:24-25`; `routes/articulos.js:16`; `routes/contratos.js:20`; `routes/facturas.js:53,61`; `public/js/factura.js:10` | Recargo no cobrado con un tipo no previsto; cambiar `IVA_DEFECTO` no tiene efecto. Preguntas P-42 y P-51 |
