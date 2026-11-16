// Caracterización de scripts/remesa_mensual.js (criticidad ALTA, camino B de flujo-factura.md).
// El script se ejecuta de verdad en un proceso hijo, con el doble de BD inyectado por
// pruebas/ayudas/precarga-remesa.js y el directorio de trabajo en una carpeta temporal vacía.
// El doble devuelve los contratos que se le dan: el filtro de vigencia (WHERE de SQLite) NO
// se ejecuta; se congelan sus parámetros. Todo lo demás (prorrateo, textos, fechas,
// numeración, cálculo, salida por consola) es el código real.

'use strict';

var comun = require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var ejecutarRemesa = require('../ayudas/remesa').ejecutarRemesa;

var SQL_CONTRATOS = 'SELECT co.*, cl.nombre, cl.recargo_equivalencia, cl.dias_pago FROM contratos co JOIN clientes cl ON cl.id = co.cliente_id WHERE co.fecha_alta <= ? AND (co.fecha_baja IS NULL OR co.fecha_baja >= ?)';

function remesa(mes, reloj, ids, cambios, extra) {
  return ejecutarRemesa(Object.assign({
    mes: mes, reloj: reloj,
    datos: { contratos: comun.contratosRemesa(ids, cambios), contadores: comun.CONTADORES_SEMILLA }
  }, extra || {}));
}
function resumen(r) {
  return r.estado.facturas.map(function (f, i) {
    var l = r.estado.lineas[i];
    return [f.numero, f.fecha, f.vencimiento, l.descripcion, l.precio, f.base, f.iva, f.recargo, f.total, f.observaciones];
  });
}

describe('RN-39 · Contratos que entran en la remesa de un mes', function () {
  it('ejemplo del documento (remesa 2026-02): se pide a la BD alta ≤ 28/02/2026 y baja nula o ≥ 01/02/2026', function () {
    var r = remesa('2026-02', '2026-03-01T09:00:00', [1, 2, 4]);
    assert.deepEqual(r.llamadas[0], { metodo: 'all', sql: SQL_CONTRATOS, params: ['2026-02-28', '2026-02-01'] });
    assert.equal(r.codigo, 0);
    assert.deepEqual(r.ficherosCreados, []);
  });
  it('el día de alta y el de baja cuentan: baja el 01/03/2026 → 1 día facturado en marzo', function () {
    var r = remesa('2026-03', '2026-04-01T09:00:00', [1], { 1: { fecha_baja: '2026-03-01' } });
    assert.deepEqual(resumen(r), [['FA-2026-000109', '2026-03-31', '2026-04-30', 'Alquiler máquina de café Futurmat F3 (1 dias)', 2.9, 2.9, 0.61, 0, 3.51, 'Remesa marzo 2026']]);
  });
  it('fronteras del periodo en febrero bisiesto y fin de año: parámetros 29/02/2028 y 31/12/2026', function () {
    assert.deepEqual(remesa('2028-02', '2028-03-01T09:00:00', []).llamadas[0].params, ['2028-02-29', '2028-02-01']);
    assert.deepEqual(remesa('2026-12', '2027-01-01T09:00:00', []).llamadas[0].params, ['2026-12-31', '2026-12-01']);
  });
  it('sin contratos: «No hay contratos que facturar en 2026-02», código 0 y sin tocar contadores', function () {
    var r = remesa('2026-02', '2026-03-01T09:00:00', []);
    assert.equal(r.consola.trim(), 'No hay contratos que facturar en 2026-02');
    assert.deepEqual([r.codigo, r.estado.facturas.length], [0, 0]);
    assert.deepEqual(r.estado.contadores, comun.CONTADORES_SEMILLA);
  });
});

