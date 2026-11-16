# Golden master del ciclo de vida de una factura

## Qué es

Una foto completa y exacta de lo que hace **hoy** GesFact 2.4 en su flujo central de negocio: el alta manual
de una factura y su rectificación (caminos A y C de
[flujo-factura.md](../../specs/000-reconocimiento/flujo-factura.md)). No dice lo que el programa *debería*
hacer, sino lo que *hace*, errores incluidos.

| Fichero | Papel |
|---|---|
| [casos.js](casos.js) | 12 casos de entrada **fijos** (GM-01 a GM-12). Cada uno indica qué reglas (`RN-NN`) y anomalías (`ANO-NNN`) ejercita |
| [generar.js](generar.js) | Ejecuta los casos con el código actual y devuelve la salida normalizada. No escribe nada |
| [master-ciclo-factura.json](master-ciclo-factura.json) | La salida de referencia |
| [golden-master.test.js](golden-master.test.js) | Regenera la salida y la compara campo a campo con el master (lo lanza `node --test`) |
| [regenerar.js](regenerar.js) | Reescribe el master. Exige `--decision` |
| [HISTORIAL.md](HISTORIAL.md) | Cada regeneración, con la decisión que la autoriza |

**Qué contiene cada caso**: la entrada; la respuesta HTTP (redirección o error); lo que se escribe en consola;
**todas las sentencias SQL con sus parámetros** en el orden en que se envían; los contadores finales; las
facturas y líneas nuevas; los cambios de estado de facturas existentes; y la presentación (línea del CSV para
la gestoría, fechas y líneas tal como se formatean para imprimir).

**Condiciones fijas**: datos iniciales = semilla de `db.js:93-180` (transcrita en
[../ayudas/semilla.js](../ayudas/semilla.js)), reloj fijado al 16/11/2026 10:00 y zona horaria
`Europe/Madrid`. La BD es el doble en memoria de [../ayudas/doble-bd.js](../ayudas/doble-bd.js): no se abre
ninguna base de datos real.

**Formato estable**: JSON con claves ordenadas alfabéticamente y sangría de 2 espacios. Los números se guardan
con todos sus decimales (la representación más corta que JavaScript vuelve a leer como el mismo número). Los
valores que JSON no admite se escriben explícitamente: `{"$numero": "NaN"}`, `{"$numero": "-0"}`,
`{"$numero": "Infinity"}`. La clave de exportación de la gestoría **nunca** se guarda (el regenerador aborta si
aparece).

## Qué significa que falle

Que el código ya no produce lo mismo que el 16/11/2026. El mensaje indica el caso y el campo exactos, por
ejemplo:

```
El caso GM-04 («Base de 1.000,01 (salto del 2 %) ...») ha cambiado:
  - GM-04.salida.facturasNuevas[0].total: esperado 1185.81, obtenido 1185.82
```

Ante un fallo **no se regenera el master para ponerlo en verde**. Primero hay que averiguar qué cambio lo ha
provocado y si estaba autorizado.

## Cuándo DEBE regenerarse

**Solo** cuando un cambio de comportamiento esté autorizado por una **decisión de negocio escrita**, que indique
quién la toma, la fecha y el alcance exacto (constitución, Principio I y apartado «Decisiones del negocio»).
Ejemplos: corregir una anomalía del registro en la fase de modernización con su decisión archivada, o cambiar el
juego de casos por acuerdo documentado.

**Nunca** se regenera:

- para que pase un test después de tocar el código sin esa decisión;
- porque «el nuevo resultado parece más correcto»;
- por un cambio en un caso de [casos.js](casos.js) que no esté acordado.

En esta fase (documentación y protección) no se espera ninguna regeneración: el código fuente es de solo
lectura.

## Cómo regenerarlo

1. Tener a mano la referencia de la decisión escrita (documento, fecha y persona que la tomó).
2. Desde la raíz del repositorio:

   ```
   node pruebas/golden-master/regenerar.js --decision "Decisión de <persona>, <dd/mm/aaaa>: <alcance> (<documento>)"
   ```

   Sin `--decision` el script no escribe nada. Si la salida no ha cambiado, tampoco.
3. Revisar el diff de `master-ciclo-factura.json` y comprobar que **solo** cambian los campos que la decisión
   autoriza. Cualquier otro cambio es un efecto no previsto y hay que investigarlo antes de seguir.
4. Comprobar que `HISTORIAL.md` tiene la nueva fila y confirmar los dos ficheros en el mismo commit que el
   cambio de código, citando la decisión y los `ANO-NNN` afectados.
5. Ejecutar `node --test` completo.
