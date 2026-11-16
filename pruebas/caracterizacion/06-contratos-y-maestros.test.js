// Caracterización de la baja de contratos (prorrateo de RN-36/38, routes/contratos.js) y de
// las altas de clientes, artículos y contratos en lo que afecta a reglas de criticidad ALTA
// (NIF, recargo, días de pago, tipo de IVA por defecto, lectura de importes).
// routes/contratos.js y routes/clientes.js son de criticidad MEDIA; se cubren porque alimentan
// datos que usan la remesa y la factura.

'use strict';

var comun = require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var entorno = require('../ayudas/entorno');
var semilla = require('../ayudas/semilla');

var db = entorno.instalarDobles().db;
var contratos = entorno.requerir('routes/contratos');
var clientes = entorno.requerir('routes/clientes');
var articulos = entorno.requerir('routes/articulos');

function baja(id, fecha) {
  return entorno.invocar(contratos, 'POST', '/:id/baja', { params: { id: id }, body: { fecha_baja: fecha } });
}
function ultimaLlamada() { return db.llamadas()[db.llamadas().length - 1]; }

test.beforeEach(function () {
  comun.fijarReloj('2026-11-16T10:00:00');
  db.reiniciar(semilla.semilla());
});
test.afterEach(comun.soltarReloj);

describe('RN-36 (pantalla) · La baja indica el prorrateo comercial en la URL con toFixed(2)', function () {
  it('ejemplo del documento: 90 € baja 15/03/2026 → «prorrateo=45.00»; 145 € baja 07/03/2026 → «33.83»', async function () {
    assert.deepEqual(await baja('1', '2026-03-15'), { tipo: 'redirect', url: '/contratos?prorrateo=45.00', estado: 302 });
    assert.deepEqual(await baja('2', '2026-03-07'), { tipo: 'redirect', url: '/contratos?prorrateo=33.83', estado: 302 });
  });
  it('frontera del día 30/31: 145 € baja 29/03 → «140.17»; 30/03 → «145.00»; 31/03 → «145.00»', async function () {
    assert.equal((await baja('2', '2026-03-29')).url, '/contratos?prorrateo=140.17');
    assert.equal((await baja('2', '2026-03-30')).url, '/contratos?prorrateo=145.00');
    assert.equal((await baja('2', '2026-03-31')).url, '/contratos?prorrateo=145.00');
  });
  it('febrero: baja 28/02/2026 → «84.00»; bisiesto 29/02/2028 → «87.00»; día 1 → «3.00»', async function () {
    assert.equal((await baja('1', '2026-02-28')).url, '/contratos?prorrateo=84.00');
    assert.equal((await baja('1', '2028-02-29')).url, '/contratos?prorrateo=87.00');
    assert.equal((await baja('1', '2026-03-01')).url, '/contratos?prorrateo=3.00');
  });
  it('sin fecha → baja hoy (16/11/2026) → «48.00»; se graba la fecha de baja', async function () {
    assert.equal((await baja('1', '')).url, '/contratos?prorrateo=48.00');
    assert.equal(db.estado().contratos[0].fecha_baja, '2026-11-16');
  });
  it('contrato inexistente → 404 «Contrato no encontrado»', async function () {
    assert.deepEqual(await baja('99', '2026-03-15'), { tipo: 'send', cuerpo: 'Contrato no encontrado', estado: 404 });
  });
});

describe('RN-38 · El prorrateo de baja no se factura solo', function () {
  it('la baja solo graba la fecha y redirige: no crea facturas ni toca contadores', async function () {
    await baja('2', '2026-03-07');
    assert.deepEqual(db.llamadas().map(function (l) { return l.sql; }), [
      'SELECT * FROM contratos WHERE id = ?',
      'UPDATE contratos SET fecha_baja = ? WHERE id = ?'
    ]);
    assert.equal(db.estado().facturas.length, 9);
  });
});

describe('RN-53 (alta de cliente) · NIF opcional; si se informa, 9 caracteres; se guarda tal cual', function () {
  it('ejemplo del documento: «B-4581-2390» se acepta y se guarda con los guiones', async function () {
    await entorno.invocar(clientes, 'POST', '/nuevo', { body: { nombre: 'A', nif: 'B-4581-2390' } });
    assert.equal(ultimaLlamada().params[1], 'B-4581-2390');
  });
  it('ejemplo del documento: «12345678» se rechaza con aviso; sin nombre también', async function () {
    assert.deepEqual(await entorno.invocar(clientes, 'POST', '/nuevo', { body: { nombre: 'A', nif: '12345678' } }),
      { tipo: 'redirect', url: '/clientes?aviso=El NIF no parece valido', estado: 302 });
    assert.deepEqual(await entorno.invocar(clientes, 'POST', '/nuevo', { body: { nombre: '' } }),
      { tipo: 'redirect', url: '/clientes?aviso=Falta el nombre', estado: 302 });
    assert.equal(db.llamadas().length, 0);
  });
  it('sin NIF, recargo marcado y días de pago: se graban null / 1 / entero; vacíos → null y 0', async function () {
    await entorno.invocar(clientes, 'POST', '/nuevo', { body: { nombre: 'A', recargo_equivalencia: 'on', dias_pago: '0' } });
    assert.deepEqual(ultimaLlamada().params, ['A', null, null, null, null, null, 1, 0]);
    await entorno.invocar(clientes, 'POST', '/nuevo', { body: { nombre: 'B', dias_pago: '45', email: '' } });
    assert.deepEqual(ultimaLlamada().params, ['B', null, null, null, null, null, 0, 45]);
    await entorno.invocar(clientes, 'POST', '/nuevo', { body: { nombre: 'C', dias_pago: '' } });
    assert.deepEqual(ultimaLlamada().params, ['C', null, null, null, null, null, 0, null]);
  });
});

describe('Altas de contratos y artículos · lectura de importes y tipo de IVA por defecto', function () {
  it('contrato: cuota «1.234,50» → 1,234; sin tipo → 21; sin fecha de alta → hoy', async function () {
    await entorno.invocar(contratos, 'POST', '/nuevo', { body: { cliente_id: '1', concepto: 'X', cuota: '1.234,50' } });
    assert.deepEqual(ultimaLlamada().params, [1, 'X', 1.234, 21, '2026-11-16']);
  });
  it('artículo: sin tipo → config.IVA_DEFECTO (21); precio «21,60» → 21,6; sin unidad → «ud»', async function () {
    await entorno.invocar(articulos, 'POST', '/nuevo', { body: { nombre: 'Vaso', precio: '21,60' } });
    assert.deepEqual(ultimaLlamada().params, ['', 'Vaso', 21.6, 21, 'ud']);
  });
});
