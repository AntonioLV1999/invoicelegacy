// Caracterización del alta manual de facturas: POST /facturas/nueva (routes/facturas.js:41-102,
// criticidad ALTA, camino A de flujo-factura.md). Express y sqlite3 no están instalados: el
// manejador se invoca directamente con una petición falsa y la BD es el doble de pruebas.
// Se congela todo lo que el código decide: lectura del formulario, cálculo, vencimiento,
// numeración, textos y SQL/parámetros que envía. Fuera de la red: el parseo HTTP real de
// body-parser y lo que SQLite haga con los valores (ver pruebas/LEEME.md).

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
var facturas = entorno.requerir('routes/facturas');

function alta(body) {
  return comun.capturarConsola(function () {
    return entorno.invocar(facturas, 'POST', '/nueva', { body: body });
  });
}
function nueva() { return db.estado().facturas[db.estado().facturas.length - 1]; }
function lineasDe(id) { return db.estado().lineas.filter(function (l) { return l.factura_id === id; }); }

test.beforeEach(function () {
  comun.fijarReloj('2026-11-16T10:00:00');
  db.reiniciar(semilla.semilla());
});
test.afterEach(comun.soltarReloj);

describe('RN-16 · Aviso del descuento en las observaciones (solo factura manual)', function () {
  it('ejemplo del documento: sin observaciones y base bruta 1.200 → «␣Descuento volumen 2% aplicado»', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'Pedido', cant: '1', precio: '1200', iva: '21' });
    assert.equal(nueva().observaciones, ' Descuento volumen 2% aplicado');
  });
  it('con observaciones se concatena: «Pedido grande» + « Descuento volumen 5% aplicado»', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', obs: 'Pedido grande', desc: 'X', cant: '1', precio: '6000', iva: '21' });
    assert.equal(nueva().observaciones, 'Pedido grande Descuento volumen 5% aplicado');
  });
  it('sin descuento y sin observaciones → cadena vacía (no null)', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '1000', iva: '21' });
    assert.equal(nueva().observaciones, '');
  });
});

describe('RN-17 · Solo se factura una fila si tiene descripción', function () {
  it('ejemplo del documento: «Portes» 1 × 6,00 y fila sin descripción 1 × 50,00 → base 6,00', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: ['Portes', ''], cant: ['1', '1'], precio: ['6,00', '50,00'], iva: ['21', '21'] });
    assert.equal(nueva().base, 6);
    assert.equal(lineasDe(nueva().id).length, 1);
  });
  it('ejemplo del documento: la única fila con precio no tiene descripción → «La factura no tiene lineas»', async function () {
    var r = await alta({ cliente_id: '1', desc: ['', '', ''], cant: ['1', '1', '1'], precio: ['50', '', ''], iva: ['21', '21', '21'] });
    assert.deepEqual(r.valor, { tipo: 'send', cuerpo: 'La factura no tiene lineas', estado: 400 });
  });
});

describe('RN-18 · Una factura necesita al menos una línea', function () {
  it('ejemplo del documento: seis filas vacías → error 400 y no se consume número', async function () {
    var r = await alta({ cliente_id: '1', desc: ['', '', '', '', '', ''], cant: ['1', '1', '1', '1', '1', '1'], precio: ['', '', '', '', '', ''], iva: ['21', '21', '21', '21', '21', '21'] });
    assert.deepEqual(r.valor, { tipo: 'send', cuerpo: 'La factura no tiene lineas', estado: 400 });
    assert.deepEqual(db.estado().contadores, comun.CONTADORES_SEMILLA);
    assert.equal(db.llamadas().length, 1); // solo la lectura del cliente
  });
  it('sin ningún campo de líneas en el formulario → mismo error', async function () {
    var r = await alta({ cliente_id: '1' });
    assert.equal(r.valor.cuerpo, 'La factura no tiene lineas');
  });
});

