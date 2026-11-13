# Mapa del sistema — GesFact 2.4 (Suministros Hidalgo S.L.)

| Campo | Valor |
|---|---|
| Fecha de elaboración | 13/11/2026 |
| Versión del código analizada | commit `1f35d01` (rama `master`) |
| Alcance | Todos los ficheros versionados salvo `.specify/` y `.claude/` (herramientas de trabajo, no forman parte del sistema) |
| Fuentes | Lectura completa del código; cálculo en memoria de la semilla de `db.js` con `services/calculo.js` (ver apéndice A) |
| Datos reales consultados | **Ninguno.** No existe `datos/gesfact.db` en la copia de trabajo (comprobado el 13/11/2026) y no se ha tocado la BD de producción |

**Convenciones.** Toda afirmación lleva su evidencia como `fichero:líneas`. Lo que no tiene evidencia se marca
**SUPOSICIÓN** y remite a una pregunta del apartado 7. Los hallazgos se citan con un identificador
`ANO-NNN` **propuesto** (apartado 6): todavía no existe el registro de anomalías y deben pasarse a él.
No se corrige nada (Principio III de la constitución).

---

## 1. Visión de negocio en una página

GesFact sirve para que la oficina de Suministros Hidalgo **emita, imprima, cobre y rectifique facturas**,
**facture cada mes las cuotas de alquileres y mantenimientos** y **entregue a la gestoría** el resumen de
IVA y el listado de facturas. Los procesos y los módulos que los soportan son:

| Proceso de negocio | Quién lo dispara | Módulos implicados |
|---|---|---|
| Emitir una factura a mano | Oficina, pantalla «Nueva factura» | `views/factura_nueva.ejs` → `routes/facturas.js` → `services/calculo.js`, `lib/numeracion.js`, `db.js` |
| Imprimir o pasar a PDF y enviar la factura | Oficina; envío a mano desde Outlook (`services/email.js:3-5`) | `views/factura_detalle.ejs`, `config.js` (datos de empresa), `public/css/estilos.css` |
| Marcar una factura como cobrada | Oficina | `routes/facturas.js:117-122` |
| Anular una factura (rectificativa espejo) | Oficina | `routes/facturas.js:129-164`, `lib/numeracion.js` |
| Facturar las cuotas del mes | Marga, a mano, el día 1 (`scripts/remesa_mensual.js:5-7`; `views/index.ejs:9-10`) | `scripts/remesa_mensual.js` → `services/calculo.js`, `lib/numeracion.js`, `db.js` |
| Dar de baja un contrato y saber cuánto cobrar del último mes | Oficina | `routes/contratos.js:31-43` → `services/calculo.js:95-102` |
| Preparar el IVA trimestral (modelo 303) | Gestoría, a partir del informe (`routes/informes.js:13`) | `routes/informes.js:14-30`, `views/informe_iva.ejs` |
| Pasar las facturas del año al Contaplus de la gestoría | Oficina → gestoría | `routes/informes.js:34-51` |
| Mantener clientes, artículos y contratos | Oficina | `routes/clientes.js`, `routes/articulos.js`, `routes/contratos.js` |

---

## 2. Fichas por módulo

### 2.0 Resumen de criticidad

| Criticidad | Módulos |
|---|---|
| **ALTA** | `services/calculo.js`, `lib/numeracion.js`, `db.js`, `config.js`, `lib/util.js`, `routes/facturas.js`, `routes/informes.js`, `scripts/remesa_mensual.js`, `views/factura_detalle.ejs`, `views/informe_iva.ejs` |
| **MEDIA** | `server.js`, `routes/clientes.js`, `routes/contratos.js`, `views/factura_nueva.ejs`, `package.json` + `package-lock.json` |
| **BAJA** | `routes/articulos.js`, `services/email.js`, `public/js/factura.js`, `public/css/estilos.css`, resto de vistas, `LEEME.txt`, `datos/migracion_mysql_2018.sql` |

### 2.1 `services/calculo.js` — núcleo fiscal

- **Responsabilidad**: calcula los importes de cada factura (base, IVA, recargo de equivalencia, descuento
  por volumen y total) y el importe proporcional de una cuota mensual cuando el servicio no cubre el mes
  entero.
- **Depende de**: `lib/util.js` (`redondear2`) — `services/calculo.js:9`.
- **Dependen de él**: `routes/facturas.js:9,66`; `routes/contratos.js:7,39`; `scripts/remesa_mensual.js:11,55`.
- **Criticidad: ALTA.** Determina cada céntimo de cada factura, manual o de remesa. El redondeo línea a
  línea es un contrato explícito con la gestoría: cuando se cambió en mayo de 2019, la gestoría devolvió el
  trimestre entero (`services/calculo.js:3-6`).
- **Comportamiento relevante**:
  - Redondeo de base, cuota de IVA y recargo **por línea** (`services/calculo.js:26-34`).
  - Recargo de equivalencia: 5,2 % / 1,4 % / 0,5 % para IVA 21/10/4, y tipos antiguos 18/16 → 4 % y 8/7 → 1 %
    (`services/calculo.js:12-23`). Solo se aplica si el cliente tiene `recargo_equivalencia == 1`
    (`services/calculo.js:49`).
  - Descuento por volumen sobre la base bruta: >5000 → 5 %, >1000 → 2 %, **estrictamente mayor**
    (`services/calculo.js:39-43`). Se aplica redondeando el **precio unitario** de cada línea y recalculando
    (`services/calculo.js:63-84`). El comentario dice «a partir de 1.000» (`services/calculo.js:37`) → ANO-023.
  - Prorrateo «a lo comercial»: mes de 30 días, el día 31 no se cobra (`services/calculo.js:90-102`). Solo
    lo usa la pantalla de baja de contratos; la remesa prorratea de otra forma → ANO-007.
  - `recargoPara`, `calcularLinea` y `porcentajeDescuento` se exportan (`services/calculo.js:104-110`) pero
    fuera del módulo solo se usan `calcularFactura` y `calcularProrrateo` (búsqueda en todo el repositorio,
    13/11/2026).

### 2.2 `lib/numeracion.js` — numeración legal

- **Responsabilidad**: asigna a cada factura y rectificativa su número correlativo, sin huecos, por serie y
  año (`FA-2026-000123`), como exige la normativa.
- **Depende de**: `db.js` (tabla `contadores`) — `lib/numeracion.js:12`.
- **Dependen de él**: `routes/facturas.js:10,71,138`; `scripts/remesa_mensual.js:12,57`.
- **Criticidad: ALTA.** La correlatividad es una obligación legal, revisada en una inspección en 2020
  (`lib/numeracion.js:3-6`). Ya hubo un número duplicado en enero de 2021 (`lib/numeracion.js:8-10`).
- **Comportamiento relevante**:
  - Lee `ultimo` y después escribe `ultimo + 1` en dos operaciones separadas, sin transacción
    (`lib/numeracion.js:16-35`) → ANO-001.
  - El año sale del reloj del ordenador, no de la fecha de la factura (`lib/numeracion.js:15`) → ANO-002.
  - Si no hay contador para el año, lo crea a cero (`lib/numeracion.js:18-23`).
  - Formato: serie, año y número rellenado con ceros a 6 cifras (`lib/numeracion.js:38-42`).

### 2.3 `db.js` — base de datos

