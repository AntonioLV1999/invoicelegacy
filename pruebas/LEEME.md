# Red de tests de caracterización de GesFact 2.4

Estos tests **congelan el comportamiento actual** del programa, tal como es el 16/11/2026, errores incluidos. No
dicen lo que GesFact *debería* hacer. Su trabajo es avisar de cualquier cambio de comportamiento, intencionado o
no, antes de que llegue a una factura.

Reglas que se siguieron al escribirlos (constitución, Principios I a IV):

- El valor esperado de cada test es **el que produce el código actual**: se ejecutó cada caso y se copió el
  resultado. Todos los ejemplos numéricos de [reglas-de-negocio.md](../specs/000-reconocimiento/reglas-de-negocio.md)
  coinciden con el código. Si un test falla, primero se comprueba si el test copió mal la realidad. El código no se
  toca.
- Lo que apareció al ejecutar y no estaba documentado se registró como anomalía (**A-63 a A-67**, ANO-072 a
  ANO-078) y se congeló.
- No se cambió ni una línea de código de producción, ni `package.json`, ni `package-lock.json`. No hay
  dependencias nuevas: solo `node:test`, `node:assert` y módulos de Node.

## Cómo se ejecutan

```
node --test                                              # toda la red: 299 tests, unos 10 s
node --test pruebas/caracterizacion/02-calculo.test.js   # un fichero
node --test --test-name-pattern="ANO-059"                # un test por nombre o por ANO
```

No hace falta `npm install`. Los tests **no abren ninguna base de datos**: ni `datos/gesfact.db` ni ninguna otra.

**Script de test en `package.json`: no se ha añadido.** Se pidió, pero `package.json` es de solo lectura en esta
fase (CLAUDE.md; constitución, Principio IV), y la constitución prevalece. `node --test` sin argumentos ya encuentra
todos los ficheros `*.test.js`. Si el responsable del proyecto autoriza por escrito la excepción, bastaría con añadir
`"test": "node --test"` al bloque `scripts`, sin tocar las dependencias.

## Método: probar desde fuera sin tocar el código

En la copia de trabajo no hay `node_modules`: `sqlite3`, `express`, `ejs` y `body-parser` no están instalados.
Instalarlos podría reescribir `package-lock.json`, y sin `.gitignore` (A-58) se corre el riesgo de subir
`node_modules` al repositorio. Por eso:

| Pieza | Cómo se prueba | Fichero |
|---|---|---|
| Funciones puras (`lib/util.js`, `services/calculo.js`) | Directamente | `01-util`, `02-calculo` |
| `db.js` | Sustituido por un **doble en memoria** inyectado en la caché de `require`. Registra cada sentencia SQL con sus parámetros exactos y simula solo las sentencias que el código envía; con una sentencia nueva, falla | [ayudas/doble-bd.js](ayudas/doble-bd.js) |
| `express` | Sustituido por un `Router` mínimo que guarda los manejadores. Se invocan con peticiones y respuestas falsas | [ayudas/entorno.js](ayudas/entorno.js) |
| `scripts/remesa_mensual.js` | Se ejecuta **el script real** en un proceso hijo, con el doble de BD precargado (`--require`), el reloj fijado y una carpeta temporal vacía como directorio de trabajo | [ayudas/remesa.js](ayudas/remesa.js), [ayudas/precarga-remesa.js](ayudas/precarga-remesa.js) |
| Reloj | `mock.timers` de `node:test` (solo `Date`) o un `Date` fijo en los procesos hijo | [ayudas/comun.js](ayudas/comun.js) |
| Zona horaria | `TZ=Europe/Madrid` en todos los procesos. Otras zonas, en procesos hijo (contradicción 12) | [ayudas/comun.js](ayudas/comun.js) |
| Datos | La semilla de `db.js:93-180`, copiada literalmente (no consta que sean datos de producción, ANO-013) | [ayudas/semilla.js](ayudas/semilla.js) |

