# Reglas de negocio — GesFact 2.4 (Suministros Hidalgo S.L.)

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `484a7dc` (rama `master`); el código fuente no ha cambiado desde `1f35d01`, la versión del [mapa del sistema](mapa-sistema.md) |
| Alcance | Los diez módulos de criticidad **ALTA** del [mapa del sistema](mapa-sistema.md), apartado 2.0, y las utilidades de las que dependen (ver apartado 0) |
| Fuentes | Lectura completa de esos módulos; [mapa del sistema](mapa-sistema.md), [ciclo de vida de una factura](flujo-factura.md), [registro de riesgos](registro-riesgos.md) y [memoria histórica](memoria-historica.md); ejecución en memoria de `services/calculo.js` y `lib/util.js` (apéndice A) |
| Datos reales consultados | **Ninguno.** No hay copia de la BD de producción: `datos/` solo contiene `migracion_mysql_2018.sql` (comprobado el 16/11/2026). Los ejemplos marcados «semilla» usan los datos de `db.js:93-180`, que el código presenta como «los que había en el sistema cuando se hizo la copia» (`db.js:91-92`), pero **no consta que sean de producción** y varios no cuadran (ANO-013, P-05) |

**Convenciones.**

- Cada regla está redactada como regla de negocio (qué se cobra, qué se permite, qué se calcula, cuándo y
  cuánto). El código se cita solo como evidencia (`fichero:líneas`).
- Los ejemplos se han calculado ejecutando mentalmente el código y se han comprobado ejecutando en memoria
  `services/calculo.js` y `lib/util.js` el 16/11/2026 (apéndice A). Ninguno abre la BD.
- **Clasificación provisional**: **INTENCIONAL** (hay comentario, testimonio escrito o coherencia interna que
  muestra una decisión), **ACCIDENTAL** (efecto colateral de cómo está programado) o **DUDOSA** (no se puede
  decidir desde el código). Es provisional: ninguna clasificación autoriza a cambiar nada (Principio I).
- Lo que no tiene evidencia se marca **SUPOSICIÓN** y remite a una pregunta `P-NN`.
- Las anomalías ya registradas se citan por su `ANO-NNN` provisional (ANO-001 a ANO-058 en los documentos
  anteriores). Los hallazgos nuevos continúan desde **ANO-059** (apartado 13) y las preguntas nuevas desde
  **P-42** (apartado 14). No se corrige nada (Principio III).
- Los importes de los ejemplos siguen la convención española (coma decimal). El sistema los guarda y
  calcula con punto decimal.

---

## 0. Módulos analizados

| Módulo (criticidad ALTA) | Qué aporta a este documento |
|---|---|
| `services/calculo.js` | Núcleo: importes de línea, IVA, recargo, descuento por volumen, totales y prorrateo comercial (apartados 1 a 3 y 7) |
| `lib/numeracion.js` | Numeración legal (apartado 5) |
| `routes/facturas.js` | Alta manual, cobro y rectificación (apartados 4 y 6) |
| `scripts/remesa_mensual.js` | Facturación mensual de cuotas (apartado 8) |
| `routes/informes.js` | Resumen de IVA y fichero para la gestoría (apartado 9) |
| `lib/util.js` (utilidad de todos los anteriores) | Redondeo, fechas, vencimientos, formato de importes y NIF (apartados 1, 4 y 10) |
| `config.js` | Constantes de negocio: plazo de pago por defecto y datos de empresa (apartado 11) |
| `db.js` | Estados, valores por defecto del esquema y datos semilla usados como ejemplo |
| `views/factura_detalle.ejs`, `views/informe_iva.ejs` | Reglas de presentación del documento fiscal y del informe (apartados 9 y 10) |

Se citan además, solo como evidencia de entradas o de quién llama a una regla, `routes/contratos.js` y
`views/factura_nueva.ejs` (criticidad MEDIA) y `views/informes.ejs` (BAJA).

---

## Índice de reglas

| ID | Regla (resumen) | Clasificación |
|---|---|---|
| RN-01 | Base de la línea = cantidad × precio, redondeada al céntimo | INTENCIONAL |
| RN-02 | Cuota de IVA de cada línea sobre la base ya redondeada | INTENCIONAL |
| RN-03 | IVA y recargo de la factura = suma de los de cada línea | INTENCIONAL |
| RN-04 | Partir una cantidad en varias líneas puede cambiar el IVA | INTENCIONAL |
| RN-05 | Redondeo de las mitades: hacia arriba en positivos, hacia cero en negativos | ACCIDENTAL |
| RN-06 | Totales de la factura | INTENCIONAL |
| RN-07 | Recargo de equivalencia solo a clientes marcados | INTENCIONAL |
| RN-08 | Tabla de recargos vigente: 21 → 5,2 %, 10 → 1,4 %, 4 → 0,5 % | INTENCIONAL |
| RN-09 | Recargos de tipos antiguos 18/16 → 4 %, 8/7 → 1 % | INTENCIONAL |
| RN-10 | Cualquier otro tipo de IVA no lleva recargo | DUDOSA |
| RN-11 | Tramos del descuento por volumen (estrictamente mayor que 1.000 y 5.000) | INTENCIONAL |
| RN-12 | El tramo se decide con la base bruta, suma de líneas ya redondeadas | ACCIDENTAL |
| RN-13 | El descuento afecta a toda la base, con salto en el umbral | DUDOSA |
| RN-14 | El descuento se aplica al precio unitario, redondeado | DUDOSA |
| RN-15 | El descuento no distingue cliente, tipo de IVA ni signo de la línea | DUDOSA |
| RN-16 | Aviso de descuento en las observaciones (solo factura manual) | INTENCIONAL |
| RN-17 | Solo se factura una fila si tiene descripción | DUDOSA |
| RN-18 | Una factura necesita al menos una línea | INTENCIONAL |
| RN-19 | Lectura de cantidades y precios tecleados | ACCIDENTAL |
| RN-20 | Se admiten cantidades y precios cero, negativos o decimales | DUDOSA |
| RN-21 | Precio e IVA: los del formulario, no los del catálogo | INTENCIONAL |
| RN-22 | Fecha de factura libre; vacía → hoy | DUDOSA |
| RN-23 | Se puede facturar a cualquier cliente existente | DUDOSA |
| RN-24 | Vencimiento = fecha + días de pago (30 por defecto), días naturales | INTENCIONAL |
| RN-25 | Una factura nueva nace «emitida» en la serie FA | INTENCIONAL |
| RN-26 | Formato del número `SERIE-AAAA-NNNNNN` | INTENCIONAL |
| RN-27 | Contador independiente por serie y año, que empieza en 1 | INTENCIONAL |
| RN-28 | El año del número es el del reloj, no el de la fecha de factura | ACCIDENTAL |
| RN-29 | El número se consume al asignarse, aunque la factura no llegue a grabarse | ACCIDENTAL |
| RN-30 | Las facturas no se borran nunca | INTENCIONAL |
| RN-31 | Estados de la factura y transiciones permitidas | INTENCIONAL |
| RN-32 | Cobro: todo o nada, sin fecha | DUDOSA |
| RN-33 | Rectificación: solo abono total de una factura FA no rectificada | INTENCIONAL |
| RN-34 | La rectificativa es el espejo exacto de la original | INTENCIONAL |
| RN-35 | Fecha, vencimiento y textos de la rectificativa | DUDOSA |
| RN-36 | Prorrateo comercial de la baja: cuota / 30 × días | INTENCIONAL |
| RN-37 | Prorrateo comercial: febrero y meses distintos | ACCIDENTAL |
| RN-38 | El prorrateo de baja no se factura solo | DUDOSA |
| RN-39 | Contratos que entran en la remesa de un mes | INTENCIONAL |
| RN-40 | Cuota del mes en la remesa: completa o por días reales | DUDOSA |
| RN-41 | La cuota de la remesa pasa por el cálculo normal (recargo y descuento) | DUDOSA |
| RN-42 | Forma de la factura de remesa: fecha, vencimiento, textos | INTENCIONAL |
| RN-43 | Mes de la remesa: solo se comprueba el formato | ACCIDENTAL |
| RN-44 | Informe de IVA: suma de líneas por tipo, en el trimestre de la fecha de factura | INTENCIONAL |
| RN-45 | Informe de IVA: rectificada y rectificativa se compensan | INTENCIONAL |
| RN-46 | Informe de IVA: año y trimestre por defecto | ACCIDENTAL |
| RN-47 | Informe de IVA: totales sumados sin redondear | ACCIDENTAL |
| RN-48 | Fichero para la gestoría: qué facturas y qué importes | INTENCIONAL |
| RN-49 | Fichero para la gestoría: formato | INTENCIONAL |
| RN-50 | Formato de importes en pantalla, impresión y fichero | ACCIDENTAL |
| RN-51 | Formato de fechas en pantalla, impresión y fichero | INTENCIONAL |
| RN-52 | Fecha de «hoy» = fecha local del equipo | INTENCIONAL |
| RN-53 | NIF opcional; si se informa, 9 caracteres | INTENCIONAL |
| RN-54 | La factura impresa usa los datos actuales del cliente y de la empresa | DUDOSA |
| RN-55 | Contenido de la factura impresa | DUDOSA |

---

## 1. Importe de cada línea y redondeo

### RN-01 · Base de la línea = cantidad × precio, redondeada al céntimo

- **Enunciado**: la base de cada línea es la cantidad por el precio unitario sin IVA, redondeada a dos
  decimales. La cantidad puede tener decimales (fracciones de caja, de saco o de servicio).
- **Ejemplo** (semilla, FA-2026-000101, `db.js:130`): 0,44 cajas de vasos a 21,60 € = 9,504 → **9,50 €**.
- **Evidencia**: `calcularLinea`, `services/calculo.js:26-27`; `redondear2`, `lib/util.js:5-7`.
- **Clasificación**: **INTENCIONAL**. Comentario «TODO redondeado por línea» (`services/calculo.js:25`) y aviso de
  Julián de mayo de 2019: el Contaplus de la gestoría cuadra línea a línea (`services/calculo.js:3-6`).