- **Responsabilidad**: guarda y da acceso a toda la información del negocio (clientes, artículos,
  contratos, facturas y sus líneas, contadores) y, si la base está vacía, la crea con los datos históricos
  de referencia.
- **Depende de**: `config.js` (`RUTA_BD`) — `db.js:9,11-15`; paquete `sqlite3` — `db.js:8`; `fs` y `path` de
  Node — `db.js:6-7`.
- **Dependen de él**: `server.js:11,44`; `lib/numeracion.js:12`; todas las rutas (`routes/clientes.js:5`,
  `routes/articulos.js:5`, `routes/contratos.js:5`, `routes/facturas.js:7`, `routes/informes.js:5`);
  `scripts/remesa_mensual.js:9,23`.
- **Criticidad: ALTA.** Es el único almacén de facturas emitidas, que no se borran nunca
  (`lib/numeracion.js:4-6`). Exporta directamente la conexión (`db.js:183`), así que cualquier módulo puede
  escribir en cualquier tabla.
- **Comportamiento relevante**:
  - Abre (y crea si no existe la carpeta) la BD **al cargar el módulo**, no al llamar a una función
    (`db.js:11-15`). Basta un `require` de `db.js`, `lib/numeracion.js` o cualquier ruta para abrir la BD.
  - Esquema en `db.js:19-81`. Importes en `REAL` (coma flotante) — `db.js:57-60,69-74`. Fechas como texto
    `YYYY-MM-DD` — `db.js:47`. El número de factura **no** es `UNIQUE` (`db.js:52`) → ANO-001.
  - Estados de factura: `emitida` / `cobrada` / `rectificada` (`db.js:61`).
  - La factura no guarda copia de los datos fiscales del cliente; solo `cliente_id` (`db.js:50-63`) → ANO-019.
  - Semilla: se carga solo si `clientes` está vacía (`db.js:83-87`); 6 clientes, 8 artículos, 4 contratos,
    9 facturas y contadores `FA/2026 = 108` y `RE/2026 = 1` (`db.js:93-181`). **Varias facturas de la
    semilla no cuadran** consigo mismas ni con el código actual → ANO-013.

### 2.4 `config.js` — configuración

- **Responsabilidad**: fija los datos de la empresa que aparecen en las facturas, dónde está la base de
  datos, el IVA y el plazo de pago por defecto y las claves de correo y de la gestoría.
- **Depende de**: nada.
- **Dependen de él**: `db.js:9`; `server.js:12,49`; `routes/articulos.js:6,16`; `routes/facturas.js:12,68,111`;
  `routes/informes.js:7,40`; `services/email.js:9`.
- **Criticidad: ALTA.** Los datos de empresa se imprimen en cada factura (`views/factura_detalle.ejs:5-7,43`),
  la clave de exportación es exigida por la gestoría (`config.js:36-37`) y la ruta de la BD decide qué datos
  se usan (`config.js:20`). Se copia a mano al servidor de la oficina (`config.js:2-3`).
- **Comportamiento relevante**:
  - `RUTA_BD` es relativa al directorio desde el que se arranca (`config.js:20`, `db.js:11-15`) → ANO-029.
  - Contiene credenciales y la clave de la gestoría **en claro** en un fichero versionado (`config.js:29-37`)
    → ANO-016. Este documento no reproduce esos valores.
  - `SMTP` solo se usa en código comentado (`services/email.js:13-18`); `IVA_DEFECTO` no se usa nunca en la
    práctica (ver 2.11). Ver «Zonas oscuras».

### 2.5 `lib/util.js` — utilidades heredadas del Access

- **Responsabilidad**: redondea importes, calcula fechas de vencimiento, da formato español a fechas e
  importes y hace una comprobación mínima del NIF.
- **Depende de**: nada.
- **Dependen de él**: `services/calculo.js:9`; `routes/clientes.js:6`; `routes/contratos.js:6`;
  `routes/facturas.js:8`; `routes/informes.js:6`; `scripts/remesa_mensual.js:10`; y las vistas a las que se
  pasa como `util` (`routes/contratos.js:12`, `routes/facturas.js:25,111`, `routes/informes.js:28`).
- **Criticidad: ALTA.** `redondear2` está debajo de cada importe (`lib/util.js:5-7`), `sumarDias` fija el
  vencimiento de cada factura (`lib/util.js:20-26`) y `formatearImporte` define el formato del CSV que se
  entrega a la gestoría (`lib/util.js:51-58`, `routes/informes.js:44-45`). El autor avisa de que viene del
  Access y hay que tener cuidado (`lib/util.js:2`).
- **Comportamiento relevante**:
  - `redondear2` = `Math.round(x*100)/100`: con coma flotante, `1.005` da `1` y `0.285` da `0.28`
    (comprobado el 13/11/2026, apéndice A) → ANO-025.
  - `sumarDias` interpreta la fecha en UTC y la devuelve en hora local (`lib/util.js:21-25`). Con la zona
    `Europe/Madrid` no se ha reproducido el desfase de un día de marzo de 2019 (`lib/util.js:18-19`) → ANO-030.
  - `diasDelMes` (`lib/util.js:36-39`) solo lo usa la remesa.
  - `validarNIF` solo comprueba que haya 9 caracteres (`lib/util.js:41-48`) → ANO-018.

### 2.6 `routes/facturas.js` — ciclo de vida de la factura

- **Responsabilidad**: lista las facturas, emite facturas nuevas, muestra la factura imprimible, la marca
  como cobrada y la anula con una rectificativa.
- **Depende de**: `express` (`routes/facturas.js:5`), `db.js`, `lib/util.js`, `services/calculo.js`,
  `lib/numeracion.js`, `services/email.js`, `config.js` (`routes/facturas.js:7-12`); vistas `facturas`,
  `factura_nueva`, `factura_detalle` (`routes/facturas.js:25,35,111`).
- **Dependen de él**: `server.js:41` (montado en `/facturas`).
- **Criticidad: ALTA.** Es el único punto por el que la oficina emite y rectifica facturas.
- **Comportamiento relevante**:
  - Alta (`routes/facturas.js:42-102`): toma las filas del formulario con descripción
    (`routes/facturas.js:50-63`), calcula (`:66`), vencimiento = días del cliente o `VENCIMIENTO_DIAS`
    (`:68-69`), reserva el número (`:71`), graba la cabecera (`:74-79`) y después las líneas una a una sin
    transacción (`:81-98`) → ANO-003, ANO-004. Llama al servicio de correo, que no envía nada (`:93-95`).
  - El precio y el IVA de cada línea son los que llegan del formulario, no los del catálogo
    (`routes/facturas.js:59-61`).
  - No comprueba que el cliente esté activo (`routes/facturas.js:46-47`) → ANO-031.
  - Detalle (`routes/facturas.js:105-114`): une con los datos **actuales** del cliente y de la empresa → ANO-019.
  - Cobro (`routes/facturas.js:117-122`): solo pasa de `emitida` a `cobrada`; no guarda fecha de cobro.
  - Rectificación (`routes/facturas.js:129-164`): rectificativa `RE` con importes y líneas en negativo, sin
    recalcular (`:127-128,142,150`), y la original pasa a `rectificada` (`:154`). Ignora errores al grabar
    líneas y al marcar la original (`:151,154`) y se queda colgada si la factura no tiene líneas
    (`:147-148`) → ANO-005. Admite rectificar facturas cobradas si se llama directamente (`:132-133`) → ANO-006.

### 2.7 `routes/informes.js` — entregables para la gestoría

