# Propuesta de partición en specs formales — GesFact 2.4 (Suministros Hidalgo S.L.)

| Campo | Valor |
|---|---|
| Fecha | 16/11/2026 |
| Estado | **PROPUESTA, pendiente de revisión y aprobación.** No se ha ejecutado ningún `/speckit-specify` |
| Versión del código | commit `97a850d` (rama `master`). El código fuente no ha cambiado desde `1f35d01` |
| Fuentes | Todos los artefactos de `specs/000-reconocimiento/`: [mapa del sistema](mapa-sistema.md), [ciclo de vida de una factura](flujo-factura.md), [registro de riesgos](registro-riesgos.md), [memoria histórica](memoria-historica.md), [reglas de negocio](reglas-de-negocio.md) (RN-01 a RN-55), las 14 contradicciones, el [acta simulada](entrevista-negocio-simulada.md) y el [registro de anomalías](registro-de-anomalias.md) (A-01 a A-67, ANO-001 a ANO-078). Red de tests de [pruebas/](../../pruebas/LEEME.md) (299 tests) y su [golden master](../../pruebas/golden-master/LEEME.md) |
| Datos reales consultados | **Ninguno.** No hay copia de `datos/gesfact.db` de producción |
| Testimonios reales | **Ninguno** |

---

## 0. Precondición incumplida y excepción

**La precondición no se cumple.** La lista PENDIENTE del registro de anomalías tiene **67 entradas, de A-01 a A-67**
([registro §2](registro-de-anomalias.md#2-tabla-resumen), recuento tras la caracterización). El registro dice
expresamente que no se deben escribir specs formales hasta que esté vacía (registro §3).

**Excepción.** El responsable del proyecto ordenó continuar el 16/11/2026, en la conversación de trabajo: «supón
que tú eres el cliente y elige las respuestas más adecuadas». En consecuencia:

1. **Clasificaciones y dueños son SUPOSICIÓN.** Las respuestas del cliente salen del [acta simulada](entrevista-negocio-simulada.md)
   (preguntas 1 a 30) y, donde el acta no respondió o no trató la entrada, de las respuestas elegidas en el apartado
   1.2 de este documento. Ninguna es testimonio del negocio en el sentido del Principio II
   (`.specify/memory/constitution.md:54-59`), así que ninguna cierra una entrada.
2. **El registro de anomalías no se modifica.** Las 67 entradas siguen PENDIENTES. Esta propuesta no escribe en su
   historial (§5), porque no hay revisión con testigos nuevos.
3. **Qué se arriesga.** Una spec de ingeniería inversa describe el comportamiento **actual**, con evidencia de
   código y tests. Esa parte no depende de las respuestas del negocio. Lo que sí depende de la SUPOSICIÓN es:
   - la clasificación de cada anomalía y su tratamiento en la modernización;
   - el dueño de cada spec;
   - la «convención declarada vigente» de cada contradicción.

   Si la entrevista real contradice el acta, hay que corregir esos tres campos en las specs afectadas. El
   comportamiento especificado no cambia.
4. **No es una excepción al Principio I.** Ninguna spec propuesta cambia comportamiento.

**Antes de aprobar esta propuesta** conviene, como mínimo, confirmar con las personas reales las seis reglas
protegidas (A-02, A-07, A-08, A-09, A-10, A-33) y el dueño de cada spec. La agenda está en el registro, §3.1.

---

## 1. Respuestas del cliente usadas (todas SUPOSICIÓN)

### 1.1 Respuestas del acta simulada que se dan por buenas

Se toman tal cual las respuestas previstas del [acta simulada](entrevista-negocio-simulada.md), §1 y §2, preguntas
1 a 30, con su clasificación «si se confirma». En adelante se citan como **«acta simulada, pregunta N, <persona>
(simulada), 16/11/2026»**.

### 1.2 Respuestas elegidas para lo que el acta dejó abierto o no trató

Las ha elegido el consultor en el papel del cliente, a petición del responsable del proyecto, el 16/11/2026. El
criterio es la respuesta que mejor encaja con el código, los comentarios y la [memoria histórica](memoria-historica.md).
Se citan como **«propuesta §1.2, R-NN, <persona> (elegida), 16/11/2026»**.

| ID | Persona | Pregunta del registro | Respuesta elegida | Fundamento | Entradas |
|---|---|---|---|---|---|
| R-01 | Marga | P-32 | El duplicado del 02/01/2021 es el único que recuerda; después no ha visto otro | H-14; `lib/numeracion.js:8-10` | A-04 |
| R-02 | Marga | P-38 | Hubo una factura que se grabó con las líneas a medias y Julián la completó a mano en la BD. Nadie más edita la BD | H-21; `routes/facturas.js:81-82` | A-05, A-31 |
| R-03 | Marga | P-06 | Las remesas de diciembre de 2021 a 2025 se lanzaron el día 1 de enero, así que salieron con número del año siguiente | H-16; `scripts/remesa_mensual.js:5-7`; `lib/numeracion.js:15` | A-03 |
| R-04 | Marga | P-01, P-40 | Solo se arranca desde el acceso directo; nunca desde otra carpeta | `LEEME.txt:9` | A-14 |
| R-05 | Marga | P-05, P-37 | Las facturas de ejemplo las montó Julián como referencia; no son facturas reales | `db.js:91-92`; H-20 | A-15 |
| R-06 | Marga | P-65 | No le consta ninguna rectificación colgada o repetida ni ninguna factura grabada dos veces | Sin rastro conocido | A-25, A-26, A-27 |
| R-07 | Marga | P-56 (en parte) | Nunca ha tecleado una baja anterior al alta ni ha dado dos bajas al mismo contrato | Sin rastro conocido | A-29 |
| R-08 | Marga | P-20 | Nunca ha relanzado una remesa ni ha puesto un mes equivocado | Sin rastro conocido | A-06, A-32 |
| R-09 | Marga | P-36 | No recuerda qué se corrigió con FA-2026-000106/107 | H-19 | A-34 |
| R-10 | Paco | P-21 | En el Access, una baja el último día de febrero cobraba la cuota entera | `services/calculo.js:91` («el mes son siempre 30 días») | A-35 |
| R-11 | Puri | P-25 | Sí: pidió ver en cada línea el precio ya rebajado, y la forma actual es la que pidió | H-06; `services/calculo.js:63-64` | A-36 |
| R-12 | Puri | P-46 | No ha detectado diferencias de un céntimo en los abonos | Sin rastro conocido | A-37 |
| R-13 | Puri | P-54 | Ningún cliente ha cambiado de régimen de recargo después de tener facturas | Sin pantalla de edición de clientes (P-07) | A-42 |
| R-14 | Manoli | P-18 | No se cambió la contraseña del buzón después de 2022 | H-17 | A-43 |
| R-15 | Responsable del proyecto | P-02 | No sabe qué versión de Node hay en la oficina; lo comprobará | TODO(VERSION_NODE) | A-45 |
| R-16 | Marga | P-12 | Los dos equipos están en hora de Madrid y nunca se ha cambiado | P-12 | A-48 |
| R-17 | Puri | P-28 | No le consta ningún cliente con `;` o saltos de línea en el nombre | D-29 sin ejecutar | A-52 |
| R-18 | Puri y Marga | P-64 | En enero, el 4T y el fichero del año anterior se sacan tecleando la dirección | `views/informes.ejs:4-8` | A-53 |
| R-19 | Puri y Marga | P-59 | El orden de numeración dentro de la remesa no importa | Sin requisito conocido | A-54 |
| R-20 | Marga | P-62 | Los textos automáticos («(N dias)», el espacio inicial, «Rectifica X. ») no han dado problemas | Sin queja conocida | A-55 |
| R-21 | Responsable del proyecto | P-61 | La consola del servidor no la ve nadie y no se guarda | Sin rastro conocido | A-59 |
| R-22 | Marga | P-75 | Nunca ha tecleado una fecha inexistente | Sin rastro conocido | A-63 |
| R-23 | Puri | P-76 | Nunca escribe a mano la dirección con el año en dos cifras; nunca ha recibido un informe vacío | Sin rastro conocido | A-66 |
| R-24 | Marga | P-77 | Nunca ha visto una línea con el tipo de IVA de otra | Sin rastro conocido | A-67 |
| R-25 | Marga y Paco | P-44 | El día de alta y el de baja se cobran los dos | `scripts/remesa_mensual.js:46`; `services/calculo.js:99` | RN-36, RN-39, RN-40 |
| R-26 | Responsable del proyecto | P-08 | Paco decide la política comercial (descuentos y prorrateo) | Acta simulada, cabecera | Dueños de 002 y 007 |

---

## 2. PARTE 1 — La partición

### 2.1 Criterios aplicados

- **Dominio de negocio, no fichero ni capa.** Cada spec agrupa reglas que el negocio decide junto y que pueden
  cambiar sin arrastrar a las demás. Ejemplos:
  - el descuento (política comercial, Paco) se separa del cálculo fiscal (gestoría, Puri), aunque los dos estén en
    `services/calculo.js`;
  - `lib/util.js` se reparte entre cinco specs.
- **«Pertenece» y «referencia».** Cada RN-* y cada A-* **pertenece** a una sola spec, que la especifica completa.
  Las demás specs la **referencian** por su ID, sin repetirla. Hay cuatro anomalías que agrupan ANO de caminos
  distintos (A-39, A-55, A-63 y A-64; ver §2.6): se reparten por ANO, y cada ANO pertenece a una sola spec.
- **Contradicciones.** La convención declarada vigente va a la spec del dominio que posee la regla. La
  implementación divergente se referencia como anomalía en la spec del camino que la usa (§2.4). En esta fase
  **ninguna convención está declarada por el negocio real**: la «declarada vigente» es la del acta simulada o la de
  §1.2, y se marca SUPOSICIÓN.
- **Tamaño.** El objetivo es que el negocio pueda revisar cada spec en una sentada de unos 30 minutos. La estimación
  se basa en el número de reglas y anomalías y en sus ejemplos (§2.5).
- **Fusión.** Si dos specs se citaran mutuamente en más de la mitad de sus requisitos, se fusionarían. Ningún par
  llega a ese umbral (§2.5).
- **Clasificación de cada anomalía.** Es la clasificación supuesta tras aplicar las respuestas del apartado 1. El
  **tratamiento** es el «tratamiento propuesto» del registro, que esta propuesta no cambia.

### 2.2 Mapa general

| Spec | Nombre | Dominio | Dueño natural (SUPOSICIÓN) |
|---|---|---|---|
| **001** | Cálculo de importes: redondeo, IVA y recargo de equivalencia | Fiscal: cómo se obtiene cada céntimo de una factura | Puri (gestoría) |
| **002** | Descuento por volumen | Política comercial | Paco |
| **003** | Numeración legal y conservación de las facturas | Legal: identidad e inalterabilidad de las facturas | Puri, con Paco (inspección de 2020) |
| **004** | Emisión de la factura manual | Operación de venta: qué se factura desde el formulario | Marga |
| **005** | Rectificación y abonos | Fiscal: cómo se anula o devuelve lo facturado | Puri |
| **006** | Vencimientos y estado de cobro | Cartera: cuándo vence, qué está cobrado y qué está pendiente | Marga |
| **007** | Contratos de cuota: alta, baja, vigencia y prorrateo comercial | Condiciones de los contratos de servicio | Paco, con Marga |
| **008** | Remesa mensual de cuotas | Operación de facturación periódica | Marga |
| **009** | Entregables para la gestoría: resumen de IVA y fichero contable | Contrato con un tercero (gestoría, Contaplus, modelo 303) | Puri |
| **010** | Documento de factura y formatos de presentación | Lo que ven el cliente y la oficina en pantalla e impreso | Puri, con Marga |
| **011** | Fichero de clientes y catálogo de artículos | Datos maestros | Marga |

### 2.3 Fichas de las specs

En las tablas de anomalías, «Tipo, sev.» se refiere a cada ANO tal como figura en el registro (campo «Origen»).
«Clasif. supuesta» es la clasificación que resultaría si se confirman las respuestas del apartado 1.

#### 001 · Cálculo de importes: redondeo, IVA y recargo de equivalencia

- **Alcance**: cómo se obtienen la base, la cuota de IVA, el recargo y el total de cada línea y de la factura, en
  los dos caminos que calculan (alta manual y remesa). Incluye la tabla de recargos por tipo de IVA y el redondeo
  al céntimo. No incluye el descuento (002) ni la rectificativa, que no recalcula (005).
- **Módulos que la evidencian**: `services/calculo.js` (`calcularLinea` `:25-34`, `recargoPara` `:11-23`,
  acumulados de `calcularFactura` `:81-86`); `lib/util.js` (`redondear2`, `:4-7`).
- **Reglas**: RN-01 a RN-10.
- **Contradicciones (convención que posee)**: C06 (tabla de recargos y tipos 21/10/4); C07, I1 (`redondear2` para
  todo importe que se graba); C09, I1 (`recargo_equivalencia == 1` con la ficha del momento de emitir).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-02 | RN-01 a RN-04, regla protegida | INTENCIONAL (acta simulada, pregunta 6, Puri) | Especificar tal cual |
| A-37 | ANO-025 (RAREZA, ALTA), ANO-059 (RAREZA, ALTA) | BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 6; R-12) | Especificar tal cual. No se corrige sin una prueba de cuadre con Contaplus |
| A-38 | ANO-040 (RAREZA, BAJA), ANO-067 (RAREZA, MEDIA) | Tipos antiguos INTENCIONAL; recargo 0 ACCIDENTAL (acta simulada, pregunta 23, Puri) | Especificar tal cual la tabla, incluidos los tipos antiguos |

- **Referencia**: A-42 (la leyenda impresa, en 010).
- **Tests**:
  - `01-util.test.js`: bloque RN-05.
  - `02-calculo.test.js`: bloques RN-01 a RN-10.
  - `09-anomalias.test.js`: ANO-025, ANO-059, ANO-040 y ANO-069.
  - `10-contradicciones.test.js`: contradicciones 06, 07 y 09.
- **Golden master**: sí, GM-01, GM-02, GM-07 y GM-10.
- **Dueño**: Puri (acta simulada, preguntas 6 y 23).

#### 002 · Descuento por volumen

- **Alcance**: cuándo se aplica el descuento por volumen, con qué porcentaje, sobre qué base y cómo se refleja en
  la factura. Recoge la convención de que las cuotas de contrato no lo llevan, aunque hoy la remesa sí lo aplique
  (A-24, en 008).
- **Módulos que la evidencian**: `services/calculo.js` (`porcentajeDescuento` `:36-43`, aplicación `:53-80`);
  `routes/facturas.js:76` (aviso en las observaciones).
- **Reglas**: RN-11 a RN-16.
- **Contradicciones**: ninguna formal. Posee la convención de A-24 (acta simulada, pregunta 18, Paco).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-21 | ANO-061 (RAREZA, ALTA) | INTENCIONAL (acta simulada, pregunta 16, Paco) | Especificar tal cual |
| A-22 | ANO-066 (RAREZA, ALTA) | INTENCIONAL (acta simulada, pregunta 17, Paco) | Especificar tal cual |
| A-33 | RN-11, regla protegida; ANO-023 (RAREZA, BAJA) | INTENCIONAL (acta simulada, pregunta 16) | Especificar tal cual |
| A-36 | ANO-062 (RAREZA, ALTA) | INTENCIONAL (R-11, Puri) | Especificar tal cual |
| A-55 (solo ANO-024) | ANO-024 (RAREZA, BAJA) | ACCIDENTAL (R-20) | Especificar tal cual |

- **Referencia**: A-24 (la cuota de remesa lleva descuento, en 008).
- **Tests**:
  - `02-calculo.test.js`: bloques RN-11 a RN-15.
  - `04-alta-factura.test.js`: bloque RN-16.
  - `09-anomalias.test.js`: ANO-023, ANO-061, ANO-062, ANO-066, ANO-024 y ANO-035/ANO-036.
- **Golden master**: sí, GM-03 a GM-06.
- **Dueño**: Paco (acta simulada, preguntas 16 a 18; R-26), con Puri para RN-14 (R-11).

#### 003 · Numeración legal y conservación de las facturas

- **Alcance**: cómo se forma y se asigna el número de cada factura (serie, año y correlativo) y la regla de que
  ninguna factura se borra. Incluye la fuente del año del número y los casos en que se repite o se pierde un número.
- **Módulos que la evidencian**: `lib/numeracion.js` (`:3-42`); `db.js:52,77-81` (contadores, sin `UNIQUE`);
  `config.js` (`RUTA_BD`, solo la ruta, nunca credenciales); ausencia de `DELETE` en el repositorio.
- **Reglas**: RN-26 a RN-30.
- **Contradicciones**: C02 (convención: el año de la fecha de la factura; acta simulada, pregunta 2, Puri).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-03 | ANO-002 (BUG, ALTA) | BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 2; R-03) | Especificar tal cual. Corregir en modernización al empezar un ejercicio, no retroactivo |
| A-04 | ANO-001 (RIESGO, ALTA) | BUG HISTÓRICO CON DEPENDIENTES (R-01; H-14) | Especificar tal cual. Corregir (numeración atómica) sin renumerar |
| A-07 | RN-30, regla protegida | INTENCIONAL (acta simulada, pregunta 9, Paco) | Especificar tal cual |
| A-08 | RN-26, RN-27, regla protegida | INTENCIONAL (acta simulada, preguntas 2 y 9) | Especificar tal cual, incluido el paso a 7 cifras |
| A-14 | ANO-029 (RIESGO, MEDIA), ANO-055 (RAREZA, BAJA) | BUG A SECAS (R-04) | Especificar tal cual (los tests dependen de ello) |
| A-64 (solo ANO-074) | ANO-074 (RAREZA, BAJA) | BUG A SECAS latente | Especificar tal cual; corregir con A-28 |

