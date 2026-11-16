# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto y en qué fase estamos

GesFact 2.4: programa de facturación heredado (Node + Express + EJS + sqlite3) de Suministros Hidalgo S.L., en producción y emitiendo facturas reales. El proyecto está en una **fase de documentación y protección** gobernada por [.specify/memory/constitution.md](.specify/memory/constitution.md), que prevalece sobre cualquier otra práctica. Léela antes de proponer cambios. En resumen:

- **El código fuente existente y `package.json`/`package-lock.json` son de solo lectura.** Nada de refactors, reformateos, renombrados, "costuras" para test ni dependencias nuevas. Solo se crean ficheros nuevos de documentación, especificación y test.
- **Los bugs se registran, no se corrigen**: van al registro de anomalías con ID `ANO-NNN`, evidencia, impacto, tipo (`BUG`/`RIESGO`/`RAREZA`) y severidad (`ALTA`/`MEDIA`/`BAJA`).
- **Toda afirmación lleva evidencia** (`fichero:líneas`, dato de una copia de la BD con fecha, o testimonio con nombre y fecha). Sin evidencia → `SUPOSICIÓN` + pregunta con destinatario.
- **Nunca se escribe en `datos/gesfact.db`** (producción). Solo copias. Las copias con datos de clientes no se suben al repo (ojo: no hay `.gitignore` en la raíz).
- **Todo en español de España**: docs, specs, nombres de tests y mensajes de commit.

## Comandos

```
npm install
node server.js                         # http://localhost:3000 (puerto fijo en config.js)
node scripts/remesa_mensual.js 2026-06 # genera facturas de cuotas de contratos de un mes (ESCRIBE en la BD)
node --test                            # tests de caracterización (solo node:test + node:assert, sin librerías)
node --test ruta/al/fichero.test.js    # un solo fichero de test
node --test --test-name-pattern="..."  # un solo test por nombre
```

No hay linter ni build. Los tests de caracterización están en [pruebas/](pruebas/LEEME.md) (no en `test/`: `node --test` ejecutaría como test cualquier `.js` de una carpeta `test/`). No necesitan `node_modules`: sustituyen `db.js` y `express` por dobles en memoria y lanzan la remesa real en un proceso hijo. Golden master del ciclo de la factura en [pruebas/golden-master/](pruebas/golden-master/LEEME.md); solo se regenera con una decisión de negocio escrita.

**Aislar la BD al probar**: `config.RUTA_BD` es `./datos/gesfact.db`, relativa al **directorio de trabajo**, no al código. Si se lanza `node <ruta>/server.js` o el script de remesa desde un directorio temporal, se usa (y se crea) `datos/gesfact.db` ahí. Si la BD está vacía, `db.inicializar()` crea el esquema y carga los datos semilla. Así se prueba desde fuera sin tocar el código. El puerto 3000 está fijo, así que no se pueden levantar dos servidores a la vez.

**Versión de Node sin resolver**: `LEEME.txt` dice Node 8, pero `node:test` y sqlite3 ^5 necesitan una versión moderna (en la máquina de desarrollo hay Node 26). Ver TODO(VERSION_NODE) en la constitución.

## Arquitectura

- [server.js](server.js): app Express, dashboard en `/` y montaje de los routers de [routes/](routes/) (`clientes`, `articulos`, `contratos`, `facturas`, `informes`). Las vistas EJS están en [views/](views/) (`cabecera.ejs`/`pie.ejs` como layout).
- [db.js](db.js): exporta directamente el objeto `sqlite3.Database` (todo el código usa callbacks `db.get/all/run`) más `inicializar()`, que define el esquema (`clientes`, `articulos`, `contratos`, `facturas`, `lineas`, `contadores`) y carga los datos semilla históricos, incluidos casos límite comentados (base de 1000 € sin descuento, rectificativa RE-2026-000001). Esos datos son una referencia útil para los tests de caracterización.
- [services/calculo.js](services/calculo.js): núcleo fiscal. **Redondeo línea a línea** (la gestoría cuadra así en Contaplus; no cambiarlo nunca), recargo de equivalencia por tipo de IVA, descuento por volumen (>1000 → 2 %, >5000 → 5 %, estrictamente mayor) aplicado al precio unitario de cada línea y recalculando después, y `calcularProrrateo` "a lo comercial" (mes de 30 días).
- [lib/numeracion.js](lib/numeracion.js): numeración correlativa `SERIE-AAAA-NNNNNN` por serie (`FA` normal, `RE` rectificativa) y año, en la tabla `contadores`, con lectura y escritura sin transacción. Por obligación legal las facturas no se borran nunca: los errores se corrigen con una rectificativa `RE` espejo (signos invertidos, sin recalcular) y una factura nueva.
- [lib/util.js](lib/util.js): utilidades heredadas del Access: `redondear2`, fechas como texto `YYYY-MM-DD`, `formatearImporte` (`1.234,50`) y `validarNIF` (solo comprueba la longitud).
- [routes/facturas.js](routes/facturas.js): alta (formulario → `calcularFactura` → número → insert de cabecera y de líneas una a una, sin transacción), detalle imprimible, cobro y rectificación.
- [routes/informes.js](routes/informes.js): resumen de IVA trimestral (sumado desde `lineas`) y CSV para la gestoría (`;`, coma decimal, clave `CLAVE_EXPORT_GESTORIA` en la primera línea). Su formato es un contrato con un tercero.
- [scripts/remesa_mensual.js](scripts/remesa_mensual.js): facturación mensual de contratos. Ojo: prorratea por **días reales del mes**, a su manera, sin usar `calculo.calcularProrrateo` (30 días).
- [config.js](config.js): datos de la empresa, puerto, ruta de la BD, IVA y vencimiento por defecto, y credenciales en claro (SMTP, clave de la gestoría). No copiar esos valores a la documentación ni a los tests.

Partes rotas o a medias que se documentan pero no se reparan: [services/email.js](services/email.js) (desactivado desde 2022, solo escribe un aviso en el log), [datos/migracion_mysql_2018.sql](datos/migracion_mysql_2018.sql) (esquema desfasado, nunca se ejecutó) y el módulo de albaranes (fuera del repo).

## Spec Kit

El flujo de trabajo usa Spec Kit con integración de Claude (skills `speckit-*`: specify → clarify → plan → tasks → analyze → implement) y scripts de PowerShell en [.specify/scripts/powershell/](.specify/scripts/powershell/). Las ramas de feature se numeran de forma secuencial (`001-slug`) y el auto-commit está desactivado. Toda especificación, plan o lista de tareas debe pasar las puertas de calidad de la constitución antes de aprobarse.