- **Responsabilidad**: da a la gestoría el resumen trimestral de IVA repercutido por tipo y el fichero anual
  de facturas para importarlo en su contabilidad.
- **Depende de**: `express`, `db.js`, `lib/util.js`, `config.js` (`routes/informes.js:3-7`); vistas
  `informes`, `informe_iva` (`routes/informes.js:10,28`).
- **Dependen de él**: `server.js:42`; la gestoría (tercero), que espera el formato del CSV
  (`routes/informes.js:32-33`).
- **Criticidad: ALTA.** Alimenta el modelo 303 (`routes/informes.js:13`; `views/informe_iva.ejs:16`) y un
  intercambio de ficheros con un tercero cuyo formato no se puede cambiar.
- **Comportamiento relevante**:
  - IVA: suma **desde las líneas**, todas las facturas del trimestre sea cual sea su estado; las
    rectificativas restan por signo (`routes/informes.js:21-25`). Rango hasta el día «31» de todos los
    trimestres, válido porque compara texto (`routes/informes.js:18-19`). Trimestre por defecto 1; fuera de
    1-4 da error (`routes/informes.js:16-18`) → ANO-026.
  - CSV: suma **desde las cabeceras** (`routes/informes.js:36-38`); primera línea `CLAVE;…`
    (`:40`), separador `;`, fechas `dd/mm/aaaa`, importes `1.234,50` (`:43-45`), fin de línea CRLF y UTF-8
    (`:47-49`), orden alfabético por número (FA y RE mezcladas, `:38`). No escapa el `;` dentro de los nombres
    → ANO-015. Si una cabecera no cuadra con sus líneas, el informe de IVA y el CSV dan cifras distintas →
    ANO-014.

### 2.8 `scripts/remesa_mensual.js` — facturación de cuotas

- **Responsabilidad**: emite de golpe las facturas del mes de todos los contratos de alquiler y
  mantenimiento vigentes, prorrateando altas y bajas a mitad de mes.
- **Depende de**: `db.js`, `lib/util.js`, `services/calculo.js`, `lib/numeracion.js`
  (`scripts/remesa_mensual.js:9-12`). No depende de `server.js`: es un proceso aparte.
- **Dependen de él**: nadie en el código. Lo lanza Marga a mano el día 1 (`scripts/remesa_mensual.js:5-7`;
  recordatorio en `views/index.ejs:9-10`).
- **Criticidad: ALTA.** Emite facturas reales todos los meses y escribe en la BD sin pasar por la web.
- **Comportamiento relevante**:
  - Contratos con alta ≤ último día y baja nula o ≥ primer día (`scripts/remesa_mensual.js:26-29`); no
    filtra clientes dados de baja → ANO-011.
  - Prorratea por **días reales del mes** (`scripts/remesa_mensual.js:43-51`), distinto de
    `calcularProrrateo` → ANO-007. Incluye el mes de la baja → ANO-008.
  - Pasa la cuota por `calcularFactura`, así que también aplica recargo y descuento por volumen
    (`scripts/remesa_mensual.js:54-55`).
  - Fecha de factura = último día del mes facturado (`:59`), pero el número toma el año del reloj → ANO-002.
  - Vencimiento con 30 días fijos si el cliente no tiene días de pago (`:60`), no con `VENCIMIENTO_DIAS` →
    ANO-012.
  - No comprueba si el mes ya se facturó → ANO-009. Ante un error termina el proceso con la remesa a medias
    (`:58,64,70`) → ANO-010.

### 2.9 `server.js` — arranque de la aplicación web

- **Responsabilidad**: pone en marcha el programa en el puesto de la oficina, muestra el panel de inicio con
  cuatro cifras y da acceso a cada pantalla.
- **Depende de**: `express`, `body-parser` (`server.js:9-10`), `db.js`, `config.js` (`server.js:11-12`),
  `ejs` como motor de vistas (`server.js:16`, sin `require` explícito), los cinco routers (`server.js:38-42`),
  carpeta `public/` (`server.js:18`), vista `index` (`server.js:26`).
- **Dependen de él**: nadie en el código; se arranca con `node server.js` (`package.json:7`; `LEEME.txt:8`).
- **Criticidad: MEDIA.** Su lógica propia es solo el panel informativo (`server.js:20-36`), pero es el punto
  único de arranque: si falla la inicialización de la BD, sale del proceso (`server.js:44-48`).
- **Comportamiento relevante**: el panel cuenta como «pendientes de cobro» también las rectificativas
  emitidas y suma el importe solo de la serie `FA`; ignora los errores de BD (`server.js:22-31`) → ANO-021.
  No hay autenticación (`server.js:16-18,38-42`) → ANO-017.

### 2.10 `routes/clientes.js` — fichero de clientes

- **Responsabilidad**: da de alta y de baja a los clientes con los datos que salen en la factura y las dos
  condiciones que cambian sus importes y plazos: si están en recargo de equivalencia y sus días de pago.
- **Depende de**: `express`, `db.js`, `lib/util.js` (`routes/clientes.js:3-6`); vista `clientes`
  (`routes/clientes.js:11`).
- **Dependen de él**: `server.js:38`. Indirectamente, toda factura lee `recargo_equivalencia` y `dias_pago`
  (`services/calculo.js:49`; `routes/facturas.js:68`; `scripts/remesa_mensual.js:26,55,60`).
- **Criticidad: MEDIA.** No calcula ni numera, pero una marca de recargo mal puesta cambia los importes de
  todas las facturas del cliente. El alta es poco frecuente y la revisa Marga (`routes/clientes.js:16`;
  `lib/util.js:42-43`).
- **Comportamiento relevante**: nombre obligatorio; NIF opcional y solo se comprueba su longitud
  (`routes/clientes.js:17-20`) → ANO-018. La baja es lógica (`activo = 0`, `routes/clientes.js:32-37`). No
  hay modificación de clientes (ver «Zonas oscuras»).

### 2.11 `routes/articulos.js` — catálogo

- **Responsabilidad**: mantiene la lista de artículos y servicios con su precio sin IVA y su tipo de IVA,
  que se ofrecen como sugerencia al hacer una factura.
- **Depende de**: `express`, `db.js`, `config.js` (`routes/articulos.js:3-6`); vista `articulos`
  (`routes/articulos.js:11`).
- **Dependen de él**: `server.js:39`. Los artículos activos alimentan el desplegable de la factura nueva
  (`routes/facturas.js:33-35`; `views/factura_nueva.ejs:22-24`).
- **Criticidad: BAJA.** El precio del catálogo solo se copia al formulario como sugerencia
  (`public/js/factura.js:9-10`); el importe que se factura es el que se envía en el formulario
  (`routes/facturas.js:59-61`). La remesa no usa artículos (`scripts/remesa_mensual.js:54`).
- **Comportamiento relevante**: `IVA_DEFECTO` solo se aplicaría si no llega `tipo_iva`
  (`routes/articulos.js:16`), pero el formulario siempre lo envía (`views/articulos.ejs:18`). Baja lógica
  (`routes/articulos.js:26-31`). Sin modificación de precios.

### 2.12 `routes/contratos.js` — contratos de cuota mensual

- **Responsabilidad**: guarda los contratos de alquiler y mantenimiento que se facturan cada mes y, al dar
  uno de baja, calcula cuánto hay que cobrar del último mes.
