// precarga-remesa.js - se carga con `node --require` antes de scripts/remesa_mensual.js.
//
// El script de remesa se ejecuta al cargarse, lee process.argv y termina con
// process.exit(), así que se lanza en un proceso hijo (ver remesa.js). Esta precarga:
//   1. inyecta el doble de BD con los datos que manda el test en GESFACT_DOBLE (JSON);
//   2. si GESFACT_RELOJ trae una fecha ISO, fija el reloj (new Date() sin argumentos y
//      Date.now()) a ese instante; new Date(texto) sigue funcionando igual;
//   3. al salir, escribe en la salida estándar el estado final del doble y las llamadas SQL.

'use strict';

var fs = require('node:fs');
var path = require('node:path');
var Module = require('node:module');
var crearDobleBD = require('./doble-bd').crearDobleBD;

var RUTA_DB = path.resolve(__dirname, '..', '..', 'db.js');
var db = crearDobleBD();
db.reiniciar(JSON.parse(process.env.GESFACT_DOBLE || '{}'));

var m = new Module(RUTA_DB, null);
m.filename = RUTA_DB;
m.loaded = true;
m.exports = db;
require.cache[RUTA_DB] = m;

// Valores de config.js alterados SOLO en la memoria de este proceso (contradicción 05:
// qué pasaría si cambiara VENCIMIENTO_DIAS). El fichero config.js no se toca.
if (process.env.GESFACT_CONFIG) {
  Object.assign(require(path.resolve(__dirname, '..', '..', 'config.js')), JSON.parse(process.env.GESFACT_CONFIG));
}

if (process.env.GESFACT_RELOJ) {
  var DateReal = Date;
  var fijo = new DateReal(process.env.GESFACT_RELOJ).getTime();
  var DateFijo = function () {
    if (!(this instanceof DateFijo)) return new DateReal(fijo).toString();
    var args = Array.prototype.slice.call(arguments);
    return args.length === 0 ? new DateReal(fijo) : new (Function.prototype.bind.apply(DateReal, [null].concat(args)))();
  };
  DateFijo.prototype = DateReal.prototype;
  DateFijo.now = function () { return fijo; };
  DateFijo.UTC = DateReal.UTC;
  DateFijo.parse = DateReal.parse;
  globalThis.Date = DateFijo;
}

function aJSON(v) {
  return JSON.stringify(v, function (k, x) {
    if (typeof x === 'number' && !isFinite(x)) return '__' + String(x) + '__';
    if (typeof x === 'number' && Object.is(x, -0)) return '__-0__';
    return x;
  });
}

process.on('exit', function (codigo) {
  fs.writeSync(1, '\n@@DOBLE@@' + aJSON({ codigo: codigo, estado: db.estado(), llamadas: db.llamadas() }) + '\n');
});