describe('RN-40 · Cuota del mes: completa, o por días reales del mes', function () {
  it('ejemplo del documento: contrato 4, alta 15/02/2026 → 14 días de 28 → 45,00', function () {
    var r = remesa('2026-02', '2026-03-01T09:00:00', [4]);
    assert.equal(r.estado.lineas[0].precio, 45);
  });
  it('ejemplo del documento: contrato 2, alta 15/01/2023 → 17 de 31 → 79,52', function () {
    assert.equal(remesa('2023-01', '2026-11-16T10:00:00', [2]).estado.lineas[0].precio, 79.52);
  });
  it('ejemplo del documento: contrato 3 → junio 2025 15 de 30 → 30,00; septiembre 2025 15 de 30 → 30,00', function () {
    assert.equal(remesa('2025-06', '2026-11-16T10:00:00', [3]).estado.lineas[0].precio, 30);
    assert.equal(remesa('2025-09', '2026-11-16T10:00:00', [3]).estado.lineas[0].precio, 30);
  });
  it('ejemplo del documento: baja el 30 de un mes de 31, cuota 145 → 140,32; febrero bisiesto, alta 15/02/2028 → 46,55', function () {
    assert.equal(remesa('2026-03', '2026-04-01T09:00:00', [2], { 2: { fecha_baja: '2026-03-30' } }).estado.lineas[0].precio, 140.32);
    assert.equal(remesa('2028-02', '2028-03-01T09:00:00', [4], { 4: { fecha_alta: '2028-02-15' } }).estado.lineas[0].precio, 46.55);
  });
  it('frontera fin de mes de 31 (cuota 145): baja día 30 → 140,32; día 31 → 145 (mes completo); mes de 30 completo → 145', function () {
    assert.equal(remesa('2026-03', '2026-04-01T09:00:00', [2], { 2: { fecha_baja: '2026-03-31' } }).estado.lineas[0].precio, 145);
    assert.equal(remesa('2026-04', '2026-05-01T09:00:00', [2], { 2: { fecha_baja: '2026-04-30' } }).estado.lineas[0].precio, 145);
  });
  it('baja anterior al alta dentro del mes → días negativos e importe negativo (−26,13 €, «(-9 dias)»)', function () {
    var r = remesa('2026-03', '2026-04-01T09:00:00', [4], { 4: { fecha_alta: '2026-03-20', fecha_baja: '2026-03-10' } });
    assert.deepEqual(resumen(r), [['FA-2026-000109', '2026-03-31', '2026-04-30', 'Alquiler máquina de café Futurmat F3 (-9 dias)', -26.13, -26.13, -5.49, 0, -31.62, 'Remesa marzo 2026']]);
  });
});

describe('RN-41 · La cuota de la remesa pasa por el cálculo normal (recargo y descuento)', function () {
  it('ejemplo del documento: contrato 4 en febrero de 2026 → 45,00 + IVA 9,45 = 54,45', function () {
    var f = remesa('2026-02', '2026-03-01T09:00:00', [4]).estado.facturas[0];
    assert.deepEqual([f.base, f.iva, f.recargo, f.total], [45, 9.45, 0, 54.45]);
  });
  it('ejemplo del documento: cuota de 1.200 € → precio 1.176 (2 %); con recargo → total 1.484,11', function () {
    var r = remesa('2026-07', '2026-08-01T09:00:00', [1], { 1: { cuota: 1200, recargo_equivalencia: 1 } });
    assert.deepEqual(resumen(r), [['FA-2026-000109', '2026-07-31', '2026-08-30', 'Alquiler máquina de café Futurmat F3 (julio 2026)', 1176, 1176, 246.96, 61.15, 1484.11, 'Remesa julio 2026']]);
    var r2 = remesa('2026-07', '2026-08-01T09:00:00', [1], { 1: { cuota: 1200 } });
    assert.equal(r2.estado.facturas[0].total, 1422.96);
  });
});