- **Depende de**: `express`, `db.js`, `lib/util.js`, `services/calculo.js` (`routes/contratos.js:3-7`); vista
  `contratos` (`routes/contratos.js:12`).
- **Dependen de él**: `server.js:40`. Sus datos los consume la remesa (`scripts/remesa_mensual.js:26-29`).
- **Criticidad: MEDIA.** Las fechas de alta y de baja deciden qué factura la remesa, y el importe de
  prorrateo que calcula se factura a mano (`routes/contratos.js:28-30`).
- **Comportamiento relevante**: el importe de prorrateo se devuelve **solo en la URL**
  (`routes/contratos.js:40`); la vista no lo muestra y pide leerlo en la barra de direcciones
  (`routes/contratos.js:12`; `views/contratos.ejs:17`) → ANO-022. La ruta de alta existe
  (`routes/contratos.js:16-26`) pero no hay formulario (`views/contratos.ejs:1-18`) → ver «Zonas oscuras».
  Cualquier error al buscar el contrato se presenta como «no encontrado» (`routes/contratos.js:34`).

### 2.13 `services/email.js` — envío de facturas por correo (desactivado)

- **Responsabilidad**: debería enviar cada factura al cliente por correo; desde 2022 solo deja un aviso en
  la consola de que hay que enviarla a mano.
- **Depende de**: `config.js` (`services/email.js:9`), que solo usa el código comentado
  (`services/email.js:12-25`).
- **Dependen de él**: `routes/facturas.js:11,93`. La remesa y la rectificación no lo llaman.
- **Criticidad: BAJA.** No hace nada que afecte a importes ni a datos (`services/email.js:26-28`). Solo
  importa que siga devolviendo `cb(null)`: el alta de factura espera su respuesta para redirigir
  (`routes/facturas.js:93-95`).
- **Comportamiento relevante**: escribe en la consola el email del cliente (`services/email.js:26-27`).
  Hay que hablar con Manoli antes de reactivarlo (`services/email.js:6`; `config.js:27-28`).

### 2.14 Vistas (`views/`)

| Vista | Responsabilidad de negocio | La usa | Depende de | Criticidad |
|---|---|---|---|---|
| `factura_detalle.ejs` | Es la factura que recibe el cliente: se imprime o se pasa a PDF y se envía a mano (`services/email.js:4-5`; `views/factura_detalle.ejs:46`) | `routes/facturas.js:111` | `cabecera`, `pie`, `util`, `config.EMPRESA` | **ALTA**: documento fiscal; titula «FACTURA» también a las rectificativas (`views/factura_detalle.ejs:10,13`) → ANO-020; cantidades con punto decimal (`:27`) |
| `informe_iva.ejs` | Muestra el IVA trimestral que revisa la gestoría para el 303 (`views/informe_iva.ejs:16`) | `routes/informes.js:28` | `cabecera`, `pie`, `util` | **ALTA**: **los totales se suman en la propia vista** (`views/informe_iva.ejs:5,11-14`) |
| `factura_nueva.ejs` | Formulario de emisión: cliente, fecha, hasta 6 líneas y observaciones (`views/factura_nueva.ejs:6-25`) | `routes/facturas.js:35` | `cabecera`, `pie`, `public/js/factura.js` (`:28`) | **MEDIA**: limita el IVA a 21/10/4 (`:18`); fecha vacía → hoy (`routes/facturas.js:44`) |
| `facturas.ejs` | Listado de facturas con filtro por estado | `routes/facturas.js:25` | `cabecera`, `pie`, `util` | BAJA |
| `clientes.ejs`, `articulos.ejs`, `contratos.ejs` | Listados y altas/bajas de datos maestros | `routes/clientes.js:11`, `routes/articulos.js:11`, `routes/contratos.js:12` | `cabecera`, `pie` (y `util` en contratos) | BAJA |
| `index.ejs` | Panel de inicio y recordatorio de la remesa | `server.js:26` | `cabecera`, `pie` | BAJA: importe con punto decimal (`views/index.ejs:6`) |
| `informes.ejs` | Menú de informes del año en curso | `routes/informes.js:10` | `cabecera`, `pie` | BAJA |
| `cabecera.ejs`, `pie.ejs` | Marco común: menú y pie con el contacto de soporte | todas las vistas (`<%- include %>` en la línea 1 y la última de cada una) | `public/css/estilos.css` (`views/cabecera.ejs:6`) | BAJA: el soporte indicado es Julián (`views/pie.ejs:2`) |

### 2.15 Recursos del navegador (`public/`)

- **`public/js/factura.js`** — **Responsabilidad**: al elegir un artículo en la factura nueva, rellena su
  precio y su IVA. **Depende de** las clases y los identificadores de `views/factura_nueva.ejs:15-23`
  (`.campo-desc`, `#lista-articulos`, `.campo-precio`, `select[name="iva"]`). **Lo usa**
  `views/factura_nueva.ejs:28`. **Criticidad: BAJA**: si falla, se escribe el precio a mano, como antes de
  2021 (`public/js/factura.js:2`). Busca por nombre exacto del artículo (`public/js/factura.js:7`).
- **`public/css/estilos.css`** — **Responsabilidad**: da el aspecto a las pantallas y, al imprimir, oculta
  menús y botones para que la factura salga limpia (`public/css/estilos.css:28`). **Lo usa**
  `views/cabecera.ejs:6`. **Criticidad: BAJA**, aunque la regla de impresión afecta al PDF que recibe el
  cliente.

### 2.16 Ficheros de proyecto

- **`package.json` / `package-lock.json`** — **Responsabilidad**: dicen qué piezas hay que instalar para
  que el programa funcione en un ordenador nuevo (`LEEME.txt:7`). **Criticidad: MEDIA**: no afectan a los
  datos, pero de ellos depende poder reinstalar. La entrada de `sqlite3` en el lockfile está incompleta
  (`package-lock.json:853-855`) → ANO-027. No declaran versión de Node (`package.json:1-17`, sin `engines`).
- **`LEEME.txt`** — **Responsabilidad**: instrucciones de instalación y lista de pendientes para la oficina.
  **Criticidad: BAJA**: desactualizado desde 2019 (`LEEME.txt:20`); la versión de Node que indica
  (`LEEME.txt:5`) no es compatible con el lockfile (apartado 4).
- **`datos/migracion_mysql_2018.sql`** — ver «Zonas oscuras». **Criticidad: BAJA**.

---

## 3. Diagrama de dependencias

### 3.1 Por capas

```
 PUNTOS DE ENTRADA     server.js (web :3000)                     scripts/remesa_mensual.js (CLI, a mano)
                          │  monta (server.js:38-42)                         │
                          ▼                                                  │
 RUTAS         clientes  articulos  contratos  facturas  informes            │
                  │         │          │          │         │                │
                  │         │          │    ┌─────┼─────┐   │                │
                  │         │          │    │     │     │   │                │
                  │         │          ▼    ▼     ▼     ▼   │                ▼
 SERVICIOS        │         │     services/calculo  lib/numeracion  services/email
                  │         │          │                │               │
                  ▼         │          ▼                │               │
 BASE          lib/util ◄───┼──────────┘                ▼               │
                            │                         db.js ◄── (todas las rutas, server.js, remesa)
                            ▼                           │               │
 CONFIG                  config.js ◄────────────────────┴───────────────┘
                                                        │
 EXTERNO        express · body-parser · ejs          sqlite3 ──► fichero ./datos/gesfact.db
```

