// generar.js - ejecuta los casos fijos del golden master contra el código ACTUAL y devuelve
// su salida completa, ya normalizada (claves ordenadas, números especiales explícitos).
// Lo usan el test (golden-master.test.js) y el regenerador (regenerar.js). No escribe nada.

'use strict';

var comun = require('../ayudas/comun'); // fija TZ = Europe/Madrid antes que nada
var entorno = require('../ayudas/entorno');
var semilla = require('../ayudas/semilla');
var CASOS = require('./casos');

var RELOJ = '2026-11-16T10:00:00';
var FORMATO = 'golden-master-ciclo-factura/1';

var db = entorno.instalarDobles().db;
var facturas = entorno.requerir('routes/facturas');
var informes = entorno.requerir('routes/informes');
var util = entorno.requerir('lib/util');

// ---------- normalización estable ----------
// JSON no representa NaN, ±Infinity ni −0: se escriben como { "$numero": "NaN" } etc. para que
// el master conserve el valor exacto. El resto de números se guardan con todos sus decimales
// (la representación más corta que JavaScript reconvierte al mismo número).
function normalizar(v) {
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return { $numero: 'NaN' };
    if (v === Infinity) return { $numero: 'Infinity' };
    if (v === -Infinity) return { $numero: '-Infinity' };
    if (Object.is(v, -0)) return { $numero: '-0' };
    return v;
  }
  if (Array.isArray(v)) return v.map(normalizar);
  if (v && typeof v === 'object') {
    var o = {};
    Object.keys(v).sort().forEach(function (k) { if (v[k] !== undefined) o[k] = normalizar(v[k]); });
    return o;
  }
  return v;
}

function serializar(obj) {
  return JSON.stringify(normalizar(obj), null, 2) + '\n';
}

// ---------- ejecución de un caso ----------
function prepararDatos(caso) {
  var s = semilla.semilla();
  Object.keys(caso.cambiosClientes || {}).forEach(function (id) {
    Object.assign(s.clientes.find(function (c) { return c.id === Number(id); }), caso.cambiosClientes[id]);
  });
  return s;
}

async function lineaCSV(f) {
  var cli = db.estado().clientes.find(function (c) { return c.id === f.cliente_id; });
  // la fila que devolvería el SELECT de export-gestoria (cabecera + ficha actual del cliente)
  var fila = { numero: f.numero, fecha: f.fecha, nombre: cli.nombre, nif: cli.nif, base: f.base, iva: f.iva, recargo: f.recargo, total: f.total, estado: f.estado };
  var guardado = db.estado().filasInforme;
  db.estado().filasInforme = [fila];
  var r = await entorno.invocar(informes, 'GET', '/export-gestoria', { query: { anyo: String(f.fecha).slice(0, 4) } });
  db.estado().filasInforme = guardado;
  return r.cuerpo.split('\r\n')[2]; // la línea 0 es la clave de la gestoría: NO se guarda
}

async function ejecutarCaso(caso) {
  comun.fijarReloj(RELOJ);
  try {
    var inicial = prepararDatos(caso);
    db.reiniciar(inicial);
    var peticion = caso.accion === 'alta'
      ? { ruta: '/nueva', datos: { body: caso.body } }
      : { ruta: '/:id/rectificar', datos: { params: { id: caso.id_factura }, body: caso.body } };
    var r = await comun.capturarConsola(function () {
      return entorno.invocar(facturas, 'POST', peticion.ruta, peticion.datos);
    });
    var sentencias = db.llamadas().slice();
    var estado = db.estado();
    var nuevas = estado.facturas.slice(inicial.facturas.length);
    var cambiadas = inicial.facturas.map(function (antes) {
      var despues = estado.facturas.find(function (f) { return f.id === antes.id; });
      return antes.estado !== despues.estado ? { numero: antes.numero, estadoAntes: antes.estado, estadoDespues: despues.estado } : null;
    }).filter(Boolean);
    var presentacion = [];
    for (var f of nuevas) {
      presentacion.push({
        numero: f.numero,
        lineaCSV: await lineaCSV(f),
        fechaImpresa: util.fechaBonita(f.fecha),
        vencimientoImpreso: util.fechaBonita(f.vencimiento),
        lineasImpresas: estado.lineas.filter(function (l) { return l.factura_id === f.id; }).map(function (l) {
          return [l.descripcion, String(l.cantidad), util.formatearImporte(l.precio), l.tipo_iva + ' %', util.formatearImporte(l.base), util.formatearImporte(l.cuota_iva), l.cuota_recargo ? util.formatearImporte(l.cuota_recargo) : ''].join(' | ');
        })
      });
    }
    return {
      titulo: caso.titulo,
      ejercita: caso.ejercita,
      entrada: { accion: caso.accion, id_factura: caso.id_factura, cambiosClientes: caso.cambiosClientes, body: caso.body },
      salida: {
        respuesta: r.valor,
        consola: r.consola,
        sentencias: sentencias,
        contadoresFinales: estado.contadores,
        facturasNuevas: nuevas,
        lineasNuevas: estado.lineas.slice(inicial.lineas.length),
        cambiosDeEstado: cambiadas,
        presentacion: presentacion
      }
    };
  } finally {
    comun.soltarReloj();
  }
}

async function generar() {
  var casos = {};
  for (var caso of CASOS) casos[caso.id] = await ejecutarCaso(caso);
  return normalizar({
    formato: FORMATO,
    condiciones: { reloj: RELOJ, zonaHoraria: process.env.TZ, datosIniciales: 'semilla de db.js:93-180 (pruebas/ayudas/semilla.js)' },
    casos: casos
  });
}

module.exports = { generar: generar, serializar: serializar, normalizar: normalizar, FORMATO: FORMATO };
