// Contradicciones de specs/000-reconocimiento/contradiccion-NN-*.md: un mismo concepto
// implementado más de una vez. Cada implementación se congela POR SEPARADO, con su resultado
// divergente; ninguna se considera «la buena» (eso lo decide el negocio).
// Las implementaciones que viven en vistas EJS o en server.js no son ejecutables sin instalar
// dependencias y se listan en pruebas/LEEME.md, «Cobertura pendiente».

'use strict';

var comun = require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var entorno = require('../ayudas/entorno');
var semilla = require('../ayudas/semilla');
var ejecutarRemesa = require('../ayudas/remesa').ejecutarRemesa;

var db = entorno.instalarDobles().db;
var u = entorno.requerir('lib/util');
var calculo = entorno.requerir('services/calculo');
var config = entorno.requerir('config');
var facturas = entorno.requerir('routes/facturas');
var contratos = entorno.requerir('routes/contratos');
var articulos = entorno.requerir('routes/articulos');

function alta(body) {
  return comun.capturarConsola(function () { return entorno.invocar(facturas, 'POST', '/nueva', { body: body }); })
    .then(function (r) { return r.valor; });
}
function post(router, ruta, id, body) { return entorno.invocar(router, 'POST', ruta, { params: { id: id }, body: body || {} }); }
function nuevas() { return db.estado().facturas.slice(9); }
// Fila de contrato tal como la devolvería la consulta de la remesa
function contrato(id, cuota, alta, baja) {
  return { id: id, cliente_id: 1, concepto: 'C' + id, cuota: cuota, tipo_iva: 21, fecha_alta: alta, fecha_baja: baja, nombre: 'Cliente', recargo_equivalencia: 0, dias_pago: null };
}
function basesRemesa(mes, reloj, filas, extra) {
  var r = ejecutarRemesa(Object.assign({ mes: mes, reloj: reloj, datos: { contratos: filas, contadores: comun.CONTADORES_SEMILLA } }, extra || {}));
  return r.estado.facturas.map(function (f) { return f.base; });
}

test.beforeEach(function () {
  comun.fijarReloj('2026-11-16T10:00:00');
  db.reiniciar(semilla.semilla());
});
test.afterEach(comun.soltarReloj);

describe('Contradicción 01 — Prorrateo de una cuota (ANO-007, ANO-008, ANO-022, ANO-042; A-17, A-18)', function () {
  // Tabla de contradiccion-01-prorrateo.md §3.2: [cuota, fecha de baja, I1 pantalla, I2 remesa]
  var BAJAS_MARZO = [
    [90, '2026-03-15', 45, 43.55], [145, '2026-03-07', 33.83, 32.74], [145, '2026-03-30', 145, 140.32],
    [145, '2026-03-31', 145, 145], [90, '2026-03-01', 3, 2.9]
  ];

  it('CONGELA comportamiento actual: I1 · calcularProrrateo (cuota/30, topes 0..30) para las bajas de la tabla §3.2', function () {
    assert.deepEqual(BAJAS_MARZO.map(function (b) { return calculo.calcularProrrateo(b[0], '2026-03-01', b[1]); }), BAJAS_MARZO.map(function (b) { return b[2]; }));
    assert.deepEqual([
      calculo.calcularProrrateo(90, '2026-02-01', '2026-02-14'), calculo.calcularProrrateo(90, '2026-02-01', '2026-02-28'),
      calculo.calcularProrrateo(90, '2028-02-01', '2028-02-29'), calculo.calcularProrrateo(145, '2026-04-01', '2026-04-30'),
      calculo.calcularProrrateo(90, '2026-03-01', '2026-03-10')
    ], [42, 84, 87, 145, 30]);
  });

  it('CONGELA comportamiento actual: I1 · la pantalla de baja lo muestra con toFixed(2): «45.00», «33.83», «145.00», «3.00»', async function () {
    var urls = [];
    for (var b of [['1', '2026-03-15'], ['2', '2026-03-07'], ['2', '2026-03-30'], ['1', '2026-03-01']]) {
      db.reiniciar(semilla.semilla());
      urls.push((await post(contratos, '/:id/baja', b[0], { fecha_baja: b[1] })).url);
    }
    assert.deepEqual(urls, ['/contratos?prorrateo=45.00', '/contratos?prorrateo=33.83', '/contratos?prorrateo=145.00', '/contratos?prorrateo=3.00']);
  });

  it('CONGELA comportamiento actual: I2 · la remesa (cuota/días reales, sin topes) para las mismas bajas de marzo', function () {
    var filas = BAJAS_MARZO.map(function (b, i) { return contrato(i + 1, b[0], '2024-01-01', b[1]); });
    assert.deepEqual(basesRemesa('2026-03', '2026-04-01T09:00:00', filas), BAJAS_MARZO.map(function (b) { return b[3]; }));
  });

  it('CONGELA comportamiento actual: I2 · febrero, bisiesto, abril y baja anterior al alta: 45 / 90 / 90 / 145 / −26,13', function () {
    assert.deepEqual(basesRemesa('2026-02', '2026-03-01T09:00:00', [contrato(1, 90, '2024-01-01', '2026-02-14'), contrato(2, 90, '2024-01-01', '2026-02-28')]), [45, 90]);
    assert.deepEqual(basesRemesa('2028-02', '2028-03-01T09:00:00', [contrato(1, 90, '2024-01-01', '2028-02-29')]), [90]);
    assert.deepEqual(basesRemesa('2026-04', '2026-05-01T09:00:00', [contrato(1, 145, '2024-01-01', '2026-04-30')]), [145]);
    assert.deepEqual(basesRemesa('2026-03', '2026-04-01T09:00:00', [contrato(1, 90, '2026-03-20', '2026-03-10')]), [-26.13]);
  });

  it('CONGELA comportamiento actual: I1 frente a I2 en las altas de la semilla (§3.1): contrato 4 → 42,00 frente a 45,00; contrato 2 → 82,17 frente a 79,52', function () {
    assert.deepEqual([calculo.calcularProrrateo(90, '2026-02-15', '2026-02-28'), calculo.calcularProrrateo(145, '2023-01-15', '2023-01-31')], [42, 82.17]);
    assert.deepEqual(basesRemesa('2026-02', '2026-03-01T09:00:00', comun.contratosRemesa([4])), [45]);
    assert.deepEqual(basesRemesa('2023-01', '2026-11-16T10:00:00', comun.contratosRemesa([2])), [79.52]);
  });
});