### RN-02 · La cuota de IVA de cada línea se calcula sobre la base ya redondeada

- **Enunciado**: primero se redondea la base de la línea y después se le aplica el tipo de IVA. La cuota
  también se redondea al céntimo. El orden es: cantidad × precio → redondeo → × tipo / 100 → redondeo.
- **Ejemplo** (semilla, misma línea): 9,50 × 21 % = 1,995 → **2,00 €**, que es lo grabado en `db.js:130`. Con la
  base sin redondear (9,504 × 21 % = 1,99584) también saldría 2,00, pero el código nunca usa ese valor.
- **Evidencia**: `services/calculo.js:27-28`.
- **Clasificación**: **INTENCIONAL** (mismas razones que RN-01).

### RN-03 · El IVA y el recargo de la factura son la suma de los de cada línea

- **Enunciado**: la cuota de IVA de la factura no es la base total por el tipo, sino la suma de las cuotas
  ya redondeadas de cada línea. Lo mismo con el recargo de equivalencia.
- **Ejemplo** (semilla recalculada, FA-2026-000103, apéndice A del mapa del sistema): las cuotas de sus cuatro
  líneas suman 118,94 + 66,69 + 19,04 + 1,14 = **205,81 €**. Aplicar el 21 % a la base total (980,01 €) daría
  205,80 €.
- **Evidencia**: `services/calculo.js:81-83`.
- **Clasificación**: **INTENCIONAL**. En mayo de 2019 se cambió a redondear sobre la base total y la gestoría
  devolvió el trimestre entero (`services/calculo.js:3-6`).

### RN-04 · Partir una misma cantidad en varias líneas puede cambiar el IVA

- **Enunciado**: como cada línea redondea su cuota, facturar lo mismo en una línea o en varias puede dar una
  diferencia de céntimos en el IVA. El programa no agrupa las líneas repetidas.
- **Ejemplo**: una línea de 2 × 2,50 € al 21 % → base 5,00, IVA **1,05**. Dos líneas de 1 × 2,50 € → bases 2,50 +
  2,50, IVA 0,53 + 0,53 = **1,06**.
- **Evidencia**: `services/calculo.js:65-84` (no hay agrupación); `routes/facturas.js:55-63` (cada fila del
  formulario es una línea).
- **Clasificación**: **INTENCIONAL** como consecuencia aceptada del redondeo por línea (RN-03).

### RN-05 · Redondeo de las mitades: hacia arriba en positivos, hacia cero en negativos, sobre coma flotante

- **Enunciado**: los importes se redondean al céntimo con `Math.round(x × 100) / 100`. Eso tiene tres efectos:
  1. Un medio céntimo exacto positivo sube: 0,125 → 0,13; 0,525 → 0,53; 2,675 → 2,68.
  2. Un medio céntimo exacto **negativo sube hacia cero**, no baja: −0,125 → **−0,12**; −0,525 → **−0,52**.
  3. Algunos valores que en pantalla parecen medio céntimo no lo son en coma flotante: 1,005 → **1,00**;
     0,285 → **0,28**.
- **Ejemplo**: una línea de 1 × 2,50 € al 21 % tiene IVA **0,53 €**; la misma línea con cantidad −1 (abono
  metido como línea negativa en una factura normal) tiene IVA **−0,52 €**, no −0,53 €. La rectificativa no
  sufre este efecto porque no recalcula, solo cambia el signo (RN-34).
- **Evidencia**: `redondear2`, `lib/util.js:5-7`; usos en `services/calculo.js:27-31,57,69,81-86`.
- **Clasificación**: **ACCIDENTAL**. El comentario solo dice «redondeo a 2 decimales "de toda la vida"»
  (`lib/util.js:4`); nada indica que se buscara la asimetría. Es el comportamiento que hoy cuadra con la
  gestoría y no se toca (`services/calculo.js:3-6`). ANO-025; la asimetría de los negativos es nueva:
  **ANO-059**. Relacionada con P-17 (líneas negativas).

### RN-06 · Totales de la factura

- **Enunciado**: base de la factura = suma de las bases de las líneas; IVA = suma de las cuotas; recargo =
  suma de los recargos; total = base + IVA + recargo. Cada suma parcial se redondea, aunque al sumar importes
  de dos decimales el redondeo no cambia nada salvo errores de coma flotante.
- **Ejemplo** (semilla recalculada, FA-2026-000101, `db.js:126-130`): bases 90,00 + 23,90 + 9,80 + 9,50 =
  **133,20**; IVA 18,90 + 2,39 + 0,98 + 2,00 = **24,27**; total **157,47 €**. La cabecera de la semilla dice
  IVA 27,97 y total 161,17 (ANO-013).
- **Evidencia**: `services/calculo.js:81-86`.
- **Clasificación**: **INTENCIONAL**.

---

## 2. Recargo de equivalencia

### RN-07 · El recargo solo se cobra a los clientes marcados en recargo de equivalencia

- **Enunciado**: si el cliente está marcado como minorista en recargo de equivalencia, cada línea lleva,
  además del IVA, un recargo calculado sobre su base redondeada y redondeado al céntimo. Depende solo de la
  marca del cliente en el momento de emitir, no del artículo. La marca vale si es `1` (también `'1'` o
  `true`); cualquier otro valor, incluido `2`, se trata como «sin recargo».
- **Ejemplo** (semilla, FA-2026-000102, Ferretería El Tornillo con recargo, `db.js:97,133`): 4 × 18,50 € =
  74,00 €; IVA 21 % = 15,54 €; recargo 5,2 % = 3,848 → **3,85 €**, como en la semilla.
- **Evidencia**: `services/calculo.js:29-32,49`; `db.js:27` («1 = minorista en recargo»);
  `routes/clientes.js:24` (se graba 1 o 0).
- **Clasificación**: **INTENCIONAL**.

### RN-08 · Tabla de recargos para los tipos actuales

- **Enunciado**: IVA 21 % → recargo 5,2 %; IVA 10 % → 1,4 %; IVA 4 % → 0,5 %.
- **Ejemplo** (semilla, FA-2026-000104, Panadería Hnos. Cifuentes con recargo, `db.js:99,146`): 8 sacos de
  harina a 14,20 € = 113,60 €; IVA 4 % = 4,544 → 4,54 €; recargo 0,5 % = 0,568 → **0,57 €**.
- **Evidencia**: `recargoPara`, `services/calculo.js:12-15`.
- **Clasificación**: **INTENCIONAL** (tabla explícita). Que los porcentajes coincidan con la normativa vigente es
  **SUPOSICIÓN** del analista (P-42).

### RN-09 · Recargos de los tipos de IVA antiguos

- **Enunciado**: se conservan los recargos de tipos de IVA ya derogados: 18 % y 16 % → recargo 4 %; 8 % y 7 % →
  recargo 1 %. Desde las pantallas no se puede elegir ninguno de esos tipos (solo 21, 10 y 4).
- **Ejemplo**: una línea de 100 € al 18 % para un cliente con recargo: IVA 18,00 €, recargo **4,00 €**.
- **Evidencia**: `services/calculo.js:16-21`; `views/factura_nueva.ejs:18`.
- **Clasificación**: **INTENCIONAL**: «no borrar por si hay que reabrir ejercicios viejos del Access»
  (`services/calculo.js:16-17`). **SUPOSICIÓN**: son los tipos de antes de 2012 (16/7 hasta 2010 y 18/8 hasta
  2012); el código solo dice «tipos antiguos». P-22.

### RN-10 · Cualquier otro tipo de IVA no lleva recargo

- **Enunciado**: si una línea tiene un tipo de IVA que no está en la tabla (por ejemplo 0 %, 2 % o 5 %), o si el
  tipo llega como texto en vez de como número, el recargo es 0 sin ningún aviso, aunque el cliente esté en
  recargo.
- **Ejemplo**: cliente con recargo, línea de 100 € al 5 % → IVA 5,00 €, recargo **0,00 €**. El tipo `'21'` como
  texto también da recargo 0 (`recargoPara` compara con `===`). Hoy el tipo siempre llega como número
  (`routes/facturas.js:61`; `db.js:46,71`).
- **Evidencia**: `services/calculo.js:22`.
- **Clasificación**: **DUDOSA**. **SUPOSICIÓN**: entre 2023 y 2024 hubo tipos temporales de IVA (0 %, 2 % y 5 %)
  para algunos alimentos, entre ellos el aceite de oliva, que está en el catálogo (`db.js:107`). Ni la
  pantalla ni la tabla de recargos los contemplan. ANO-040; P-42.

---

## 3. Descuento por volumen

### RN-11 · Tramos del descuento por volumen

- **Enunciado**: si la base de la factura sin descuento es **mayor que** 1.000 €, se descuenta un 2 %; si es
  **mayor que** 5.000 €, un 5 %. Los valores justos no entran en el tramo: 1.000,00 € no lleva descuento y
  5.000,00 € lleva el 2 %, no el 5 %. La base se mide sin IVA ni recargo.
- **Ejemplo**: una línea de 1.000,00 € → sin descuento, total **1.210,00 €**. Una línea de 1.000,01 € → 2 %,
  total **1.185,81 €**. Una línea de 5.000,00 € → 2 %, total **5.929,00 €**. Una de 5.000,01 € → 5 %, total
  **5.747,51 €**.
- **Evidencia**: `porcentajeDescuento`, `services/calculo.js:39-43`; se llama con la base bruta en `:60`.
- **Clasificación**: **INTENCIONAL**. Acuerdo con Paco en 2018 (`services/calculo.js:38`) y caso «comentado
  con la gestoría»: «base 1000 justa NO lleva descuento» (`db.js:138`). El comentario de la función dice «a
  partir de 1.000», lo que se contradice con el código (ANO-023).

### RN-12 · El tramo se decide con la suma de las líneas ya redondeadas