- **Referencias**: A-05 (huecos por el alta sin transacción, en 004); A-13 (concurrencia; excluida, §2.7).
- **Tests**:
  - `03-numeracion.test.js`: bloques RN-26 a RN-29.
  - `11-codigo-fuente.test.js`: bloque RN-30 y bloque de ausencia de transacciones.
  - `09-anomalias.test.js`: ANO-001 (dos tests), ANO-002, ANO-003 (contador sin factura), ANO-029 y ANO-074.
  - `10-contradicciones.test.js`: contradicción 02.
- **Golden master**: en parte. Los 12 casos fijan los contadores finales y el número asignado.
- **Dueño**: Puri (acta simulada, pregunta 2) y Paco (pregunta 9). Marga, para el pasado (pregunta 4; R-01).

#### 004 · Emisión de la factura manual

- **Alcance**: qué se factura cuando la oficina rellena «Nueva factura»: qué filas entran, cómo se leen cantidades
  y precios, qué fecha, qué cliente y qué estado inicial tiene la factura, y cómo se graba. El cálculo lo hacen 001
  y 002, el número 003 y el vencimiento 006.
- **Módulos que la evidencian**: `routes/facturas.js` (`POST /facturas/nueva`, `:42-102`);
  `views/factura_nueva.ejs`; `public/js/factura.js`; `lib/util.js` (`hoy`, `:9-15`).
- **Reglas**: RN-17 a RN-23, RN-25 y RN-52.
- **Contradicciones**: C08, L1 (lectura de importes; la anomalía es suya, A-16). Referencia la divergencia de C10,
  I2 (ANO-031) y de C13, I2 (abono con líneas negativas, A-23).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-05 | ANO-003 (RIESGO, ALTA), ANO-004 (RIESGO, ALTA) | BUG HISTÓRICO CON DEPENDIENTES (R-02; H-21) | Especificar tal cual. Corregir con transacción única; los huecos existentes se justifican con la gestoría |
| A-16 | ANO-032 (RIESGO, ALTA), ANO-068 (RAREZA, MEDIA) | BUG A SECAS latente (acta simulada, pregunta 19, Marga) | Especificar tal cual. Corregir sin retroactividad |
| A-20 | ANO-064 (RIESGO, ALTA) | BUG A SECAS (acta simulada, pregunta 22) | Especificar tal cual. Corregir: avisar en lugar de descartar |
| A-27 | ANO-045 (RIESGO, MEDIA) | BUG A SECAS (R-06) | Especificar tal cual. Corregir |
| A-28 | RN-20; ANO-003 (parte `NaN`), ANO-040 (parte tipo) | Negativos: uso real de la oficina (acta simulada, pregunta 13). `NaN` y texto: BUG A SECAS | Especificar tal cual los negativos; corregir el `NaN` |
| A-31 | ANO-049 (RIESGO, ALTA) | Formato INTENCIONAL; falta de validación BUG A SECAS (R-02) | Especificar tal cual el formato guardado; validar sin cambiarlo |
| A-63 (solo ANO-072) | ANO-072 (RAREZA, BAJA) | BUG A SECAS (R-22) | Especificar tal cual; corregir con A-31 |
| A-67 | ANO-078 (RIESGO, ALTA) | BUG A SECAS latente (R-24) | Especificar tal cual; corregir con A-28 |

- **Referencias**:
  - A-19, por la parte del servidor (ANO-031): el alta factura a un cliente de baja. Pertenece a 008 y la convención
    está en 011.
  - A-23: abono con líneas negativas, en 005.
  - A-38: el servidor acepta cualquier tipo de IVA, en 001.
  - A-64, por ANO-073: un precio «1e400» da un total `Infinity`. Pertenece a 010.
  - A-46: el envío por correo está desactivado. Está excluida (§2.7).
- **Tests**:
  - `04-alta-factura.test.js`: bloques RN-16 a RN-25.
  - `01-util.test.js`: bloque RN-52.
  - `09-anomalias.test.js`: ANO-003 (dos tests), ANO-004, ANO-031, ANO-032, ANO-040, ANO-045, ANO-049, ANO-064,
    ANO-072 (factura manual), ANO-073 (1e400) y ANO-078 (dos tests).
  - `10-contradicciones.test.js`: contradicciones 08, 10 y 13.
- **Golden master**: sí, completo. GM-01 a GM-10 son el camino A.
- **Dueño**: Marga (acta simulada, preguntas 13, 19 y 22).

#### 005 · Rectificación y abonos

- **Alcance**: cómo se anula una factura emitida con una rectificativa de la serie RE, qué se copia, con qué fecha
  y textos, qué facturas se pueden rectificar y las dos formas de abonar que existen hoy. Recoge la convención de
  que el abono devuelve lo que se cobró de verdad.
- **Módulos que la evidencian**: `routes/facturas.js` (`POST /facturas/:id/rectificar`, `:124-164`).
- **Reglas**: RN-33, RN-34 y RN-35. La transición a `rectificada` de RN-31 se especifica aquí; la máquina de
  estados pertenece a 006.
- **Contradicciones**:
  - C13: la convención es suya (acta simulada, pregunta 13, Puri). La divergencia del camino A se referencia en 004.
  - C14, parte de rectificar: ANO-006 y ANO-034 (acta simulada, pregunta 25).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-10 | RN-34, regla protegida | INTENCIONAL (acta simulada, pregunta 7, Puri) | Especificar tal cual |
| A-11 | RN-35 | INTENCIONAL (acta simulada, pregunta 8, Puri) | Especificar tal cual |
| A-23 | ANO-071 (RAREZA, ALTA) | BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 13) | Especificar tal cual las dos formas; decidir el abono parcial en modernización |
| A-25 | ANO-005 (BUG, ALTA) | BUG A SECAS (R-06) | Especificar tal cual. Corregir con transacción |
| A-26 | ANO-044 (RIESGO, ALTA) | BUG A SECAS (R-06) | Especificar tal cual. Corregir |
| A-39 (ANO-006 y ANO-034) | ANO-006 (RAREZA, BAJA), ANO-034 (RAREZA, MEDIA) | ANO-006 INTENCIONAL; ANO-034 BUG A SECAS (acta simulada, pregunta 25) | Especificar tal cual el servidor |
| A-55 (solo ANO-038) | ANO-038 (RAREZA, BAJA) | ACCIDENTAL (R-20) | Especificar tal cual |
| A-65 | ANO-075 (RAREZA, BAJA) | ACCIDENTAL | Especificar tal cual |

- **Referencias**: A-51 (título impreso, en 010); A-01 (compensación en el informe, en 009); A-03 (año del número
  RE, en 003).
- **Tests**:
  - `05-cobro-rectificacion.test.js`: bloques RN-31 y RN-33 a RN-35.
  - `09-anomalias.test.js`: ANO-005 (dos tests), ANO-006, ANO-034, ANO-038, ANO-044 y ANO-075.
  - `10-contradicciones.test.js`: contradicciones 13 y 14.
- **Golden master**: sí, GM-11 y GM-12 (camino C).
- **Dueño**: Puri (acta simulada, preguntas 7, 8 y 13).

#### 006 · Vencimientos y estado de cobro

- **Alcance**: cuándo vence una factura, qué estados tiene y cómo cambian, cómo se marca una factura cobrada y qué
  cuenta como «pendiente de cobro».
- **Módulos que la evidencian**:
  - `routes/facturas.js` (cálculo del vencimiento `:68-69` y cobro `:117-122`);
  - `lib/util.js` (`sumarDias`, `:17-26`);
  - `config.js` (`VENCIMIENTO_DIAS`, `:39-40`);
  - `server.js:23-25` y `views/index.ejs` (panel);
  - `db.js:61` (estados).
- **Reglas**: RN-24, RN-31 y RN-32.
- **Contradicciones (convención que posee)**:
  - C04 (pendiente = importe de las FA emitidas; acta simulada, pregunta 25, Marga);
  - C05 (30 días de `config.js` y el contado vence el mismo día; acta simulada, pregunta 27, Marga). La divergencia
    de la remesa se referencia en 008;
  - C12, I2 (`sumarDias`);
  - C14, parte de cobrar (ANO-033).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-39 (solo ANO-033) | ANO-033 (RAREZA, BAJA) | ACCIDENTAL (acta simulada, pregunta 25) | Especificar tal cual el servidor |
| A-41 | ANO-021 (RAREZA, BAJA) | ACCIDENTAL (acta simulada, pregunta 25) | Especificar tal cual; corregir el número |
| A-47 | ANO-012 (RAREZA, BAJA), ANO-041 (RAREZA, BAJA) | ANO-012 ACCIDENTAL; ANO-041 BUG A SECAS en el contado (acta simulada, pregunta 27) | Especificar tal cual |
| A-48 | ANO-030 (RIESGO, BAJA) | BUG A SECAS latente (R-16) | Especificar tal cual con `Europe/Madrid` |

- **Referencias**: A-63, por ANO-072 (desbordamiento de `sumarDias`; pertenece a 004); RN-35 (la rectificativa no
  tiene vencimiento, en 005).
- **Tests**:
  - `01-util.test.js`: bloque RN-24 (`sumarDias`).
  - `04-alta-factura.test.js`: bloque RN-24.
  - `05-cobro-rectificacion.test.js`: bloques RN-31 y RN-32.
  - `09-anomalias.test.js`: ANO-033 y ANO-041.
  - `10-contradicciones.test.js`: contradicciones 05, 12 y 14.
- **Golden master**: en parte. Los vencimientos de GM-01 a GM-10.
- **Sin test**: A-41 entera (panel de `server.js`). Es cobertura pendiente de [pruebas/LEEME.md](../../pruebas/LEEME.md).
- **Dueño**: Marga (acta simulada, preguntas 25 y 27).

#### 007 · Contratos de cuota: alta, baja, vigencia y prorrateo comercial

- **Alcance**: cómo se da de alta y de baja un contrato, cuándo está vigente, cuánto cuesta el último mes «a lo
  comercial» y qué indica la pantalla para facturarlo a mano.
- **Módulos que la evidencian**: `routes/contratos.js` (`:12-42`); `views/contratos.ejs`; `services/calculo.js`
  (`calcularProrrateo`, `:90-102`).
- **Reglas**: RN-36, RN-37 y RN-38.
- **Contradicciones (convención que posee)**:
  - C01: prorrateo a 30 días (acta simulada, pregunta 14, Paco). La divergencia de la remesa es A-17, en 008.
  - C11: vigencia según el criterio de fechas de la remesa, I1. La divergencia de la pantalla, I2, es A-30.

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-18 | ANO-008 (RIESGO, ALTA), ANO-022 (RAREZA, MEDIA) | BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 15, Marga) | Especificar tal cual. Corregir sin retroactividad |
| A-29 | ANO-042 (RIESGO, MEDIA), ANO-053 (RAREZA, BAJA) | BUG A SECAS (R-07) | Especificar tal cual. Corregir |
| A-30 | ANO-070 (RAREZA, MEDIA) | BUG HISTÓRICO CON DEPENDIENTES, con A-18 (acta simulada, pregunta 21) | Especificar tal cual la remesa; corregir la pantalla |
| A-35 | ANO-043 (BUG, ALTA) | BUG HISTÓRICO CON DEPENDIENTES (R-10, Paco) | Especificar tal cual; se decide junto con A-17 |