describe('Contradicción 02 — A qué año pertenece una factura (ANO-002; A-03)', function () {
  it('CONGELA comportamiento actual: I1 · el número toma el año del reloj (remesa 2026-12 lanzada el 01/01/2027 → FA-2027-000001..3)', function () {
    var r = ejecutarRemesa({ mes: '2026-12', reloj: '2027-01-01T09:00:00', datos: { contratos: comun.contratosRemesa([1, 2, 4]), contadores: comun.CONTADORES_SEMILLA } });
    assert.deepEqual(r.estado.facturas.map(function (f) { return f.numero; }), ['FA-2027-000001', 'FA-2027-000002', 'FA-2027-000003']);
    assert.deepEqual(r.estado.contadores[2], { serie: 'FA', anyo: 2027, ultimo: 3 });
  });
  it('CONGELA comportamiento actual: I2 · la fecha es la del periodo facturado (31/12/2026) y los totales 108,90 / 175,45 / 108,90', function () {
    var r = ejecutarRemesa({ mes: '2026-12', reloj: '2027-01-01T09:00:00', datos: { contratos: comun.contratosRemesa([1, 2, 4]), contadores: comun.CONTADORES_SEMILLA } });
    assert.deepEqual(r.estado.facturas.map(function (f) { return [f.fecha, f.total]; }), [['2026-12-31', 108.9], ['2026-12-31', 175.45], ['2026-12-31', 108.9]]);
  });
  it('CONGELA comportamiento actual: remesa atrasada 2025-06 lanzada en 2026 → FA-2026-000109 con fecha 30/06/2025', function () {
    var r = ejecutarRemesa({ mes: '2025-06', reloj: '2026-11-16T10:00:00', datos: { contratos: comun.contratosRemesa([3]), contadores: comun.CONTADORES_SEMILLA } });
    assert.deepEqual([r.estado.facturas[0].numero, r.estado.facturas[0].fecha], ['FA-2026-000109', '2025-06-30']);
  });
});