- **Enunciado**: la base que decide el descuento es la suma de las bases de cada línea, cada una ya redondeada
  al céntimo (RN-01). El redondeo de una sola línea puede hacer cruzar el umbral.
- **Ejemplo** (semilla, FA-2026-000103, `db.js:138-143`): 0,92 × 6,00 € de portes = 5,52 € (la semilla graba
  5,50 €). Con el código actual, la base bruta es **1.000,02 €** y **sí** lleva el 2 %: base final 980,01 €,
  total 1.185,82 €. La semilla, que presenta este caso como «base 1000 justa», no lleva descuento (ANO-013).
- **Evidencia**: `services/calculo.js:53-58`.
- **Clasificación**: **ACCIDENTAL**.

### RN-13 · El descuento afecta a toda la base, no solo al exceso; hay un salto en cada umbral

- **Enunciado**: cuando se supera el umbral, el porcentaje se aplica a toda la factura, no a la parte que
  pasa de 1.000 € o de 5.000 €. En consecuencia, en una franja justo por encima de cada umbral, comprar más
  sale más barato que quedarse en el umbral.
- **Ejemplo** (al 21 %, sin recargo): base de 1.000,00 € → total 1.210,00 €; 1.000,01 € → total 1.185,81 €.
  Hasta una base bruta de **1.020,41 €** el cliente no vuelve a pagar 1.210,00 €. En el segundo tramo: 5.000,00 €
  → base 4.900,00 €; 5.000,01 € → base 4.750,01 €; hasta unos 5.157,89 € de base bruta no se vuelve a la base de
  4.900 €.
- **Evidencia**: `services/calculo.js:60-71`.
- **Clasificación**: **DUDOSA**. El comentario «a partir de 1.000 eur -> 2 %» (`services/calculo.js:37`) es
  compatible con las dos lecturas. **ANO-061**; P-45.

### RN-14 · El descuento se aplica rebajando el precio unitario, que se redondea antes de multiplicar

- **Enunciado**: el descuento no se aplica a la base de la línea, sino al precio unitario: precio × (100 −
  descuento) / 100, redondeado al céntimo. Después se recalcula la línea con ese precio (RN-01 a RN-03). En la
  factura se imprime y se graba el precio ya rebajado; no aparece ni el precio original ni una línea de
  descuento. Con cantidades grandes, el redondeo del precio unitario se multiplica, y en precios unitarios
  muy bajos el descuento desaparece.
- **Ejemplo** (semilla recalculada, FA-2026-000103): platos a 28,90 € − 2 % = 28,322 → **28,32 €**;
  × 20 = **566,40 €**. Aplicar el 2 % a la base de la línea (578,00 €) daría 566,44 €. En el conjunto de la
  factura, 980,01 € frente a los 980,02 € de aplicar el 2 % a la base bruta. Un artículo a 0,01 € sigue a
  0,01 € con el 2 % (0,0098 → 0,01): por debajo de 0,25 € con el 2 %, o de 0,10 € con el 5 %, el precio no baja.
- **Evidencia**: `services/calculo.js:63-80`; `routes/facturas.js:86-87` (se graba `l.precio`, el rebajado);
  `views/factura_detalle.ejs:28`.
- **Clasificación**: **DUDOSA**. Aplicarlo «línea a línea para que la gestoría lo vea desglosado igual» es una
  petición de Puri de 2018 (`services/calculo.js:63-64`), pero no consta que se pidiera redondear el precio
  unitario. **ANO-062**; P-25.

### RN-15 · El descuento no distingue cliente, tipo de IVA ni signo de la línea

- **Enunciado**: el descuento se aplica a cualquier cliente (también a los minoristas en recargo de
  equivalencia), a todas las líneas con el mismo porcentaje sea cual sea su tipo de IVA, a las cuotas de
  contrato de la remesa (RN-41) y a las líneas negativas. Las líneas negativas restan de la base bruta y
  pueden hacer perder el descuento.
- **Ejemplo**: Ferretería El Tornillo (con recargo, `db.js:97`), una línea de 1.200 € al 21 % → precio rebajado
  1.176,00 €, IVA 246,96 €, recargo 61,15 €, total **1.484,11 €**. Otra factura con una línea de 1.050 € y otra
  de −60 € → base bruta 990 € → **sin descuento**, total 1.197,90 €.
- **Evidencia**: `services/calculo.js:39-43,48-71` (ninguna condición sobre el cliente, el tipo o el signo).
- **Clasificación**: **DUDOSA**. El comentario dice que se acordó «para fidelizar hostelería»
  (`services/calculo.js:38`), pero el código lo aplica a todos los clientes: discrepancia entre comentario y
  código, **ANO-066**. P-24 y P-14.

### RN-16 · Aviso del descuento en las observaciones (solo en la factura manual)

- **Enunciado**: si la factura manual lleva descuento, se añade a las observaciones el texto « Descuento
  volumen N% aplicado» (con un espacio delante, también cuando no hay observaciones). La remesa no lo añade.
- **Ejemplo**: factura manual sin observaciones con base bruta de 1.200 € → observaciones «␣Descuento volumen
  2% aplicado».
- **Evidencia**: `routes/facturas.js:76`; `scripts/remesa_mensual.js:62`.
- **Clasificación**: **INTENCIONAL** el aviso; el espacio inicial (ANO-024) y la ausencia en la remesa
  (ANO-036) parecen **ACCIDENTALES**.

---

## 4. Alta de una factura manual

### RN-17 · Solo se factura una fila del formulario si tiene descripción

- **Enunciado**: las filas del formulario sin descripción se descartan, **aunque tengan precio**. No se avisa.
  El formulario tiene seis filas fijas y la cantidad viene rellena con 1.
- **Ejemplo**: fila 1 con «Portes», 1 × 6,00 €; fila 2 sin descripción, 1 × 50,00 € → la factura sale por 6,00 €
  de base; los 50 € no se facturan. Si la única fila con precio no tiene descripción, el alta se rechaza («La
  factura no tiene lineas»).
- **Evidencia**: `routes/facturas.js:55-56`; `views/factura_nueva.ejs:13-16`.
- **Clasificación**: **DUDOSA**. El comentario dice «filas vacías del formulario» (`routes/facturas.js:56`), pero el
  código descarta cualquier fila sin descripción: discrepancia entre comentario y código, **ANO-064**. P-47.

### RN-18 · Una factura necesita al menos una línea

- **Enunciado**: no se puede emitir una factura sin ninguna línea con descripción.
- **Ejemplo**: las seis filas vacías → «La factura no tiene lineas» (error 400) y no se consume número.
- **Evidencia**: `routes/facturas.js:64` (antes de pedir el número en `:71`).
- **Clasificación**: **INTENCIONAL**.

### RN-19 · Lectura de cantidades y precios tecleados

- **Enunciado**: se acepta la coma decimal, pero solo se convierte la **primera** coma en punto y se ignora todo
  lo que haya después del primer carácter no numérico. Un campo vacío da un valor no numérico (`NaN`).
- **Ejemplo**: «1,5» → 1,5. «1.234,50» → **1,234** (se factura mil veces menos). «12abc» → 12. Precio vacío →
  base y total `NaN`.
- **Evidencia**: `routes/facturas.js:59-60`.
- **Clasificación**: **ACCIDENTAL**. ANO-032 y ANO-003 (qué se graba con `NaN` sigue siendo SUPOSICIÓN). P-13.

### RN-20 · Se admiten cantidades y precios cero, negativos o decimales

- **Enunciado**: el servidor no limita las cantidades ni los precios: se aceptan cero, negativos y cualquier
  número de decimales. Una factura FA puede salir con total cero o negativo y consume número.
- **Ejemplo**: 1 línea de −5 × 10,00 € al 21 % → base −50,00 €, IVA −10,50 €, total **−60,50 €** en serie FA.
- **Evidencia**: `routes/facturas.js:55-64`; `services/calculo.js:26-34` (sin comprobaciones);
  `registro-riesgos.md`, apéndice A, caso 3.
- **Clasificación**: **DUDOSA**. **SUPOSICIÓN**: podría usarse como abono parcial, que no existe (RN-33). P-17.

### RN-21 · El precio y el IVA que se facturan son los del formulario, no los del catálogo

- **Enunciado**: el catálogo de artículos solo sirve de sugerencia: al elegir un artículo se rellenan su precio
  y su IVA, pero se factura lo que haya en el formulario al enviarlo. El formulario solo ofrece IVA 21, 10 y
  4 %; el servidor acepta cualquier número entero.
- **Ejemplo**: se elige «Café en grano natural 1kg» (11,95 €, 10 %, `db.js:109`), se cambia el precio a 11,00 € → se
  factura a 11,00 €.
- **Evidencia**: `routes/facturas.js:59-61`; `public/js/factura.js:1-10`; `views/factura_nueva.ejs:18`.
- **Clasificación**: **INTENCIONAL**: el autorrelleno se añadió en 2021 y antes el precio «se copiaba a mano»
  (`public/js/factura.js:2`). La aceptación de cualquier tipo en el servidor es ANO-040.

### RN-22 · La fecha de la factura es la que se teclee; si se deja vacía, la de hoy

- **Enunciado**: la oficina puede poner cualquier fecha a una factura manual, pasada o futura, de este año o de
  otro, sin ninguna comprobación. Si se deja vacía, se usa la fecha de hoy del equipo (RN-52). La fecha decide
  el trimestre del informe de IVA y el año del fichero de la gestoría (RN-44, RN-48), pero no el año del
  número (RN-28).
- **Ejemplo**: el 16/11/2026 se emite una factura con fecha 15/12/2025 → número `FA-2026-…`, aparece en el IVA
  del 4T de 2025 y en el fichero de la gestoría de 2025.
- **Evidencia**: `routes/facturas.js:44`; `views/factura_nueva.ejs:9`.
- **Clasificación**: **DUDOSA**. ANO-002, ANO-049.

### RN-23 · Se puede facturar a cualquier cliente existente

