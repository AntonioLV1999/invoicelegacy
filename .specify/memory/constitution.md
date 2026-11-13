<!--
INFORME DE IMPACTO DE SINCRONIZACIÓN (borrador temporal: eliminar antes de confirmar el commit)
- Cambio de versión: plantilla sin rellenar → 1.0.0 (ratificación inicial)
- Principios definidos (desde los marcadores de la plantilla):
  - [PRINCIPLE_1_NAME] → I. El comportamiento actual es sagrado (INNEGOCIABLE)
  - [PRINCIPLE_2_NAME] → II. Evidencia obligatoria (INNEGOCIABLE)
  - [PRINCIPLE_3_NAME] → III. Los hallazgos se registran, no se corrigen (INNEGOCIABLE)
  - [PRINCIPLE_4_NAME] → IV. Cero dependencias nuevas y cero refactors (INNEGOCIABLE)
  - [PRINCIPLE_5_NAME] → V. Español de España (INNEGOCIABLE)
- Secciones añadidas:
  - [SECTION_2_NAME] → Restricciones del sistema heredado
  - [SECTION_3_NAME] → Flujo de trabajo y puertas de calidad
  - Gobernanza
- Secciones eliminadas: ninguna
- Plantillas dependientes: no se modifican (leen la constitución en tiempo de ejecución)
- TODO pendientes:
  - TODO(VERSION_NODE): LEEME.txt habla de Node 8, pero node:test exige Node 18 o
    superior y sqlite3 ^5.1.7 tampoco funciona con Node 8. Hay que confirmar con el negocio
    qué versión de Node se usa de verdad en la oficina.
-->

# Constitución de GesFact (Suministros Hidalgo S.L.)

## Principios fundamentales

### I. El comportamiento actual es sagrado (INNEGOCIABLE)

GesFact es un sistema heredado que está en producción y emite facturas con dinero real. La gestoría
y otros terceros dependen de que sus resultados sean exactos, céntimo a céntimo.

- Está PROHIBIDO cualquier cambio en el comportamiento observable del sistema sin una decisión
  explícita y por escrito del negocio. Esa decisión debe indicar quién la toma, la fecha y el
  alcance exacto.
- La regla se aplica también cuando el comportamiento parece un error. Un error documentado y estable
  es parte del contrato que los terceros ya han asumido.
- "Comportamiento observable" incluye importes, redondeos, numeración de facturas, formatos de
  fecha y de número, el contenido de informes y remesas, los mensajes y el esquema y contenido de
  la base de datos.
- Ninguna tarea de esta fase puede escribir en la base de datos de producción
  (`datos/gesfact.db`). Todo análisis o prueba se hace sobre copias.

**Justificación**: un céntimo de diferencia en una factura o en el informe de IVA tiene
consecuencias fiscales y contables fuera de nuestro control. El objetivo de esta fase es
documentar y proteger, no mejorar.

### II. Evidencia obligatoria (INNEGOCIABLE)

Toda afirmación sobre lo que hace el sistema DEBE ir acompañada de al menos una evidencia
verificable:

- **Código**: fichero y líneas concretas (por ejemplo, `services/calculo.js:42-57`).
- **Dato real**: consulta o registro de una copia de la base de datos, indicando de qué copia se
  trata y en qué fecha se tomó.
- **Testimonio del negocio**: el nombre de la persona, la fecha y lo que dijo literalmente o de
  forma resumida.

Lo que no tenga evidencia DEBE marcarse como **SUPOSICIÓN**. Además, cada suposición DEBE
convertirse en una pregunta concreta, dirigida a alguien concreto, y quedar abierta hasta que se
responda. Ninguna suposición puede usarse como base de un test de caracterización ni de una decisión.

**Justificación**: el conocimiento sobre GesFact está repartido entre el código, los datos y la
memoria de personas que ya no están (por ejemplo, Julián o Roberto, según `LEEME.txt`). Sin
evidencia, la documentación sería una opinión.

### III. Los hallazgos se registran, no se corrigen (INNEGOCIABLE)

- Todo bug, riesgo o rareza que se descubra DEBE anotarse en el registro de anomalías. Está
  PROHIBIDO corregirlo en esta fase.
- Cada entrada del registro DEBE incluir:
  - un identificador único (`ANO-NNN`);
  - una descripción;
  - la evidencia exigida por el Principio II;
  - el impacto estimado;
  - la clasificación.
- La clasificación tiene dos ejes:
  - **Tipo**: `BUG` (resultado incorrecto), `RIESGO` (fallo potencial, de seguridad o de
    pérdida de datos) o `RAREZA` (comportamiento extraño cuya corrección no está clara).
  - **Severidad**: `ALTA` (afecta a importes, numeración o datos fiscales), `MEDIA` o `BAJA`.
- Los tests de caracterización DEBEN fijar el comportamiento actual, incluso el que es erróneo, y
  DEBEN citar el identificador `ANO-NNN` cuando corresponda.
- Corregir una anomalía es una decisión del módulo siguiente y está sujeta al Principio I.

**Justificación**: si se corrige mientras se documenta, se mezclan dos actividades con riesgos
distintos y se pierde la referencia de cómo funcionaba el sistema.

### IV. Cero dependencias nuevas y cero refactors (INNEGOCIABLE)