describe('Contradicción 03 — IVA del periodo: líneas frente a cabeceras (ANO-014; A-01)', function () {
  it('CONGELA comportamiento actual: I1 · el informe suma cuota_iva de las líneas: FA-2026-000105 aporta 339,02', function () {
    var lineas = semilla.semilla().lineas.filter(function (l) { return l.factura_id === 5; });
    assert.equal(lineas.reduce(function (a, l) { return a + l.cuota_iva; }, 0), 339.02);
  });
  it('CONGELA comportamiento actual: I2 · el CSV lleva el IVA de la cabecera: FA-2026-000105 aporta «468,63»', async function () {
    var s = semilla.semilla();
    db.reiniciar({ filasInforme: [{ numero: s.facturas[4].numero, fecha: s.facturas[4].fecha, nombre: 'X', nif: '', base: s.facturas[4].base, iva: s.facturas[4].iva, recargo: 0, total: s.facturas[4].total, estado: 'emitida' }] });
    var informes = entorno.requerir('routes/informes');
    var r = await entorno.invocar(informes, 'GET', '/export-gestoria', { query: { anyo: '2026' } });
    assert.equal(r.cuerpo.split('\r\n')[2], 'FA-2026-000105;31/03/2026;X;;2.287,75;468,63;0,00;2.756,38;emitida');
  });
});

describe('Contradicción 05 — Plazo de vencimiento por defecto (ANO-012, ANO-041; A-47)', function () {
  it('CONGELA comportamiento actual: I1 · el alta manual usa config.VENCIMIENTO_DIAS: con 30 → 02/03/2026; con 45 (solo en memoria) → 17/03/2026', async function () {
    await alta({ cliente_id: '1', fecha: '2026-01-31', desc: 'X', cant: '1', precio: '10', iva: '21' });
    var original = config.VENCIMIENTO_DIAS;
    config.VENCIMIENTO_DIAS = 45;
    try {
      await alta({ cliente_id: '1', fecha: '2026-01-31', desc: 'X', cant: '1', precio: '10', iva: '21' });
    } finally {
      config.VENCIMIENTO_DIAS = original;
    }
    assert.deepEqual(nuevas().map(function (f) { return f.vencimiento; }), ['2026-03-02', '2026-03-17']);
  });
  it('CONGELA comportamiento actual: I2 · la remesa usa 30 escrito en el código: con VENCIMIENTO_DIAS = 45 sigue venciendo el 02/03/2026', function () {
    var r = ejecutarRemesa({ mes: '2026-01', reloj: '2026-02-01T09:00:00', config: { VENCIMIENTO_DIAS: 45 }, datos: { contratos: comun.contratosRemesa([1]), contadores: comun.CONTADORES_SEMILLA } });
    assert.equal(r.estado.facturas[0].vencimiento, '2026-03-02');
  });
  it('CONGELA comportamiento actual: I1 e I2 · dias_pago = 0 se trata como «sin dato» en los dos caminos (+30)', async function () {
    var s = semilla.semilla(); s.clientes[0].dias_pago = 0; db.reiniciar(s);
    await alta({ cliente_id: '1', fecha: '2026-01-31', desc: 'X', cant: '1', precio: '10', iva: '21' });
    var r = ejecutarRemesa({ mes: '2026-01', reloj: '2026-02-01T09:00:00', datos: { contratos: comun.contratosRemesa([1], { 1: { dias_pago: 0 } }), contadores: comun.CONTADORES_SEMILLA } });
    assert.deepEqual([nuevas()[0].vencimiento, r.estado.facturas[0].vencimiento], ['2026-03-02', '2026-03-02']);
  });
});

describe('Contradicción 06 — Tipos de IVA admitidos y tipo por defecto (ANO-040, ANO-067; A-38)', function () {
  it('CONGELA comportamiento actual: L3 · el cálculo conoce 7 tipos con recargo (21, 10, 4, 18, 16, 8, 7) y el resto da 0', function () {
    assert.deepEqual([21, 10, 4, 18, 16, 8, 7, 5, 2, 0].map(calculo.recargoPara), [5.2, 1.4, 0.5, 4, 4, 1, 1, 0, 0, 0]);
  });
  it('CONGELA comportamiento actual: servidor · el alta manual acepta y graba cualquier entero (18 con recargo → 4,00 €)', async function () {
    await alta({ cliente_id: '2', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '100', iva: '18' });
    assert.deepEqual([nuevas()[0].iva, nuevas()[0].recargo], [18, 4]);
  });
  it('CONGELA comportamiento actual: D2 · artículo sin tipo → config.IVA_DEFECTO; con IVA_DEFECTO = 10 (en memoria) → 10', async function () {
    var original = config.IVA_DEFECTO;
    config.IVA_DEFECTO = 10;
    try {
      await entorno.invocar(articulos, 'POST', '/nuevo', { body: { nombre: 'X', precio: '1' } });
    } finally {
      config.IVA_DEFECTO = original;
    }
    assert.equal(db.llamadas()[0].params[3], 10);
  });
  it('CONGELA comportamiento actual: D3 · contrato sin tipo → 21 escrito en el código, aunque IVA_DEFECTO = 10', async function () {
    var original = config.IVA_DEFECTO;
    config.IVA_DEFECTO = 10;
    try {
      await entorno.invocar(contratos, 'POST', '/nuevo', { body: { cliente_id: '1', concepto: 'X', cuota: '90' } });
    } finally {
      config.IVA_DEFECTO = original;
    }
    assert.equal(db.llamadas()[0].params[3], 21);
  });
});

