// entorno.js - carga módulos de GesFact con dobles de prueba, sin modificar el código.
//
// - Sustituye db.js por el doble de pruebas/ayudas/doble-bd.js inyectándolo en require.cache.
//   Así no se abre ninguna base de datos (ni la de producción ni ninguna otra).
// - Sustituye el paquete 'express' (no instalado) por un Router mínimo que solo guarda los
//   manejadores de cada ruta, para poder invocarlos con peticiones y respuestas falsas.
//
// Nada de esto toca ficheros de producción: todo ocurre en la memoria del proceso de test.

'use strict';

var path = require('node:path');
var Module = require('node:module');
var crearDobleBD = require('./doble-bd').crearDobleBD;

var RAIZ = path.resolve(__dirname, '..', '..');
var RUTA_DB = path.join(RAIZ, 'db.js');
var ID_EXPRESS = '<<doble-express>>';

function moduloFalso(id, exportsFalsos) {
  var m = new Module(id, null);
  m.filename = id;
  m.loaded = true;
  m.exports = exportsFalsos;
  return m;
}

function expressFalso() {
  function Router() {
    var rutas = [];
    function registrar(metodo) {
      return function (ruta, manejador) { rutas.push({ metodo: metodo, ruta: ruta, manejador: manejador }); };
    }
    return { rutas: rutas, get: registrar('GET'), post: registrar('POST') };
  }
  return { Router: Router };
}

var instalado = null;

// Instala los dobles (una vez por proceso; node --test usa un proceso por fichero).
function instalarDobles() {
  if (instalado) return instalado;
  var db = crearDobleBD();
  require.cache[RUTA_DB] = moduloFalso(RUTA_DB, db);

  var resolverOriginal = Module._resolveFilename;
  Module._resolveFilename = function (peticion) {
    if (peticion === 'express') return ID_EXPRESS;
    return resolverOriginal.apply(this, arguments);
  };
  require.cache[ID_EXPRESS] = moduloFalso(ID_EXPRESS, expressFalso());

  instalado = { db: db };
  return instalado;
}

function requerir(relativa) {
  return require(path.join(RAIZ, relativa));
}

// Busca el manejador de una ruta tal como la declaró el router (p. ej. '/:id/rectificar').
function manejador(router, metodo, ruta) {
  var r = router.rutas.find(function (x) { return x.metodo === metodo && x.ruta === ruta; });
  if (!r) throw new Error('Ruta no declarada: ' + metodo + ' ' + ruta);
  return r.manejador;
}

// Invoca un manejador con una petición falsa. Devuelve una promesa con lo que hizo la
// respuesta: { tipo: 'redirect'|'send'|'render'|'sin-respuesta'|'excepcion', ... }.
// Si en `esperaMs` no responde, se considera que la petición se queda colgada.
function invocar(router, metodo, ruta, peticion, esperaMs) {
  var h = manejador(router, metodo, ruta);
  peticion = peticion || {};
  var req = { body: peticion.body || {}, params: peticion.params || {}, query: peticion.query || {} };
  return new Promise(function (resolve) {
    var codigo = 200;
    var cabeceras = {};
    var hecho = false;
    function fin(r) {
      if (hecho) return;
      hecho = true;
      clearTimeout(temporizador);
      r.estado = codigo;
      if (Object.keys(cabeceras).length) r.cabeceras = cabeceras;
      resolve(r);
    }
    var res = {
      status: function (c) { codigo = c; return res; },
      setHeader: function (k, v) { cabeceras[k] = v; },
      send: function (cuerpo) { fin({ tipo: 'send', cuerpo: cuerpo }); },
      redirect: function (url) { codigo = 302; fin({ tipo: 'redirect', url: url }); },
      render: function (vista, datos) { fin({ tipo: 'render', vista: vista, datos: datos }); }
    };
    var temporizador = setTimeout(function () { fin({ tipo: 'sin-respuesta' }); }, esperaMs || 300);
    try {
      h(req, res);
    } catch (e) {
      fin({ tipo: 'excepcion', error: e.constructor.name + ': ' + e.message });
    }
  });
}

module.exports = {
  RAIZ: RAIZ,
  instalarDobles: instalarDobles,
  requerir: requerir,
  invocar: invocar
};