- **Referencias**:
  - A-17: prorrateo por días reales, en 008.
  - A-19: la baja de un cliente no toca sus contratos, en 008. La convención está en 011.
  - A-38: tipo de IVA del contrato, 21 por defecto (D2/D3), en 001.
  - A-40: el prorrateo se muestra en la URL con `toFixed(2)`, en 010.
- **Tests**:
  - `02-calculo.test.js`: bloques RN-36 y RN-37.
  - `06-contratos-y-maestros.test.js`: bloques RN-36 (pantalla), RN-38 y altas de contratos.
  - `09-anomalias.test.js`: ANO-008, ANO-042, ANO-043, ANO-053 y ANO-070.
  - `10-contradicciones.test.js`: contradicciones 01 y 11.
- **Golden master**: no lo cubre (está fuera del ciclo de la factura).
- **Dueño**: Paco, para el prorrateo (acta simulada, pregunta 14; R-10; R-26). Marga, para el procedimiento
  (preguntas 15 y 21).

#### 008 · Remesa mensual de cuotas

- **Alcance**: qué contratos se facturan cada mes, por qué importe, con qué forma de factura y qué controles tiene
  (o no tiene) el lanzamiento de la remesa.
- **Módulos que la evidencian**: `scripts/remesa_mensual.js` (`:1-84`); `lib/util.js` (`diasDelMes`, `:35-39`).
- **Reglas**: RN-39 a RN-43.
- **Contradicciones (divergencias que se especifican aquí)**:
  - C01, I2 (A-17);
  - C05, I2 (30 días escritos en el código; ANO-012, que pertenece a 006);
  - C10, I3 (A-19);
  - C11, I1 (criterio de vigencia; la convención está en 007).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-06 | ANO-009 (RIESGO, ALTA), ANO-010 (RIESGO, MEDIA) | BUG A SECAS (acta simulada, pregunta 11, Marga; R-08) | Especificar tal cual. Corregir sin impedir los meses atrasados |
| A-17 | ANO-007 (RAREZA, ALTA) | Remesa: BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 14, Paco) | Especificar tal cual los dos caminos; unificar en modernización |
| A-19 | ANO-011 (RAREZA, MEDIA), ANO-031 (RAREZA, BAJA) | BUG A SECAS (acta simulada, pregunta 20, Marga) | Especificar tal cual. Corregir sin quitar la rectificación a clientes de baja |
| A-24 | ANO-035 (RAREZA, ALTA) | BUG A SECAS latente (acta simulada, pregunta 18, Paco) | Especificar tal cual |
| A-32 | ANO-048 (BUG, MEDIA) | BUG A SECAS (R-08) | Especificar tal cual. Corregir sin impedir los meses atrasados |
| A-54 | ANO-037 (RAREZA, BAJA) | ACCIDENTAL (R-19) | Especificar el orden observado (D-30) |
| A-55 (ANO-036 y ANO-065) | ANO-036, ANO-065 (RAREZA, BAJA) | ACCIDENTAL (R-20) | Especificar tal cual |
| A-63 (solo ANO-077) | ANO-077 (RAREZA, BAJA) | BUG A SECAS | Especificar tal cual; corregir con A-32 |

- **Referencias**:
  - A-03: diciembre se numera con el año siguiente, en 003.
  - A-47: 30 días fijos, en 006.
  - A-18 y A-30: doble cobro del último mes, en 007.
  - A-34: dato excluido (§2.7).
- **Tests**:
  - `07-remesa.test.js`: bloques RN-39 a RN-43.
  - `09-anomalias.test.js`: ANO-009, ANO-010, ANO-011, ANO-035/ANO-036, ANO-037, ANO-039, ANO-048, ANO-065 y
    ANO-077.
  - `10-contradicciones.test.js`: contradicciones 01, 02, 05, 10 y 11.
- **Golden master**: no lo cubre. El camino B tiene su propia batería, `07-remesa`, que ejecuta el script real
  (`pruebas/golden-master/casos.js:2-3`).
- **Dueño**: Marga (acta simulada, preguntas 11, 15 y 20). Paco, para el importe (pregunta 14).

#### 009 · Entregables para la gestoría: resumen de IVA y fichero contable

- **Alcance**: el resumen trimestral de IVA (en pantalla) y el fichero CSV anual para Contaplus. Para cada uno:
  qué facturas entran, de qué tabla salen los importes y cuál es su formato exacto. Es un contrato con un tercero.
- **Módulos que la evidencian**: `routes/informes.js` (`:9-51`); `views/informe_iva.ejs`; `views/informes.ejs`.
- **Reglas**: RN-44 a RN-49.
- **Contradicciones**: C03 (convención: la cifra oficial del 303 es la suma por líneas; acta simulada, pregunta 1,
  Puri, testimonio simulado). Las dos implementaciones están en esta spec.

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-01 | ANO-014 (RIESGO, ALTA) | BUG HISTÓRICO CON DEPENDIENTES, condicionado a D-01 (acta simulada, preguntas 1 y 1 bis) | Especificar tal cual las dos salidas; aviso de descuadre en modernización sin cambiar ninguna fórmula |
| A-09 | RN-48, RN-49, regla protegida | INTENCIONAL (acta simulada, pregunta 10, Puri) | Especificar tal cual, byte a byte |
| A-52 | ANO-015 (RIESGO, MEDIA) | BUG A SECAS latente (R-17) | Especificar tal cual; corregir solo con Puri |
| A-53 | ANO-026, ANO-063 (RAREZA, BAJA) | ACCIDENTAL (R-18) | Especificar tal cual; corregir el menú |
| A-66 | ANO-076 (RAREZA, BAJA) | ACCIDENTAL (R-23) | Especificar tal cual; corregir con A-53 |

- **Referencias**:
  - A-03: facturas `FA-2027-…` con fecha de 2026 en el fichero de 2026, en 003.
  - A-11: la rectificativa resta en el periodo en que se emite, en 005.
  - A-31: los filtros comparan texto, en 004.
  - A-40: totales sin redondear y «-0,00», en 010.
  - A-50: nombre y NIF actuales del cliente, en 010.
- **Tests**:
  - `08-informes.test.js`: bloques RN-44, RN-46, RN-48 y RN-49.
  - `09-anomalias.test.js`: ANO-014, ANO-015, ANO-026/ANO-063 y ANO-076.
  - `10-contradicciones.test.js`: contradicción 03.
- **Golden master**: en parte. La línea del CSV de cada caso.
- **Sin test**: RN-45 y RN-47, y las sumas reales de SQLite (cobertura pendiente).
- **Dueño**: Puri (acta simulada, preguntas 1, 1 bis y 10).

#### 010 · Documento de factura y formatos de presentación

- **Alcance**: qué contiene la factura impresa o reimpresa y con qué datos (los de hoy o los de la emisión). Cómo se
  muestran importes y fechas en pantalla, impresión y fichero. Qué acciones ofrece el detalle.
- **Módulos que la evidencian**: `views/factura_detalle.ejs`; `routes/facturas.js` (detalle, `:104-112`);
  `lib/util.js` (`formatearImporte` `:50-58`, `fechaBonita` `:28-33`); usos de `toFixed(2)` en
  `views/index.ejs:6`, `views/articulos.ejs:8`, `views/contratos.ejs:8` y `routes/contratos.js:40`.
- **Reglas**: RN-50, RN-51, RN-54 y RN-55.
- **Contradicciones**:
  - Convención que posee: C08, E1 (`1.234,50`).
  - Divergencias que se especifican aquí: C07, I2 (`toFixed`, A-40); C08, E2 y E3 (pantallas internas); C09, I2
    (leyenda, A-42); C14, V1 (botones del detalle; la anomalía es A-39, de 005 y 006).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-40 | ANO-060 (RAREZA, BAJA) | ACCIDENTAL (acta simulada, pregunta 24, Marga) | Especificar tal cual |
| A-42 | ANO-069 (RAREZA, BAJA) | ACCIDENTAL (R-13; acta simulada, pregunta 26) | Especificar tal cual; se decide con A-50 |
| A-50 | ANO-019 (RIESGO, MEDIA) | BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 26, Puri) | Especificar tal cual; guardar los datos de emisión solo en las facturas nuevas |
| A-51 | ANO-020 (RAREZA, MEDIA) | BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 26) | Especificar tal cual; corregir sin retroactividad |
| A-64 (solo ANO-073) | ANO-073 (RAREZA, BAJA) | BUG A SECAS latente | Especificar tal cual; corregir con A-28 |

- **Referencias**: A-16 (lectura de importes, en 004); A-39 (botones frente a servidor, en 005 y 006).
- **Tests**:
  - `01-util.test.js`: bloques RN-50 y RN-51.
  - `05-cobro-rectificacion.test.js`: bloque RN-54 (parte de servidor).
  - `09-anomalias.test.js`: ANO-060 y ANO-073.
  - `10-contradicciones.test.js`: contradicciones 07, 08 y 09.
- **Golden master**: en parte. Fechas y líneas formateadas para imprimir en los 12 casos.
- **Sin test**: RN-55 y la leyenda de RN-54 (las vistas EJS no se ejecutan; cobertura pendiente).
- **Dueño**: Puri (acta simulada, pregunta 26), con Marga (pregunta 24).

#### 011 · Fichero de clientes y catálogo de artículos

- **Alcance**: el alta y la baja de clientes, con el NIF, la marca de recargo, los días de pago y el indicador de
  activo, y el alta de artículos, con su precio y tipo de IVA. Recoge la convención de qué cliente es facturable.
- **Módulos que la evidencian**: `routes/clientes.js`; `routes/articulos.js`; `views/clientes.ejs`;
  `views/articulos.ejs`; `lib/util.js` (`validarNIF`, `:41-48`); `db.js:24-37` (esquema).
- **Reglas**: RN-53.
- **Contradicciones (convención que posee)**:
  - C10: dar de baja un cliente debería dar de baja sus contratos (acta simulada, pregunta 20, Marga). Hoy no lo
    hace: la divergencia es A-19 en 008, y ANO-031 en 004.
  - C06, D1 (`IVA_DEFECTO` en el alta de artículos).
  - C09, I3 (columna «R.E.» del listado).

| A | ANO (tipo, sev.) | Clasif. supuesta | Tratamiento |
|---|---|---|---|
| A-49 | ANO-018 (RIESGO, MEDIA) | INTENCIONAL provisional (acta simulada, pregunta 28, Marga) | Especificar tal cual; validar en modernización solo los NIF nuevos |

- **Referencias**: A-19 (en 008); A-38 (tipos del desplegable, en 001); A-42 (en 010).
- **Tests**:
  - `01-util.test.js`: bloque RN-53.
  - `06-contratos-y-maestros.test.js`: bloque RN-53 (alta de cliente) y altas de artículos.
  - `09-anomalias.test.js`: ANO-018.
  - `10-contradicciones.test.js`: contradicciones 06, 09 y 10.
- **Golden master**: no lo cubre.
- **Dueño**: Marga (acta simulada, preguntas 20 y 28).

### 2.4 Reparto de las 14 contradicciones

| Contradicción | Convención «declarada vigente» (SUPOSICIÓN) | Spec que la posee | Implementación divergente → spec del camino que la usa |
|---|---|---|---|
| 01 · Prorrateo | 30 días «a lo comercial» (acta simulada, pregunta 14, Paco) | 007 | I2, remesa por días reales → **A-17 en 008** |
| 02 · Año de la factura | El año de la fecha (acta simulada, pregunta 2, Puri) | 003 | I1, reloj, en los tres caminos → **A-03 en 003**, referenciada en 008 y 009 |
| 03 · IVA del periodo | Suma por líneas (acta simulada, pregunta 1, Puri) | 009 | I2, CSV por cabeceras → **A-01 en 009** |
| 04 · Pendiente de cobro | El importe de las FA emitidas (acta simulada, pregunta 25, Marga) | 006 | I1, I3 e I4 → **A-41 en 006** |
| 05 · Vencimiento | `config.js` (30); el contado, el mismo día (acta simulada, pregunta 27) | 006 | I2, remesa a 30 fijos → **A-47 (ANO-012), referenciada en 008**. I3, la rectificativa sin vencimiento, se especifica en 005 sin anomalía |
| 06 · Tipos de IVA | 21/10/4 vigentes y tabla con tipos antiguos (acta simulada, pregunta 23, Puri) | 001 | L5, el servidor acepta cualquier tipo → **A-38**, referenciada en 004, 007 y 011. D1 en 011; D2 y D3 en 007 |
| 07 · Redondeo | `redondear2` para lo que se graba (acta simulada, pregunta 6) | 001 | I2, `toFixed` al mostrar → **A-40 en 010** |
| 08 · Formato de importes | `1.234,50` en documentos (E1) | 010 | L1, lectura de lo tecleado → **A-16 en 004**. E2/E3 se especifican en 010 |
| 09 · Recargo de equivalencia | `== 1` con la ficha al emitir (I1) | 001 | I2, leyenda impresa → **A-42 en 010**. I3, listado, en 011 |
| 10 · Cliente facturable | Baja de cliente ⇒ baja de contratos; solo activos (acta simulada, pregunta 20) | 011 | I3, remesa → **A-19 en 008**. I2, alta (ANO-031) → referenciada en 004 |
| 11 · Contrato vigente | Criterio de fechas de la remesa (I1, RN-39 INTENCIONAL) | 007 | I2, pantalla → **A-30 en 007**, referenciada en 008 |
| 12 · Fechas y zona horaria | `hoy()` en hora local (RN-52) | 004 | I2, `sumarDias` en UTC → **A-48 en 006** |
| 13 · Abono | Se devuelve lo cobrado de verdad (acta simulada, pregunta 13, Puri) | 005 | I2, FA con líneas negativas → **A-23 en 005**, referenciada en 004 |
| 14 · Acciones permitidas | Una cobrada se puede rectificar y sigue constando el cobro; una RE no se cobra (acta simulada, pregunta 25) | 005 (rectificar) y 006 (cobrar) | V1, pantalla → 010. V2 → ANO-033 en 006. V3 → ANO-006 y ANO-034 en 005 |