### 3.2 Lista exacta de aristas (A → B = «A usa B»)

```
server.js                  → express, body-parser, ejs (implícito), db.js, config.js,
                             routes/{clientes,articulos,contratos,facturas,informes}.js,
                             public/, views/index.ejs                              (server.js:9-42)
routes/clientes.js         → express, db.js, lib/util.js, views/clientes.ejs       (routes/clientes.js:3-11)
routes/articulos.js        → express, db.js, config.js, views/articulos.ejs        (routes/articulos.js:3-11)
routes/contratos.js        → express, db.js, lib/util.js, services/calculo.js,
                             views/contratos.ejs                                   (routes/contratos.js:3-12)
routes/facturas.js         → express, db.js, lib/util.js, services/calculo.js,
                             lib/numeracion.js, services/email.js, config.js,
                             views/{facturas,factura_nueva,factura_detalle}.ejs    (routes/facturas.js:5-12,25,35,111)
routes/informes.js         → express, db.js, lib/util.js, config.js,
                             views/{informes,informe_iva}.ejs                      (routes/informes.js:3-10,28)
scripts/remesa_mensual.js  → db.js, lib/util.js, services/calculo.js, lib/numeracion.js
                                                                                   (scripts/remesa_mensual.js:9-12)
services/calculo.js        → lib/util.js                                           (services/calculo.js:9)
lib/numeracion.js          → db.js                                                 (lib/numeracion.js:12)
services/email.js          → config.js (solo en código comentado)                  (services/email.js:9,12-25)
db.js                      → sqlite3, fs, path, config.js                          (db.js:6-9)
lib/util.js, config.js     → (nada)
views/*.ejs                → views/cabecera.ejs, views/pie.ejs
views/cabecera.ejs         → public/css/estilos.css                                 (views/cabecera.ejs:6)
views/factura_nueva.ejs    → public/js/factura.js                                   (views/factura_nueva.ejs:28)
```

**Lectura rápida del diagrama**: `db.js`, `lib/util.js` y `config.js` son la base de la que cuelga todo;
`services/calculo.js` y `lib/numeracion.js` son los dos módulos con lógica fiscal y ambos los comparten la web
y la remesa, que **son dos procesos distintos escribiendo en la misma BD** (ver ANO-001).

---

## 4. Tecnologías y versiones reales

Deducidas del código y de `package.json`/`package-lock.json`, no de `LEEME.txt`.

| Pieza | Versión real | Evidencia | Notas |
|---|---|---|---|
| Express | **4.22.2** (declarada `^4.22.2`) | `package.json:14`; `package-lock.json:273-274` | Motor web y enrutado. Requiere Node ≥ 0.10 (`package-lock.json:311-312`) |
| body-parser | **1.20.5** (declarada `^1.20.5`) | `package.json:12`; `package-lock.json:49-50` | Solo formularios `urlencoded`, `extended: false` (`server.js:17`) |
| EJS | **3.1.10** (declarada `^3.1.10`) | `package.json:13`; `package-lock.json:204-205` | Se carga de forma implícita con `app.set('view engine','ejs')` (`server.js:16`). Arrastra `jake ^10.8.5` (`package-lock.json:210-211`) |
| sqlite3 (driver nativo) | **5.1.7** (declarada `^5.1.7`) | `package.json:15`; `package-lock.json:853-854` | Entrada del lockfile **sin** `resolved`, `integrity` ni dependencias (`package-lock.json:853-855`) → ANO-027 |
| Motor SQLite | **Desconocida** | — | **SUPOSICIÓN**: la que incluya el binario de sqlite3 5.1.7 instalado. Pregunta P-11 |
| Node.js | **Sin determinar en la oficina.** En la máquina de desarrollo, 26.13.0 (`node --version`, 13/11/2026) | `package.json` no tiene `engines` | El código es ES5 puro: sin `=>`, `let`, `const` ni `async` (búsqueda en todos los `.js`, 13/11/2026), así que el código propio no exige una versión concreta; lo que la exige es sqlite3 5.x. TODO(VERSION_NODE) de la constitución. Pregunta P-02 |
| npm | **≥ 7** | `lockfileVersion: 3` (`package-lock.json:4`) | **SUPOSICIÓN** basada en el formato del lockfile: el npm de Node 8 (npm 5/6) genera `lockfileVersion: 1`, así que el lockfile **no** se generó con el Node 8 de `LEEME.txt:5` |
| Módulos de Node | `fs`, `path` | `db.js:6-7` | — |
| Paquetes totales en el lockfile | 77 entradas `node_modules/…` | recuento en `package-lock.json`, 13/11/2026 | — |
| Base de datos | Fichero SQLite en `./datos/gesfact.db`, relativo al directorio de arranque | `config.js:20`; `db.js:11-15` | Importes `REAL`, fechas `TEXT` `YYYY-MM-DD` (`db.js:47,57-60`) |
| Navegador | HTML5 y JavaScript sin librerías; usa `<datalist>`, `<input type="date">`, `NodeList.forEach` y `Element.closest` | `views/factura_nueva.ejs:9,22`; `views/contratos.ejs:12`; `public/js/factura.js:3,8` | Exige un navegador moderno (no Internet Explorer). La factura se pasa a PDF con «Imprimir» del navegador (`views/factura_detalle.ejs:46`; `public/css/estilos.css:28`) |
| Formato de intercambio | CSV `;`, coma decimal, `dd/mm/aaaa`, CRLF, UTF-8 | `routes/informes.js:40-49` | Contrato con la gestoría (`routes/informes.js:32-33`) |
| Tecnologías **retiradas** | Access (GesFact 1.x), ficheros JSON, nodemailer, MySQL | `server.js:7`; `db.js:2-4`; `services/email.js:8`; `datos/migracion_mysql_2018.sql:1-3` | Siguen dejando rastro en el código (tipos de IVA antiguos, comentarios) |
| Herramientas del proyecto (no del sistema) | Spec Kit 1.1.1, scripts PowerShell | `.specify/init-options.json`; `.specify/integration.json:2` | Solo para la documentación |

---

## 5. Zonas oscuras

Todo lo que existe en el proyecto y no encaja en el mapa anterior.

### 5.1 Código muerto

| Elemento | Evidencia | Situación |
|---|---|---|
| Envío por SMTP con nodemailer | `services/email.js:8,12-25` | Comentado; nodemailer «desinstalado en 2023» (`services/email.js:8`) y no está en `package.json:11-16` |
| `config.SMTP` (servidor, usuario y clave) | `config.js:27-34` | Solo lo lee el código comentado anterior. Credenciales en claro sin uso → ANO-016 |
| `config.IVA_DEFECTO` | `config.js:25`; `routes/articulos.js:16` | Inalcanzable desde la pantalla: el desplegable siempre envía un tipo (`views/articulos.ejs:18`). Solo se usaría con una petición hecha a mano |
| Recargos de IVA antiguos 18/16/8/7 | `services/calculo.js:16-21` | Las pantallas solo permiten 21/10/4 (`views/factura_nueva.ejs:18`; `views/articulos.ejs:18`). Se conservan «por si hay que reabrir ejercicios viejos del Access» (`services/calculo.js:16-17`). Alcanzables solo con datos o peticiones fuera de la interfaz (p. ej. `tipo_iva` libre en `routes/contratos.js:20`) |
| Exportaciones sin uso externo | `services/calculo.js:105-107` (`recargoPara`, `calcularLinea`, `porcentajeDescuento`); `lib/numeracion.js:46` (`formatear`) | Se usan dentro de su propio módulo; nadie más las importa |

