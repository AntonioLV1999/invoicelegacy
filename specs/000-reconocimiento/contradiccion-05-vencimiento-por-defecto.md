# Contradicción 05 — Plazo de vencimiento por defecto

| Campo | Valor |
|---|---|
| Fecha de elaboración | 16/11/2026 |
| Versión del código analizada | commit `96b09ca`; código fuente sin cambios desde `1f35d01` |
| Datos reales consultados | **Ninguno de producción.** Cálculos con el `lib/util.js` real; remesas reales sobre la semilla en una BD temporal (método en [contradicción 01](contradiccion-01-prorrateo.md#método-de-verificación-común-a-todas-las-contradicciones)) |
| Anomalías relacionadas | ANO-012, ANO-041, ANO-058 |
| Preguntas relacionadas | P-40; nueva P-51 |

No se decide qué valor es el correcto. No se corrige nada.

---

## 1. Implementaciones implicadas

| | Regla | Evidencia | Camino |
|---|---|---|---|
| **I1** | Vencimiento = fecha + `cliente.dias_pago`, o `config.VENCIMIENTO_DIAS` si el cliente no lo tiene | `routes/facturas.js:68-69`; `config.js:39-40` («días de vencimiento por defecto si el cliente no tiene forma de pago») | Alta manual (A) |
| **I2** | Vencimiento = fecha + `co.dias_pago`, o **30 escrito en el código** | `scripts/remesa_mensual.js:60` | Remesa (B). El script no carga `config.js` (`scripts/remesa_mensual.js:9-12`) |
| **I3** | Sin vencimiento (`NULL`) | `routes/facturas.js:142` | Rectificación (C) |

## 2. Comparación paso a paso

| Paso | I1 · manual | I2 · remesa |
|---|---|---|
| Días del cliente | `cliente.dias_pago` (fila de `clientes`, `routes/facturas.js:46`) | `cl.dias_pago` traído por el `JOIN` (`scripts/remesa_mensual.js:26`) |
| Valor por defecto | `config.VENCIMIENTO_DIAS` (hoy 30) | `30` literal |
| Operador | `\|\|`: un 0 cuenta como «sin dato» (ANO-041) | `\|\|`: igual |
| Suma de días | `util.sumarDias` | `util.sumarDias` |
| Fecha de partida | Fecha de la factura | Último día del mes facturado |

Mismo algoritmo, pero **la constante sale de dos sitios distintos**.

## 3. Ejemplos en los que darían resultados distintos

Con el `config.js` del repositorio (30) **coinciden**. Se comprobó el 16/11/2026: la remesa real de febrero
de 2026 sobre la semilla vence el 30/03/2026 para la Cafetería La Parada (`dias_pago` nulo) y el 29/04/2026
para Casa Ubaldo (60 días), igual que haría I1.

Divergen en cuanto `VENCIMIENTO_DIAS` valga otra cosa. Ejemplo hipotético con 45 días y un cliente sin
`dias_pago` (Cafetería La Parada, `db.js:96`) y factura del 31/01/2026:

| Camino | Cálculo | Vencimiento |
|---|---|---|
| Alta manual (I1) | 31/01/2026 + 45 | **17/03/2026** |
| Remesa (I2) | 31/01/2026 + 30 | **02/03/2026** |

Diferencia: 15 días de plazo de pago para el mismo cliente según cómo se emitió la factura.

## 4. Cuándo divergen y cuándo coinciden

- **Coinciden** mientras `config.js` diga 30 y para todo cliente con `dias_pago` informado (en la semilla, 60
  días para Casa Ubaldo y Hotel Vega Baja, `db.js:98,100`).
- **Divergirían** para los clientes sin `dias_pago` (4 de 6 en la semilla) si se cambia `VENCIMIENTO_DIAS`.
- **No consta que el `config.js` de producción diga 30.** Ese fichero «se copia a mano al servidor de la
  oficina» (`config.js:1-3`) y la ruta del servidor no está clara (ANO-058). Que coincidan hoy en producción es
  una **SUPOSICIÓN** (P-51).

**Por qué no se ha detectado**: con el valor actual el resultado es el mismo y no hay nada que detectar.

## 5. Historia probable

`VENCIMIENTO_DIAS` lo puso Julián en `config.js` para la factura manual (**SUPOSICIÓN**: por el estilo del
fichero y porque la factura manual es anterior a 2021). En 2021 Roberto escribió la remesa sin cargar
`config.js` y puso el 30 directamente (`scripts/remesa_mensual.js:9-12,60`; H-16). Es el mismo patrón de la
[contradicción 01](contradiccion-01-prorrateo.md): reimplementar en el script en lugar de reutilizar lo que
ya había.

## 6. Pregunta de negocio (sin decidir)

¿El plazo de pago por defecto es un valor de configuración que puede cambiar o es fijo en 30 días? ¿Debe ser
el mismo para cuotas y para ventas?

| ID | Pregunta | Destinatario | Motivo |
|---|---|---|---|
| P-51 | En el `config.js` del servidor de la oficina, ¿qué valores tienen `VENCIMIENTO_DIAS` e `IVA_DEFECTO`? ¿Se han cambiado alguna vez? Si se cambiaran, ¿se espera que afecten también a las cuotas de la remesa y a los contratos? | Marga y responsable del proyecto | Contradicciones 05 y 06; ANO-012, ANO-067 |

## 7. Para el registro de anomalías

No se proponen anomalías nuevas: es **ANO-012**. Se propone añadir a su evidencia que la remesa no carga
`config.js` (`scripts/remesa_mensual.js:9-12`) y que el valor de producción no se conoce (`config.js:1-3`).
