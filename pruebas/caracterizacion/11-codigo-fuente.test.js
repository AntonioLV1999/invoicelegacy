// Reglas que se comprueban sobre el propio código fuente (lectura, nunca escritura), porque
// lo que afirman es una ausencia: no hay forma de borrar facturas, no hay transacciones.
// Fuente: búsquedas descritas en reglas-de-negocio.md RN-30 y registro A-04 (13 y 16/11/2026).

'use strict';

require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');

var RAIZ = path.resolve(__dirname, '..', '..');
var FICHEROS = ['server.js', 'db.js', 'config.js', 'lib/util.js', 'lib/numeracion.js', 'services/calculo.js', 'services/email.js',
  'routes/clientes.js', 'routes/articulos.js', 'routes/contratos.js', 'routes/facturas.js', 'routes/informes.js',
  'scripts/remesa_mensual.js', 'public/js/factura.js'];

function fuente(f) { return fs.readFileSync(path.join(RAIZ, f), 'utf8'); }

describe('RN-30 · Las facturas no se borran nunca', function () {
  it('ejemplo del documento: ningún fichero .js del programa contiene DELETE', function () {
    var conDelete = FICHEROS.filter(function (f) { return /\bDELETE\b/i.test(fuente(f)); });
    assert.deepEqual(conDelete, []);
  });
  it('solo hay dos UPDATE sobre facturas (cobrar y rectificar) y ninguno sobre lineas', function () {
    var updates = [];
    FICHEROS.forEach(function (f) {
      (fuente(f).match(/UPDATE (facturas|lineas)[^"]*/g) || []).forEach(function (m) { updates.push(f + ': ' + m.trim()); });
    });
    assert.deepEqual(updates, [
      "routes/facturas.js: UPDATE facturas SET estado = 'cobrada' WHERE id = ? AND estado = 'emitida'",
      "routes/facturas.js: UPDATE facturas SET estado = 'rectificada' WHERE id = ?"
    ]);
  });
});

describe('ANO-001 / ANO-004 · Sin transacciones', function () {
  it('CONGELA comportamiento actual: ANO-001 · ningún fichero usa BEGIN, COMMIT ni ROLLBACK', function () {
    var conTransaccion = FICHEROS.filter(function (f) { return /\b(BEGIN|COMMIT|ROLLBACK)\b/.test(fuente(f)); });
    assert.deepEqual(conTransaccion, []);
  });
  it('CONGELA comportamiento actual: ANO-001 · facturas.numero no es UNIQUE en el esquema', function () {
    assert.match(fuente('db.js'), /'numero TEXT NOT NULL,' \+/);
    assert.doesNotMatch(fuente('db.js'), /numero TEXT[^,]*UNIQUE/);
  });
});