### 2.5 Tamaño y citas mutuas

| Spec | Reglas | Anomalías propias | Revisión estimada |
|---|---|---|---|
| 001 | 10 | 3 | ~30 min (diez reglas cortas, cada una con un ejemplo numérico) |
| 002 | 6 | 5 | ~25 min |
| 003 | 5 | 6 | ~25 min |
| 004 | 9 | 8 | ~30 min (la más cargada; en el límite) |
| 005 | 3 | 8 | ~25 min |
| 006 | 3 | 4 | ~20 min |
| 007 | 3 | 4 | ~20 min |
| 008 | 5 | 8 | ~30 min |
| 009 | 6 | 5 | ~30 min (formato byte a byte) |
| 010 | 4 | 5 | ~20 min |
| 011 | 1 | 1 | ~10 min |

Ninguna excede la sentada de unos 30 minutos, así que no se divide ninguna. Los pares con más riesgo de fusión:

| Par | Requisitos de la primera que citan a la segunda | Requisitos de la segunda que citan a la primera | Decisión |
|---|---|---|---|
| 007 ↔ 008 | 4 de 9 (RN-38, A-18, A-30 y la convención de prorrateo) | 5 de 14 (RN-39, RN-40, A-17, A-18, A-19) | Por debajo de la mitad en los dos sentidos: **no se fusionan** |
| 001 ↔ 002 | 0 de 13 | 2 de 11 (RN-12 y RN-14 recalculan con RN-01 a RN-03) | **No se fusionan** |
| 005 ↔ 006 | 2 de 11 (transición a `rectificada`, ANO-034) | 2 de 7 (RN-31, ANO-033) | **No se fusionan** |
| 003 ↔ 004 | 1 de 11 (A-05) | 2 de 17 (RN-18 no consume número, RN-25) | **No se fusionan** |
| 009 ↔ 010 | 2 de 11 (RN-47, formato de RN-49) | 0 de 9 | **No se fusionan** |

**Observación**: 011 es muy pequeña. No cumple ninguna condición de fusión, pero puede revisarse con Marga en la
misma sentada que 004.

### 2.6 Casos frontera

| Concepto | Podría ir en | Recomendación | Criterio |
|---|---|---|---|
| Prorrateo de una cuota | 007 o 008 | Convención (30 días) en **007**; días reales (A-17) en **008** | Regla de reparto de contradicciones: la condición comercial del contrato es de 007; la remesa es el camino que diverge |
| Doble cobro del último mes (A-18) | 007 o 008 | **007** | Nace del procedimiento de baja (RN-38, H-24): sin la indicación de la pantalla no habría factura manual. 008 la referencia |
| Máquina de estados (RN-31) | 005 o 006 | **006**; la transición a `rectificada` se especifica en 005 | La máquina de estados describe la cartera de cobro; la rectificación es solo uno de sus eventos |
| Qué se puede cobrar o rectificar (A-39) | 005 o 006 | **Reparto por ANO**: ANO-006 y ANO-034 en 005; ANO-033 en 006 | Cada ANO es la regla de un dominio distinto (rectificar o cobrar) |
| Aviso de descuento en observaciones (RN-16, ANO-024) | 002 o 004 | **002** | El aviso se decide con el descuento: si cambia el descuento, cambia el aviso |
| Formato de importes y fechas (RN-50, RN-51) | 010 o 009 | **010**. 009 fija el CSV byte a byte con sus propios valores | El CSV es un contrato con un tercero y debe poder quedar fijo aunque cambie la presentación en pantalla |
| Totales del informe sin redondear (RN-47) | 009 o 010 | **009**; A-40 se especifica en 010 | Es contenido del entregable que revisa la gestoría |
| «Hoy» (RN-52) | 004, 005 o 007 | **004** | Es la fecha por defecto del alta, su primer uso. 005 y 007 la referencian |
| Huecos en la numeración (A-05) | 003 o 004 | **004**; 003 la referencia | El hueco lo causa el alta sin transacción, que es del camino A |
| Tipos de IVA (A-38) | 001, 004, 007 o 011 | **001**, referenciada en los otros tres | La tabla de recargos (RN-09, RN-10) es su núcleo |
| Clientes de baja (A-19) | 008, 011 o 004 | **008**; convención en 011; ANO-031, referenciado en 004 | El impacto económico (cuotas a clientes de baja) está en la remesa |
| Abonos (A-23) | 005 o 004 | **005**; 004 la referencia | El abono es un dominio fiscal; el alta solo es el camino que se usa para hacerlo |
| Textos automáticos (A-55) | 002, 005 o 008 | **Reparto por ANO**: ANO-024 en 002, ANO-038 en 005, ANO-036 y ANO-065 en 008 | Cada texto lo produce un dominio distinto |
| Fechas imposibles (A-63) | 004 o 008 | **Reparto por ANO**: ANO-072 en 004, ANO-077 en 008 | Ídem |
| Formatos fuera de rango (A-64) | 003 o 010 | **Reparto por ANO**: ANO-074 en 003, ANO-073 en 010 | Ídem |
| BD relativa al directorio (A-14) | 003 o excluida | **003** | Su efecto de negocio es repetir números de factura; el registro pide especificarla tal cual |
| Tramo decidido con líneas redondeadas (RN-12) | 001 o 002 | **002** | Decide el descuento; solo usa el redondeo de 001 |

### 2.7 Exclusiones justificadas

Ninguna de estas entradas describe una regla de negocio del programa que una spec de comportamiento pueda fijar.
Siguen en el registro con su tratamiento, y su sitio natural es un documento técnico u operativo de la fase de
modernización.

| A | Motivo de la exclusión | Tratamiento del registro | Clasif. supuesta |
|---|---|---|---|
| A-12 | Procedimiento operativo (copia en un pendrive), no comportamiento del código | Documentar sin especificar | BUG A SECAS, riesgo (acta simulada, pregunta 3) |
| A-13 | Riesgo de infraestructura (SQLite en carpeta de red) sin regla de negocio. Su efecto en la numeración se referencia en 003 | Documentar; corregir | BUG A SECAS, riesgo (acta simulada, pregunta 5) |
| A-15 | Es un dato, no una regla: la semilla descuadrada. Toda spec debe advertir que la semilla no es oráculo | Documentar sin especificar | ACCIDENTAL (R-05) |
| A-34 | Es un dato (FA-106/107), no una regla | Documentar sin especificar | Sin respuesta concluyente (R-09) |
| A-43 | Seguridad de credenciales; no se pueden copiar a una spec (CLAUDE.md) | Corregir, no retroactivo | BUG A SECAS (R-14) |
| A-44 | Seguridad de acceso; sin comportamiento de negocio que caracterizar | Corregir | BUG A SECAS (acta simulada, pregunta 30) |
| A-45 | Instalación y versión de Node; condiciona la validez de los tests, no el negocio | Documentar | BUG A SECAS (R-15) |
| A-46 | Envío por correo roto desde 2022; lo único observable es un aviso en el log (ANO-054, con test). 004 indica que no se envía nada (RN-25) | Documentar sin especificar | Sin clasificación (acta simulada, pregunta 29) |
| A-56 | Despliegue (ruta del servidor, `config.js` copiado a mano) | Especificar el nombre `config.js`, que es un requisito técnico | ACCIDENTAL |
| A-57 | Dependencias con avisos de seguridad; Principio IV | Corregir en modernización | BUG A SECAS |
| A-58 | Falta de `.gitignore`; no es comportamiento del programa | Corregir con autorización | BUG A SECAS (acta simulada, pregunta 30) |
| A-59 | Privacidad del log y errores internos. Los mensajes de error de negocio («La factura no tiene lineas», «Ya esta rectificada»…) sí se especifican en 004 y 005 | Corregir | BUG A SECAS (R-21) |
| A-60 | Documentación y comentarios obsoletos; cada discrepancia concreta está en su propia entrada | Documentar sin especificar | — |
| A-61 | Deuda técnica | Documentar sin especificar | — |
| A-62 | Partes abandonadas (MySQL, albaranes, Access); sin código vivo que especificar | Documentar sin especificar | Abandonadas (acta simulada, pregunta 30) |

### 2.8 Completitud

- **Reglas**: las 55 tienen una sola spec.
  - 001: RN-01 a RN-10.
  - 002: RN-11 a RN-16.
  - 003: RN-26 a RN-30.
  - 004: RN-17 a RN-23, RN-25 y RN-52.
  - 005: RN-33 a RN-35.
  - 006: RN-24, RN-31 y RN-32.
  - 007: RN-36 a RN-38.
  - 008: RN-39 a RN-43.
  - 009: RN-44 a RN-49.
  - 010: RN-50, RN-51, RN-54 y RN-55.
  - 011: RN-53.
- **Anomalías**: las 67 están asignadas. 52 tienen spec; cuatro de ellas se reparten por ANO (A-39, A-55, A-63 y
  A-64). Las otras 15 están excluidas con justificación (§2.7).
- **ANO**: los 78 tienen destino. El de cada uno se deduce de su A (registro §4.1) y de los repartos de §2.6.

---

## 3. PARTE 2 — Descripciones para `/speckit-specify`

Cada bloque es la descripción **completa** que se pasaría a `/speckit-specify` para crear la spec, y no depende de
los demás. Las rutas de test son relativas a la raíz del repositorio. Los tests están en `pruebas/` y no en
`tests/`, porque `node --test` ejecutaría como test cualquier `.js` de una carpeta `test/` (CLAUDE.md). En todos
los bloques, «acta simulada» es `specs/000-reconocimiento/entrevista-negocio-simulada.md` y «propuesta §1.2» es
`specs/000-reconocimiento/propuesta-particion-specs.md`, apartado 1.2.

**No lanzar hasta que se apruebe esta propuesta.**

### 3.1 Spec 001 · Cálculo de importes: redondeo, IVA y recargo de equivalencia

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE del cálculo de importes de una factura
(redondeo, IVA y recargo de equivalencia) de GesFact 2.4. No es una feature nueva: es la especificación formal
de lo que el sistema YA hace, para que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción: los ejemplos salen de la ejecución del código y de la semilla de db.js, que NO es
  oráculo (ANO-013, A-15).
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro
  (specs/000-reconocimiento/registro-de-anomalias.md).
- Los criterios de aceptación se verifican contra la suite de pruebas/ (node --test) y citan el test cuando
  existe. Los importes se comparan céntimo a céntimo, sin tolerancia.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Hoy todas son SUPOSICIÓN:
  el acta es simulada y las respuestas de la propuesta §1.2 las eligió el consultor.

Alcance (evidencia: services/calculo.js calcularLinea :25-34, recargoPara :11-23, calcularFactura :81-86;
lib/util.js redondear2 :4-7):
- RN-01. Base de la línea = cantidad × precio, redondeada al céntimo. Ejemplo: 0,44 × 21,60 = 9,504 → 9,50 €.
- RN-02. Cuota de IVA = base ya redondeada × tipo / 100, redondeada. Ejemplo: 9,50 × 21 % = 1,995 → 2,00 €.
- RN-03. IVA y recargo de la factura = suma de las cuotas redondeadas de cada línea. Ejemplo (líneas de
  FA-2026-000103): 118,94 + 66,69 + 19,04 + 1,14 = 205,81 € (el 21 % de la base total, 980,01, daría 205,80).
- RN-04. No se agrupan líneas: 1 línea de 2 × 2,50 al 21 % → IVA 1,05; 2 líneas de 1 × 2,50 → 0,53 + 0,53 = 1,06.
- RN-05. Redondeo Math.round(x × 100) / 100 en coma flotante: 0,125 → 0,13; −0,125 → −0,12; 0,525 → 0,53;
  −0,525 → −0,52; 2,675 → 2,68; 1,005 → 1,00; 0,285 → 0,28. Una línea de −1 × 2,50 al 21 % lleva IVA −0,52.
- RN-06. Totales: base = suma de bases; IVA = suma de cuotas; recargo = suma de recargos; total = base + IVA +
  recargo. Ejemplo (líneas de FA-2026-000101): 133,20 / 24,27 / 157,47 €.
- RN-07. Recargo solo si el cliente tiene recargo_equivalencia == 1 al emitir (también '1' o true; 2 no).
  Ejemplo: Ferretería El Tornillo, 4 × 18,50 = 74,00; IVA 15,54; recargo 5,2 % = 3,848 → 3,85 €.
- RN-08. Tabla vigente: IVA 21 → recargo 5,2 %; 10 → 1,4 %; 4 → 0,5 %. Ejemplo: 8 × 14,20 = 113,60; IVA 4 % 4,54;
  recargo 0,57 €.
- RN-09. Tipos antiguos: 18 y 16 → 4 %; 8 y 7 → 1 %. Ejemplo: 100 € al 18 % con recargo → recargo 4,00 €.
- RN-10. Cualquier otro tipo, o el tipo como texto ('21'), lleva recargo 0 sin aviso. Ejemplo: 100 € al 5 % →
  IVA 5,00, recargo 0,00.
- Convenciones que posee esta spec (contradicciones 06, 07 y 09): los tipos vigentes son 21/10/4 y se conservan
  los antiguos (acta simulada, pregunta 23, Puri, 16/11/2026); redondear2 se usa para todo importe que se graba
  (acta simulada, pregunta 6, Puri); el recargo depende de la ficha del cliente al emitir.

Anomalías (clasificación supuesta; tratamiento del registro):
- A-02 (regla protegida RN-01 a RN-04): INTENCIONAL (acta simulada, pregunta 6, Puri, 16/11/2026). Tratamiento:
  especificar tal cual; cualquier reescritura debe reproducir los importes céntimo a céntimo.
- A-37 (ANO-025, ANO-059; RAREZA, ALTA): BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 6; propuesta
  §1.2, R-12, Puri). Tratamiento: especificar tal cual; no se corrige sin una prueba de cuadre con Contaplus sobre
  un trimestre real.
- A-38 (ANO-040, RAREZA, BAJA; ANO-067, RAREZA, MEDIA): los tipos antiguos son INTENCIONALES y el recargo 0,
  ACCIDENTAL (acta simulada, pregunta 23, Puri). Tratamiento: especificar tal cual la tabla, incluidos los tipos
  antiguos. Hay que documentar dónde diverge la lista de tipos: pantallas 21/10/4, servidor cualquier entero.