### 5.2 Ficheros huérfanos

| Fichero | Evidencia | Situación |
|---|---|---|
| `datos/migracion_mysql_2018.sql` | `datos/migracion_mysql_2018.sql:1-5`; `LEEME.txt:12-13` | Nunca se ejecutó; esquema de 2 tablas, sin recargo ni rectificativas. Ningún código lo lee |
| `LEEME.txt` | `LEEME.txt:5,20` | Desactualizado (Node 8, 2019) y en conflicto con el lockfile (apartado 4). Ningún código lo lee |
| Ruta `POST /contratos/nuevo` | `routes/contratos.js:16-26` | Sin formulario en la vista (`views/contratos.ejs:1-18`). **SUPOSICIÓN**: los contratos se dan de alta por otra vía. Pregunta P-07 |

### 5.3 Funcionalidades a medias o ausentes

| Funcionalidad | Evidencia | Situación |
|---|---|---|
| Envío de facturas por email | `services/email.js:3-6`; `LEEME.txt:14` | Roto desde 2022; las facturas se mandan a mano desde el Outlook de Marga |
| Migración a MySQL | `LEEME.txt:12-13`; `db.js:3-4`; `config.js:19` | Abandonada en 2018 |
| Módulo de albaranes | `LEEME.txt:15-16` | No hay ni una línea en el repositorio (búsqueda de «albaran», 13/11/2026). Pregunta P-09 |
| Facturación del prorrateo de baja | `routes/contratos.js:28-30,40`; `views/contratos.ejs:17` | Se calcula pero no se factura: se copia de la URL y se emite a mano → ANO-008, ANO-022 |
| Modificación de datos maestros | `routes/clientes.js`, `routes/articulos.js`, `routes/contratos.js` (solo `GET /`, `POST /nuevo`, `POST /:id/baja`) | No existe edición de clientes, artículos ni contratos. **SUPOSICIÓN**: se corrige directamente en la BD o dando de baja y de alta. Pregunta P-07 |
| Fecha de cobro | `routes/facturas.js:117-122`; `db.js:50-63` | Solo se guarda el estado `cobrada`, no cuándo ni cómo |
| Rectificación parcial | `routes/facturas.js:124-128` | Solo existe el abono total |
| Validación real del NIF | `lib/util.js:41-43` | TODO desde 11/2017 |
| Desfase de vencimiento de marzo de 2019 | `lib/util.js:18-19` | TODO sin resolver → ANO-030 |
| Reparación manual de facturas sin líneas | `routes/facturas.js:81-82` | «ya se apañó en su día a mano en la bd»: hubo al menos una intervención directa sobre datos fiscales, sin registro |

### 5.4 Infraestructura y entorno sin documentar

| Asunto | Evidencia | Situación |
|---|---|---|
| Dónde está la BD de producción | `config.js:2-3,20`; `LEEME.txt:6`; `views/index.ejs:9-10`; `lib/numeracion.js:8-10`; `db.js:2-3` | La ruta es relativa al directorio de arranque, el programa se copia a cada puesto desde `\\SERVIDOR`, la remesa se lanza «desde el ordenador de Marga» y hubo escrituras simultáneas «de Marga y yo». **SUPOSICIÓN**: hay una única BD compartida (en red o en el puesto de Marga). Pregunta P-01 |
| Vistas y estáticos relativos al directorio de arranque | `server.js:16-18` | **SUPOSICIÓN** (comportamiento por defecto de Express 4: `views` = `<cwd>/views`; `express.static('public')` relativo al cwd): arrancar desde otra carpeta no encontraría las vistas. Afecta a la técnica de aislamiento descrita en `CLAUDE.md`. Verificar con un test antes de apoyarse en ella → ANO-029 |
| No hay `.gitignore` | listado de la raíz, 13/11/2026 | Un `git add .` subiría `node_modules/` y, si existiera, `datos/gesfact.db` con datos de clientes → ANO-028 |
| Personas citadas como fuente | Julián (`package.json:9`; `views/pie.ejs:2`), Marga, Roberto, Puri (gestoría, `services/calculo.js:6`), Paco (`services/calculo.js:38,92`), Manoli (`services/email.js:6`) | El pie de página manda llamar a Julián, que según la constitución ya no está. El rol de Paco y Manoli no consta. Pregunta P-08 |
| Semilla en `db.js` como «datos históricos» | `db.js:91-92,122` | No es la salida del código actual (ANO-013). **No debe usarse como resultado esperado de los tests de caracterización sin recalcularla antes** |

---

## 6. Hallazgos para el registro de anomalías (propuestos)

Identificadores **provisionales**: deben trasladarse al registro de anomalías cuando se cree. Ninguno se
corrige en esta fase.

