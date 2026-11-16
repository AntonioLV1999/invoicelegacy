// Caracterización de routes/informes.js (criticidad ALTA, mapa-sistema.md §2.7): resumen de
// IVA y fichero CSV para la gestoría. Las sumas y filtros (SUM, GROUP BY, WHERE, ORDER BY) los
// hace SQLite y quedan FUERA de la red; aquí se congela el periodo calculado, el SQL enviado y
// el formato exacto del CSV a partir de las filas que devolvería la consulta.
// La clave de exportación no se copia en ningún test (CLAUDE.md): se compara con config.

'use strict';

var comun = require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var entorno = require('../ayudas/entorno');
var semilla = require('../ayudas/semilla');

var db = entorno.instalarDobles().db;
var config = entorno.requerir('config');
var informes = entorno.requerir('routes/informes');

var SQL_IVA = 'SELECT l.tipo_iva, SUM(l.base) AS base, SUM(l.cuota_iva) AS cuota, SUM(l.cuota_recargo) AS recargo FROM lineas l JOIN facturas f ON f.id = l.factura_id WHERE f.fecha >= ? AND f.fecha <= ? GROUP BY l.tipo_iva ORDER BY l.tipo_iva DESC';
var SQL_CSV = 'SELECT f.numero, f.fecha, c.nombre, c.nif, f.base, f.iva, f.recargo, f.total, f.estado FROM facturas f JOIN clientes c ON c.id = f.cliente_id WHERE f.fecha LIKE ? ORDER BY f.numero';

function iva(query) {
  db.reiniciar({ filasInforme: [{ tipo_iva: 21, base: 1, cuota: 0.21, recargo: 0 }] });
  return entorno.invocar(informes, 'GET', '/iva', { query: query });
}
// Filas que devolvería el SQL del CSV para la semilla (cabeceras + ficha actual del cliente)
function filasCSVSemilla() {
  var s = semilla.semilla();
  return s.facturas.map(function (f) {
    var c = s.clientes.find(function (x) { return x.id === f.cliente_id; });
    return { numero: f.numero, fecha: f.fecha, nombre: c.nombre, nif: c.nif, base: f.base, iva: f.iva, recargo: f.recargo, total: f.total, estado: f.estado };
  }).sort(function (a, b) { return a.numero < b.numero ? -1 : 1; });
}
function csv(query, filas) {
  db.reiniciar({ filasInforme: filas });
  return entorno.invocar(informes, 'GET', '/export-gestoria', { query: query });
}

test.beforeEach(function () { comun.fijarReloj('2026-11-16T10:00:00'); });
test.afterEach(comun.soltarReloj);

describe('RN-44 · Resumen de IVA: líneas por tipo, en el trimestre de la fecha de factura', function () {
  it('trimestres: 1T 01-01..03-31; 2T 04-01..06-31; 3T 07-01..09-31; 4T 10-01..12-31 (siempre «31», compara texto)', async function () {
    var periodos = [];
    for (var t = 1; t <= 4; t++) {
      await iva({ anyo: '2026', trimestre: String(t) });
      periodos.push(db.llamadas()[0].params);
    }
    assert.deepEqual(periodos, [['2026-01-01', '2026-03-31'], ['2026-04-01', '2026-06-31'], ['2026-07-01', '2026-09-31'], ['2026-10-01', '2026-12-31']]);
  });
  it('SQL exacto: suma desde «lineas» de todas las facturas del periodo, agrupado por tipo de mayor a menor', async function () {
    var r = await iva({ anyo: '2026', trimestre: '1' });
    assert.deepEqual(db.llamadas(), [{ metodo: 'all', sql: SQL_IVA, params: ['2026-01-01', '2026-03-31'] }]);
    assert.equal(r.vista, 'informe_iva');
    assert.deepEqual([r.datos.anyo, r.datos.trimestre, r.datos.filas], [2026, 1, [{ tipo_iva: 21, base: 1, cuota: 0.21, recargo: 0 }]]);
  });
});

