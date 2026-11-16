// Caracterización de lib/numeracion.js (criticidad ALTA, mapa-sistema.md §2.2).
// La tabla `contadores` la sustituye el doble de BD (pruebas/ayudas/doble-bd.js): se congela
// la lógica JavaScript y el SQL exacto que se envía, no el comportamiento de SQLite.

'use strict';

var comun = require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var entorno = require('../ayudas/entorno');

var db = entorno.instalarDobles().db;
var num = entorno.requerir('lib/numeracion');

function siguiente(serie) {
  return new Promise(function (resolve) {
    num.siguienteNumero(serie, function (err, numero) { resolve([err ? err.message : null, numero]); });
  });
}

test.beforeEach(function () { comun.fijarReloj('2026-11-16T10:00:00'); });
test.afterEach(comun.soltarReloj);

describe('RN-26 · Formato del número: SERIE-AAAA-NNNNNN', function () {
  it('ejemplo del documento: con FA/2026 en 108 → FA-2026-000109; con RE/2026 en 1 → RE-2026-000002', async function () {
    db.reiniciar({ contadores: comun.CONTADORES_SEMILLA });
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2026-000109']);
    assert.deepEqual(await siguiente('RE'), [null, 'RE-2026-000002']);
  });
  it('frontera de 6 cifras: 999.998 → «999999»; 999.999 → «1000000» (7 cifras, sin aviso)', async function () {
    db.reiniciar({ contadores: [{ serie: 'FA', anyo: 2026, ultimo: 999998 }] });
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2026-999999']);
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2026-1000000']);
  });
  it('formatear: 1 → 000001; 1.234.567 → 1234567', function () {
    assert.equal(num.formatear('FA', 2026, 1), 'FA-2026-000001');
    assert.equal(num.formatear('RE', 2027, 1234567), 'RE-2027-1234567');
  });
});

describe('RN-27 · Contador independiente por serie y año, que empieza en 1', function () {
  it('ejemplo del documento: primera rectificativa de 2027 → RE-2027-000001 aunque RE/2026 vaya por 2', async function () {
    comun.fijarReloj('2027-01-15T10:00:00');
    db.reiniciar({ contadores: [{ serie: 'RE', anyo: 2026, ultimo: 2 }] });
    assert.deepEqual(await siguiente('RE'), [null, 'RE-2027-000001']);
    assert.deepEqual(db.estado().contadores, [{ serie: 'RE', anyo: 2026, ultimo: 2 }, { serie: 'RE', anyo: 2027, ultimo: 1 }]);
  });
  it('sin contador del año: lo crea a 0 y reserva el 1; FA y RE no se mezclan', async function () {
    db.reiniciar({ contadores: [] });
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2026-000001']);
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2026-000002']);
    assert.deepEqual(await siguiente('RE'), [null, 'RE-2026-000001']);
    assert.deepEqual(db.estado().contadores, [{ serie: 'FA', anyo: 2026, ultimo: 2 }, { serie: 'RE', anyo: 2026, ultimo: 1 }]);
  });
  it('SQL exacto enviado: SELECT, INSERT (solo si falta) y UPDATE, en sentencias separadas', async function () {
    db.reiniciar({ contadores: [] });
    await siguiente('FA');
    assert.deepEqual(db.llamadas(), [
      { metodo: 'get', sql: 'SELECT ultimo FROM contadores WHERE serie = ? AND anyo = ?', params: ['FA', 2026] },
      { metodo: 'run', sql: 'INSERT INTO contadores (serie, anyo, ultimo) VALUES (?,?,0)', params: ['FA', 2026] },
      { metodo: 'run', sql: 'UPDATE contadores SET ultimo = ? WHERE serie = ? AND anyo = ?', params: [1, 'FA', 2026] }
    ]);
  });
});

describe('RN-28 · El año del número es el del reloj del equipo', function () {
  it('ejemplo del documento: lanzado el 01/01/2027 → FA-2027-000001 aunque FA/2026 vaya por 108', async function () {
    comun.fijarReloj('2027-01-01T09:00:00');
    db.reiniciar({ contadores: comun.CONTADORES_SEMILLA });
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2027-000001']);
  });
  it('frontera de nochevieja: 31/12/2026 23:59:59 → año 2026; 01/01/2027 00:00:00 → año 2027', async function () {
    comun.fijarReloj('2026-12-31T23:59:59');
    db.reiniciar({ contadores: comun.CONTADORES_SEMILLA });
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2026-000109']);
    comun.fijarReloj('2027-01-01T00:00:00');
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2027-000001']);
  });
});

describe('RN-29 · El número se consume al asignarse', function () {
  it('el UPDATE del contador se envía antes de devolver el número (nada lo deshace)', async function () {
    db.reiniciar({ contadores: comun.CONTADORES_SEMILLA });
    await siguiente('FA');
    assert.equal(db.estado().contadores[0].ultimo, 109);
  });
});