describe('Contradicción 07 — Redondeo al céntimo: redondear2 frente a toFixed(2) (ANO-060; A-40)', function () {
  // Tabla §3.2: [cantidad, precio tecleado, precio impreso (I2), base (I1)]
  var CASOS = [[1, 1.115, '1,11', 1.12], [1, 2.675, '2,67', 2.68], [3, 1.005, '1,00', 3.01], [1, 0.125, '0,13', 0.13]];
  it('CONGELA comportamiento actual: I1 · redondear2 en el cálculo de la base: 1,12 / 2,68 / 3,01 / 0,13', function () {
    assert.deepEqual(CASOS.map(function (c) { return calculo.calcularLinea(c[0], c[1], 21, false).base; }), CASOS.map(function (c) { return c[3]; }));
  });
  it('CONGELA comportamiento actual: I2 · toFixed en formatearImporte del precio: «1,11» / «2,67» / «1,00» / «0,13»', function () {
    assert.deepEqual(CASOS.map(function (c) { return u.formatearImporte(c[1]); }), CASOS.map(function (c) { return c[2]; }));
  });
  it('CONGELA comportamiento actual: mitades negativas: I1 −0,525 → −0,52; I2 −0,525 → «-0,53»', function () {
    assert.deepEqual([u.redondear2(-0.525), u.formatearImporte(-0.525)], [-0.52, '-0,53']);
  });
});

describe('Contradicción 08 — Cómo se escriben y cómo se leen los importes (ANO-032, ANO-068; A-16)', function () {
  // Tabla §3: texto tecleado → valor que lee L1 (parseFloat tras cambiar la primera coma)
  var LECTURAS = [['2.756,38', 2.756], ['1.000,00', 1], ['1.234', 1.234], ['3032.85', 3032.85], ['45.00', 45], ['21.6', 21.6], ['2756,38', 2756.38], ['12,5', 12.5], ['1,234.50', 1.234]];
  it('CONGELA comportamiento actual: L1 · lectura del formulario de factura (textos tecleados como cantidad, con precio 0 para que no haya descuento)', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: LECTURAS.map(function () { return 'L'; }), cant: LECTURAS.map(function (x) { return x[0]; }), precio: LECTURAS.map(function () { return '0'; }), iva: LECTURAS.map(function () { return '21'; }) });
    var leidos = db.estado().lineas.filter(function (l) { return l.factura_id === 10; }).map(function (l) { return l.cantidad; });
    assert.deepEqual(leidos, LECTURAS.map(function (x) { return x[1]; }));
  });
  it('CONGELA comportamiento actual: E1 · formatearImporte escribe «2.756,38» y «1.000,00», que L1 vuelve a leer como 2,756 y 1', async function () {
    assert.deepEqual([u.formatearImporte(2756.38), u.formatearImporte(1000)], ['2.756,38', '1.000,00']);
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'X', cant: '1', precio: u.formatearImporte(2756.38), iva: '21' });
    assert.equal(db.estado().lineas.filter(function (l) { return l.factura_id === 10; })[0].precio, 2.756);
  });
  it('CONGELA comportamiento actual: E2 · toFixed(2) de la pantalla de contratos y del prorrateo escribe «145.00», que L1 lee bien', async function () {
    assert.equal((145).toFixed(2), '145.00');
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: 'X', cant: '1', precio: (145).toFixed(2), iva: '21' });
    assert.equal(db.estado().lineas.filter(function (l) { return l.factura_id === 10; })[0].precio, 145);
  });
});