**Qué garantiza el doble y qué no.** Garantiza la lógica JavaScript: qué se lee del formulario, qué se calcula,
qué se numera, qué textos se componen y qué SQL se envía, con qué parámetros y en qué orden. **No** garantiza lo que
haría SQLite con eso: filtros `WHERE`, `SUM`, `ORDER BY`, conversión de tipos, `NaN` o `-0` en columnas `REAL`,
restricciones. En los tests de concurrencia (ANO-001, ANO-044, ANO-045), el doble responde de forma asíncrona y
entrelazada. El test demuestra que el código asigna el mismo número **si** las dos lecturas llegan antes de las dos
escrituras. Que la cola real de `sqlite3` permita ese orden es la hipótesis del registro (A-04), y no la demuestra
este test.

## Estructura

| Fichero | Contenido | Tests |
|---|---|---|
| [caracterizacion/01-util.test.js](caracterizacion/01-util.test.js) | RN-05, RN-24, RN-50 a RN-53; `diasDelMes` | 47 |
| [caracterizacion/02-calculo.test.js](caracterizacion/02-calculo.test.js) | RN-01 a RN-15, RN-20, RN-36, RN-37, RN-41 | 46 |
| [caracterizacion/03-numeracion.test.js](caracterizacion/03-numeracion.test.js) | RN-26 a RN-29 | 9 |
| [caracterizacion/04-alta-factura.test.js](caracterizacion/04-alta-factura.test.js) | RN-16 a RN-25 (`POST /facturas/nueva`) | 25 |
| [caracterizacion/05-cobro-rectificacion.test.js](caracterizacion/05-cobro-rectificacion.test.js) | RN-31 a RN-35; RN-54 (lado servidor) | 13 |
| [caracterizacion/06-contratos-y-maestros.test.js](caracterizacion/06-contratos-y-maestros.test.js) | RN-36 y RN-38 (pantalla de baja); RN-53 (alta de cliente); altas de contratos y artículos | 11 |
| [caracterizacion/07-remesa.test.js](caracterizacion/07-remesa.test.js) | RN-39 a RN-43 (script real) | 18 |
| [caracterizacion/08-informes.test.js](caracterizacion/08-informes.test.js) | RN-44, RN-46, RN-48, RN-49 | 10 |
| [caracterizacion/09-anomalias.test.js](caracterizacion/09-anomalias.test.js) | Un test «CONGELA comportamiento actual: ANO-NNN» por anomalía ejecutable | 61 |
| [caracterizacion/10-contradicciones.test.js](caracterizacion/10-contradicciones.test.js) | Contradicciones 01, 02, 03, 05 a 14: **cada implementación por separado**, con su resultado divergente | 40 |
| [caracterizacion/11-codigo-fuente.test.js](caracterizacion/11-codigo-fuente.test.js) | RN-30 y ausencia de transacciones (lectura del código fuente) | 4 |
| [golden-master/](golden-master/LEEME.md) | Golden master del ciclo de vida de una factura: 12 casos fijos, salida completa | 15 |

Cada umbral se prueba por los dos lados (justo debajo, valor exacto, justo encima): descuento en 1.000 y 5.000 €,
tope de 30 días del prorrateo, 6 cifras de la numeración, día 30/31 de la remesa, medio céntimo positivo y
negativo, longitud del NIF, nochevieja en el reloj y trimestres 0, 4 y 5. También se cubren los casos habituales:
coma flotante (1,005; 0,285; 2,675; 0,1 + 0,2), fin de mes, fin de año, febrero bisiesto (2028, 2024, 2000, 2100),
cero, cero negativo, negativos, vacíos, `null`, `undefined`, `NaN` e `Infinity`.

## Anomalías congeladas

**63 de los 78 ANO** tienen al menos un test que fija su comportamiento actual:

- en `09-anomalias` y `11-codigo-fuente`: ANO-001 a 006, 008 a 011, 013 a 015, 018, 023 a 026, 029, 031 a 045,
  048, 049, 053, 054, 056, 059 a 066, 069, 070 y 072 a 078;
- en `10-contradicciones`, además: ANO-007, 012, 022, 030, 067, 068 y 071.