Tests que la respaldan: pruebas/caracterizacion/01-util.test.js (RN-05); 02-calculo.test.js (bloques RN-01 a
RN-10); 09-anomalias.test.js («CONGELA comportamiento actual: ANO-025», «ANO-059», «ANO-040», «ANO-069»);
10-contradicciones.test.js (contradicciones 06, 07 y 09). Golden master: GM-01, GM-02, GM-07 y GM-10
(pruebas/golden-master/casos.js).

Fuera de alcance: el descuento por volumen (spec 002); la rectificativa, que no recalcula (spec 005); la
presentación de importes y la leyenda de recargo impresa (spec 010, A-40 y A-42); la lectura de lo tecleado en el
formulario (spec 004).
```

### 3.2 Spec 002 · Descuento por volumen

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE del descuento por volumen de GesFact 2.4. No es
una feature nueva: es la especificación formal de lo que el sistema YA hace, para que sirva de contrato en la
modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción; la semilla de db.js no es oráculo (ANO-013).
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro
  de anomalías.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe. Los
  importes se comparan céntimo a céntimo.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.

Alcance (evidencia: services/calculo.js porcentajeDescuento :36-43 y aplicación :53-80; routes/facturas.js:76):
- RN-11. Tramos: base bruta estrictamente mayor que 1.000 € → 2 %; estrictamente mayor que 5.000 € → 5 %. Se mide
  sin IVA ni recargo. Ejemplos (una línea al 21 %, sin recargo): 1.000,00 → sin descuento, total 1.210,00;
  1.000,01 → 2 %, total 1.185,81; 5.000,00 → 2 %, total 5.929,00; 5.000,01 → 5 %, total 5.747,51.
- RN-12. El tramo se decide con la suma de las bases de línea ya redondeadas. Ejemplo (líneas de
  FA-2026-000103): 0,92 × 6,00 = 5,52 → base bruta 1.000,02 → 2 %, base 980,01, total 1.185,82.
- RN-13. El porcentaje se aplica a toda la base, no al exceso: hay un salto en cada umbral. Ejemplo: hasta una
  base bruta de 1.020,41 € el cliente no vuelve a pagar 1.210,00 €. 5.000,00 → base 4.900,00; 5.000,01 → base
  4.750,01 (hasta unos 5.157,89 € no se vuelve a 4.900 €).
- RN-14. Se rebaja el precio unitario, redondeado al céntimo, y se recalcula la línea. Se graba e imprime el
  precio rebajado, sin línea de descuento. Ejemplo: 28,90 − 2 % = 28,322 → 28,32; × 20 = 566,40 (sobre la base
  serían 566,44). FA-2026-000103 da 980,01 frente a 980,02. Por debajo de 0,25 € (2 %) o de 0,10 € (5 %) el
  precio no baja: 0,01 € sigue en 0,01.
- RN-15. No distingue cliente, tipo de IVA ni signo; las líneas negativas restan de la base bruta. Ejemplos:
  Ferretería (con recargo), 1.200 € al 21 % → precio 1.176,00, IVA 246,96, recargo 61,15, total 1.484,11;
  líneas de 1.050 y −60 → base bruta 990 → sin descuento, total 1.197,90.
- RN-16. Solo en la factura manual se añade a las observaciones « Descuento volumen N% aplicado», con un espacio
  delante también si no había observaciones. La remesa no lo añade.
- Convención que posee esta spec: las cuotas de contrato no deben llevar descuento (acta simulada, pregunta 18,
  Paco, 16/11/2026). Hoy la remesa sí lo aplica: es A-24, que se especifica en la spec 008.

Anomalías (clasificación supuesta; tratamiento):
- A-21 (ANO-061; RAREZA, ALTA): INTENCIONAL (acta simulada, pregunta 16, Paco). Especificar tal cual; cambiarlo es
  una decisión comercial.
- A-22 (ANO-066; RAREZA, ALTA): INTENCIONAL; se aplica a todos los clientes (acta simulada, pregunta 17, Paco).
  Especificar tal cual.
- A-33 (regla protegida RN-11; ANO-023, RAREZA, BAJA): INTENCIONAL (acta simulada, pregunta 16). Especificar tal
  cual. El comentario «a partir de 1.000» del código se contradice con este comportamiento; no se toca el
  comentario.
- A-36 (ANO-062; RAREZA, ALTA): INTENCIONAL (propuesta §1.2, R-11, Puri, 16/11/2026). Especificar tal cual.
- A-55, solo ANO-024 (RAREZA, BAJA), el espacio inicial: ACCIDENTAL (propuesta §1.2, R-20, Marga). Especificar
  tal cual.

Tests: pruebas/caracterizacion/02-calculo.test.js (bloques RN-11 a RN-15); 04-alta-factura.test.js (RN-16);
09-anomalias.test.js («ANO-023», «ANO-061», «ANO-062», «ANO-066», «ANO-024», «ANO-035/ANO-036»). Golden master:
GM-03, GM-04, GM-05 y GM-06.

Fuera de alcance: el redondeo, el IVA y el recargo con que se recalcula la línea rebajada (spec 001); la cuota de
remesa que recibe el descuento (spec 008, A-24); la presentación del precio impreso (spec 010).
```

### 3.3 Spec 003 · Numeración legal y conservación de las facturas

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE de la numeración legal y de la conservación de
las facturas de GesFact 2.4. No es una feature nueva: es la especificación formal de lo que el sistema YA hace,
para que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción.
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.
- No se copian valores de config.js a la spec (credenciales y clave de la gestoría).

Alcance (evidencia: lib/numeracion.js :3-42; db.js:52 y :77-81; búsqueda de DELETE en el repositorio, sin
resultados, 16/11/2026):
- RN-26. Formato SERIE-AAAA-NNNNNN con 6 cifras rellenas de ceros. Ejemplo: con el contador FA/2026 en 108, la
  siguiente factura es FA-2026-000109; con RE/2026 en 1, la siguiente rectificativa es RE-2026-000002. Si se pasa
  de 999.999, el número sale con 7 cifras sin aviso.
- RN-27. Contador independiente por serie (FA, RE) y año, que se crea solo y empieza en 1. Ejemplo: la primera
  rectificativa de 2027 es RE-2027-000001.
- RN-28. El año del número es el del reloj del equipo al emitir, no el de la fecha de la factura. Ejemplo: la
  remesa de diciembre de 2026 lanzada el 01/01/2027 graba facturas con fecha 31/12/2026 y número FA-2027-000001.
- RN-29. El número se consume al asignarse (lectura y escritura del contador sin transacción); si la grabación
  falla, queda un hueco. Ejemplo: un fallo al grabar deja el contador en 109 sin FA-2026-000109, y la siguiente
  factura es la 000110.
- RN-30. Las facturas y las líneas no se borran nunca. Un error se corrige con una rectificativa y una factura
  nueva. Ejemplo (semilla): FA-2026-000106 se anula con RE-2026-000001 y se sustituye por FA-2026-000107.
- Convención que posee esta spec (contradicción 02): el número debería llevar el año de la fecha de la factura
  (acta simulada, pregunta 2, Puri, 16/11/2026), sin renumerar nada ya emitido.

Anomalías (clasificación supuesta; tratamiento):
- A-03 (ANO-002; BUG, ALTA): BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 2; propuesta §1.2, R-03,
  Marga). Especificar tal cual. En modernización se corregiría al empezar un ejercicio, coordinado con la gestoría
  y sin retroactividad.
- A-04 (ANO-001; RIESGO, ALTA): BUG HISTÓRICO CON DEPENDIENTES por el duplicado del 02/01/2021 (propuesta §1.2,
  R-01, Marga; H-14). Especificar tal cual: dos emisiones entrelazadas reciben el mismo número; al abrir el año a
  la vez, la segunda falla por la clave primaria. Corregir sin renumerar.
- A-07 (regla protegida RN-30): INTENCIONAL (acta simulada, pregunta 9, Paco). Especificar tal cual.
- A-08 (regla protegida RN-26 y RN-27): INTENCIONAL (acta simulada, preguntas 2 y 9). Especificar tal cual,
  incluido el paso a 7 cifras.
- A-14 (ANO-029, RIESGO, MEDIA; ANO-055, RAREZA, BAJA): BUG A SECAS (propuesta §1.2, R-04, Marga). Especificar tal
  cual: la ruta de la BD es relativa al directorio de arranque; desde otra carpeta se crea una BD nueva cuyos
  contadores repiten números.
- A-64, solo ANO-074 (RAREZA, BAJA): BUG A SECAS latente. Especificar tal cual: un contador en 0 da
  «FA-2026-000000» y uno en −5, «FA-2026-0000-5».
- Se referencian sin especificar: A-05 (huecos por el alta sin transacción, spec 004) y A-13 (concurrencia sobre
  SQLite, excluida de las specs).

Tests: pruebas/caracterizacion/03-numeracion.test.js (bloques RN-26 a RN-29); 11-codigo-fuente.test.js (RN-30 y
«ANO-001 / ANO-004 · Sin transacciones»); 09-anomalias.test.js («ANO-001», dos tests; «ANO-002»; «ANO-003», el
contador sin factura; «ANO-029»; «ANO-074»); 10-contradicciones.test.js (contradicción 02). Golden master: los 12
casos fijan el número asignado y los contadores finales.

Fuera de alcance: el alta y su grabación sin transacción (spec 004); la rectificación (spec 005); la remesa
(spec 008); el año del fichero de la gestoría (spec 009).
```

### 3.4 Spec 004 · Emisión de la factura manual

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE de la emisión de una factura manual desde el
formulario «Nueva factura» de GesFact 2.4. No es una feature nueva: es la especificación formal de lo que el
sistema YA hace, para que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción.
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe. Los
  importes se comparan céntimo a céntimo.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.
- Los mensajes de error visibles se especifican literalmente: forman parte del comportamiento observable.

Alcance (evidencia: routes/facturas.js POST /facturas/nueva :42-102; views/factura_nueva.ejs;
public/js/factura.js; lib/util.js hoy :9-15):
- RN-17. Solo se factura una fila si tiene descripción; las demás se descartan sin aviso, aunque tengan precio. El
  formulario tiene 6 filas fijas, con la cantidad rellena a 1. Ejemplo: «Portes» 1 × 6,00 y una fila sin
  descripción de 1 × 50,00 → base 6,00 €.
- RN-18. Sin ninguna fila con descripción → «La factura no tiene lineas» (error 400) y no se consume número.
- RN-19. Lectura de lo tecleado: solo la primera coma pasa a punto y se lee hasta el primer carácter no numérico.
  «1,5» → 1,5; «1.234,50» → 1,234; «12abc» → 12; un campo vacío → NaN.
- RN-20. Se admiten cantidades y precios cero, negativos o con cualquier número de decimales. Ejemplo: −5 × 10,00 al
  21 % → base −50,00, IVA −10,50, total −60,50 € en serie FA, consumiendo número.
- RN-21. Se factura el precio y el IVA del formulario, no los del catálogo (el autorrelleno solo sugiere). Ejemplo:
  «Café en grano natural 1kg» (11,95 €) cambiado a 11,00 € → se factura a 11,00 €. La pantalla ofrece 21, 10 y 4 %;
  el servidor acepta cualquier entero.
- RN-22. La fecha es la tecleada, sin comprobar; si está vacía, la de hoy. Ejemplo: el 16/11/2026, con fecha
  15/12/2025 → número FA-2026-…, que entra en el IVA del 4T de 2025 y en el fichero de 2025.
- RN-23. Se puede facturar a cualquier cliente que exista; el servidor no mira activo. Ejemplo: un cliente con
  activo = 0 recibe una factura con una petición directa.
- RN-25. Toda factura manual es de la serie FA y nace «emitida». No se envía a nadie (correo desactivado desde
  2022). Ejemplo: con el contador en 108 → FA-2026-000109, emitida.
- RN-52. «Hoy» es la fecha local del equipo. Ejemplo: el 16/11/2026 a las 00:30 en Madrid, hoy = 2026-11-16.
- Grabación: cabecera y líneas en sentencias separadas, sin transacción (A-05).

Anomalías (clasificación supuesta; tratamiento):
- A-05 (ANO-003 y ANO-004; RIESGO, ALTA): BUG HISTÓRICO CON DEPENDIENTES (propuesta §1.2, R-02, Marga; H-21).
  Especificar tal cual: si falla la cabecera, el contador queda consumido sin factura; si fallan las líneas, queda
  la cabecera sin líneas y error 500. En modernización, transacción única; los huecos existentes se justifican con
  la gestoría.
- A-16 (ANO-032, RIESGO, ALTA; ANO-068, RAREZA, MEDIA): BUG A SECAS latente (acta simulada, pregunta 19, Marga).
  Especificar tal cual: «1.234,50» en el precio → 1,234 y una factura de 1,49 €.
- A-20 (ANO-064; RIESGO, ALTA): BUG A SECAS (acta simulada, pregunta 22, Marga). Especificar tal cual; en
  modernización, avisar en lugar de descartar.
- A-27 (ANO-045; RIESGO, MEDIA): BUG A SECAS (propuesta §1.2, R-06, Marga). Especificar tal cual: dos envíos
  entrelazados del mismo formulario graban dos facturas.
- A-28 (RN-20; ANO-003, parte NaN; ANO-040, parte tipo): las líneas negativas son un uso real de la oficina para
  abonos parciales (acta simulada, pregunta 13, Marga); el NaN y el texto no numérico, BUG A SECAS. Especificar
  tal cual los negativos; corregir el NaN en modernización. Ejemplo: precio vacío → base, IVA y total NaN en el
  INSERT de la cabecera.
- A-31 (ANO-049; RIESGO, ALTA): el formato AAAA-MM-DD es INTENCIONAL desde 2018; la falta de validación, BUG A
  SECAS (propuesta §1.2, R-02). Especificar tal cual: «2026-1-5» se graba así y se imprime «5/1/2026».
- A-63, solo ANO-072 (RAREZA, BAJA): BUG A SECAS (propuesta §1.2, R-22, Marga). Especificar tal cual: una factura
  con fecha «2026-02-30» se graba así y vence el 01/04/2026.
- A-67 (ANO-078; RIESGO, ALTA): BUG A SECAS latente (propuesta §1.2, R-24, Marga). Especificar tal cual: si llegan
  menos cantidades o tipos que descripciones, la línea sobrante va con NaN; si falta un tipo en medio, los tipos se
  desplazan una línea.
- Se referencian, especificadas en otras specs:
  - A-19 por ANO-031 (alta a un cliente de baja). Pertenece a la spec 008 y la convención está en la 011.
  - A-23 (abono con líneas negativas frente a la rectificativa espejo), spec 005.
  - A-38 (el servidor acepta cualquier tipo de IVA), spec 001.
  - A-64 por ANO-073 (precio «1e400» → total Infinity), spec 010.
  - A-46 (envío por correo desactivado), excluida de las specs.

Tests: pruebas/caracterizacion/04-alta-factura.test.js (bloques RN-16 a RN-25); 01-util.test.js (RN-52);
09-anomalias.test.js («ANO-003», dos tests; «ANO-004»; «ANO-031»; «ANO-032»; «ANO-040»; «ANO-045»; «ANO-049»;
«ANO-064»; «ANO-072»; «ANO-073»; «ANO-078», dos tests); 10-contradicciones.test.js (contradicciones 08, 10 y 13).
Golden master: GM-01 a GM-10 (camino A completo). Sin test: la lectura HTTP real del formulario (body-parser),
que es cobertura pendiente de pruebas/LEEME.md.

Fuera de alcance: el cálculo de importes (spec 001) y el descuento (spec 002); el número (spec 003); el
vencimiento (spec 006); la rectificación (spec 005); la factura impresa (spec 010); el fichero de clientes y
artículos (spec 011).
```