| ID | Tipo | Sev. | Descripción | Evidencia | Impacto estimado |
|---|---|---|---|---|---|
| ANO-001 | RIESGO | ALTA | La numeración lee y escribe el contador en dos pasos sin transacción, y `numero` no es único: dos emisiones simultáneas (dos pestañas, dos puestos o web + remesa) pueden recibir el mismo número | `lib/numeracion.js:8-10,16-35`; `db.js:52`; `scripts/remesa_mensual.js:57` | Facturas duplicadas; incumplimiento legal de correlatividad. Ya ocurrió en enero de 2021 |
| ANO-002 | BUG | ALTA | El año del número sale del reloj, no de la fecha de la factura. La remesa de diciembre, lanzada el 1 de enero, numera `FA-<año siguiente>` con fecha 31/12 del año anterior. Igual con una factura manual con fecha de otro año | `lib/numeracion.js:15`; `scripts/remesa_mensual.js:5-7,59`; `routes/facturas.js:44` | Facturas fuera de su serie anual; posible hueco o desorden en la numeración. Pregunta P-06 |
| ANO-003 | RIESGO | ALTA | El número se reserva antes de grabar la factura; si la grabación falla, el número se pierde. **SUPOSICIÓN**: un precio o una cantidad vacíos en una línea con descripción dan `NaN` (`routes/facturas.js:56-61`) y fallan al grabar; hay que verificarlo con un test sobre una copia | `routes/facturas.js:71-78,138-145`; `scripts/remesa_mensual.js:57-64`; `lib/numeracion.js:3-6` | Huecos en la numeración legal |
| ANO-004 | RIESGO | ALTA | Cabecera y líneas se graban por separado sin transacción: puede quedar una factura sin líneas o con líneas parciales. Ya pasó una vez y se reparó a mano | `routes/facturas.js:74-98` (comentario `:81-82`); `scripts/remesa_mensual.js:61-70` | Cabecera que no cuadra con sus líneas; IVA y CSV divergentes (ANO-014) |
| ANO-005 | BUG | ALTA | Rectificar ignora los errores al grabar líneas y al marcar la original; si la factura no tiene líneas, la petición nunca responde y la original no se marca como `rectificada`, aunque la `RE` ya está grabada | `routes/facturas.js:147-159` | Rectificativa sin líneas; factura original que sigue `emitida` y se puede volver a rectificar |
| ANO-006 | RAREZA | BAJA | La pantalla solo ofrece rectificar facturas `emitida` de serie FA, pero el servidor también admite rectificar una `cobrada` | `views/factura_detalle.ejs:47`; `routes/facturas.js:132-133` | Comportamiento dependiente de la interfaz |
| ANO-007 | RAREZA | ALTA | Dos métodos de prorrateo: la pantalla de baja usa 30 días «a lo comercial», que es «lo que espera la gestoría», y la remesa usa días reales. Ejemplo con la semilla: contrato de 90 € con alta el 15/02/2026 → la remesa factura 90/28×14 = **45,00 €**; a lo comercial serían 90/30×14 = **42,00 €** | `services/calculo.js:90-102`; `scripts/remesa_mensual.js:43-51`; `routes/contratos.js:37-39`; `db.js:119` | Importes distintos según el camino. Pregunta P-04 |
| ANO-008 | RIESGO | ALTA | La remesa factura (prorrateado) el mes en que cae la baja, y la pantalla de baja indica emitir además a mano la factura del prorrateo de ese mismo mes | `scripts/remesa_mensual.js:28,46`; `routes/contratos.js:28-30`; `views/contratos.ejs:17` | Posible doble facturación del último mes. **SUPOSICIÓN** sobre la práctica real; pregunta P-03 |
| ANO-009 | RIESGO | ALTA | La remesa no comprueba si el mes ya se facturó: lanzarla dos veces duplica todas las cuotas | `scripts/remesa_mensual.js:14-31` | Facturas duplicadas con número legal consumido (solo se anulan con rectificativa) |
| ANO-010 | RIESGO | MEDIA | Ante un error, la remesa termina el proceso y deja facturado solo parte del mes; relanzarla duplica lo ya hecho (ANO-009) | `scripts/remesa_mensual.js:58,64,70` | Remesa incompleta o duplicada |
| ANO-011 | RAREZA | MEDIA | La remesa factura contratos de clientes dados de baja (no filtra `activo`), mientras que la factura manual solo ofrece clientes activos | `scripts/remesa_mensual.js:26-28`; `routes/facturas.js:31` | Facturas a clientes de baja si su contrato sigue vigente |
| ANO-012 | RAREZA | BAJA | Vencimiento por defecto: 30 fijo en la remesa y `VENCIMIENTO_DIAS` en la factura manual. Hoy coinciden | `scripts/remesa_mensual.js:60`; `routes/facturas.js:68`; `config.js:40` | Divergencia si se cambia la configuración |
| ANO-013 | RAREZA | ALTA | La semilla «histórica» no cuadra: en FA-101, 105, 106 (y su copia FA-107 y su espejo RE-001) y 108 la cabecera no es la suma de sus líneas; en FA-102, 103, 105, 106 y 108 hay líneas cuya base no es cantidad × precio. FA-103 («base 1000 justa NO lleva descuento») recalculada con el código actual da base bruta 1.000,02 € y **sí** llevaría el 2 %. Detalle en el apéndice A | `db.js:122-171`; cálculo del 13/11/2026 (apéndice A) | Si esos datos están en producción, el informe de IVA y el CSV no coinciden. No sirven como resultado esperado de los tests. Pregunta P-05 |
| ANO-014 | RIESGO | ALTA | El informe de IVA suma desde las líneas y el CSV para la gestoría desde las cabeceras: cuando no cuadran (ANO-004, ANO-013), la gestoría recibe dos cifras distintas | `routes/informes.js:23-25` vs `routes/informes.js:36-38` | Descuadre en el 303 o en la contabilidad |
| ANO-015 | RIESGO | MEDIA | El CSV no escapa el `;` ni los saltos de línea en el nombre del cliente, que es texto libre | `routes/informes.js:43-45`; `routes/clientes.js:21-22` | Fichero de la gestoría con columnas desplazadas |
| ANO-016 | RIESGO | ALTA | Credenciales de correo y clave de exportación de la gestoría en claro en un fichero versionado | `config.js:29-37` | Exposición de credenciales a quien tenga el repositorio |
| ANO-017 | RIESGO | MEDIA | No hay autenticación ni protección de formularios; `listen` sin host. **SUPOSICIÓN** (comportamiento por defecto de Node): escucha en todas las interfaces de red | `server.js:16-18,38-42,49` | Cualquiera en la red local podría emitir, cobrar o rectificar facturas |
| ANO-018 | RIESGO | MEDIA | El NIF solo se valida por longitud y es opcional; la semilla tiene un NIF con letra minúscula | `lib/util.js:41-48`; `routes/clientes.js:18`; `db.js:101` | Facturas con NIF erróneo o sin NIF |
| ANO-019 | RIESGO | MEDIA | La factura impresa toma los datos del cliente y de la empresa en el momento de imprimir, no los de la emisión | `routes/facturas.js:106,111`; `db.js:50-63` | Reimprimir una factura antigua puede mostrar otros datos fiscales |
| ANO-020 | RAREZA | MEDIA | La rectificativa se imprime con el título «FACTURA» (solo añade «Rectifica a:») | `views/factura_detalle.ejs:10,13` | **SUPOSICIÓN** sobre el requisito legal; pregunta P-10 |
| ANO-021 | RAREZA | BAJA | Panel: «pendientes de cobro» cuenta las rectificativas emitidas, el importe solo suma FA, se muestra con punto decimal y los errores de BD se convierten en ceros | `server.js:22-31`; `db.js:160`; `views/index.ejs:5-6` | Cifras del panel engañosas |
| ANO-022 | RAREZA | MEDIA | El importe del prorrateo de baja solo aparece en la barra de direcciones | `routes/contratos.js:12,40`; `views/contratos.ejs:17` | Importe copiado a mano a una factura: riesgo de error al transcribirlo |
| ANO-023 | RAREZA | BAJA | El comentario dice «a partir de 1.000» y el código aplica «más de 1000» (confirmado como intencionado por la semilla) | `services/calculo.js:37,40-41`; `db.js:138` | Documentación interna contradictoria |
| ANO-024 | RAREZA | BAJA | Sin observaciones, el texto de descuento se graba con un espacio inicial | `routes/facturas.js:76` | Texto de observaciones con espacio inicial |
| ANO-025 | RAREZA | ALTA | `redondear2` redondea sobre coma flotante: `1.005` → `1`, `0.285` → `0.28` | `lib/util.js:5-7`; apéndice A | Céntimos que difieren del redondeo aritmético; es el comportamiento que hoy cuadra con la gestoría y no se toca |
| ANO-026 | RAREZA | BAJA | Informe de IVA: trimestre no numérico → 1T sin avisar; trimestre fuera de 1-4 → error 500 | `routes/informes.js:16-18` | Informe del trimestre equivocado sin aviso |
| ANO-027 | RIESGO | MEDIA | La entrada de `sqlite3` en el lockfile no tiene `resolved`, `integrity` ni dependencias | `package-lock.json:853-855` | Instalación no reproducible en un ordenador nuevo. Pregunta P-11 |
| ANO-028 | RIESGO | MEDIA | No existe `.gitignore` | listado de la raíz, 13/11/2026 | Subida accidental de la BD con datos de clientes |
| ANO-029 | RIESGO | MEDIA | La BD (y, como **SUPOSICIÓN**, vistas y estáticos) se resuelven desde el directorio de arranque; desde otra carpeta se crea una BD nueva con la semilla sin avisar | `config.js:20`; `db.js:11-15,83-87`; `server.js:16-18` | Facturar contra una BD equivocada sin darse cuenta |
| ANO-030 | RIESGO | BAJA | El desfase de un día en el vencimiento de marzo de 2019 sigue sin explicar; con `Europe/Madrid` no se reproduce (`new Date('2026-03-29')` → 01:00 local del mismo día, 13/11/2026) | `lib/util.js:17-26` | **SUPOSICIÓN**: depende de la zona horaria del equipo. Pregunta P-12 |
| ANO-031 | RAREZA | BAJA | El alta de factura no comprueba que el cliente esté activo (la pantalla solo los ofrece activos) | `routes/facturas.js:31,46-47` | Comportamiento dependiente de la interfaz |


