// Caracterización de cobro y rectificación (routes/facturas.js:104-164; camino C de
// flujo-factura.md). Doble de BD con la semilla de db.js; reloj fijado al 16/11/2026.

'use strict';

var comun = require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var entorno = require('../ayudas/entorno');
var semilla = require('../ayudas/semilla');

var db = entorno.instalarDobles().db;
var facturas = entorno.requerir('routes/facturas');

function post(ruta, id, body) {
  return entorno.invocar(facturas, 'POST', ruta, { params: { id: id }, body: body || {} });
}
function factura(id) { return db.estado().facturas.find(function (f) { return f.id === id; }); }
function ultima() { return db.estado().facturas[db.estado().facturas.length - 1]; }
function lineasDe(id) { return db.estado().lineas.filter(function (l) { return l.factura_id === id; }); }

test.beforeEach(function () {
  comun.fijarReloj('2026-11-16T10:00:00');
  db.reiniciar(semilla.semilla());
});
test.afterEach(comun.soltarReloj);

describe('RN-31 · Estados y transiciones', function () {
  it('ejemplo del documento: en la semilla FA-2026-000106 está «rectificada» y RE-2026-000001 «emitida»', function () {
    assert.equal(factura(6).estado, 'rectificada');
    assert.equal(factura(7).estado, 'emitida');
  });
  it('emitida → cobrada → rectificada (por petición directa); no hay vuelta atrás desde rectificada', async function () {
    await post('/:id/cobrar', '9');
    assert.equal(factura(9).estado, 'cobrada');
    await post('/:id/rectificar', '9');
    assert.equal(factura(9).estado, 'rectificada');
    await post('/:id/cobrar', '9');
    assert.equal(factura(9).estado, 'rectificada');
  });
});

describe('RN-32 · Cobro: todo o nada, sin fecha', function () {
  it('ejemplo del documento: FA-2026-000108 emitida → cobrada; repetirlo no cambia nada y no avisa', async function () {
    assert.deepEqual(await post('/:id/cobrar', '9'), { tipo: 'redirect', url: '/facturas/9', estado: 302 });
    assert.equal(factura(9).estado, 'cobrada');
    assert.deepEqual(await post('/:id/cobrar', '9'), { tipo: 'redirect', url: '/facturas/9', estado: 302 });
  });
  it('SQL exacto: solo cambia el estado y solo si estaba emitida (no guarda fecha, importe ni forma)', async function () {
    await post('/:id/cobrar', '9');
    assert.deepEqual(db.llamadas(), [{ metodo: 'run', sql: "UPDATE facturas SET estado = 'cobrada' WHERE id = ? AND estado = 'emitida'", params: ['9'] }]);
  });
});

describe('RN-33 · Rectificación: solo abono total de una FA no rectificada', function () {
  it('ejemplo del documento: RE-2026-000001 → «No se rectifica una rectificativa»; FA-2026-000106 → «Ya esta rectificada»', async function () {
    assert.deepEqual(await post('/:id/rectificar', '7'), { tipo: 'send', cuerpo: 'No se rectifica una rectificativa', estado: 400 });
    assert.deepEqual(await post('/:id/rectificar', '6'), { tipo: 'send', cuerpo: 'Ya esta rectificada', estado: 400 });
  });
  it('inexistente → 404 «Factura no encontrada»; ninguno de los rechazos consume número', async function () {
    assert.deepEqual(await post('/:id/rectificar', '99'), { tipo: 'send', cuerpo: 'Factura no encontrada', estado: 404 });
    assert.deepEqual(db.estado().contadores, comun.CONTADORES_SEMILLA);
  });
});