- **Enunciado**: basta con que el cliente exista. La pantalla solo ofrece los activos, pero el servidor no lo
  comprueba.
- **Ejemplo**: un cliente dado de baja (`activo = 0`) puede recibir una factura con una petición directa.
- **Evidencia**: `routes/facturas.js:31,46-47`.
- **Clasificación**: **DUDOSA**. ANO-031.

### RN-24 · Vencimiento = fecha de la factura + días de pago del cliente (30 por defecto)

- **Enunciado**: el vencimiento se calcula sumando a la fecha de la factura los días de pago del cliente. Si el
  cliente no los tiene (o los tiene a 0), se suman 30. Son días naturales: no se ajusta a fin de mes, ni a días
  fijos de pago, ni a festivos; se cruza de mes y de año sin problema.
- **Ejemplo** (semilla): los ocho vencimientos de facturas FA de la semilla coinciden con esta regla. Por ejemplo,
  FA-2026-000101, 31/01/2026 + 30 → **02/03/2026** (`db.js:126`); FA-2026-000103, Hotel Vega Baja con 60 días,
  20/02/2026 + 60 → **21/04/2026** (`db.js:100,139`). Otros: 31/12/2026 + 30 → 30/01/2027; 28/02/2028 + 1 →
  29/02/2028.
- **Evidencia**: `routes/facturas.js:68-69`; `sumarDias`, `lib/util.js:20-26`; `config.js:39-40`;
  `db.js:28` («NULL -> el de config»).
- **Clasificación**: **INTENCIONAL**. El caso de 0 días (contado), que se convierte en 30, es **ACCIDENTAL**
  (ANO-041). El desfase de un día de marzo de 2019 sigue sin explicar (ANO-030, P-12).

### RN-25 · Una factura nueva nace «emitida» en la serie FA

- **Enunciado**: toda factura manual es de la serie FA y nace en estado `emitida`, con las observaciones
  tecleadas (y el aviso de descuento, RN-16). No se envía a nadie: el envío por correo está desactivado
  desde 2022.
- **Ejemplo**: alta del 16/11/2026 con el contador `FA/2026` en 108 → `FA-2026-000109`, `emitida`.
- **Evidencia**: `routes/facturas.js:71,74-76,93`; `services/email.js:3-6,26-28`.
- **Clasificación**: **INTENCIONAL**.

---

## 5. Numeración legal

### RN-26 · Formato del número: `SERIE-AAAA-NNNNNN`

- **Enunciado**: el número de factura es la serie, el año y un número correlativo de 6 cifras rellenado con
  ceros por la izquierda. Si se pasara de 999.999 en un año, el número pasaría a 7 cifras sin aviso.
- **Ejemplo** (semilla): con el contador `FA/2026` en 108 (`db.js:176`), la siguiente factura es
  **`FA-2026-000109`**; con `RE/2026` en 1 (`db.js:177`), la siguiente rectificativa es **`RE-2026-000002`**.
- **Evidencia**: `formatear`, `lib/numeracion.js:38-42`; `db.js:52`.
- **Clasificación**: **INTENCIONAL**.

### RN-27 · Contador independiente por serie y año, que empieza en 1

- **Enunciado**: las facturas normales (FA) y las rectificativas (RE) tienen cada una su propio contador por
  año. La primera factura de cada serie en un año nuevo es la 000001; el contador del año se crea solo.
- **Ejemplo**: primera rectificativa de 2027 → **`RE-2027-000001`**, aunque en 2026 se hubiera llegado a la
  000002.
- **Evidencia**: `lib/numeracion.js:14-28` (comentario «año nuevo: se abre contador a cero», `:19`);
  `db.js:77-81`.
- **Clasificación**: **INTENCIONAL**: la numeración debe ser «correlativa y sin huecos dentro de cada serie y
  año» (`lib/numeracion.js:3-4`).

### RN-28 · El año del número es el del reloj del equipo, no el de la fecha de la factura

- **Enunciado**: el año que aparece en el número es el año en curso en el ordenador cuando se emite, aunque la
  factura lleve fecha de otro año.
- **Ejemplo**: la remesa de diciembre de 2026, lanzada el 01/01/2027 como indica el procedimiento, graba facturas
  con fecha **31/12/2026** y número **`FA-2027-000001`** y siguientes, que abren la serie de 2027.
- **Evidencia**: `lib/numeracion.js:15`; `scripts/remesa_mensual.js:5-7,59`; `routes/facturas.js:44,71`.
- **Clasificación**: **ACCIDENTAL**. ANO-002; P-06.

### RN-29 · El número se consume al asignarse, aunque la factura no llegue a grabarse

- **Enunciado**: el número se reserva (se sube el contador) antes de grabar la factura. Si la grabación falla,
  ese número queda sin factura. Tampoco hay nada que impida que dos emisiones simultáneas reciban el mismo
  número.
- **Ejemplo**: alta con un precio que provoca un error al grabar → el contador pasa de 108 a 109 y no existe
  `FA-2026-000109`; la siguiente factura será la 000110.
- **Evidencia**: `lib/numeracion.js:16-35`; `routes/facturas.js:71-78`; `db.js:52` (sin `UNIQUE`).
- **Clasificación**: **ACCIDENTAL**: el comentario exige lo contrario, «sin huecos» (`lib/numeracion.js:3-4`).
  ANO-001, ANO-003.

### RN-30 · Las facturas no se borran nunca

- **Enunciado**: no existe ninguna forma de borrar una factura ni una línea. Un error se corrige con una
  rectificativa y, si hace falta, una factura nueva.
- **Ejemplo** (semilla): FA-2026-000106, errónea, se anula con RE-2026-000001 y se sustituye por FA-2026-000107
  (`db.js:156-166`).
- **Evidencia**: `lib/numeracion.js:4-6`; búsqueda de `DELETE` en todos los `.js` del repositorio (fuera de
  `node_modules`) sin resultados, 16/11/2026.
- **Clasificación**: **INTENCIONAL** («desde la inspección de 2020», `lib/numeracion.js:4-5`).

---

## 6. Estados, cobro y rectificación

### RN-31 · Estados de la factura y transiciones permitidas

- **Enunciado**: una factura está `emitida`, `cobrada` o `rectificada`. Transiciones:

  | Desde | Hacia | Cómo | Evidencia |
  |---|---|---|---|
  | (nueva) | `emitida` | Alta manual, remesa o rectificativa | `routes/facturas.js:75,142`; `scripts/remesa_mensual.js:62` |
  | `emitida` | `cobrada` | Marcar cobrada | `routes/facturas.js:118` |
  | `emitida` o `cobrada` (serie FA) | `rectificada` | Rectificar | `routes/facturas.js:132-133,154` |

  No hay vuelta atrás: una factura cobrada no vuelve a emitida y una rectificada no cambia de estado.
- **Ejemplo** (semilla): FA-2026-000106 está `rectificada`; su rectificativa RE-2026-000001, `emitida`
  (`db.js:156,160`).
- **Evidencia**: `db.js:61`.
- **Clasificación**: **INTENCIONAL**. Que una factura cobrada se pueda rectificar sin aviso (la pantalla no lo
  ofrece) es **DUDOSA**: ANO-006, ANO-034; P-16.

### RN-32 · Cobro: todo o nada, sin fecha

- **Enunciado**: marcar una factura como cobrada la da por cobrada entera. No se guarda la fecha, el importe ni
  la forma de cobro, y no hay cobros parciales. Solo cambia si estaba `emitida`; si no, no hace nada y no
  avisa. El servidor también deja marcar como cobrada una rectificativa.
- **Ejemplo**: FA-2026-000108 (`emitida`, 154,24 €) → «Marcar cobrada» → `cobrada`. Repetirlo no cambia nada.
- **Evidencia**: `routes/facturas.js:117-122`; `views/factura_detalle.ejs:47-48`.
- **Clasificación**: **DUDOSA**. ANO-033.

### RN-33 · Rectificación: solo el abono total de una factura FA que no esté ya rectificada

- **Enunciado**: una factura se rectifica entera; no hay abonos parciales. No se puede rectificar una
  rectificativa ni una factura ya rectificada.
- **Ejemplo**: rectificar RE-2026-000001 → «No se rectifica una rectificativa». Rectificar FA-2026-000106 →
  «Ya esta rectificada».
- **Evidencia**: `routes/facturas.js:124-126,132-133`.
- **Clasificación**: **INTENCIONAL** («rectificar una factura entera (abono total)», `routes/facturas.js:124`).
  La falta de abono parcial está en P-39.

### RN-34 · La rectificativa es el espejo exacto de la original

- **Enunciado**: la rectificativa no recalcula nada. Su cabecera lleva la base, el IVA, el recargo y el total de
  la **cabecera** de la original con el signo cambiado (no la suma de sus líneas). Cada línea se copia con la
  cantidad, la base, la cuota de IVA y el recargo en negativo, el **precio en positivo**, el mismo tipo de IVA y
  la descripción precedida de «Rectificación: ». Si la original tenía un error de cálculo, la rectificativa lo
  copia.
- **Ejemplo** (semilla, RE-2026-000001, `db.js:160-162`): cabecera −101,61 / −20,62 / 0,00 / −122,23; línea
  «Rectificación: Café en grano natural 1kg», cantidad −0,97, precio 11,95, base −11,61, IVA −1,16. La cabecera
  copia el IVA de 20,62 € de FA-2026-000106, que no coincide con la suma de sus líneas (20,06 €, ANO-013).
- **Evidencia**: `routes/facturas.js:127-128,141-143,149-150`.
- **Clasificación**: **INTENCIONAL**: «Puri dixit: la rectificativa tiene que ser espejo exacto de la original»
  (`routes/facturas.js:127-128`).

### RN-35 · Fecha, vencimiento y textos de la rectificativa

- **Enunciado**: la rectificativa lleva la fecha de **hoy**, no la de la factura original, y no tiene
  vencimiento. Guarda el número de la factura que rectifica y en las observaciones pone «Rectifica
  <número>. <motivo>»; el motivo es opcional. Su número es de la serie RE del año en curso. Como la fecha
  es la de hoy, resta en el trimestre y en el año en que se emite, no en los de la original (RN-44, RN-48).