### 3.5 Spec 005 · Rectificación y abonos

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE de la rectificación de facturas y de los abonos
de GesFact 2.4. No es una feature nueva: es la especificación formal de lo que el sistema YA hace, para que sirva
de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción; la semilla de db.js no es oráculo (ANO-013).
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe. Los
  importes se comparan céntimo a céntimo.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.

Alcance (evidencia: routes/facturas.js POST /facturas/:id/rectificar :124-164):
- RN-33. Solo se rectifica entera (abono total) una factura FA que no esté ya rectificada. Ejemplos: rectificar
  RE-2026-000001 → «No se rectifica una rectificativa»; rectificar FA-2026-000106 → «Ya esta rectificada». Se
  admite una factura cobrada.
- RN-34. La rectificativa es el espejo exacto de la original y no recalcula nada:
  - la cabecera copia la base, el IVA, el recargo y el total de la CABECERA original con el signo cambiado;
  - cada línea copia la cantidad, la base, la cuota de IVA y el recargo en negativo, el precio en positivo, el
    mismo tipo y la descripción precedida de «Rectificación: ».
  Ejemplo (RE-2026-000001): cabecera −101,61 / −20,62 / 0,00 / −122,23. La línea «Rectificación: Café en grano
  natural 1kg» lleva cantidad −0,97, precio 11,95, base −11,61 e IVA −1,16. Copia el IVA de cabecera de 20,62 €,
  aunque las líneas de la original suman 20,06 €.
- RN-35. Fecha de hoy, sin vencimiento, serie RE del año en curso. Observaciones: «Rectifica <número>. <motivo>»,
  con el motivo opcional. Ejemplos: una factura del 31/03/2026 rectificada el 06/04/2026 suma en el 1T y resta en
  el 2T; sin motivo → «Rectifica FA-2026-000106. ».
- RN-31, transición a «rectificada»: la original, emitida o cobrada, pasa a «rectificada» y no vuelve atrás. La
  máquina de estados completa está en la spec 006.
- Convención que posee esta spec (contradicción 13): un abono devuelve lo que se cobró de verdad, con el descuento
  y los redondeos de la original (acta simulada, pregunta 13, Puri, 16/11/2026). Hoy los abonos parciales se hacen
  con una FA de cantidades negativas (acta simulada, pregunta 13, Marga), que se recalcula.

Anomalías (clasificación supuesta; tratamiento):
- A-10 (regla protegida RN-34): INTENCIONAL (acta simulada, pregunta 7, Puri). Especificar tal cual. Si un día se
  recalcula cuando la original estaba mal, será en modernización y sin retroactividad.
- A-11 (RN-35): INTENCIONAL, porque la rectificativa va en el periodo en que se emite (acta simulada, pregunta 8,
  Puri). Especificar tal cual.
- A-23 (ANO-071; RAREZA, ALTA): BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 13). Especificar tal cual
  las dos formas. Ejemplo (contradicción 13, caso A): base bruta 1.814,80 € con un 2 % de descuento; anular con
  líneas negativas da −2.083,91 € frente a los 2.042,11 € cobrados, 41,80 € de más.
- A-25 (ANO-005; BUG, ALTA): BUG A SECAS (propuesta §1.2, R-06, Marga). Especificar tal cual:
  - rectificar una factura sin líneas deja la petición sin respuesta, con la RE grabada y la original «emitida»;
  - los errores al grabar las líneas de la RE se ignoran y la original pasa igualmente a «rectificada».
- A-26 (ANO-044; RIESGO, ALTA): BUG A SECAS (R-06). Especificar tal cual: dos rectificaciones entrelazadas graban
  dos RE con el mismo número.
- A-39, solo ANO-006 (RAREZA, BAJA) y ANO-034 (RAREZA, MEDIA):
  - ANO-006 es INTENCIONAL: se puede rectificar una cobrada (acta simulada, pregunta 25, Marga y Puri);
  - ANO-034 es BUG A SECAS: no queda rastro del cobro.
  Especificar tal cual el servidor.
- A-55, solo ANO-038 (RAREZA, BAJA): ACCIDENTAL (R-20). Especificar tal cual el texto «Rectifica X. » sin motivo.
- A-65 (ANO-075; RAREZA, BAJA): ACCIDENTAL. Especificar tal cual: rectificar una factura sin recargo envía recargo
  −0 en la cabecera y en cada línea. Lo que guarda SQLite está sin verificar.
- Se referencian: A-51 (la RE se imprime con el título «FACTURA», spec 010); A-01 (compensación en el informe de
  IVA, spec 009); A-03 (año del número RE, spec 003).

Tests: pruebas/caracterizacion/05-cobro-rectificacion.test.js (bloques RN-31, RN-33, RN-34 y RN-35);
09-anomalias.test.js («ANO-005», dos tests; «ANO-006»; «ANO-034»; «ANO-038»; «ANO-044»; «ANO-075»);
10-contradicciones.test.js (contradicciones 13 y 14). Golden master: GM-11 y GM-12 (camino C).

Fuera de alcance: el alta con líneas negativas como camino (spec 004); el cobro y la máquina de estados completa
(spec 006); la numeración RE (spec 003); la factura impresa (spec 010); el informe de IVA y el CSV (spec 009).
```

### 3.6 Spec 006 · Vencimientos y estado de cobro

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE de los vencimientos, los estados de cobro y el
«pendiente de cobro» de GesFact 2.4. No es una feature nueva: es la especificación formal de lo que el sistema YA
hace, para que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción.
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe. Las fechas
  se prueban con TZ=Europe/Madrid (SUPOSICIÓN, P-12).
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.
- No se copian valores de config.js salvo el plazo por defecto, que no es secreto.

Alcance (evidencia: routes/facturas.js :68-69 y :117-122; lib/util.js sumarDias :17-26; config.js:39-40;
server.js:23-25; views/index.ejs; db.js:61):
- RN-24. Vencimiento = fecha de la factura + días de pago del cliente; si no los tiene, o los tiene a 0,
  VENCIMIENTO_DIAS (30). Son días naturales, sin ajustes de fin de mes ni festivos. Ejemplos:
  - FA-2026-000101: 31/01/2026 + 30 → 02/03/2026;
  - FA-2026-000103 (Hotel Vega Baja, 60 días): 20/02/2026 → 21/04/2026;
  - 31/12/2026 + 30 → 30/01/2027;
  - 28/02/2028 + 1 → 29/02/2028.
- RN-31. Estados emitida, cobrada y rectificada. Transiciones: (nueva) → emitida; emitida → cobrada; emitida o
  cobrada, en serie FA → rectificada. No hay vuelta atrás.
- RN-32. Cobro de todo o nada, sin fecha, importe ni forma. Solo cambia si estaba emitida; si no, no hace nada y no
  avisa. El servidor también deja marcar cobrada una RE. Ejemplo: FA-2026-000108 (emitida, 154,24 €) → cobrada;
  repetirlo no cambia nada.
- Convenciones que posee esta spec (SUPOSICIÓN):
  - contradicción 04: «pendiente de cobro» es el importe de las FA emitidas y una RE no está pendiente (acta
    simulada, pregunta 25, Marga, 16/11/2026);
  - contradicción 05: el plazo por defecto es el de config.js, 30 días, y el contado debería vencer el mismo día
    (acta simulada, pregunta 27, Marga);
  - contradicción 14, cobrar: una RE no se cobra (acta simulada, pregunta 25).

Anomalías (clasificación supuesta; tratamiento):
- A-39, solo ANO-033 (RAREZA, BAJA): ACCIDENTAL (acta simulada, pregunta 25). Especificar tal cual el servidor: marca
  «cobrada» una rectificativa y no avisa si la factura no existe. La pantalla solo ofrece el botón en FA emitidas
  (spec 010).
- A-41 (ANO-021; RAREZA, BAJA): ACCIDENTAL (acta simulada, pregunta 25). Especificar tal cual las cuatro
  definiciones: número de emitidas de cualquier serie, importe de FA emitidas, listado de emitidas y condición del
  botón. Ejemplo (semilla): el panel dice «3 facturas» y «3032.85 €»; el listado de emitidas, 4 filas que suman
  2.910,62 €. Corregir el número en modernización.
- A-47 (ANO-012 y ANO-041; RAREZA, BAJA): ANO-012 (la remesa usa 30 escrito en el código) es ACCIDENTAL; ANO-041
  (el contado, días de pago 0, vence a 30 días) es BUG A SECAS (acta simulada, pregunta 27). Especificar tal cual.
  La divergencia de la remesa se especifica en la spec 008 y se referencia aquí.
- A-48 (ANO-030; RIESGO, BAJA): BUG A SECAS latente (propuesta §1.2, R-16, Marga). Especificar tal cual con
  Europe/Madrid. sumarDias lee la fecha como medianoche UTC y escribe en hora local: en zonas al oeste de UTC el
  vencimiento sale un día antes (contradicción 12, §3).
- Se referencian: A-63 por ANO-072 (desbordamiento de sumarDias con fechas imposibles, spec 004); RN-35 (la
  rectificativa sin vencimiento, spec 005).

Tests: pruebas/caracterizacion/01-util.test.js (RN-24, sumarDias); 04-alta-factura.test.js (RN-24);
05-cobro-rectificacion.test.js (RN-31 y RN-32); 09-anomalias.test.js («ANO-033», «ANO-041»);
10-contradicciones.test.js (contradicciones 05, 12 y 14). Golden master: los vencimientos de GM-01 a GM-10. Sin
test: el panel de server.js (A-41), que es cobertura pendiente de pruebas/LEEME.md. Los criterios de A-41 deben
indicar que se verificarán con pruebas HTTP cuando se puedan ejecutar.

Fuera de alcance: la rectificación (spec 005); la remesa y su vencimiento a 30 fijos (spec 008); la presentación
de los botones y del panel (spec 010); los días de pago de la ficha del cliente (spec 011).
```

### 3.7 Spec 007 · Contratos de cuota: alta, baja, vigencia y prorrateo comercial

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE de los contratos de cuota mensual de GesFact 2.4
(alta, baja, vigencia y prorrateo «a lo comercial» del último mes). No es una feature nueva: es la especificación
formal de lo que el sistema YA hace, para que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción.
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.

Alcance (evidencia: routes/contratos.js :12-42; views/contratos.ejs; services/calculo.js calcularProrrateo
:90-102):
- RN-36. Al dar de baja un contrato, el último mes vale cuota / 30 × días, del día 1 al de la baja ambos incluidos,
  con un máximo de 30 días. Se divide antes de multiplicar y se redondea al final. Ejemplos (90 €): baja el
  15/03/2026 → 45,00 €; el 30/03 o el 31/03 → 90,00 €; el 01/03 → 3,00 €. Con 145 €: baja el 07/03/2026 → 33,83 €.
- RN-37. Solo se mira el número del día, no el mes. Ejemplos (90 €): baja el 28/02/2026 → 84,00 €; el 29/02/2028 →
  87,00 €. Del 20/01/2026 al 05/02/2026 → 0,00 € sin aviso (desde la pantalla no ocurre).
- RN-38. El prorrateo no se factura solo: la pantalla lo pone en la barra de direcciones para que la oficina
  emita la factura a mano. Ejemplo (145 €, baja el 07/03/2026): la pantalla indica 33,83 € y la remesa de marzo
  emite además 32,74 € de base.
- Alta de contrato: la cuota se lee con la misma regla que en el formulario de factura y el tipo de IVA es 21 por
  defecto (escrito en el código y como DEFAULT del esquema; contradicción 06, D2 y D3).
- Baja de contrato: se acepta cualquier fecha, o hoy si está vacía, sin comprobarla contra el alta ni contra la
  fecha actual. Una segunda baja sobrescribe la primera.
- El día de alta y el de baja se cobran los dos (propuesta §1.2, R-25, Marga y Paco, 16/11/2026).
- Convenciones que posee esta spec (SUPOSICIÓN):
  - contradicción 01: las cuotas se prorratean a 30 días, como hacía Paco en el Access (acta simulada, pregunta 14,
    Paco, 16/11/2026). La remesa usa días reales: es A-17, en la spec 008;
  - contradicción 11: un contrato está vigente en un mes si el alta es como muy tarde el último día del mes y no
    tiene baja, o la baja es el día 1 o posterior. La pantalla usa otro criterio (A-30).

Anomalías (clasificación supuesta; tratamiento):
- A-18 (ANO-008, RIESGO, ALTA; ANO-022, RAREZA, MEDIA): BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 15,
  Marga). Especificar tal cual. Ejemplo: cuota de 90 € con baja el 15/03/2026 → la pantalla indica facturar 45,00 €
  y la remesa de marzo cobra además 43,55 €: 88,55 € por medio mes. Corregir sin retroactividad; los cobros dobles
  se abonan con rectificativa por decisión del negocio.