describe('RN-34 · La rectificativa es el espejo exacto de la original', function () {
  it('ejemplo del documento: rectificar FA-2026-000106 reproduce RE-2026-000001 (cabecera −101,61 / −20,62 / −122,23 y líneas espejo)', async function () {
    var s = semilla.semilla();
    s.facturas[5].estado = 'emitida'; // FA-2026-000106 antes de rectificarse
    db.reiniciar(s);
    await post('/:id/rectificar', '6');
    var re = ultima();
    assert.deepEqual([re.base, re.iva, re.recargo, re.total], [-101.61, -20.62, -0, -122.23]);
    assert.deepEqual(lineasDe(re.id).map(function (l) { return [l.descripcion, l.cantidad, l.precio, l.tipo_iva, l.base, l.cuota_iva]; }), [
      ['Rectificación: Alquiler máquina de café Futurmat F3 (abril)', -1, 90, 21, -90, -18.9],
      ['Rectificación: Café en grano natural 1kg', -0.97, 11.95, 10, -11.61, -1.16]
    ]);
  });
  it('copia la cabecera de la original aunque no cuadre con sus líneas: FA-2026-000105 → IVA −468,63 (líneas: −339,02)', async function () {
    await post('/:id/rectificar', '5', { motivo: 'Error precio' });
    var re = ultima();
    assert.deepEqual(re, {
      id: 10, numero: 'RE-2026-000002', serie: 'RE', cliente_id: 3, fecha: '2026-11-16', vencimiento: null,
      base: -2287.75, iva: -468.63, recargo: -0, total: -2756.38, estado: 'emitida',
      rectifica_a: 'FA-2026-000105', observaciones: 'Rectifica FA-2026-000105. Error precio'
    });
    var sumaIva = lineasDe(10).reduce(function (a, l) { return a + l.cuota_iva; }, 0);
    assert.equal(sumaIva, -339.02);
    assert.equal(factura(5).estado, 'rectificada');
  });
  it('con recargo: FA-2026-000102 (Ferretería) → recargo de cabecera −6,01 y de líneas −3,85 / −1,50 / −0,56 / −0,10', async function () {
    await post('/:id/rectificar', '2');
    assert.equal(ultima().recargo, -6.01);
    assert.deepEqual(lineasDe(ultima().id).map(function (l) { return l.cuota_recargo; }), [-3.85, -1.5, -0.56, -0.1]);
  });
});

describe('RN-35 · Fecha, vencimiento y textos de la rectificativa', function () {
  it('ejemplo del documento: sin motivo → «Rectifica FA-2026-000101. »; fecha de hoy; sin vencimiento; serie RE del año en curso', async function () {
    await post('/:id/rectificar', '1');
    var re = ultima();
    assert.deepEqual([re.numero, re.fecha, re.vencimiento, re.observaciones, re.rectifica_a],
      ['RE-2026-000002', '2026-11-16', null, 'Rectifica FA-2026-000101. ', 'FA-2026-000101']);
  });
  it('ejemplo del documento: una factura de diciembre rectificada en enero de 2027 → RE-2027-000001 con fecha de 2027', async function () {
    comun.fijarReloj('2027-01-10T09:00:00');
    await post('/:id/rectificar', '9');
    assert.deepEqual([ultima().numero, ultima().fecha], ['RE-2027-000001', '2027-01-10']);
  });
  it('orden y forma exacta de las sentencias de la rectificación', async function () {
    await post('/:id/rectificar', '8');
    assert.deepEqual(db.llamadas().map(function (l) { return l.sql; }), [
      'SELECT f.*, c.nombre AS cliente FROM facturas f JOIN clientes c ON c.id = f.cliente_id WHERE f.id = ?',
      'SELECT * FROM lineas WHERE factura_id = ?',
      'SELECT ultimo FROM contadores WHERE serie = ? AND anyo = ?',
      'UPDATE contadores SET ultimo = ? WHERE serie = ? AND anyo = ?',
      'INSERT INTO facturas (numero,serie,cliente_id,fecha,vencimiento,base,iva,recargo,total,estado,rectifica_a,observaciones) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      'INSERT INTO lineas (factura_id,descripcion,cantidad,precio,tipo_iva,base,cuota_iva,cuota_recargo) VALUES (?,?,?,?,?,?,?,?)',
      'INSERT INTO lineas (factura_id,descripcion,cantidad,precio,tipo_iva,base,cuota_iva,cuota_recargo) VALUES (?,?,?,?,?,?,?,?)',
      "UPDATE facturas SET estado = 'rectificada' WHERE id = ?"
    ]);
  });
});

describe('RN-54 (parte de servidor) · El detalle lee los datos actuales del cliente', function () {
  it('la consulta del detalle une la factura con la ficha actual del cliente; inexistente → 404', async function () {
    var r = await entorno.invocar(facturas, 'GET', '/:id', { params: { id: '7' } });
    assert.equal(r.vista, 'factura_detalle');
    assert.deepEqual(Object.keys(r.datos), ['f', 'lineas', 'util', 'empresa']);
    assert.deepEqual(db.llamadas().map(function (l) { return l.sql; }), [
      'SELECT f.*, c.nombre AS cliente, c.nif, c.direccion, c.cp, c.poblacion, c.recargo_equivalencia FROM facturas f JOIN clientes c ON c.id = f.cliente_id WHERE f.id = ?',
      'SELECT * FROM lineas WHERE factura_id = ? ORDER BY id'
    ]);
    assert.deepEqual(await entorno.invocar(facturas, 'GET', '/:id', { params: { id: '99' } }), { tipo: 'send', cuerpo: 'Factura no encontrada', estado: 404 });
  });
});