describe('Contradicción 09 — ¿Está el cliente en recargo? (ANO-069; A-42)', function () {
  it('CONGELA comportamiento actual: I1 · el cálculo cobra recargo con 1, «1», true; no con 0, null, 2, «S», «sí»', function () {
    var marcas = [1, '1', true, 0, null, 2, 'S', 'sí'];
    assert.deepEqual(marcas.map(function (m) { return calculo.calcularFactura([{ descripcion: 'X', cantidad: 1, precio: 100, tipoIva: 21 }], { recargo_equivalencia: m }).recargo; }),
      [5.2, 5.2, 5.2, 0, 0, 0, 0, 0]);
  });
});

describe('Contradicción 10 — A qué clientes se puede facturar (ANO-011, ANO-031; A-19)', function () {
  it('CONGELA comportamiento actual: I1 · el formulario solo ofrece clientes con activo = 1 (SQL)', async function () {
    await entorno.invocar(facturas, 'GET', '/nueva', {});
    assert.equal(db.llamadas()[0].sql, 'SELECT * FROM clientes WHERE activo = 1 ORDER BY nombre');
  });
  it('CONGELA comportamiento actual: I2 · el POST de alta factura a un cliente con activo = 0', async function () {
    var s = semilla.semilla(); s.clientes[5].activo = 0; db.reiniciar(s);
    await alta({ cliente_id: '6', fecha: '2026-11-16', desc: 'X', cant: '1', precio: '10', iva: '21' });
    assert.equal(nuevas()[0].cliente_id, 6);
  });
  it('CONGELA comportamiento actual: I3 · la remesa no consulta «activo» (contrato 4 del cliente 6 de baja → FA de 108,90 en noviembre)', function () {
    var r = ejecutarRemesa({ mes: '2026-11', reloj: '2026-12-01T09:00:00', datos: { contratos: comun.contratosRemesa([4]), contadores: comun.CONTADORES_SEMILLA } });
    assert.doesNotMatch(r.llamadas[0].sql, /activo/);
    assert.deepEqual([r.estado.facturas[0].cliente_id, r.estado.facturas[0].total, r.estado.lineas[0].descripcion], [6, 108.9, 'Alquiler máquina de café Futurmat F3 (noviembre 2026)']);
  });
  it('CONGELA comportamiento actual: I4 · la rectificación no mira el cliente: se rectifica una factura de un cliente de baja', async function () {
    var s = semilla.semilla(); s.clientes[0].activo = 0; db.reiniciar(s);
    assert.equal((await post(facturas, '/:id/rectificar', '9')).tipo, 'redirect');
  });
});

describe('Contradicción 11 — Cuándo está vigente un contrato (ANO-070; A-30)', function () {
  it('CONGELA comportamiento actual: I1 · remesa de noviembre con baja el 15/12/2026 → mes completo (90,00)', function () {
    assert.deepEqual(basesRemesa('2026-11', '2026-12-01T09:00:00', comun.contratosRemesa([1], { 1: { fecha_baja: '2026-12-15' } })), [90]);
  });
  it('CONGELA comportamiento actual: I1 · remesa de diciembre con esa baja → 15 de 31 días (43,55)', function () {
    assert.deepEqual(basesRemesa('2026-12', '2026-12-31T20:00:00', comun.contratosRemesa([1], { 1: { fecha_baja: '2026-12-15' } })), [43.55]);
  });
  it('CONGELA comportamiento actual: pantalla · al registrar en noviembre la baja del 15/12/2026 indica ya «prorrateo=45.00»', async function () {
    assert.equal((await post(contratos, '/:id/baja', '1', { fecha_baja: '2026-12-15' })).url, '/contratos?prorrateo=45.00');
  });
});

describe('Contradicción 12 — Fecha de hoy y suma de días según la zona horaria (ANO-030; A-48)', function () {
  // Instante fijo: 29/03/2026 23:30 UTC (01:30 del 30/03 en Madrid y 00:30 en Canarias). El
  // documento no indica el instante de su tabla §3; este la reproduce exactamente.
  var INSTANTE = '2026-03-29T23:30:00Z';
  var EXPR = '[u.hoy(), u.sumarDias("2026-01-31", 30), u.sumarDias("2026-03-01", 0), u.sumarDias("2026-03-02", 30)]';
  it('CONGELA comportamiento actual: I1 · hoy() usa la hora local: Madrid, Canarias y Auckland «2026-03-30»; UTC y Nueva York «2026-03-29»', function () {
    assert.deepEqual(['Europe/Madrid', 'Atlantic/Canary', 'UTC', 'America/New_York', 'Pacific/Auckland'].map(function (tz) {
      return comun.enZonaHoraria(tz, 'u.hoy()', INSTANTE);
    }), ['2026-03-30', '2026-03-30', '2026-03-29', '2026-03-29', '2026-03-30']);
  });
  it('CONGELA comportamiento actual: I2 · sumarDias lee en UTC: igual en Madrid, Canarias, UTC y Auckland', function () {
    ['Europe/Madrid', 'Atlantic/Canary', 'UTC', 'Pacific/Auckland'].forEach(function (tz) {
      assert.deepEqual(comun.enZonaHoraria(tz, EXPR, INSTANTE).slice(1), ['2026-03-02', '2026-03-01', '2026-04-01'], tz);
    });
  });
  it('CONGELA comportamiento actual: I2 · en Nueva York sumarDias devuelve un día menos, incluso sumando 0', function () {
    assert.deepEqual(comun.enZonaHoraria('America/New_York', EXPR, INSTANTE).slice(1), ['2026-03-01', '2026-02-28', '2026-03-31']);
  });
});