- Está PROHIBIDO añadir, quitar o actualizar paquetes en `package.json` o en `package-lock.json`.
- El código fuente existente es de solo lectura durante esta fase. Está PROHIBIDO renombrarlo,
  moverlo, reformatearlo, extraer funciones o introducir "costuras" (seams) para facilitar las
  pruebas.
- Los tests de caracterización DEBEN usar exclusivamente el runner nativo de Node (`node:test`) y
  los módulos incluidos en Node (`node:assert`, `fetch` nativo, etc.).
- Si una parte del sistema no se puede probar sin modificar el código, se prueba desde fuera (por
  HTTP o ejecutando los scripts sobre una copia de los datos) o se anota como anomalía de tipo
  `RIESGO`. Nunca se adapta el código para poder probarlo.
- Solo se permite crear ficheros nuevos de documentación, especificación y test.

**Justificación**: cada dependencia o cada refactor cambia la base sobre la que se caracteriza el
sistema y puede alterar su comportamiento sin que nadie lo note.

### V. Español de España (INNEGOCIABLE)

- Toda la documentación, las especificaciones, el registro de anomalías, las preguntas al negocio,
  los nombres y descripciones de los tests y los mensajes de commit DEBEN redactarse en español de
  España.
- Los identificadores que ya existen en el código se citan tal cual. Los términos técnicos sin
  traducción asentada (por ejemplo, `commit` o `runner`) pueden usarse en su forma original.
- Los formatos de ejemplo siguen las convenciones españolas: coma decimal, `dd/mm/aaaa` y euros.
  Esto es solo para la redacción: el comportamiento real del sistema se documenta tal como es.

**Justificación**: el proyecto, su código y sus usuarios (oficina y gestoría) trabajan en español.
La documentación tiene que entenderla quien toma las decisiones de negocio.

## Restricciones del sistema heredado

- **Pila tecnológica actual**, según `package.json`, que es el único registro que se puede
  verificar: Node.js, Express ^4.22.2, body-parser ^1.20.5, EJS ^3.1.10 y sqlite3 ^5.1.7. Esta
  pila se documenta y no se cambia.
- **Datos**: la base de datos de producción es `datos/gesfact.db`. Según `LEEME.txt`, Marga hace
  una copia manual en un pendrive cada viernes. Está PROHIBIDO tocar el fichero de producción.
  Cualquier copia que contenga datos de clientes debe tratarse como confidencial y NO puede
  añadirse al repositorio.
- **Partes conocidas como rotas o a medias**, según `LEEME.txt`:
  - el envío de facturas por email (`services/email.js`), "roto desde lo de Arsys 2022";
  - la migración a MySQL (`datos/migracion_mysql_2018.sql`);
  - el módulo de albaranes de Roberto, que no está en el repositorio.
  Todo ello se documenta y se registra; no se repara.
- **Versión de Node**: `LEEME.txt` indica Node 8, pero `node:test` requiere Node 18 o superior.
  TODO(VERSION_NODE): confirmar con el negocio qué versión está instalada en la oficina antes de
  dar por válido cualquier resultado de los tests de caracterización.

## Flujo de trabajo y puertas de calidad

- **Antes de aprobar cualquier especificación, plan o lista de tareas**, el revisor DEBE comprobar
  que:
  - (a) ninguna tarea modifica código fuente existente ni dependencias;
  - (b) toda afirmación tiene evidencia o está marcada como SUPOSICIÓN y tiene su pregunta;
  - (c) los hallazgos aparecen en el registro de anomalías y no como correcciones.
- **Tests de caracterización**: deben ser deterministas, ejecutarse con `node --test` sobre copias
  de los datos y comparar resultados exactos. Los importes se comparan céntimo a céntimo, sin
  tolerancias.
- **Preguntas abiertas**: cada SUPOSICIÓN genera una pregunta con destinatario. Las respuestas se
  incorporan como testimonio del negocio (nombre y fecha) y sustituyen a la suposición.
- **Decisiones del negocio**: cualquier excepción al Principio I tiene que quedar archivada por
  escrito (quién, cuándo y qué), junto a la especificación que la usa.

## Gobernanza

- Esta constitución está por encima de cualquier otra práctica, plantilla o costumbre del
  proyecto. Si hay conflicto, gana la constitución.
- **Enmiendas**: deben proponerse por escrito, justificarse y aprobarse de forma explícita por el
  responsable del proyecto. Si la enmienda afecta al Principio I, también debe aprobarla el
  negocio. Toda enmienda actualiza la versión y la fecha de última enmienda.
- **Versionado** (semántico):
  - MAYOR: se elimina o se redefine un principio.
  - MENOR: se añade un principio o una sección, o se amplía materialmente una de ellas.
  - PARCHE: aclaraciones y correcciones de redacción.
- **Cumplimiento**: toda revisión de especificaciones, planes, tareas y cambios DEBE comprobar que
  se cumple esta constitución. Si una tarea la incumple, se rechaza; no se negocian excepciones.
- **Fin de fase**: cuando termine la fase de documentación y protección, el módulo siguiente debe
  enmendar esta constitución (versión MAYOR) antes de empezar a corregir anomalías.

**Versión**: 1.0.0 | **Ratificada**: 2026-11-13 | **Última enmienda**: 2026-11-13