- **Ejemplo**: una factura de 31/03/2026 rectificada el 06/04/2026 suma en el IVA del 1T y resta en el del 2T.
  Una factura de diciembre de 2026 rectificada en enero de 2027 → `RE-2027-…` con fecha de 2027; no aparece en el
  fichero de 2026. Sin motivo, las observaciones quedan «Rectifica FA-2026-000106. ».
- **Evidencia**: `routes/facturas.js:141-143`; `util.hoy`, `lib/util.js:10-15`.
- **Clasificación**: **DUDOSA**. El código no explica por qué se usa la fecha de hoy. ANO-038 (sin motivo); P-43.

---

## 7. Prorrateo «a lo comercial» (baja de contrato)

### RN-36 · Importe del último mes al dar de baja un contrato: cuota / 30 × días

- **Enunciado**: al dar de baja un contrato, el importe del último mes se calcula «a lo comercial»: la cuota
  mensual dividida entre 30 y multiplicada por los días de servicio, del día 1 al día de la baja, **ambos
  incluidos**. Como máximo se cobran 30 días; en los meses de 31 días, dar de baja el 30 o el 31 cuesta lo
  mismo: la cuota entera. Se divide primero y luego se multiplica, y se redondea al céntimo al final.
- **Ejemplo**: contrato de 90 € (`db.js:116`) con baja el 15/03/2026 → 90 / 30 × 15 = **45,00 €**; baja el
  30/03 o el 31/03 → **90,00 €**; baja el 01/03 → **3,00 €**. Contrato de 145 € (`db.js:117`) con baja el
  07/03/2026 → 145 / 30 × 7 = **33,83 €**.
- **Evidencia**: `calcularProrrateo`, `services/calculo.js:90-102`; la llama la baja de contratos con el día 1
  del mes de la baja (`routes/contratos.js:37-39`).
- **Clasificación**: **INTENCIONAL**: «así lo hacía Paco a mano en el Access y así lo espera la gestoría»;
  «meses de 31: el día 31 no se cobra» (`services/calculo.js:91-93,99`).

### RN-37 · Prorrateo comercial en febrero y entre meses distintos

- **Enunciado**: el cálculo solo mira el número del día, no el mes. En febrero una baja el último día no da la
  cuota entera, sino 28/30 (o 29/30 en bisiesto). Si el inicio y el fin caen en meses distintos, el resultado
  es 0 sin aviso (desde la pantalla no ocurre, porque el inicio siempre es el día 1 del mes de la baja).
- **Ejemplo**: 90 € con baja el 28/02/2026 → **84,00 €**; con baja el 29/02/2028 → **87,00 €**. Del 20/01/2026 al
  05/02/2026 → **0,00 €**.
- **Evidencia**: `services/calculo.js:96-101`.
- **Clasificación**: **ACCIDENTAL**: contradice el propio comentario, «el mes son siempre 30 días»
  (`services/calculo.js:91`) y «dentro del MISMO mes» (`:94`), que no se comprueba. ANO-043; P-21.

### RN-38 · El prorrateo de baja no se factura solo

- **Enunciado**: el importe del prorrateo solo se muestra en la barra de direcciones; la oficina tiene que emitir
  a mano la factura. Ese mismo mes, la remesa también factura el contrato, prorrateado por días reales
  (RN-40).
- **Ejemplo**: contrato de 145 € con baja el 07/03/2026 → la pantalla indica **33,83 €** para facturar a mano, y
  la remesa de marzo emite además 145 / 31 × 7 = **32,74 €** de base.
- **Evidencia**: `routes/contratos.js:28-30,40`; `views/contratos.ejs:17`; `scripts/remesa_mensual.js:28,46`.
- **Clasificación**: **DUDOSA**. ANO-008, ANO-022; P-03.

---

## 8. Remesa mensual de cuotas de contratos

### RN-39 · Contratos que se facturan en la remesa de un mes

- **Enunciado**: se factura cada contrato dado de alta como muy tarde el último día del mes y que no tenga baja
  o cuya baja sea el día 1 del mes o posterior. El día de alta y el de baja cuentan como días de servicio. Se
  facturan también los contratos de clientes dados de baja. No se comprueba si el mes ya se facturó. El orden
  en que se emiten (y por tanto el orden de los números) es el que devuelva la base de datos.
- **Ejemplo** (semilla, remesa `2026-02`): entran los contratos 1, 2 y 4; el 3 no, porque tiene baja el
  15/09/2025 (`db.js:116-119`). Un contrato con baja el 01/03/2026 entra en la remesa de marzo con 1 día.
- **Evidencia**: `scripts/remesa_mensual.js:20-21,26-29`.
- **Clasificación**: **INTENCIONAL** el criterio de fechas. **ACCIDENTAL** incluir clientes de baja
  (ANO-011), no evitar duplicados (ANO-009) y el orden sin `ORDER BY` (ANO-037). Que el día de baja se cobre es
  **DUDOSA** (P-44).

### RN-40 · Cuota del mes: completa, o proporcional a los días reales del mes

- **Enunciado**: si el contrato cubre todo el mes, se factura la cuota entera. Si el alta o la baja caen dentro
  del mes, se factura la cuota dividida entre los **días reales** del mes (28, 29, 30 o 31) y multiplicada por
  los días de servicio, ambos extremos incluidos. Se redondea al céntimo. Si la baja es anterior al alta dentro
  del mismo mes, sale un importe negativo o cero.
- **Ejemplo** (semilla):
  - Contrato 4, Bar Nuevo Siglo, 90 €, alta 15/02/2026 → 14 días de 28 → **45,00 €** (a lo comercial, RN-36,
    serían 42,00 €).
  - Contrato 2, Casa Ubaldo, 145 €, alta 15/01/2023 → 17 días de 31 → **79,52 €** (a lo comercial, 82,17 €).
  - Contrato 3, Hotel Vega Baja, 60 €, alta 16/06/2025 y baja 15/09/2025 → junio, 15 de 30 → **30,00 €**;
    septiembre, 15 de 30 → **30,00 €**.
  - Baja el día 30 de un mes de 31, cuota de 145 € → **140,32 €** (a lo comercial, 145,00 €).
  - Febrero bisiesto, 90 €, alta 15/02/2028 → 15 de 29 → **46,55 €** (a lo comercial, 45,00 €).
- **Evidencia**: `scripts/remesa_mensual.js:43-51`; `diasDelMes`, `lib/util.js:36-39`.
- **Clasificación**: **DUDOSA**. El script lo hace a propósito («por los días reales del mes»,
  `scripts/remesa_mensual.js:43-44`), pero contradice la regla que «espera la gestoría»
  (`services/calculo.js:91-93`). ANO-007, ANO-042; P-04, P-33.

### RN-41 · La cuota de la remesa pasa por el cálculo normal de factura

- **Enunciado**: la cuota del mes se factura como una línea de cantidad 1 y precio igual a la cuota (o al
  prorrateo), con el tipo de IVA del contrato. Se le aplican las reglas de los apartados 1 a 3: recargo si el
  cliente está en recargo y descuento por volumen si la cuota pasa de 1.000 €.
- **Ejemplo**: contrato 4 en febrero de 2026: 45,00 € + IVA 21 % 9,45 € = **54,45 €**. Una cuota de 1.200 € se
  facturaría a 1.176,00 € (2 %), total 1.422,96 €.
- **Evidencia**: `scripts/remesa_mensual.js:54-55`; `services/calculo.js:48-88`.
- **Clasificación**: **DUDOSA**. ANO-035; P-14.

### RN-42 · Forma de la factura de remesa

- **Enunciado**: una factura FA por contrato y mes, con una sola línea. Fecha de la factura: el último día del
  mes facturado. Vencimiento: esa fecha más los días de pago del cliente o **30 fijos** (no el valor de
  `config.js`). Descripción de la línea: «<concepto> (<mes> <año>)» si es el mes completo o «<concepto> (<N> dias)»
  si es parcial, sin indicar el mes. Observaciones: «Remesa <mes> <año>». Sin aviso de descuento (RN-16).
- **Ejemplo** (semilla, remesa `2026-02`): contrato 1 → línea «Alquiler máquina de café Futurmat F3 (febrero
  2026)», fecha 28/02/2026, vencimiento **30/03/2026**, observaciones «Remesa febrero 2026». Contrato 4 → línea
  «Alquiler máquina de café Futurmat F3 (14 dias)».
- **Evidencia**: `scripts/remesa_mensual.js:53-54,59-62,80-84`.
- **Clasificación**: **INTENCIONAL**. Los 30 días fijos (ANO-012) y la línea parcial sin mes (**ANO-065**) parecen
  **ACCIDENTALES**. Las facturas de remesa de la semilla no tienen esta forma (ANO-039).

### RN-43 · Mes de la remesa: solo se comprueba el formato

- **Enunciado**: se acepta cualquier valor con forma `AAAA-MM`, incluidos meses futuros y meses imposibles. Un
  mes 00 o 13 se trata como de 31 días y su nombre sale como «undefined».
- **Ejemplo**: `2026-13` → facturas con fecha «2026-13-31» y observaciones «Remesa undefined 2026».
- **Evidencia**: `scripts/remesa_mensual.js:15,21,80-84`; `lib/util.js:36-39`.
- **Clasificación**: **ACCIDENTAL**. ANO-048.

---

## 9. Entregables para la gestoría

### RN-44 · Resumen de IVA: suma de las líneas por tipo de IVA, en el trimestre de la fecha de factura

- **Enunciado**: el resumen trimestral suma base, cuota de IVA y recargo **desde las líneas** de todas las
  facturas (FA y RE, en cualquier estado) cuya fecha de factura cae en el trimestre: 1T del 1 de enero al 31 de
  marzo, 2T de abril a junio, 3T de julio a septiembre y 4T de octubre a diciembre, ambos extremos incluidos.
  Se agrupa por tipo de IVA, de mayor a menor.
