// Golden master del ciclo de vida de una factura (alta manual y rectificación).
// Regenera la salida de los 12 casos fijos de casos.js con el código ACTUAL y la compara en
// profundidad con master-ciclo-factura.json. Cada diferencia indica el caso y el campo exactos.
// Si falla: el comportamiento ha cambiado. NO se regenera el master para «ponerlo en verde»;
// ver LEEME.md de esta carpeta.

'use strict';

require('../ayudas/comun');
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var gm = require('./generar');

var MASTER = path.join(__dirname, 'master-ciclo-factura.json');

function describir(v) {
  if (v && typeof v === 'object' && v.$numero !== undefined) return v.$numero;
  return JSON.stringify(v);
}

// Recorre los dos árboles y devuelve una lista de diferencias con su ruta completa.
function diferencias(esperado, obtenido, ruta, salida) {
  salida = salida || [];
  var tipoE = Array.isArray(esperado) ? 'array' : typeof esperado;
  var tipoO = Array.isArray(obtenido) ? 'array' : typeof obtenido;
  if (esperado === null || obtenido === null || tipoE !== tipoO || tipoE !== 'object' && tipoE !== 'array' ||
      (esperado.$numero !== undefined) || (obtenido.$numero !== undefined)) {
    if (JSON.stringify(esperado) !== JSON.stringify(obtenido)) {
      salida.push(ruta + ': esperado ' + describir(esperado) + ', obtenido ' + describir(obtenido));
    }
    return salida;
  }
  if (tipoE === 'array') {
    if (esperado.length !== obtenido.length) salida.push(ruta + ': esperaba ' + esperado.length + ' elementos, hay ' + obtenido.length);
    for (var i = 0; i < Math.max(esperado.length, obtenido.length); i++) {
      if (i >= esperado.length) salida.push(ruta + '[' + i + ']: sobra ' + describir(obtenido[i]));
      else if (i >= obtenido.length) salida.push(ruta + '[' + i + ']: falta ' + describir(esperado[i]));
      else diferencias(esperado[i], obtenido[i], ruta + '[' + i + ']', salida);
    }
    return salida;
  }
  var claves = Object.keys(Object.assign({}, esperado, obtenido)).sort();
  claves.forEach(function (k) {
    var r = ruta ? ruta + '.' + k : k;
    if (!(k in obtenido)) salida.push(r + ': falta el campo (esperado ' + describir(esperado[k]) + ')');
    else if (!(k in esperado)) salida.push(r + ': campo nuevo no previsto (' + describir(obtenido[k]) + ')');
    else diferencias(esperado[k], obtenido[k], r, salida);
  });
  return salida;
}

test.describe('Golden master · ciclo de vida de una factura (flujo-factura.md, caminos A y C)', function () {
  var master;
  var actual;

  test.before(async function () {
    assert.ok(fs.existsSync(MASTER), 'No existe ' + MASTER + '. Ver LEEME.md para crearlo.');
    master = JSON.parse(fs.readFileSync(MASTER, 'utf8'));
    actual = await gm.generar();
  });

  test.it('el formato y las condiciones del master coinciden con las del generador', function () {
    assert.equal(master.formato, gm.FORMATO);
    assert.deepEqual(diferencias(master.condiciones, actual.condiciones, 'condiciones'), []);
  });

  test.it('el juego de casos es el mismo (ni se añaden ni se quitan casos sin regenerar)', function () {
    assert.deepEqual(Object.keys(actual.casos), Object.keys(master.casos));
  });

  test.it('el master no contiene la clave de exportación de la gestoría', function () {
    assert.equal(fs.readFileSync(MASTER, 'utf8').indexOf('CLAVE;'), -1);
  });

  // Un test por caso, para que el informe señale el caso exacto
  require('./casos').forEach(function (caso) {
    test.it('caso ' + caso.id + ' · ' + caso.titulo, function () {
      var e = master.casos[caso.id];
      var o = actual.casos[caso.id];
      assert.ok(e, 'el caso ' + caso.id + ' no está en el master');
      var d = diferencias(e, o, caso.id);
      assert.deepEqual(d, [], 'El caso ' + caso.id + ' («' + caso.titulo + '») ha cambiado:\n  - ' + d.join('\n  - '));
    });
  });
});

module.exports = { diferencias: diferencias };
