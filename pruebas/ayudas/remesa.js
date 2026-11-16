// remesa.js - lanza scripts/remesa_mensual.js en un proceso hijo con el doble de BD.
//
// El proceso hijo se ejecuta en un directorio temporal vacío: aunque algo fallara, nunca
// podría abrir datos/gesfact.db del repositorio (config.RUTA_BD es relativa al directorio
// de trabajo, ANO-029).

'use strict';

var path = require('node:path');
var os = require('node:os');
var fs = require('node:fs');
var spawnSync = require('node:child_process').spawnSync;

var RAIZ = path.resolve(__dirname, '..', '..');
var SCRIPT = path.join(RAIZ, 'scripts', 'remesa_mensual.js');
var PRECARGA = path.join(__dirname, 'precarga-remesa.js');

function revivir(v) {
  return JSON.parse(JSON.stringify(v), function (k, x) {
    if (x === '__NaN__') return NaN;
    if (x === '__Infinity__') return Infinity;
    if (x === '__-Infinity__') return -Infinity;
    if (x === '__-0__') return -0;
    return x;
  });
}

// opciones: { mes, datos: {contratos, contadores}, reloj: 'AAAA-MM-DDTHH:MM:SS', tz }
function ejecutarRemesa(opciones) {
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gesfact-remesa-'));
  try {
    var args = ['--require', PRECARGA, SCRIPT];
    if (opciones.mes !== undefined) args.push(opciones.mes);
    var env = Object.assign({}, process.env, {
      TZ: opciones.tz || 'Europe/Madrid',
      GESFACT_DOBLE: JSON.stringify(opciones.datos || {})
    });
    if (opciones.config) env.GESFACT_CONFIG = JSON.stringify(opciones.config);
    else delete env.GESFACT_CONFIG;
    if (opciones.reloj) env.GESFACT_RELOJ = opciones.reloj;
    else delete env.GESFACT_RELOJ;
    var r = spawnSync(process.execPath, args, { cwd: dir, env: env, encoding: 'utf8', timeout: 20000 });
    var salida = r.stdout || '';
    var i = salida.lastIndexOf('\n@@DOBLE@@');
    var doble = i >= 0 ? JSON.parse(salida.slice(i + 10).trim()) : null;
    return {
      codigo: r.status,
      consola: (i >= 0 ? salida.slice(0, i) : salida).replace(/\r\n/g, '\n'),
      errores: (r.stderr || '').replace(/\r\n/g, '\n'),
      estado: doble ? revivir(doble.estado) : null,
      llamadas: doble ? revivir(doble.llamadas) : null,
      // el directorio de trabajo debe seguir vacío: el doble impide crear datos/gesfact.db
      ficherosCreados: fs.readdirSync(dir)
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { ejecutarRemesa: ejecutarRemesa };