- **Ejemplo** (semilla, 1T de 2026, cinco facturas, `db.js:126-154`):

  | Tipo | Base | Cuota IVA | Recargo |
  |---|---|---|---|
  | 21 % | 2.533,30 | 532,00 | 6,01 |
  | 10 % | 392,20 | 39,22 | 0,00 |
  | 4 % | 811,10 | 32,44 | 0,76 |
  | **Total** | **3.736,60** | **603,66** | **6,77** |

  Las cabeceras de esas mismas facturas suman 3.688,85 € de base y 736,97 € de IVA, que es lo que recibe la
  gestoría en el fichero (RN-48): ANO-013, ANO-014.
- **Evidencia**: `routes/informes.js:14-29`; `views/informe_iva.ejs:5-14`.
- **Clasificación**: **INTENCIONAL**: «se suma desde las líneas para tener el desglose por tipo»
  (`routes/informes.js:21`). **SUPOSICIÓN**: SQLite puede sumar en otro orden; los totales del ejemplo se han
  sumado en JavaScript, pero al mostrarse con dos decimales no cambian.

### RN-45 · En el resumen de IVA, la factura rectificada y su rectificativa se compensan

- **Enunciado**: la factura rectificada sigue sumando y la rectificativa resta con sus importes negativos. Si
  caen en el mismo trimestre se anulan; si no, cada una cuenta en el suyo (RN-35).
- **Ejemplo** (semilla, 2T de 2026): FA-2026-000106 y RE-2026-000001 se anulan; el resumen queda en 21 %: base
  194,15 €, IVA 40,77 €; 10 %: base 35,51 €, IVA 3,55 € (líneas de FA-2026-000107 y FA-2026-000108).
- **Evidencia**: `routes/informes.js:21-25`; `views/informe_iva.ejs:16`.
- **Clasificación**: **INTENCIONAL** («las rectificativas entran con signo negativo y cuadran solas»,
  `routes/informes.js:21-22`). Solo cuadran si las líneas cuadran con la cabecera (ANO-014).

### RN-46 · Resumen de IVA: año y trimestre por defecto

- **Enunciado**: sin año, se usa el año en curso. Sin trimestre, o con un trimestre 0 o no numérico, se muestra el
  **1T** sin avisar. Con un trimestre de 5 en adelante, error. El menú de informes solo enlaza los cuatro
  trimestres y el fichero del **año en curso**: en enero, el 4T y el fichero del año anterior solo se
  obtienen escribiendo la dirección a mano.
- **Ejemplo**: el 15/01/2027, el menú ofrece «Resumen IVA 1T 2027» a 4T 2027 y el fichero de 2027; no hay
  enlace al 4T de 2026, que es el que toca presentar.
- **Evidencia**: `routes/informes.js:9-11,15-18`; `views/informes.ejs:4-8`.
- **Clasificación**: **ACCIDENTAL**. ANO-026 y **ANO-063**.

### RN-47 · Los totales del resumen de IVA se suman sin redondear

- **Enunciado**: la fila de totales del resumen se suma en la propia pantalla con coma flotante, sin redondear,
  y se muestra con el formato de importes (RN-50).
- **Ejemplo**: la cuota del 21 % del 2T de 2026 suma internamente 40,769999999999996 y se muestra «40,77». Una suma
  que debería ser cero puede mostrarse «-0,00» (por ejemplo, 0,30 − 0,10 − 0,20).
- **Evidencia**: `views/informe_iva.ejs:5,11-14`.
- **Clasificación**: **ACCIDENTAL**. **ANO-060**.

### RN-48 · Fichero para la gestoría: qué facturas y qué importes

- **Enunciado**: el fichero de un año incluye todas las facturas, de las dos series y en cualquier estado, cuya
  fecha de factura es de ese año, con los importes de su **cabecera** (no de las líneas) y su estado. Se ordena
  por número como texto: primero todas las FA y después todas las RE; dentro de cada serie, por año del número
  y número. Sin año, el del año en curso.
- **Ejemplo** (semilla, fichero de 2026): FA-2026-000101 a FA-2026-000108 y después RE-2026-000001. Si la remesa
  de diciembre de 2026 se lanza el 01/01/2027 (RN-28), sus facturas `FA-2027-…` con fecha 31/12/2026 salen en el
  fichero de **2026**, después de las FA-2026 y antes de las RE-2026.
- **Evidencia**: `routes/informes.js:34-38`.
- **Clasificación**: **INTENCIONAL** (formato acordado con Puri en 2019, `routes/informes.js:32-33`). Que use la
  cabecera y el informe de IVA las líneas es ANO-014.

### RN-49 · Fichero para la gestoría: formato

- **Enunciado**:
  - primera línea: `CLAVE;` seguida de la clave de exportación de `config.js` (este documento no la reproduce);
  - segunda línea: `NUMERO;FECHA;CLIENTE;NIF;BASE;IVA;RECARGO;TOTAL;ESTADO`;
  - una línea por factura, campos separados por `;`, sin comillas y sin escapar el `;` ni los saltos de línea
    del nombre del cliente;
  - fecha `dd/mm/aaaa`; importes con punto de miles y coma decimal (RN-50); NIF vacío si el cliente no tiene;
  - nombre del cliente y NIF **actuales**, no los de la emisión;
  - fin de línea CRLF, sin salto tras la última línea; UTF-8 (el código no añade BOM); nombre del fichero
    `facturas_AAAA.csv`.
- **Ejemplo** (semilla):
  ```
  FA-2026-000101;31/01/2026;Cafetería La Parada, S.C.;J45771102;133,20;27,97;0,00;161,17;cobrada
  RE-2026-000001;06/05/2026;Bar Nuevo Siglo;70355910k;-101,61;-20,62;0,00;-122,23;emitida
  ```
- **Evidencia**: `routes/informes.js:36-49`; `config.js:36-37`.
- **Clasificación**: **INTENCIONAL** (contrato con la gestoría, `routes/informes.js:32-33`). La falta de escape es
  ANO-015; los datos actuales del cliente, ANO-019.

---

## 10. Formatos, fechas y validaciones comunes

### RN-50 · Formato de importes en pantalla, impresión y fichero

- **Enunciado**: los importes se muestran con dos decimales, coma decimal y punto de miles, y signo menos
  delante si son negativos. Un importe vacío, nulo o no numérico se muestra como «0,00». El redondeo a dos
  decimales de este formato **no es el mismo** que el del cálculo (RN-05): solo coincide cuando el importe ya
  viene redondeado, que es lo normal en cabeceras y líneas.
- **Ejemplo**: 1234,5 → «1.234,50»; −101,61 → «-101,61»; `NaN` → «0,00»; 2,675 → «2,67» (el cálculo daría 2,68);
  −0,001 → «-0,00».
- **Evidencia**: `formatearImporte`, `lib/util.js:51-58`.
- **Clasificación**: **ACCIDENTAL** las diferencias de redondeo, el «-0,00» y que un `NaN` se muestre como cero
  (oculta el problema de ANO-003). **ANO-060**.

### RN-51 · Formato de fechas en pantalla, impresión y fichero

- **Enunciado**: las fechas se guardan como texto `AAAA-MM-DD` y se muestran `DD/MM/AAAA` cambiando de orden las
  tres partes, sin comprobarlas. Una fecha vacía se muestra vacía; una fecha guardada en otro formato sale
  descolocada.
- **Ejemplo**: «2026-01-31» → «31/01/2026». «31/12/2026» guardada así → «undefined/undefined/31/12/2026».
- **Evidencia**: `fechaBonita`, `lib/util.js:28-33`; `lib/util.js:9` («la bd guarda así desde 2018»).
- **Clasificación**: **INTENCIONAL** el formato; el resultado con fechas mal guardadas es **ACCIDENTAL** (ANO-049).

### RN-52 · «Hoy» es la fecha local del equipo

- **Enunciado**: cuando el programa necesita la fecha de hoy (factura manual sin fecha, rectificativa, baja de
  contrato sin fecha) usa la fecha del reloj del ordenador en su zona horaria.
- **Ejemplo**: el 16/11/2026 a las 00:30 en Madrid, «hoy» es 2026-11-16.
- **Evidencia**: `hoy`, `lib/util.js:10-15`; usos en `routes/facturas.js:44,142`; `routes/contratos.js:32`.
- **Clasificación**: **INTENCIONAL**.

### RN-53 · NIF opcional; si se informa, 9 caracteres

- **Enunciado**: un cliente puede no tener NIF. Si se informa, se acepta si tiene 9 caracteres después de quitar
  espacios y guiones; no se comprueba la letra ni el formato. Se guarda **tal como se tecleó**, con espacios,
  guiones o minúsculas, y así sale en la factura y en el fichero de la gestoría.
- **Ejemplo**: «B-4581-2390» se acepta y se guarda con los guiones; «ABCDEFGHI» se acepta; «12345678» se rechaza.
  En la semilla hay un NIF con la letra en minúscula, «70355910k» (`db.js:101`).
- **Evidencia**: `validarNIF`, `lib/util.js:41-48`; `routes/clientes.js:18-22`.
- **Clasificación**: **INTENCIONAL** como solución provisional: «falta comprobar la letra, de momento con la
  longitud vale porque los da de alta Marga y los mira ella» (`lib/util.js:42-43`, Julián, 11/2017). ANO-018;
  P-23.

### RN-54 · La factura impresa usa los datos actuales del cliente y de la empresa

- **Enunciado**: al imprimir o reimprimir una factura se toman el nombre, NIF y dirección actuales del cliente y
  los datos actuales de la empresa. También la leyenda «Cliente en régimen de recargo de equivalencia» depende
  de la marca **actual** del cliente, no de si la factura lleva recargo.
- **Ejemplo**: si a Ferretería El Tornillo se le quitara la marca de recargo, al reimprimir FA-2026-000102
  desaparecería la leyenda, aunque la factura sigue llevando 6,01 € de recargo.