---

## 7. Suposiciones y preguntas abiertas

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-01 | ¿En qué equipo y carpeta está físicamente `gesfact.db` de producción? ¿Se arranca `server.js` en un solo puesto o en varios contra la misma BD? | Marga (administración) | §5.4, ANO-001, ANO-029 |
| P-02 | ¿Qué versión de Node (`node --version`) está instalada en el puesto de la oficina? | Marga / responsable del proyecto | TODO(VERSION_NODE), §4 |
| P-03 | Al dar de baja un contrato a mitad de mes, ¿se emite a mano la factura del prorrateo además de la que genera la remesa ese mes? | Marga | ANO-008 |
| P-04 | ¿Qué prorrateo espera la gestoría para las cuotas: mes de 30 días o días reales del mes? | Puri (gestoría) | ANO-007 |
| P-05 | ¿Las facturas FA-2026-000101 a 000108 y RE-2026-000001 existen en producción con esos importes? ¿Se sabe por qué sus cabeceras no cuadran con sus líneas? | Marga y Puri | ANO-013, ANO-014 |
| P-06 | ¿Qué número recibieron las facturas de la remesa de diciembre lanzada el 1 de enero en años anteriores? | Marga (y comprobar en una copia de la BD) | ANO-002 |
| P-07 | ¿Cómo se dan de alta los contratos y cómo se corrigen los datos de un cliente, artículo o contrato, si no hay pantalla para ello? | Marga | §5.2, §5.3 |
| P-08 | ¿Quiénes son Paco y Manoli y qué decisiones les corresponden? ¿Quién da soporte ahora que Julián no está? | Responsable del proyecto | §5.4 |
| P-09 | ¿Existe en algún sitio el código del módulo de albaranes de Roberto? | Responsable del proyecto (para trasladarlo a Roberto) | §5.3 |
| P-10 | ¿Basta con «Rectifica a: …» o la rectificativa debe titularse expresamente «factura rectificativa»? | Puri (gestoría) | ANO-020 |
| P-11 | ¿Cómo se instaló el programa en el puesto actual (`npm install` o copia de la carpeta con `node_modules`)? ¿Qué versión de SQLite incluye? | Marga / responsable del proyecto | ANO-027, §4 |
| P-12 | ¿Hay algún registro de la factura de marzo de 2019 cuyo vencimiento salió un día menos? ¿En qué zona horaria está configurado el equipo? | Marga | ANO-030 |
| — | Verificar con un test lanzado desde un directorio temporal si Express encuentra `views/` y `public/` | Equipo de documentación (verificación técnica, no pregunta al negocio) | §5.4, ANO-029 |

---

## Apéndice A. Contraste de la semilla de `db.js` con el código actual

**Método**: el 13/11/2026, con Node 26.13.0, se cargó `services/calculo.js` (que solo depende de
`lib/util.js` y no abre la BD) y se aplicó a las líneas de la semilla (`db.js:126-171`) con el
`recargo_equivalencia` de cada cliente (`db.js:96-101`). No se abrió ninguna base de datos. El script se
guardó fuera del repositorio; se reproduce con el fragmento del final.

| Factura | Cabecera grabada (base / IVA / recargo / total) | Suma de sus líneas grabadas | `calcularFactura` sobre las mismas cantidades y precios |
|---|---|---|---|
| FA-2026-000101 (`db.js:126-130`) | 133,20 / **27,97** / 0,00 / **161,17** | 133,20 / 24,27 / 0,00 / 157,47 | 133,20 / 24,27 / 0,00 / 157,47 |
| FA-2026-000102 (`db.js:132-136`) | 115,60 / 24,28 / 6,01 / 145,89 | igual | 115,62 / 24,28 / 6,01 / 145,91 |
| FA-2026-000103 (`db.js:139-143`) | 1.000,00 / 210,00 / 0,00 / 1.210,00 | igual | **980,01 / 205,81 / 0,00 / 1.185,82 (descuento 2 %)** |
| FA-2026-000104 (`db.js:145-147`) | 152,30 / 6,09 / 0,76 / 159,15 | igual | igual |
| FA-2026-000105 (`db.js:149-154`) | **2.287,75 / 468,63** / 0,00 / **2.756,38** | 2.335,50 / 339,02 / 0,00 / 2.674,52 | 2.288,68 / 332,22 / 0,00 / 2.620,90 (descuento 2 %) |
| FA-2026-000106 y FA-2026-000107 (`db.js:156-158,164-166`); RE-2026-000001 con signo contrario (`db.js:160-162`) | 101,61 / **20,62** / 0,00 / **122,23** | 101,61 / 20,06 / 0,00 / 121,67 | 101,59 / 20,06 / 0,00 / 121,65 |
| FA-2026-000108 (`db.js:168-171`) | 128,05 / **26,19** / 0,00 / **154,24** | 128,05 / 24,26 / 0,00 / 152,31 | 128,16 / 24,28 / 0,00 / 152,44 |

Líneas cuya base grabada no es `redondear2(cantidad × precio)`:

| Línea | Cálculo | Grabado |
|---|---|---|
| `db.js:136` (FA-102, portes) | 0,32 × 6,00 = 1,92 | 1,90 |
| `db.js:143` (FA-103, portes) | 0,92 × 6,00 = 5,52 (IVA 1,16) | 5,50 (IVA 1,15) |
| `db.js:154` (FA-105, portes) | 2,87 × 6,00 = 17,22 (IVA 3,62) | 17,20 (IVA 3,61) |
| `db.js:158`, `:166` (FA-106/107, café) | 0,97 × 11,95 = 11,59 | 11,61 |
| `db.js:171` (FA-108, vasos) | 0,66 × 21,60 = 14,26 (IVA 2,99) | 14,15 (IVA 2,97) |

Además, FA-105 dice «Descuento volumen 2 % aplicado» (`db.js:149`), pero sus líneas llevan el precio de
catálogo sin descuento (`db.js:151-154` frente a `db.js:105-112`), al contrario de lo que haría
`calcularFactura` (`services/calculo.js:63-71`).

Fragmento para reproducirlo (ejecutar desde la raíz del repositorio; no abre la BD):

```js
var calc = require('./services/calculo');
// FA-2026-000103: cliente 5, sin recargo (db.js:100, db.js:139-143)
var r = calc.calcularFactura([
  { descripcion: '', cantidad: 20,   precio: 28.90, tipoIva: 21 },
  { descripcion: '', cantidad: 15,   precio: 21.60, tipoIva: 21 },
  { descripcion: '', cantidad: 5,    precio: 18.50, tipoIva: 21 },
  { descripcion: '', cantidad: 0.92, precio: 6.00,  tipoIva: 21 }
], { recargo_equivalencia: 0 });
console.log(r.descuentoPct, r.base, r.iva, r.total); // 2 980.01 205.81 1185.82
```