describe('RN-42 · Forma de la factura de remesa', function () {
  it('ejemplo del documento (remesa 2026-02, semilla): tres facturas, una línea cada una, fecha 28/02, textos y vencimientos', function () {
    var r = remesa('2026-02', '2026-03-01T09:00:00', [1, 2, 4]);
    assert.deepEqual(resumen(r), [
      ['FA-2026-000109', '2026-02-28', '2026-03-30', 'Alquiler máquina de café Futurmat F3 (febrero 2026)', 90, 90, 18.9, 0, 108.9, 'Remesa febrero 2026'],
      ['FA-2026-000110', '2026-02-28', '2026-04-29', 'Mantenimiento cámaras frigoríficas (febrero 2026)', 145, 145, 30.45, 0, 175.45, 'Remesa febrero 2026'],
      ['FA-2026-000111', '2026-02-28', '2026-03-30', 'Alquiler máquina de café Futurmat F3 (14 dias)', 45, 45, 9.45, 0, 54.45, 'Remesa febrero 2026']
    ]);
    assert.deepEqual(r.estado.lineas.map(function (l) { return [l.factura_id, l.cantidad, l.tipo_iva, l.cuota_recargo]; }), [[1, 1, 21, 0], [2, 1, 21, 0], [3, 1, 21, 0]]);
    assert.deepEqual(r.estado.facturas.map(function (f) { return [f.serie, f.estado]; }), [['FA', 'emitida'], ['FA', 'emitida'], ['FA', 'emitida']]);
    assert.deepEqual(r.estado.contadores, [{ serie: 'FA', anyo: 2026, ultimo: 111 }, { serie: 'RE', anyo: 2026, ultimo: 1 }]);
  });
  it('salida por consola exacta (nombre del cliente y total con punto decimal)', function () {
    var r = remesa('2026-02', '2026-03-01T09:00:00', [1, 2, 4]);
    assert.equal(r.consola, [
      '  FA-2026-000109  Cafetería La Parada, S.C.  108.90 eur',
      '  FA-2026-000110  Restaurante Casa Ubaldo, S.L.  175.45 eur',
      '  FA-2026-000111  Bar Nuevo Siglo  54.45 eur',
      'Remesa 2026-02 terminada: 3 facturas.',
      ''
    ].join('\n'));
  });
  it('fin de año: remesa de diciembre → fecha 31/12/2026, vencimiento 30/01/2027 (60 días → 01/03/2027)', function () {
    var r = remesa('2026-12', '2026-12-31T20:00:00', [1, 2]);
    assert.deepEqual(r.estado.facturas.map(function (f) { return [f.numero, f.fecha, f.vencimiento]; }),
      [['FA-2026-000109', '2026-12-31', '2027-01-30'], ['FA-2026-000110', '2026-12-31', '2027-03-01']]);
  });
});

describe('RN-43 · Mes de la remesa: solo se comprueba el formato AAAA-MM', function () {
  it('ejemplo del documento: «2026-13» → fecha «2026-13-31» y observaciones «Remesa undefined 2026»', function () {
    var r = remesa('2026-13', '2026-11-16T10:00:00', [1]);
    assert.deepEqual(resumen(r), [['FA-2026-000109', '2026-13-31', 'NaN-NaN-NaN', 'Alquiler máquina de café Futurmat F3 (undefined 2026)', 90, 90, 18.9, 0, 108.9, 'Remesa undefined 2026']]);
  });
  it('«2026-00» → igual que el 13: 31 días, fecha «2026-00-31»', function () {
    var r = remesa('2026-00', '2026-11-16T10:00:00', [1]);
    assert.deepEqual(r.estado.facturas.map(function (f) { return [f.fecha, f.vencimiento, f.observaciones]; }), [['2026-00-31', 'NaN-NaN-NaN', 'Remesa undefined 2026']]);
  });
  it('sin mes o con formato incorrecto («2026-1») → uso, código de salida 1 y ninguna consulta', function () {
    [undefined, '2026-1', '26-01', '2026-011'].forEach(function (mes) {
      var r = ejecutarRemesa({ mes: mes, reloj: '2026-11-16T10:00:00', datos: {} });
      assert.equal(r.codigo, 1, String(mes));
      assert.equal(r.consola.trim(), 'Uso: node scripts/remesa_mensual.js YYYY-MM');
      assert.deepEqual(r.llamadas, []);
    });
  });
});