- **Evidencia**: `routes/facturas.js:106,111`; `views/factura_detalle.ejs:5-7,18-20,43`.
- **Clasificación**: **DUDOSA**. ANO-019.

### RN-55 · Contenido de la factura impresa

- **Enunciado**: la factura impresa lleva el título «FACTURA» seguido del número, también en las rectificativas
  (que solo añaden «Rectifica a: <número>»). El vencimiento aparece solo si existe. Las cantidades salen tal
  cual, con punto decimal; los importes, con el formato de RN-50. La columna de recargo se deja en blanco en las
  líneas sin recargo, y la fila «Recargo equivalencia» de los totales solo aparece si es distinta de cero.
  Se imprimen las observaciones y el dato registral de la empresa. Los botones de cobro y rectificación solo
  se muestran en facturas FA emitidas.
- **Ejemplo** (semilla, RE-2026-000001): «FACTURA RE-2026-000001», «Rectifica a: FA-2026-000106», sin
  vencimiento, cantidad «-0.97», sin fila de recargo.
- **Evidencia**: `views/factura_detalle.ejs:10-14,27,32,37-43,47-52`.
- **Clasificación**: **DUDOSA**. ANO-020; P-10.

---

## 11. Constantes mágicas y tablas fijas en el código

| Constante | Valor | Dónde | Época y motivo según la evidencia | ¿Por qué sigue ahí? |
|---|---|---|---|---|
| Recargo por tipo de IVA | 21 → 5,2; 10 → 1,4; 4 → 0,5 | `services/calculo.js:13-15` | Tipos en vigor. **SUPOSICIÓN**: desde 2012 | Se usan en cada factura con recargo |
| Recargo de tipos antiguos | 18, 16 → 4; 8, 7 → 1 | `services/calculo.js:16-21` | «Tipos antiguos» del Access. **SUPOSICIÓN**: anteriores a 2012 | «Por si hay que reabrir ejercicios viejos» (`:16-17`). P-22 |
| Tipos de IVA que ofrece la pantalla | 21, 10, 4 | `views/factura_nueva.ejs:18`; `db.js:36` | Tipos en vigor | **SUPOSICIÓN**: no se añadieron los temporales de 2023-2024. P-42 |
| Umbrales del descuento | > 1.000 € → 2 %; > 5.000 € → 5 % | `services/calculo.js:40-41` | Acuerdo con Paco, 2018 (`:38`) | P-24: si sigue vigente |
| Días del mes comercial | 30 | `services/calculo.js:99,101` | Práctica de Paco en el Access, antes de 2017 (`:91-93`) | Lo «espera la gestoría». Solo lo usa la baja de contratos |
| Días de vencimiento por defecto | 30 | `config.js:40` (factura manual) y **escrito a mano** en `scripts/remesa_mensual.js:60` | Sin fecha | Dos copias del mismo valor (ANO-012) |
| Milisegundos de un día | 24 × 60 × 60 × 1000 | `lib/util.js:21` | Viene del Access (`lib/util.js:2`) | Supone días de 24 horas; ANO-030 |
| Cifras del número de factura | 6 | `lib/numeracion.js:40` | Sin fecha | — |
| Series | `FA` (normal), `RE` (rectificativa) | `routes/facturas.js:71,138`; `scripts/remesa_mensual.js:57`; `db.js:53` | Desde la inspección de 2020 la serie RE es obligatoria (`lib/numeracion.js:5-6`) | — |
| Meses de cada trimestre | 01-03, 04-06, 07-09, 10-12, hasta el día «31» | `routes/informes.js:17-19` | v2.3, 2019 | Funciona porque compara texto |
| Filas del formulario de factura | 6 | `views/factura_nueva.ejs:13` | Sin fecha | Una factura manual no puede tener más de 6 líneas |
| Nombres de los meses | enero … diciembre | `scripts/remesa_mensual.js:81-82` | Verano de 2021 | — |
| Estados | `emitida`, `cobrada`, `rectificada` | `db.js:61` | — | — |
| Clave de exportación de la gestoría | (no se reproduce) | `config.js:36-37` | Formato de 2019 | «La pide la gestoría, no cambiar». ANO-016 |

---

## 12. Discrepancias entre comentarios y código

Cada una es un hallazgo. Las que ya tenían identificador se citan; las nuevas están en el apartado 13.

| # | Lo que dice el comentario | Lo que hace el código | Hallazgo |
|---|---|---|---|
| 1 | «a partir de 1.000 eur -> 2 %, a partir de 5.000 eur -> 5 %» (`services/calculo.js:37`) | Estrictamente mayor (`:40-41`) | ANO-023 |
| 2 | Descuento «para fidelizar hostelería» (`services/calculo.js:38`) | Se aplica a todos los clientes, también a ferreterías y panaderías en recargo | **ANO-066** |
| 3 | «el descuento se aplica línea a línea para que la gestoría lo vea desglosado igual» (`services/calculo.js:63-64`) | La factura no muestra ningún desglose del descuento: solo el precio ya rebajado y una frase en observaciones (`views/factura_detalle.ejs:28,42`) | **ANO-062**; P-25 |
| 4 | «el mes son siempre 30 días» (`services/calculo.js:91`) | Febrero completo da 28/30 o 29/30 | ANO-043 |
| 5 | «desde/hasta … dentro del MISMO mes» (`services/calculo.js:94`) | No se comprueba; si no, devuelve 0 | ANO-043 |
| 6 | «así lo espera la gestoría» (prorrateo a 30 días, `services/calculo.js:92-93`) | La remesa prorratea por días reales (`scripts/remesa_mensual.js:43-51`) | ANO-007 |
| 7 | «filas vacías del formulario» (`routes/facturas.js:56`) | Descarta cualquier fila sin descripción, aunque tenga precio | **ANO-064** |
| 8 | «si falla una a mitad … no ha vuelto a pasar» (`routes/facturas.js:81-82`) | Sigue sin transacción | ANO-004 |
| 9 | «deja la original en estado "rectificada"» (`routes/facturas.js:125-126`) | No siempre: ignora errores y se queda colgada sin líneas (`:147-159`) | ANO-005 |
| 10 | «las rectificativas entran con signo negativo y cuadran solas» (`routes/informes.js:21-22`) | Solo si la cabecera cuadra con las líneas | ANO-014 |
| 11 | «correlativa y sin huecos» (`lib/numeracion.js:3-4`) | Puede dejar huecos y repetir números | ANO-001, ANO-002, ANO-003 |
| 12 | «leyendo justo antes de grabar … no ha vuelto a pasar (creo)» (`lib/numeracion.js:8-10`) | Lectura y escritura siguen separadas | ANO-001 |
| 13 | «creo que fue por el cambio de hora» (`lib/util.js:18-19`) | La fecha se interpreta en UTC: con `Europe/Madrid` el cambio de hora no afecta | ANO-030 |
| 14 | Redondeo «de toda la vida» (`lib/util.js:4`) | Coma flotante y mitades negativas hacia cero | ANO-025, **ANO-059** |
| 15 | `dias_pago` «NULL -> el de config» (`db.js:28`) | La remesa usa 30 escrito a mano; un 0 también se cambia por el valor por defecto | ANO-012, ANO-041 |
| 16 | Tipos de IVA «21 / 10 / 4» (`db.js:36`) | El cálculo admite también 18, 16, 8 y 7, y cualquier otro sin recargo | ANO-040 |
| 17 | Base de la línea «ya redondeada (ver calculo.js)» (`db.js:72`) y facturas «tal cual quedaron grabadas» (`db.js:122`) | Varias líneas de la semilla no son cantidad × precio y varias cabeceras no suman sus líneas | ANO-013 |
| 18 | «base 1000 justa NO lleva descuento» (`db.js:138`) | Recalculada con el código actual, la base es 1.000,02 € y sí lo lleva | ANO-013 |
| 19 | «si la baja cae a mitad de mes, administración emite después a mano la factura del prorrateo» (`routes/contratos.js:28-30`) | La remesa también factura ese mes | ANO-008 |
| 20 | «Se pasa el mes a facturar (normalmente el que acaba de terminar)» (`scripts/remesa_mensual.js:5`) | El año del número es el del reloj, así que diciembre sale con número del año siguiente | ANO-002 |

---

## 13. Hallazgos nuevos para el registro de anomalías (propuestos)

Continúan la numeración provisional (ANO-001 a ANO-058 en los documentos anteriores). Ninguno se corrige en
esta fase.