- A-29 (ANO-042, RIESGO, MEDIA; ANO-053, RAREZA, BAJA): BUG A SECAS (propuesta §1.2, R-07, Marga). Especificar tal
  cual:
  - con alta el 20/03 y baja el 10/03, la remesa emite una FA de −31,62 € y la pantalla indica 30,00;
  - una segunda baja sobrescribe la primera;
  - una baja tecleada «15/03/2026» da un prorrateo «NaN».
- A-30 (ANO-070; RAREZA, MEDIA): BUG HISTÓRICO CON DEPENDIENTES, junto con A-18 (acta simulada, pregunta 21, Marga).
  Especificar tal cual la remesa: con baja el 15/12/2026, la remesa de noviembre factura el mes completo y la
  pantalla ya muestra el contrato como de baja. Corregir la pantalla en modernización.
- A-35 (ANO-043; BUG, ALTA): BUG HISTÓRICO CON DEPENDIENTES (propuesta §1.2, R-10, Paco: en el Access, la baja el
  último día de febrero cobraba la cuota entera). Especificar tal cual; se decide junto con A-17.
- Se referencian:
  - A-17: prorrateo por días reales en la remesa, spec 008;
  - A-19: la baja de un cliente no toca sus contratos. Pertenece a la spec 008 y la convención está en la 011;
  - A-38: tipos de IVA, spec 001;
  - A-40: el prorrateo se muestra con toFixed(2) en la URL, spec 010.

Tests: pruebas/caracterizacion/02-calculo.test.js (RN-36 y RN-37); 06-contratos-y-maestros.test.js (RN-36 en
pantalla, RN-38 y altas de contratos); 09-anomalias.test.js («ANO-008», «ANO-042», «ANO-043», «ANO-053»,
«ANO-070»); 10-contradicciones.test.js (contradicciones 01 y 11). Golden master: no la cubre.

Fuera de alcance: la facturación mensual de los contratos (spec 008); el cálculo de la factura del último mes
cuando se emite a mano (specs 001 y 004); la ficha del cliente (spec 011).
```

### 3.8 Spec 008 · Remesa mensual de cuotas

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE de la remesa mensual de cuotas de contratos de
GesFact 2.4 (scripts/remesa_mensual.js). No es una feature nueva: es la especificación formal de lo que el sistema
YA hace, para que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción.
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test), que ejecuta el script real en un proceso
  hijo, y citan el test cuando existe. Los importes se comparan céntimo a céntimo.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.
- Ninguna prueba ni ejemplo puede ejecutar la remesa sobre datos/gesfact.db: el script ESCRIBE en la BD.

Alcance (evidencia: scripts/remesa_mensual.js :1-84; lib/util.js diasDelMes :35-39):
- RN-39. Entra cada contrato dado de alta como muy tarde el último día del mes y sin baja, o con baja el día 1 del
  mes o posterior. Entran también los contratos de clientes de baja. No se comprueba si el mes ya está facturado.
  El orden es el que devuelve la BD. Ejemplo (semilla, remesa 2026-02): entran los contratos 1, 2 y 4; el 3 no
  (baja el 15/09/2025). Un contrato con baja el 01/03/2026 entra en marzo con 1 día.
- RN-40. Mes completo → cuota entera. Si el alta o la baja caen dentro del mes → cuota / días reales del mes ×
  días de servicio, ambos extremos incluidos, redondeado. Ejemplos (entre paréntesis, lo que daría el prorrateo a
  lo comercial):
  - contrato 4, 90 €, alta el 15/02/2026 → 14/28 → 45,00 € (42,00);
  - contrato 2, 145 €, alta el 15/01/2023 → 17/31 → 79,52 € (82,17);
  - contrato 3, 60 €, junio y septiembre de 2025 → 30,00 € cada mes;
  - baja el día 30 de un mes de 31, con 145 € → 140,32 € (145,00);
  - 90 € con alta el 15/02/2028 → 15/29 → 46,55 € (45,00).
- RN-41. La cuota es una línea de cantidad 1 que pasa por el cálculo normal: recargo, y descuento si pasa de
  1.000 €. Ejemplos: contrato 4 en febrero de 2026 → 45,00 + IVA 9,45 = 54,45 €; una cuota de 1.200 € → 1.176,00 €,
  total 1.422,96 €.
- RN-42. Una FA por contrato y mes, con una línea:
  - fecha: el último día del mes;
  - vencimiento: + días de pago del cliente o 30 escritos en el código;
  - línea: «<concepto> (<mes> <año>)» o «<concepto> (<N> dias)»;
  - observaciones: «Remesa <mes> <año>», sin aviso de descuento.
  Ejemplo (remesa 2026-02, contrato 1): «Alquiler máquina de café Futurmat F3 (febrero 2026)», fecha 28/02/2026,
  vencimiento 30/03/2026, «Remesa febrero 2026». Contrato 4: «… (14 dias)».
- RN-43. Solo se comprueba la forma AAAA-MM. Ejemplo: «2026-13» → fecha «2026-13-31» y observaciones «Remesa
  undefined 2026».
- El número de cada factura sigue la spec 003. Diciembre lanzado el 1 de enero recibe número del año siguiente
  (A-03, referenciada).

Anomalías (clasificación supuesta; tratamiento):
- A-06 (ANO-009, RIESGO, ALTA; ANO-010, RIESGO, MEDIA): BUG A SECAS (acta simulada, pregunta 11, Marga; propuesta
  §1.2, R-08). Especificar tal cual: relanzar el mismo mes vuelve a facturar; si falla una línea, el script sale
  con código 1 y deja la cabecera grabada. Corregir sin impedir las remesas legítimas de meses atrasados.
- A-17 (ANO-007; RAREZA, ALTA): en la remesa, BUG HISTÓRICO CON DEPENDIENTES. La convención de 30 días está en la
  spec 007 (acta simulada, pregunta 14, Paco). Especificar tal cual los días reales; unificar en modernización sin
  retroactividad.
- A-19 (ANO-011, RAREZA, MEDIA; ANO-031, RAREZA, BAJA): BUG A SECAS (acta simulada, pregunta 20, Marga). Especificar
  tal cual: la remesa no filtra clientes.activo. La convención está en la spec 011. Corregir sin quitar la
  posibilidad de rectificar a clientes de baja.
- A-24 (ANO-035; RAREZA, ALTA): BUG A SECAS latente; las cuotas no deberían llevar descuento (acta simulada,
  pregunta 18, Paco). Especificar tal cual: una cuota de 1.200 € se factura a 1.176 €.
- A-32 (ANO-048; BUG, MEDIA): BUG A SECAS (R-08). Especificar tal cual: acepta un mes futuro (2030-05) y lo numera
  con el año del reloj.
- A-54 (ANO-037; RAREZA, BAJA): ACCIDENTAL (propuesta §1.2, R-19). Especificar el orden observado: sin ORDER BY.
  El orden real sobre SQLite queda pendiente de D-30.
- A-55, solo ANO-036 y ANO-065 (RAREZA, BAJA): ACCIDENTAL (R-20). Especificar tal cual: la remesa no lleva aviso de
  descuento, y la línea de un mes parcial dice «(14 dias)» sin indicar el mes.
- A-63, solo ANO-077 (RAREZA, BAJA): BUG A SECAS. Especificar tal cual: la remesa «2026-13» da vencimiento
  «NaN-NaN-NaN» y la línea «(undefined 2026)».
- Se referencian:
  - A-03: año del número, spec 003;
  - A-47 por ANO-012: 30 días fijos frente a config.js, spec 006;
  - A-18 y A-30: doble cobro del último mes y baja futura, spec 007;
  - ANO-039: la forma de las facturas de remesa de la semilla no coincide con la que genera el script. Es un dato,
    no una regla (A-15, excluida).

Tests: pruebas/caracterizacion/07-remesa.test.js (bloques RN-39 a RN-43); 09-anomalias.test.js («ANO-009»,
«ANO-010», «ANO-011», «ANO-035/ANO-036», «ANO-037», «ANO-039», «ANO-048», «ANO-065», «ANO-077»);
10-contradicciones.test.js (contradicciones 01, 02, 05, 10 y 11). Golden master: no la cubre; el camino B tiene su
propia batería en 07-remesa. Sin test: los filtros WHERE y el orden reales de SQLite (cobertura pendiente).

Fuera de alcance: la vigencia, la baja y el prorrateo comercial de los contratos (spec 007); el cálculo de
importes y el descuento (specs 001 y 002); la numeración (spec 003); el vencimiento por defecto (spec 006); la
ficha del cliente (spec 011).
```

### 3.9 Spec 009 · Entregables para la gestoría: resumen de IVA y fichero contable

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE de los entregables para la gestoría de GesFact
2.4: el resumen trimestral de IVA y el fichero CSV anual para Contaplus. No es una feature nueva: es la
especificación formal de lo que el sistema YA hace, para que sirva de contrato en la modernización. El formato del
fichero es un contrato con un tercero.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción ni un CSV real recibido por la gestoría (D-07): los ejemplos salen de la semilla, que
  NO es oráculo (ANO-013).
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe. El fichero
  se compara byte a byte.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.
- La clave de exportación de config.js NUNCA se copia a la spec ni a los tests.

Alcance (evidencia: routes/informes.js :9-51; views/informe_iva.ejs; views/informes.ejs):
- RN-44. El resumen trimestral suma base, cuota de IVA y recargo DESDE LAS LÍNEAS de todas las facturas, FA y RE en
  cualquier estado, cuya fecha cae en el trimestre (1T 01/01–31/03, 2T, 3T, 4T). Agrupa por tipo, de mayor a menor.
  Ejemplo (semilla, 1T de 2026):
  - 21 %: 2.533,30 / 532,00 / 6,01;
  - 10 %: 392,20 / 39,22 / 0,00;
  - 4 %: 811,10 / 32,44 / 0,76;
  - total: 3.736,60 / 603,66 / 6,77.
  Las cabeceras de esas facturas suman 3.688,85 de base y 736,97 de IVA.
- RN-45. La rectificada sigue sumando y la rectificativa resta: se anulan si caen en el mismo trimestre. Ejemplo
  (2T de 2026): FA-2026-000106 y RE-2026-000001 se anulan, y quedan 21 %: 194,15 / 40,77 y 10 %: 35,51 / 3,55.
- RN-46. Sin año → el año en curso. Sin trimestre, o con 0 o no numérico → 1T sin aviso; 5 o más → error. El menú
  solo enlaza el año en curso. Ejemplo: el 15/01/2027 no hay enlace al 4T de 2026.
- RN-47. La fila de totales se suma en la vista sin redondear. Ejemplo: 40,769999999999996 se muestra «40,77»; una
  suma que debería ser cero puede mostrarse «-0,00».
- RN-48. El fichero de un año incluye todas las facturas, de las dos series y en cualquier estado, cuya fecha es de
  ese año. Lleva los importes de la CABECERA y el estado, y se ordena por número como texto (todas las FA y después
  las RE). Ejemplo: FA-2026-000101 a 000108 y después RE-2026-000001. Las facturas FA-2027-… con fecha 31/12/2026
  salen en el fichero de 2026, entre las FA-2026 y las RE-2026.
- RN-49. Formato:
  - primera línea: «CLAVE;» seguida de la clave (no se reproduce);
  - cabecera: NUMERO;FECHA;CLIENTE;NIF;BASE;IVA;RECARGO;TOTAL;ESTADO;
  - separador «;», sin comillas ni escape; fecha dd/mm/aaaa; importes con punto de miles y coma decimal; NIF vacío
    si no hay;
  - nombre y NIF actuales del cliente;
  - fin de línea CRLF, sin salto tras la última; UTF-8 sin BOM; nombre del fichero facturas_AAAA.csv.
  Ejemplo:
  «FA-2026-000101;31/01/2026;Cafetería La Parada, S.C.;J45771102;133,20;27,97;0,00;161,17;cobrada» y
  «RE-2026-000001;06/05/2026;Bar Nuevo Siglo;70355910k;-101,61;-20,62;0,00;-122,23;emitida».
  El formato de los importes del fichero se fija aquí con valores concretos, independiente de la spec 010.
- Convención que posee esta spec (contradicción 03): la cifra oficial del IVA del 303 es la suma por líneas de la
  pantalla, y nadie la cruza con Contaplus (acta simulada, preguntas 1 y 1 bis, Puri simulada por el responsable
  del proyecto, 16/11/2026, testimonio simulado). Las dos implementaciones están en esta spec.

Anomalías (clasificación supuesta; tratamiento):
- A-01 (ANO-014; RIESGO, ALTA): BUG HISTÓRICO CON DEPENDIENTES, si D-01 encuentra descuadres en producción (acta
  simulada, preguntas 1 y 1 bis). Especificar tal cual las dos salidas. Ejemplo: 1T de 2026, la pantalla da
  603,66 € de IVA y el CSV 736,97 € (diferencia de 133,31 €). En modernización, aviso de descuadre sin cambiar
  ninguna fórmula.
- A-09 (regla protegida RN-48 y RN-49): INTENCIONAL (acta simulada, pregunta 10, Puri). Especificar tal cual, byte a
  byte. No se cambia el orden, el separador, el fin de línea ni la codificación sin probarlo antes con la gestoría.
- A-52 (ANO-015; RIESGO, MEDIA): BUG A SECAS latente (propuesta §1.2, R-17, Puri). Especificar tal cual: un nombre
  con «;», comillas o salto de línea se copia sin escapar. Corregir solo con Puri.
- A-53 (ANO-026 y ANO-063; RAREZA, BAJA): ACCIDENTAL (R-18). Especificar tal cual; corregir el menú.
- A-66 (ANO-076; RAREZA, BAJA): ACCIDENTAL (R-23, Puri). Especificar tal cual:
  - el año «26» da el periodo «26-04-01»..«26-06-31» y el filtro del CSV «26-%»;
  - «2026abc» se lee como 2026 y «abc» como el año en curso;
  - el trimestre «-1» lanza un TypeError, igual que el 5.
- Se referencian:
  - A-03: facturas FA-2027 con fecha de 2026, spec 003;
  - A-11: la RE resta en el periodo en que se emite, spec 005;
  - A-31: los filtros comparan texto, spec 004;
  - A-40: totales sin redondear, spec 010;
  - A-50: nombre y NIF actuales, spec 010.