describe('RN-19 · Lectura de cantidades y precios tecleados', function () {
  it('ejemplo del documento: «1,5» → 1,5; «1.234,50» → 1,234; «12abc» → 12; precio vacío → NaN', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: ['A', 'B', 'C', 'D'], cant: ['1,5', '1', '12abc', '1'], precio: ['2', '1.234,50', '1', ''], iva: ['21', '21', '21', '21'] });
    assert.deepEqual(lineasDe(nueva().id).map(function (l) { return [l.cantidad, l.precio]; }),
      [[1.5, 2], [1, 1.234], [12, 1], [1, NaN]]);
  });
  it('solo cambia la primera coma: «1,234,5» → 1,234; un punto decimal se respeta: «2.5» → 2,5', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: ['A', 'B'], cant: ['1', '1'], precio: ['1,234,5', '2.5'], iva: ['21', '21'] });
    assert.deepEqual(lineasDe(nueva().id).map(function (l) { return l.precio; }), [1.234, 2.5]);
  });
});

describe('RN-20 · Se admiten cantidades y precios cero, negativos o decimales', function () {
  it('ejemplo del documento: −5 × 10,00 al 21 % → FA con base −50, IVA −10,50, total −60,50 y número consumido', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'Abono', cant: '-5', precio: '10,00', iva: '21' });
    var f = nueva();
    assert.deepEqual([f.numero, f.serie, f.base, f.iva, f.total], ['FA-2026-000109', 'FA', -50, -10.5, -60.5]);
  });
  it('cantidad cero → FA con total 0', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'Nada', cant: '0', precio: '10', iva: '21' });
    assert.deepEqual([nueva().numero, nueva().total], ['FA-2026-000109', 0]);
  });
});

describe('RN-21 · Se factura el precio y el IVA del formulario', function () {
  it('ejemplo del documento: café a 11,00 en vez de 11,95 de catálogo → se factura a 11,00', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'Café en grano natural 1kg', cant: '1', precio: '11,00', iva: '10' });
    assert.deepEqual(lineasDe(nueva().id)[0], { id: 29, factura_id: 10, descripcion: 'Café en grano natural 1kg', cantidad: 1, precio: 11, tipo_iva: 10, base: 11, cuota_iva: 1.1, cuota_recargo: 0 });
  });
  it('el servidor acepta un tipo que el formulario no ofrece (5) y lo graba', async function () {
    await alta({ cliente_id: '2', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '100', iva: '5' });
    assert.deepEqual([lineasDe(nueva().id)[0].tipo_iva, nueva().iva, nueva().recargo], [5, 5, 0]);
  });
});