Las 15 restantes no son ejecutables con esta red; se detallan abajo.

## Cobertura pendiente (fuera de la red y por qué)

Para la siguiente fase. Casi todo depende de poder ejecutar `sqlite3`, Express y EJS reales. Eso exige instalar las
dependencias declaradas (`npm ci`) **fuera del repositorio** o después de autorizar un `.gitignore` (A-58, decisión
del responsable del proyecto), y resolver TODO(VERSION_NODE).

| Qué queda fuera | Por qué | Anomalías o reglas afectadas | Cómo cubrirlo después |
|---|---|---|---|
| **SQL real**: filtros, `SUM`, `GROUP BY`, `ORDER BY`, `LIKE` | El doble no ejecuta SQL; `sqlite3` no está instalado | RN-39 (vigencia de contratos), RN-44 (sumas por tipo), **RN-45** (compensación FA/RE), RN-48 (orden del CSV), ANO-014 (cifras del informe frente al CSV) | Tests sobre una BD temporal creada con `db.inicializar()` en una carpeta temporal |
| **Tipos en SQLite**: qué se guarda con `NaN`, `-0`, texto en `INTEGER` | Ídem | ANO-003, ANO-075 (A-65), contradicción 09 | Ídem, leyendo lo grabado |
| `db.js`: esquema, `inicializar()`, carga de la semilla | Necesita `sqlite3` | ANO-055 (A-14: BD nueva desde otra carpeta, que repite números), ANO-057 (A-34) | Ejecutar `server.js` o la remesa desde una carpeta temporal |
| **Vistas EJS** (`views/*.ejs`) | `ejs` no está instalado | **RN-47** (totales del informe sin redondear), **RN-55** (factura impresa), RN-54 (leyenda de recargo), ANO-019 (A-50), ANO-020 (A-51), botones de la contradicción 14 (V1), leyenda y listado de la contradicción 09 (I2, I3), estado de los contratos en pantalla (contradicción 11, I2), menú de informes (ANO-063, parte visual) | Renderizar las vistas con `ejs` sobre datos fijos, o pruebas HTTP |
| `server.js`: panel de inicio y montaje de rutas | Necesita `express`, `body-parser` y el puerto 3000 libre | ANO-021 (A-41, cuatro «pendiente de cobro»), contradicción 04 entera, contradicción 10 (I5) | Pruebas HTTP con `fetch` contra el servidor arrancado en una carpeta temporal |
| Lectura HTTP del formulario (`body-parser`, nombres `desc[]` y otros) | El test pasa `req.body` ya construido | RN-17 a RN-19 en su forma real; ANO-078 (si un navegador llega a enviar listas desiguales) | Pruebas HTTP; navegador para la contradicción 06 |
| Autenticación y protección de formularios | No hay nada que probar sin servidor | ANO-017, ANO-052 (A-44) | Pruebas HTTP |
| `public/js/factura.js` (autorrelleno en el navegador) | Código de navegador | RN-21 (parte de pantalla) | Prueba en navegador |
| Concurrencia real (dos puestos, carpeta de red) | Depende del sistema de ficheros y de `sqlite3` | ANO-046 (A-13); confirmación real de ANO-001, ANO-044 y ANO-045 | Dos procesos sobre la misma BD temporal |
| Operación e infraestructura | No son comportamiento del programa | ANO-016 y ANO-051 (A-43, credenciales), ANO-027 (A-45), ANO-028 (A-58), ANO-047 (A-12), ANO-050 (A-57), ANO-058 (A-56) | Revisión y documentación, no tests |
| Envío real por correo | Código comentado desde 2022 | A-46 (se congela solo el aviso, ANO-054) | — |
| Versión de Node de la oficina | TODO(VERSION_NODE): los resultados valen para Node 26.13.0 | Todas | Repetir `node --test` con la versión real cuando se confirme (P-02) |
| Zona horaria real del equipo de la oficina | SUPOSICIÓN: `Europe/Madrid` (P-12) | ANO-030 y toda fecha | Confirmar con Marga; la contradicción 12 ya congela otras zonas |