describe('Contradicción 13 — Dos formas de abonar (ANO-071, ANO-059; A-23)', function () {
  // Factura A de la contradicción: 40 platos × 28,90 + 24 aceites × 27,45, sin recargo → 2 %
  var A = { cliente_id: '1', fecha: '2026-11-16', desc: ['Platos', 'Aceite'], cant: ['40', '24'], iva: ['21', '4'] };
  it('CONGELA comportamiento actual: original A → 2.042,11 €', async function () {
    await alta(Object.assign({ precio: ['28,90', '27,45'] }, A));
    assert.equal(nuevas()[0].total, 2042.11);
  });
  it('CONGELA comportamiento actual: I1 · rectificativa espejo de A → −2.042,11 €', async function () {
    await alta(Object.assign({ precio: ['28,90', '27,45'] }, A));
    await post(facturas, '/:id/rectificar', '10');
    assert.deepEqual([nuevas()[1].numero, nuevas()[1].total], ['RE-2026-000002', -2042.11]);
  });
  it('CONGELA comportamiento actual: I2 · factura FA con las mismas líneas en negativo → −2.083,91 € (sin descuento)', async function () {
    await alta(Object.assign({}, A, { cant: ['-40', '-24'], precio: ['28,90', '27,45'] }));
    assert.deepEqual([nuevas()[0].numero, nuevas()[0].total, nuevas()[0].observaciones], ['FA-2026-000109', -2083.91, '']);
  });
  it('CONGELA comportamiento actual: casos B y C: original 96,55 / 4,41; espejo −96,55 / −4,41; líneas negativas −96,54 / −4,39', function () {
    var B = function (s) { return [{ descripcion: 'D', cantidad: 4 * s, precio: 18.5, tipoIva: 21 }, { descripcion: 'P', cantidad: 1 * s, precio: 2.5, tipoIva: 21 }]; };
    var C = function (s) { return [{ descripcion: 'X', cantidad: s, precio: 2.5, tipoIva: 21 }, { descripcion: 'Y', cantidad: s, precio: 1.25, tipoIva: 10 }]; };
    assert.deepEqual([calculo.calcularFactura(B(1), { recargo_equivalencia: 1 }).total, calculo.calcularFactura(B(-1), { recargo_equivalencia: 1 }).total], [96.55, -96.54]);
    assert.deepEqual([calculo.calcularFactura(C(1), {}).total, calculo.calcularFactura(C(-1), {}).total], [4.41, -4.39]);
  });
});

describe('Contradicción 14 — Qué facturas se pueden cobrar o rectificar en el servidor (ANO-006, ANO-033, ANO-034; A-39)', function () {
  // [factura (id semilla), estado y serie, ¿cobra? (estado final), ¿rectifica?]
  it('CONGELA comportamiento actual: V2 · cobrar: FA emitida → cobrada; FA cobrada, FA rectificada → sin cambios; RE emitida → cobrada', async function () {
    for (var id of ['9', '1', '6', '7']) await post(facturas, '/:id/cobrar', id);
    assert.deepEqual([9, 1, 6, 7].map(function (id) { return db.estado().facturas[id - 1].estado; }), ['cobrada', 'cobrada', 'rectificada', 'cobrada']);
  });
  it('CONGELA comportamiento actual: V3 · rectificar: FA emitida y FA cobrada → sí; FA rectificada y RE → 400', async function () {
    var r = [];
    for (var id of ['9', '1', '6', '7']) r.push((await post(facturas, '/:id/rectificar', id)).estado);
    assert.deepEqual(r, [302, 302, 400, 400]);
  });
});