describe('RN-22 · Fecha de la factura: la tecleada; vacía → hoy', function () {
  it('ejemplo del documento: el 16/11/2026 con fecha 15/12/2025 → número FA-2026-…, fecha 2025-12-15', async function () {
    await alta({ cliente_id: '1', fecha: '2025-12-15', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.deepEqual([nueva().numero, nueva().fecha], ['FA-2026-000109', '2025-12-15']);
  });
  it('fecha vacía → hoy (2026-11-16); sin campo fecha → hoy', async function () {
    await alta({ cliente_id: '1', fecha: '', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(nueva().fecha, '2026-11-16');
    await alta({ cliente_id: '1', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(nueva().fecha, '2026-11-16');
  });
  it('la fecha se graba tal cual, sin validar: «31/12/2026» → vencimiento «NaN-NaN-NaN»', async function () {
    await alta({ cliente_id: '1', fecha: '31/12/2026', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.deepEqual([nueva().fecha, nueva().vencimiento], ['31/12/2026', 'NaN-NaN-NaN']);
  });
});

describe('RN-23 · Se puede facturar a cualquier cliente existente', function () {
  it('ejemplo del documento: un cliente con activo = 0 recibe factura por petición directa', async function () {
    var s = semilla.semilla();
    s.clientes[5].activo = 0;
    db.reiniciar(s);
    var r = await alta({ cliente_id: '6', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(r.valor.tipo, 'redirect');
    assert.equal(nueva().cliente_id, 6);
  });
  it('cliente inexistente o id no numérico → 400 «Cliente no valido»', async function () {
    assert.deepEqual((await alta({ cliente_id: '99', desc: 'X' })).valor, { tipo: 'send', cuerpo: 'Cliente no valido', estado: 400 });
    var r = await alta({ cliente_id: 'abc', desc: 'X' });
    assert.equal(r.valor.cuerpo, 'Cliente no valido');
    assert.deepEqual(db.llamadas()[db.llamadas().length - 1].params, [NaN]);
  });
  it('el formulario solo lista clientes y artículos activos (SQL congelado)', async function () {
    var r = await entorno.invocar(facturas, 'GET', '/nueva', {});
    assert.equal(r.vista, 'factura_nueva');
    assert.deepEqual(db.llamadas().map(function (l) { return l.sql; }), [
      'SELECT * FROM clientes WHERE activo = 1 ORDER BY nombre',
      'SELECT * FROM articulos WHERE activo = 1 ORDER BY referencia'
    ]);
  });
});

describe('RN-24 · Vencimiento = fecha + días de pago del cliente (30 por defecto)', function () {
  it('ejemplo del documento: Hotel Vega Baja (60 días) 20/02/2026 → 21/04/2026; sin días 31/01/2026 → 02/03/2026', async function () {
    await alta({ cliente_id: '5', fecha: '2026-02-20', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(nueva().vencimiento, '2026-04-21');
    await alta({ cliente_id: '1', fecha: '2026-01-31', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(nueva().vencimiento, '2026-03-02');
  });
  it('fin de año y bisiesto: 31/12/2026 + 30 → 30/01/2027; 30/01/2028 + 30 → 29/02/2028', async function () {
    await alta({ cliente_id: '1', fecha: '2026-12-31', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(nueva().vencimiento, '2027-01-30');
    await alta({ cliente_id: '1', fecha: '2028-01-30', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(nueva().vencimiento, '2028-02-29');
  });
  it('el valor por defecto sale de config.VENCIMIENTO_DIAS (hoy 30)', function () {
    assert.equal(config.VENCIMIENTO_DIAS, 30);
  });
});

describe('RN-25 · Una factura nueva nace «emitida» en la serie FA', function () {
  it('ejemplo del documento: alta del 16/11/2026 con FA/2026 en 108 → FA-2026-000109, emitida', async function () {
    var r = await alta({ cliente_id: '2', fecha: '2026-11-16', desc: ['Desengrasante', 'Portes'], cant: ['4', '1,5'], precio: ['18,50', '2.5'], iva: ['21', '21'] });
    assert.deepEqual(r.valor, { tipo: 'redirect', url: '/facturas/10', estado: 302 });
    assert.deepEqual(nueva(), {
      id: 10, numero: 'FA-2026-000109', serie: 'FA', cliente_id: 2, fecha: '2026-11-16', vencimiento: '2026-12-16',
      base: 77.75, iva: 16.33, recargo: 4.05, total: 98.13, estado: 'emitida', observaciones: ''
    });
    assert.deepEqual(lineasDe(10), [
      { id: 29, factura_id: 10, descripcion: 'Desengrasante', cantidad: 4, precio: 18.5, tipo_iva: 21, base: 74, cuota_iva: 15.54, cuota_recargo: 3.85 },
      { id: 30, factura_id: 10, descripcion: 'Portes', cantidad: 1.5, precio: 2.5, tipo_iva: 21, base: 3.75, cuota_iva: 0.79, cuota_recargo: 0.2 }
    ]);
  });
  it('orden y forma exacta de las sentencias: cliente → contador → cabecera → líneas', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.deepEqual(db.llamadas().map(function (l) { return l.sql; }), [
      'SELECT * FROM clientes WHERE id = ?',
      'SELECT ultimo FROM contadores WHERE serie = ? AND anyo = ?',
      'UPDATE contadores SET ultimo = ? WHERE serie = ? AND anyo = ?',
      'INSERT INTO facturas (numero,serie,cliente_id,fecha,vencimiento,base,iva,recargo,total,estado,observaciones) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      'INSERT INTO lineas (factura_id,descripcion,cantidad,precio,tipo_iva,base,cuota_iva,cuota_recargo) VALUES (?,?,?,?,?,?,?,?)'
    ]);
  });
  it('no se envía nada: solo un aviso en la consola con el correo del cliente', async function () {
    var r = await alta({ cliente_id: '2', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.deepEqual(r.consola, ['[email] AVISO: envio desactivado. Factura FA-2026-000109 pendiente de enviar a mano a eltornillo4@hotmail.com']);
    var r2 = await alta({ cliente_id: '4', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.deepEqual(r2.consola, ['[email] AVISO: envio desactivado. Factura FA-2026-000110 pendiente de enviar a mano a (sin email)']);
  });
});
