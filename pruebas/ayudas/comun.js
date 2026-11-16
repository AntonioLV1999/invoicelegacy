// comun.js - ayudas compartidas por los tests de caracterización.
//
// DEBE ser lo primero que cargue cada fichero de test: fija la zona horaria antes de que
// nadie use Date. El comportamiento de lib/util.js depende de ella (ANO-030, contradicción
// 12) y la oficina trabaja en Europe/Madrid (SUPOSICIÓN del reconocimiento, apéndices A).

'use strict';

process.env.TZ = 'Europe/Madrid';

var mock = require('node:test').mock;
var path = require('node:path');
var spawnSync = require('node:child_process').spawnSync;
var semilla = require('./semilla');

var RAIZ = path.resolve(__dirname, '..', '..');

// Reloj del proceso fijado a una hora local de Madrid ('2026-11-16T10:00:00').
// Solo se simula Date: setTimeout/setImmediate siguen siendo reales.
function fijarReloj(isoLocal) {
  mock.timers.reset();
  mock.timers.enable({ apis: ['Date'], now: new Date(isoLocal).getTime() });
}

function soltarReloj() {
  mock.timers.reset();
}

// Ejecuta `fn` capturando lo que escribe en console.log. Devuelve { valor, consola }.
async function capturarConsola(fn) {
  var original = console.log;
  var lineas = [];
  console.log = function () { lineas.push(Array.prototype.slice.call(arguments).join(' ')); };
  try {
    var valor = await fn();
    return { valor: valor, consola: lineas };
  } finally {
    console.log = original;
  }
}

// Filas tal como las devolvería la consulta de la remesa (contratos JOIN clientes) a
// partir de la semilla, con cambios opcionales por id de contrato.
function contratosRemesa(ids, cambios) {
  var s = semilla.semilla();
  return s.contratos
    .filter(function (c) { return !ids || ids.indexOf(c.id) >= 0; })
    .map(function (c) {
      var cl = s.clientes.find(function (x) { return x.id === c.cliente_id; });
      return Object.assign({}, c, {
        nombre: cl.nombre, recargo_equivalencia: cl.recargo_equivalencia, dias_pago: cl.dias_pago
      }, (cambios || {})[c.id] || {});
    });
}

var CONTADORES_SEMILLA = [{ serie: 'FA', anyo: 2026, ultimo: 108 }, { serie: 'RE', anyo: 2026, ultimo: 1 }];

// Evalúa una expresión con lib/util.js en un proceso hijo con otra zona horaria.
// `expr` recibe `u` (lib/util) y debe devolver algo serializable en JSON.
function enZonaHoraria(tz, expr, reloj) {
  var codigo =
    'var u = require(' + JSON.stringify(path.join(RAIZ, 'lib', 'util.js')) + ');' +
    (reloj ? 'var R = new Date(' + JSON.stringify(reloj) + ').getTime(); var D = Date;' +
      'globalThis.Date = function () { return arguments.length ? new (Function.prototype.bind.apply(D, [null].concat([].slice.call(arguments))))() : new D(R); };' +
      'Date.prototype = D.prototype; Date.now = function () { return R; };' : '') +
    'process.stdout.write(JSON.stringify((function (u) { return ' + expr + '; })(u)));';
  var env = Object.assign({}, process.env, { TZ: tz });
  var r = spawnSync(process.execPath, ['-e', codigo], { env: env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout);
}

module.exports = {
  RAIZ: RAIZ,
  fijarReloj: fijarReloj,
  soltarReloj: soltarReloj,
  capturarConsola: capturarConsola,
  contratosRemesa: contratosRemesa,
  CONTADORES_SEMILLA: CONTADORES_SEMILLA,
  enZonaHoraria: enZonaHoraria
};