Tests: pruebas/caracterizacion/08-informes.test.js (bloques RN-44, RN-46, RN-48 y RN-49); 09-anomalias.test.js
(«ANO-014», «ANO-015», «ANO-026/ANO-063», «ANO-076»); 10-contradicciones.test.js (contradicción 03). Golden
master: la línea del CSV de cada uno de los 12 casos. Sin test: RN-45, RN-47 y las sumas reales de SQLite
(cobertura pendiente de pruebas/LEEME.md). Los criterios de esas reglas deben indicar que se verificarán sobre
una BD temporal.

Fuera de alcance: cómo se calculan los importes de cada línea y cabecera (specs 001 y 002); la numeración (spec
003); la rectificación (spec 005); el formato de importes y fechas en pantalla e impresión (spec 010).
```

### 3.10 Spec 010 · Documento de factura y formatos de presentación

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE del documento de factura (impreso o reimpreso) y
de los formatos con que GesFact 2.4 muestra importes y fechas. No es una feature nueva: es la especificación formal
de lo que el sistema YA hace, para que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción.
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe. Las vistas
  EJS no se ejecutan en la red actual: los criterios de RN-54 (leyenda) y RN-55 deben indicar que se verificarán
  renderizando las vistas (cobertura pendiente de pruebas/LEEME.md).
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.

Alcance (evidencia: views/factura_detalle.ejs; routes/facturas.js detalle :104-112; lib/util.js formatearImporte
:50-58 y fechaBonita :28-33; toFixed(2) en views/index.ejs:6, views/articulos.ejs:8, views/contratos.ejs:8 y
routes/contratos.js:40):
- RN-50. Importes en documentos: dos decimales, coma decimal, punto de miles y signo menos delante. Vacío, nulo o no
  numérico → «0,00». El redondeo es el de toFixed, no el del cálculo. Ejemplos: 1234,5 → «1.234,50»; −101,61 →
  «-101,61»; NaN → «0,00»; 2,675 → «2,67» (el cálculo da 2,68); −0,001 → «-0,00».
- Pantallas internas (contradicción 08, E2 y E3): el panel, los artículos, los contratos y la URL del prorrateo usan
  toFixed(2), con punto decimal y sin miles («1234.50»); el autorrelleno copia el precio tal cual («21.6»).
- RN-51. Las fechas se guardan como AAAA-MM-DD y se muestran DD/MM/AAAA, reordenando las partes sin comprobarlas.
  Ejemplos: «2026-01-31» → «31/01/2026»; vacía → vacía; «31/12/2026» guardada así → «undefined/undefined/31/12/2026».
- RN-54. Al imprimir o reimprimir se usan los datos ACTUALES del cliente y de la empresa. La leyenda «Cliente en
  régimen de recargo de equivalencia» depende de la marca actual del cliente. Ejemplo: si a Ferretería El Tornillo
  se le quitara la marca, al reimprimir FA-2026-000102 desaparecería la leyenda aunque la factura lleve recargo.
- RN-55. Contenido impreso:
  - título «FACTURA» + número, también en las RE, que añaden «Rectifica a: <número>»;
  - el vencimiento solo si existe;
  - las cantidades con punto decimal;
  - la columna de recargo en blanco en las líneas sin recargo, y la fila de recargo solo si es distinta de cero;
  - las observaciones y el dato registral;
  - los botones de cobrar y rectificar, solo en FA emitidas.
  Ejemplo: «FACTURA RE-2026-000001», «Rectifica a: FA-2026-000106», sin vencimiento, cantidad «-0.97», sin fila de
  recargo.
- Convención que posee esta spec (contradicción 08): en los documentos que reciben el cliente y la gestoría, los
  importes se escriben «1.234,50».

Anomalías (clasificación supuesta; tratamiento):
- A-40 (ANO-060; RAREZA, BAJA): ACCIDENTAL (acta simulada, pregunta 24, Marga: precios siempre con dos decimales).
  Especificar tal cual las diferencias entre toFixed y redondear2 (contradicción 07).
- A-42 (ANO-069; RAREZA, BAJA): ACCIDENTAL (propuesta §1.2, R-13, Puri; acta simulada, pregunta 26). Especificar tal
  cual los criterios de la leyenda (si la ficha actual tiene la marca) y de la fila de recargo (si la factura tiene
  recargo). Se decide junto con A-50.
- A-50 (ANO-019; RIESGO, MEDIA): BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 26, Puri: debería salir con
  los datos de la emisión). Especificar tal cual. Si se cambia, solo para las facturas nuevas.
- A-51 (ANO-020; RAREZA, MEDIA): BUG HISTÓRICO CON DEPENDIENTES (acta simulada, pregunta 26, Puri: debería decir
  «FACTURA RECTIFICATIVA»). Especificar tal cual; corregir sin retroactividad.
- A-64, solo ANO-073 (RAREZA, BAJA): BUG A SECAS latente. Especificar tal cual: formatearImporte(Infinity) da
  «Infinity,undefined» y 1e21 da «1e+21,undefined».
- Se referencian: A-16 (la lectura de importes tecleados, spec 004); A-39 (los botones frente a lo que permite el
  servidor, specs 005 y 006).

Tests: pruebas/caracterizacion/01-util.test.js (bloques RN-50 y RN-51); 05-cobro-rectificacion.test.js (RN-54,
parte de servidor: el detalle lee los datos actuales del cliente); 09-anomalias.test.js («ANO-060», «ANO-073»);
10-contradicciones.test.js (contradicciones 07, 08 y 09). Golden master: fechas y líneas formateadas para imprimir
en los 12 casos.

Fuera de alcance: el cálculo de los importes (spec 001); el formato del fichero de la gestoría, que se fija aparte
(spec 009); las reglas de cobro y rectificación detrás de los botones (specs 005 y 006).
```

### 3.11 Spec 011 · Fichero de clientes y catálogo de artículos

```text
Spec de ingeniería inversa: documenta el comportamiento EXISTENTE del fichero de clientes y del catálogo de
artículos de GesFact 2.4. No es una feature nueva: es la especificación formal de lo que el sistema YA hace, para
que sirva de contrato en la modernización.

Reglas de la spec:
- Cada requisito y criterio describe el comportamiento ACTUAL con su evidencia (fichero y función, o dato real).
  No hay datos de producción.
- Las anomalías NO se corrigen ni se omiten: se especifican tal cual funcionan hoy, citadas por su ID del registro.
- Los criterios de aceptación se verifican contra pruebas/ (node --test) y citan el test cuando existe.
- Toda decisión de negocio se cita por su acta (documento, pregunta, persona, fecha). Todas son SUPOSICIÓN.
- No se copian datos personales reales: los ejemplos usan la semilla de db.js.

Alcance (evidencia: routes/clientes.js; routes/articulos.js; views/clientes.ejs; views/articulos.ejs; lib/util.js
validarNIF :41-48; db.js:24-37):
- RN-53. El NIF es opcional. Si se informa, se acepta con 9 caracteres después de quitar espacios y guiones, sin
  comprobar letra ni formato, y se guarda tal como se tecleó. Ejemplos: «B-4581-2390» se acepta y se guarda con
  guiones; «ABCDEFGHI» se acepta; «12345678» se rechaza; la semilla tiene «70355910k» en minúscula.
- Alta de cliente: la marca de recargo de equivalencia se graba como 1 o 0 y los días de pago pueden quedar
  vacíos. No hay pantalla para modificar un cliente (P-07).
- Baja de cliente: pone activo = 0 y no toca sus contratos.
- Listado de clientes: la columna «R.E.» muestra «SÍ» con cualquier valor verdadero (contradicción 09, I3).
- Alta de artículo: el desplegable ofrece 21, 10 y 4 %. IVA_DEFECTO (21) solo se usaría con una petición sin
  tipo, inalcanzable desde la pantalla (contradicción 06, D1). El precio se lee con la misma regla que el
  formulario de factura. El precio del catálogo solo es una sugerencia al facturar.
- Convención que posee esta spec (contradicción 10): solo los clientes activos son facturables, y dar de baja a un
  cliente debería dar de baja sus contratos (acta simulada, pregunta 20, Marga, 16/11/2026). Hoy no es así: la
  remesa factura a clientes de baja (A-19, spec 008) y el alta del servidor admite cualquier cliente (ANO-031,
  spec 004).

Anomalías (clasificación supuesta; tratamiento):
- A-49 (ANO-018; RIESGO, MEDIA): INTENCIONAL provisional; Marga comprueba la letra a ojo (acta simulada, pregunta
  28, Marga). Especificar tal cual; en modernización, validar solo los NIF nuevos, sin reescribir los guardados.
- Se referencian: A-19 (spec 008); A-38 (tipos de IVA, spec 001); A-42 (leyenda impresa de recargo, spec 010).

Tests: pruebas/caracterizacion/01-util.test.js (RN-53); 06-contratos-y-maestros.test.js (RN-53 en el alta de
cliente; altas de artículos con la lectura de importes y el tipo por defecto); 09-anomalias.test.js («ANO-018»);
10-contradicciones.test.js (contradicciones 06, 09 y 10). Golden master: no la cubre.

Fuera de alcance: cómo influye la marca de recargo en el cálculo (spec 001); el uso de los días de pago en el
vencimiento (spec 006); la facturación a clientes de baja (specs 004 y 008); los contratos (spec 007).
```

---

## 4. Tabla resumen

| Spec | Reglas | Anomalías propias (clasif. supuesta) | Dueño (SUPOSICIÓN) | Tests (`pruebas/caracterizacion/`) | Golden master |
|---|---|---|---|---|---|
| 001 Cálculo de importes | RN-01 a RN-10 | A-02 (INT), A-37 (BHD), A-38 (INT/ACC) | Puri | 01, 02, 09, 10 (C06, C07, C09) | Sí: GM-01, 02, 07, 10 |
| 002 Descuento por volumen | RN-11 a RN-16 | A-21 (INT), A-22 (INT), A-33 (INT), A-36 (INT), A-55·ANO-024 (ACC) | Paco | 02, 04, 09 | Sí: GM-03 a 06 |
| 003 Numeración y conservación | RN-26 a RN-30 | A-03 (BHD), A-04 (BHD), A-07 (INT), A-08 (INT), A-14 (BAS), A-64·ANO-074 (BAS) | Puri, con Paco | 03, 09, 10 (C02), 11 | En parte: contadores de los 12 casos |
| 004 Emisión de la factura manual | RN-17 a RN-23, RN-25, RN-52 | A-05 (BHD), A-16 (BAS), A-20 (BAS), A-27 (BAS), A-28 (uso/BAS), A-31 (INT/BAS), A-63·ANO-072 (BAS), A-67 (BAS) | Marga | 01, 04, 09, 10 (C08, C10, C13) | Sí: GM-01 a 10 |
| 005 Rectificación y abonos | RN-33 a RN-35 (y la transición de RN-31) | A-10 (INT), A-11 (INT), A-23 (BHD), A-25 (BAS), A-26 (BAS), A-39·ANO-006/034 (INT/BAS), A-55·ANO-038 (ACC), A-65 (ACC) | Puri | 05, 09, 10 (C13, C14) | Sí: GM-11, 12 |
| 006 Vencimientos y cobro | RN-24, RN-31, RN-32 | A-39·ANO-033 (ACC), A-41 (ACC), A-47 (ACC/BAS), A-48 (BAS) | Marga | 01, 04, 05, 09, 10 (C05, C12, C14) | En parte: vencimientos |
| 007 Contratos de cuota | RN-36 a RN-38 | A-18 (BHD), A-29 (BAS), A-30 (BHD), A-35 (BHD) | Paco, con Marga | 02, 06, 09, 10 (C01, C11) | No |
| 008 Remesa mensual | RN-39 a RN-43 | A-06 (BAS), A-17 (BHD), A-19 (BAS), A-24 (BAS), A-32 (BAS), A-54 (ACC), A-55·ANO-036/065 (ACC), A-63·ANO-077 (BAS) | Marga | 07, 09, 10 (C01, C02, C05, C10, C11) | No (batería propia `07-remesa`) |
| 009 Entregables para la gestoría | RN-44 a RN-49 | A-01 (BHD condicionado), A-09 (INT), A-52 (BAS), A-53 (ACC), A-66 (ACC) | Puri | 08, 09, 10 (C03) | En parte: línea del CSV |
| 010 Documento y formatos | RN-50, RN-51, RN-54, RN-55 | A-40 (ACC), A-42 (ACC), A-50 (BHD), A-51 (BHD), A-64·ANO-073 (BAS) | Puri, con Marga | 01, 05, 09, 10 (C07, C08, C09) | En parte: presentación |
| 011 Clientes y catálogo | RN-53 | A-49 (INT provisional) | Marga | 01, 06, 09, 10 (C06, C09, C10) | No |
| Excluidas (§2.7) | — | A-12, A-13, A-15, A-34, A-43 a A-46, A-56 a A-62 | — | — | — |

Abreviaturas de la clasificación supuesta: INT = INTENCIONAL; ACC = ACCIDENTAL; BHD = BUG HISTÓRICO CON
DEPENDIENTES; BAS = BUG A SECAS. Todas son SUPOSICIÓN (apartado 0).

---

## 5. Siguientes pasos (sin ejecutar)

1. **Revisar y aprobar esta propuesta.** Con la constitución, cada spec debe pasar las puertas de calidad (a) a (c)
   antes de aprobarse. La puerta (b) obliga a que la SUPOSICIÓN de las clasificaciones quede visible en cada spec,
   y las descripciones del apartado 3 ya la marcan.
2. **Orden de lanzamiento recomendado**, por impacto (registro §0.6) y por dependencias:
   1. 001, 003 y 009, que tienen las reglas protegidas de nivel A y la gestoría como tercero;
   2. 005;
   3. 002 y 004;
   4. 006, 007 y 008;
   5. 010 y 011.
3. **Antes de lanzar cada spec**, confirmar con su dueño real las respuestas del apartado 1 que le afectan. Si
   alguna cambia, hay que actualizar su clasificación y su tratamiento en la descripción del apartado 3. El
   comportamiento especificado no cambia.
4. Mientras tanto, el registro de anomalías sigue con **67 entradas PENDIENTES**, y la entrevista real y la copia
   fechada de la BD siguen siendo la condición para cerrarlas.