| ID | Tipo | Sev. | Descripción | Evidencia | Impacto estimado |
|---|---|---|---|---|---|
| ANO-059 | RAREZA | ALTA | `redondear2` sube las mitades exactas hacia +∞: en negativos las acerca a cero (−0,525 → −0,52, frente a 0,525 → 0,53). Una línea negativa no da la misma cuota, con el signo cambiado, que la positiva equivalente. Complementa ANO-025 | `lib/util.js:5-7`; apéndice A | Abonos metidos como líneas negativas (P-17) con un céntimo distinto de la factura que compensan. La rectificativa no se ve afectada (no recalcula) |
| ANO-060 | RAREZA | BAJA | `formatearImporte` redondea con `toFixed`, que no coincide con `redondear2` en valores sin redondear (2,675 → «2,67» frente a 2,68), muestra «-0,00» para negativos muy pequeños y muestra «0,00» para `NaN` | `lib/util.js:51-58`; `views/informe_iva.ejs:5,11-14`; apéndice A | Totales del informe de IVA con un céntimo de diferencia o «-0,00»; importes `NaN` que parecen cero |
| ANO-061 | RAREZA | ALTA | El descuento por volumen se aplica a toda la base al superar el umbral: entre 1.000,01 € y 1.020,41 € de base bruta (y entre 5.000,01 € y unos 5.157,89 €) el cliente paga menos que con una base de 1.000 € (o de 5.000 €) | `services/calculo.js:39-43,60-71`; apéndice A | Incentivo a inflar pedidos hasta pasar el umbral; facturas que bajan de importe al añadir mercancía. P-45 |
| ANO-062 | RAREZA | ALTA | El descuento se redondea en el precio unitario antes de multiplicar por la cantidad: con cantidades grandes el error se multiplica (566,40 € frente a 566,44 € en 20 platos) y por debajo de 0,25 € (2 %) o 0,10 € (5 %) el precio no baja. La factura no desglosa el descuento | `services/calculo.js:63-71`; `views/factura_detalle.ejs:28`; apéndice A | Céntimos de diferencia frente a aplicar el porcentaje a la base. P-25 |
| ANO-063 | RAREZA | BAJA | El menú de informes solo enlaza el año en curso; en enero no hay enlace al 4T ni al fichero del año anterior. Además, un trimestre 0 se convierte en 1T sin aviso (amplía ANO-026) | `views/informes.ejs:4-8`; `routes/informes.js:10,16` | Riesgo de entregar a la gestoría el trimestre o el año equivocado |
| ANO-064 | RIESGO | ALTA | En la factura manual se descarta sin aviso cualquier fila sin descripción, aunque tenga precio. El comentario dice que solo se descartan las filas vacías | `routes/facturas.js:55-56` | Mercancía tecleada que no se factura y nadie lo nota. P-47 |
| ANO-065 | RAREZA | BAJA | En la remesa, la línea de un mes parcial dice «(N dias)» sin indicar el mes ni las fechas; solo las observaciones indican el mes | `scripts/remesa_mensual.js:53` | El cliente no puede comprobar qué días se le cobran |
| ANO-066 | RAREZA | ALTA | El descuento por volumen se acordó «para fidelizar hostelería», pero se aplica a cualquier cliente, incluidos los minoristas en recargo de equivalencia | `services/calculo.js:38-43,48-60`; `db.js:97,99` | Descuentos a clientes a los que quizá no correspondían. P-24 |

---

## 14. Suposiciones y preguntas abiertas

Continúan la numeración de los documentos anteriores (P-01 a P-41).

| ID | Pregunta | Destinatario | Reglas / ANO |
|---|---|---|---|
| P-42 | Entre 2023 y 2024, ¿se vendió con tipos de IVA temporales (0 %, 2 % o 5 %), por ejemplo el aceite de oliva? Si fue así, ¿cómo se facturó, si la pantalla solo ofrece 21, 10 y 4 %? ¿Qué recargo de equivalencia correspondía? ¿Siguen vigentes los porcentajes 5,2 / 1,4 / 0,5? | Puri (gestoría) | RN-08, RN-10; ANO-040 |
| P-43 | Cuando se rectifica una factura de un trimestre o un año ya cerrado, ¿la rectificativa debe ir con la fecha del día (y restar en el trimestre actual) o con otra fecha? ¿Cómo lo trata Contaplus? | Puri (gestoría) | RN-35, RN-45, RN-48 |
| P-44 | Si un contrato se da de baja el día 1 o a mitad de mes, ¿el día de la baja se cobra? ¿Y el día del alta? | Marga y Paco | RN-36, RN-39, RN-40 |
| P-45 | El descuento por volumen, ¿se aplica a toda la factura al pasar de 1.000 € (o 5.000 €) o solo a lo que pasa del umbral? ¿Se sabe que con 1.000,01 € el cliente paga menos que con 1.000 €? | Paco | RN-13; ANO-061 |
| P-46 | ¿Se han detectado diferencias de un céntimo en abonos hechos con líneas negativas frente a la factura original? | Puri (gestoría) y Marga | RN-05; ANO-059 |
| P-47 | ¿Se ha dado el caso de teclear una línea con precio pero sin descripción? ¿Se revisa la factura impresa antes de enviarla? | Marga | RN-17; ANO-064 |
| — | Verificación técnica: confirmar con un test sobre una BD temporal el orden y el método de suma de `SUM()` en la versión de SQLite instalada (RN-44) | Equipo de documentación (no es una pregunta al negocio) | RN-44; P-11 |

Siguen abiertas y afectan a estas reglas: P-03, P-04, P-05, P-06, P-10, P-12, P-13, P-14, P-16, P-17, P-21,
P-22, P-23, P-24, P-25, P-33 y P-39.

---

## Apéndice A. Verificación en memoria (16/11/2026)

**Método**: Node 26.13.0, zona horaria del equipo `Europe/Madrid`. Un script guardado fuera del repositorio
cargó solo `services/calculo.js` y `lib/util.js`, que no abren la BD. No se abrió ninguna base de datos ni se
modificó ningún fichero del repositorio. Los cálculos de la remesa se reprodujeron con la misma fórmula del
script (`redondear2(cuota / diasDelMes × días)`, `scripts/remesa_mensual.js:51`) sin ejecutarlo.

| Caso | Entrada | Resultado |
|---|---|---|
| 1 | `redondear2` de 0,125 / −0,125 / 0,525 / −0,525 / 2,675 / −2,675 / 1,005 / 0,285 | 0,13 / −0,12 / 0,53 / −0,52 / 2,68 / −2,67 / 1 / 0,28 |
| 2 | `calcularLinea(1, 2.5, 21, false)` y `calcularLinea(-1, 2.5, 21, false)` | IVA 0,53 y −0,52 |
| 3 | `calcularLinea(4, 18.5, 21, true)`; `(8, 14.2, 4, true)`; `(0.44, 21.6, 21, false)` | 74 / 15,54 / 3,85; 113,6 / 4,54 / 0,57; 9,5 / 2 / 0 |
| 4 | `calcularFactura` con las líneas de FA-2026-000101 (`db.js:127-130`) | base 133,2; IVA 24,27; total 157,47; descuento 0 |
| 5 | Una línea de 1 × importe al 21 %: 1000; 1000,01; 1020,40; 1020,41; 5000; 5000,01; 5263,15 | (descuento, base, total): (0, 1000, 1210); (2, 980,01, 1185,81); (2, 999,99, 1209,99); (2, 1000, 1210); (2, 4900, 5929); (5, 4750,01, 5747,51); (5, 4999,99, 6049,99) |
| 6 | `calcularFactura` con las líneas de FA-2026-000103 (`db.js:140-143`) | precios 28,32 / 21,17 / 18,13 / 5,88; base 980,01; IVA 205,81; total 1185,82; descuento 2. `redondear2(980.01 × 0.21)` = 205,8 |
| 7 | `calcularFactura([{cantidad: 110000, precio: 0.01, tipoIva: 21}])` | descuento 2; precio 0,01; base 1100 |
| 8 | Líneas 1 × 1050 y −1 × 60 al 21 % | descuento 0; base 990; total 1197,9 |
| 9 | Ferretería (recargo): 1 × 1200 al 21 % | precio 1176; IVA 246,96; recargo 61,15; total 1484,11 |
| 10 | `recargo_equivalencia` = `'1'`, `true`, `2` sobre 100 € al 21 % | 5,2; 5,2; 0 |
| 11 | `recargoPara` de 21, 10, 4, 18, 16, 8, 7, 5, 2, 0, `'21'` | 5,2; 1,4; 0,5; 4; 4; 1; 1; 0; 0; 0; 0 |
| 12 | `calcularProrrateo(90, …)` del 01/03 al 15/03, 30/03, 31/03, 01/03; del 01/02/2026 al 28/02; del 01/02/2028 al 29/02; del 20/01 al 05/02 | 45; 90; 90; 3; 84; 87; 0 |
| 13 | `calcularProrrateo(145, …)` del 01/03 al 07/03; del 15/01/2023 al 31/01/2023 | 33,83; 82,17 |
| 14 | Fórmula de la remesa: 145/31×17; 90/28×14; 60/30×15; 145/31×1; 145/31×30; 145/31×7; 90/29×15 | 79,52; 45; 30; 4,68; 140,32; 32,74; 46,55 |
| 15 | `calcularFactura([{cantidad: 1, precio: 45, tipoIva: 21}], {recargo_equivalencia: 0})` | base 45; IVA 9,45; total 54,45 |
| 16 | `diasDelMes` de 2026-02, 2028-02, 2026-13, 2026-00, 2026-12 | 28; 29; 31; 31; 31 |
| 17 | `sumarDias` con las fechas y días de pago de las ocho FA de la semilla | 2026-03-02; 03-08; 04-21; 04-04; 05-30; 05-30; 06-05; 06-30 (coinciden con `db.js:126-168`) |
| 18 | `sumarDias('2026-12-31', 30)`; `('2028-02-28', 1)`; `('2026-02-28', 30)`; `('2026-03-29', 1)`; `('2026-10-25', 1)` | 2027-01-30; 2028-02-29; 2026-03-30; 2026-03-30; 2026-10-26 |
| 19 | `formatearImporte` de 1234,5; −101,61; −0; −0,001; `NaN`; `null`; `'abc'`; 2,675; 1,005; 0,3 − 0,1 − 0,2 | «1.234,50»; «-101,61»; «0,00»; «-0,00»; «0,00»; «0,00»; «0,00»; «2,67»; «1,00»; «-0,00» |
| 20 | `fechaBonita` de «2026-01-31», `null`, «31/12/2026» | «31/01/2026»; «»; «undefined/undefined/31/12/2026» |
| 21 | `validarNIF` de «B45812390», «70355910k», «B-4581-2390», « B 45812390», «ABCDEFGHI», «12345678», «», `null` | true; true; true; true; true; false; false; false |
| 22 | Sumas por tipo de las líneas de la semilla en el 1T y el 2T de 2026 | 1T: 21 % 2533,3 / 532 / 6,01; 10 % 392,2 / 39,22 / 0; 4 % 811,1 / 32,44 / 0,76. 2T: 21 % 194,15 / 40,77; 10 % 35,51 / 3,55 |
| 23 | Orden de texto de FA-2026-000009, FA-2026-000150, FA-2027-000001, RE-2026-000002 | El mismo orden: FA-2026 < FA-2027 < RE-2026 |