describe('RN-46 · Resumen de IVA: año y trimestre por defecto', function () {
  it('sin año → año en curso (2026); sin trimestre, 0 o no numérico → 1T sin avisar', async function () {
    for (var q of [{}, { trimestre: '0' }, { trimestre: 'abc' }]) {
      var r = await iva(q);
      assert.deepEqual([r.datos.anyo, r.datos.trimestre, db.llamadas()[0].params], [2026, 1, ['2026-01-01', '2026-03-31']], JSON.stringify(q));
    }
  });
  it('frontera del trimestre: 4 → 4T; 5 → excepción TypeError sin respuesta HTTP propia; −1 → excepción', async function () {
    assert.equal((await iva({ trimestre: '4' })).datos.trimestre, 4);
    assert.deepEqual(await iva({ trimestre: '5' }), { tipo: 'excepcion', error: "TypeError: Cannot read properties of undefined (reading '0')", estado: 200 });
    assert.equal((await iva({ trimestre: '-1' })).tipo, 'excepcion');
  });
  it('ejemplo del documento: el 15/01/2027 el menú de informes ofrece solo el año en curso (2027)', async function () {
    comun.fijarReloj('2027-01-15T10:00:00');
    assert.deepEqual(await entorno.invocar(informes, 'GET', '/', {}), { tipo: 'render', vista: 'informes', datos: { anyo: 2027 }, estado: 200 });
  });
});

describe('RN-48 · Fichero para la gestoría: qué facturas y qué importes', function () {
  it('SQL exacto: cabeceras (no líneas) de las facturas con fecha del año, de las dos series, ordenadas por número', async function () {
    await csv({ anyo: '2026' }, []);
    assert.deepEqual(db.llamadas(), [{ metodo: 'all', sql: SQL_CSV, params: ['2026-%'] }]);
  });
  it('sin año → el del año en curso', async function () {
    var r = await csv({}, []);
    assert.deepEqual(db.llamadas()[0].params, ['2026-%']);
    assert.equal(r.cabeceras['Content-Disposition'], 'attachment; filename="facturas_2026.csv"');
  });
});

describe('RN-49 · Fichero para la gestoría: formato', function () {
  it('ejemplo del documento (semilla 2026): líneas exactas, CRLF, sin salto final, cabeceras HTTP', async function () {
    var r = await csv({ anyo: '2026' }, filasCSVSemilla());
    var lineas = r.cuerpo.split('\r\n');
    assert.equal(lineas[0], 'CLAVE;' + config.CLAVE_EXPORT_GESTORIA);
    assert.deepEqual(lineas.slice(1), [
      'NUMERO;FECHA;CLIENTE;NIF;BASE;IVA;RECARGO;TOTAL;ESTADO',
      'FA-2026-000101;31/01/2026;Cafetería La Parada, S.C.;J45771102;133,20;27,97;0,00;161,17;cobrada',
      'FA-2026-000102;06/02/2026;Ferretería El Tornillo;03488812K;115,60;24,28;6,01;145,89;cobrada',
      'FA-2026-000103;20/02/2026;Hotel Vega Baja, S.A.;A45102939;1.000,00;210,00;0,00;1.210,00;cobrada',
      'FA-2026-000104;05/03/2026;Panadería Hnos. Cifuentes;E45332218;152,30;6,09;0,76;159,15;cobrada',
      'FA-2026-000105;31/03/2026;Restaurante Casa Ubaldo, S.L.;B45610021;2.287,75;468,63;0,00;2.756,38;emitida',
      'FA-2026-000106;30/04/2026;Bar Nuevo Siglo;70355910k;101,61;20,62;0,00;122,23;rectificada',
      'FA-2026-000107;06/05/2026;Bar Nuevo Siglo;70355910k;101,61;20,62;0,00;122,23;emitida',
      'FA-2026-000108;31/05/2026;Cafetería La Parada, S.C.;J45771102;128,05;26,19;0,00;154,24;emitida',
      'RE-2026-000001;06/05/2026;Bar Nuevo Siglo;70355910k;-101,61;-20,62;0,00;-122,23;emitida'
    ]);
    assert.equal(r.cuerpo.endsWith('\r\n'), false);
    assert.equal(r.cuerpo.charCodeAt(0), 'C'.charCodeAt(0)); // sin BOM
    assert.deepEqual(r.cabeceras, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="facturas_2026.csv"' });
  });
  it('vacío: solo la línea de clave y la de títulos', async function () {
    var r = await csv({ anyo: '2025' }, []);
    assert.deepEqual(r.cuerpo.split('\r\n').slice(1), ['NUMERO;FECHA;CLIENTE;NIF;BASE;IVA;RECARGO;TOTAL;ESTADO']);
  });
  it('NIF nulo → campo vacío; importes NaN o nulos → «0,00»; fecha nula → vacía', async function () {
    var r = await csv({ anyo: '2026' }, [{ numero: 'FA-2026-000200', fecha: null, nombre: 'X', nif: null, base: NaN, iva: null, recargo: 0, total: 1234567.5, estado: 'emitida' }]);
    assert.equal(r.cuerpo.split('\r\n')[2], 'FA-2026-000200;;X;;0,00;0,00;0,00;1.234.567,50;emitida');
  });
});
