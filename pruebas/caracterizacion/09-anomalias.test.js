// Un test por cada anomalía ejecutable de specs/000-reconocimiento/registro-de-anomalias.md.
// Cada uno congela el comportamiento ACTUAL, aunque sea erróneo (constitución, Principio III):
// que un test de este fichero falle significa que alguien ha cambiado el comportamiento, no que
// lo haya arreglado. Corregir una anomalía exige decisión de negocio escrita y actualizar aquí
// el test y el registro a la vez.
//
// Las contradicciones (un concepto implementado varias veces) están en 10-contradicciones.test.js.
// Las anomalías no ejecutables y el motivo están en pruebas/LEEME.md, «Cobertura pendiente».

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
var num = entorno.requerir('lib/numeracion');
var config = entorno.requerir('config');
var email = entorno.requerir('services/email');
var facturas = entorno.requerir('routes/facturas');
var contratos = entorno.requerir('routes/contratos');
var informes = entorno.requerir('routes/informes');

function alta(body) {
  return comun.capturarConsola(function () { return entorno.invocar(facturas, 'POST', '/nueva', { body: body }); })
    .then(function (r) { return r.valor; });
}
function linea1(precio, extra) {
  return Object.assign({ cliente_id: '1', fecha: '2026-11-16', desc: 'X', cant: '1', precio: precio, iva: '21' }, extra || {});
}
function post(router, ruta, id, body) { return entorno.invocar(router, 'POST', ruta, { params: { id: id }, body: body || {} }); }
function facturasNuevas() { return db.estado().facturas.slice(9); }
function lineasDe(id) { return db.estado().lineas.filter(function (l) { return l.factura_id === id; }); }
function siguiente(serie) {
  return new Promise(function (resolve) { num.siguienteNumero(serie, function (e, n) { resolve([e ? e.message : null, n]); }); });
}
function remesa(mes, reloj, filas, extra) {
  return ejecutarRemesa(Object.assign({ mes: mes, reloj: reloj, datos: { contratos: filas, contadores: comun.CONTADORES_SEMILLA } }, extra || {}));
}
var L = function (q, p, t) { return { descripcion: 'X', cantidad: q, precio: p, tipoIva: t }; };

test.beforeEach(function () {
  comun.fijarReloj('2026-11-16T10:00:00');
  db.reiniciar(semilla.semilla());
});
test.afterEach(comun.soltarReloj);

describe('Nivel A del registro', function () {
  // ANO-001 (A-04): lectura y escritura del contador en dos pasos, sin transacción
  it('CONGELA comportamiento actual: ANO-001 · dos peticiones entrelazadas reciben el mismo número FA-2026-000109', async function () {
    db.reiniciar({ contadores: comun.CONTADORES_SEMILLA });
    var r = await Promise.all([siguiente('FA'), siguiente('FA')]);
    assert.deepEqual(r, [[null, 'FA-2026-000109'], [null, 'FA-2026-000109']]);
    assert.deepEqual(db.estado().contadores[0], { serie: 'FA', anyo: 2026, ultimo: 109 });
  });

  // ANO-001 (A-04), variante del año nuevo (flujo-factura.md §2.2, paso 3)
  it('CONGELA comportamiento actual: ANO-001 · al abrir el año a la vez, la segunda petición falla por la clave primaria', async function () {
    db.reiniciar({ contadores: [] });
    var r = await Promise.all([siguiente('FA'), siguiente('FA')]);
    assert.deepEqual(r, [[null, 'FA-2026-000001'], ['SQLITE_CONSTRAINT: UNIQUE constraint failed: contadores.serie, contadores.anyo', undefined]]);
  });

  // ANO-002 (A-03): el año del número sale del reloj
  it('CONGELA comportamiento actual: ANO-002 · factura manual tecleada el 05/01/2027 con fecha 31/12/2026 → FA-2027-000001', async function () {
    comun.fijarReloj('2027-01-05T10:00:00');
    await alta(linea1('10', { fecha: '2026-12-31' }));
    assert.deepEqual([facturasNuevas()[0].numero, facturasNuevas()[0].fecha], ['FA-2027-000001', '2026-12-31']);
  });

  // ANO-003 (A-05, A-28): número consumido aunque la factura no se grabe; NaN se envía a la BD
  it('CONGELA comportamiento actual: ANO-003 · si falla el INSERT de la cabecera, el contador queda en 109 sin factura', async function () {
    var s = semilla.semilla(); s.fallarInsert = { facturas: true }; db.reiniciar(s);
    var r = await alta(linea1('10'));
    assert.deepEqual(r, { tipo: 'send', cuerpo: 'Error al grabar: SQLITE_ERROR: fallo simulado al grabar en facturas', estado: 500 });
    assert.equal(db.estado().contadores[0].ultimo, 109);
    assert.equal(facturasNuevas().length, 0);
  });
  it('CONGELA comportamiento actual: ANO-003 · precio vacío → se envían base, IVA y total NaN en el INSERT de la cabecera', async function () {
    await alta(linea1(''));
    var p = db.llamadas()[3].params;
    assert.deepEqual(p, ['FA-2026-000109', 'FA', 1, '2026-11-16', '2026-12-16', NaN, NaN, 0, NaN, 'emitida', '']);
  });

  // ANO-004 (A-05): cabecera grabada aunque fallen las líneas
  it('CONGELA comportamiento actual: ANO-004 · si fallan las líneas, queda la cabecera sin líneas y error 500', async function () {
    var s = semilla.semilla(); s.fallarInsert = { lineas: true }; db.reiniciar(s);
    var r = await alta(linea1('10'));
    assert.deepEqual(r, { tipo: 'send', cuerpo: 'Error al grabar lineas: SQLITE_ERROR: fallo simulado al grabar en lineas', estado: 500 });
    assert.deepEqual([facturasNuevas().length, facturasNuevas()[0].total, lineasDe(10).length], [1, 12.1, 0]);
  });

  // ANO-009 (A-06): nada impide facturar dos veces el mismo mes
  it('CONGELA comportamiento actual: ANO-009 · relanzar la remesa del mismo mes vuelve a facturar (no consulta lo ya emitido)', function () {
    var r = remesa('2026-02', '2026-03-01T09:00:00', comun.contratosRemesa([1]));
    var sqls = r.llamadas.map(function (l) { return l.sql.slice(0, 30); });
    assert.equal(sqls.filter(function (s) { return /FROM facturas/.test(s); }).length, 0);
    assert.equal(r.estado.facturas.length, 1);
  });

  // ANO-010 (A-06): remesa a medias
  it('CONGELA comportamiento actual: ANO-010 · si falla una línea, la remesa sale con código 1 dejando la cabecera grabada', function () {
    var r = ejecutarRemesa({ mes: '2026-02', reloj: '2026-03-01T09:00:00', datos: { contratos: comun.contratosRemesa([1, 2]), contadores: comun.CONTADORES_SEMILLA, fallarInsert: { lineas: true } } });
    assert.equal(r.codigo, 1);
    assert.deepEqual([r.estado.facturas.length, r.estado.lineas.length, r.estado.contadores[0].ultimo], [1, 0, 109]);
  });

  // ANO-013 (A-15): la semilla no cuadra con el código actual
  // Caso de contraste: tabla del apéndice A de mapa-sistema.md (columna «calcularFactura»)
  it('CONGELA comportamiento actual: ANO-013 · recalcular las líneas de la semilla no reproduce sus cabeceras (apéndice A del mapa)', function () {
    var s = semilla.semilla();
    var comparado = [1, 2, 3, 4, 5, 6, 8, 9].map(function (id) {
      var cab = s.facturas[id - 1];
      var cli = s.clientes.find(function (c) { return c.id === cab.cliente_id; });
      var f = calculo.calcularFactura(semilla.lineasParaCalculo(id), cli);
      return [cab.numero, [cab.base, cab.iva, cab.recargo, cab.total], [f.base, f.iva, f.recargo, f.total, f.descuentoPct]];
    });
    assert.deepEqual(comparado, [
      ['FA-2026-000101', [133.2, 27.97, 0, 161.17], [133.2, 24.27, 0, 157.47, 0]],
      ['FA-2026-000102', [115.6, 24.28, 6.01, 145.89], [115.62, 24.28, 6.01, 145.91, 0]],
      ['FA-2026-000103', [1000, 210, 0, 1210], [980.01, 205.81, 0, 1185.82, 2]],
      ['FA-2026-000104', [152.3, 6.09, 0.76, 159.15], [152.3, 6.09, 0.76, 159.15, 0]],
      ['FA-2026-000105', [2287.75, 468.63, 0, 2756.38], [2288.68, 332.22, 0, 2620.9, 2]],
      ['FA-2026-000106', [101.61, 20.62, 0, 122.23], [101.59, 20.06, 0, 121.65, 0]],
      ['FA-2026-000107', [101.61, 20.62, 0, 122.23], [101.59, 20.06, 0, 121.65, 0]],
      ['FA-2026-000108', [128.05, 26.19, 0, 154.24], [128.16, 24.28, 0, 152.44, 0]]
    ]);
  });

  // ANO-014 (A-01): informe desde líneas, CSV desde cabeceras
  it('CONGELA comportamiento actual: ANO-014 · el informe de IVA lee «lineas» y el CSV lee la cabecera de «facturas»', async function () {
    db.reiniciar({ filasInforme: [] });
    await entorno.invocar(informes, 'GET', '/iva', { query: { anyo: '2026', trimestre: '1' } });
    await entorno.invocar(informes, 'GET', '/export-gestoria', { query: { anyo: '2026' } });
    var sqls = db.llamadas().map(function (l) { return l.sql; });
    assert.match(sqls[0], /SUM\(l\.cuota_iva\) AS cuota, SUM\(l\.cuota_recargo\) AS recargo FROM lineas l JOIN facturas f/);
    assert.match(sqls[1], /SELECT f\.numero, f\.fecha, c\.nombre, c\.nif, f\.base, f\.iva, f\.recargo, f\.total, f\.estado FROM facturas f/);
  });

  // ANO-029 (A-14): la ruta de la BD es relativa al directorio de trabajo
  it('CONGELA comportamiento actual: ANO-029 · config.RUTA_BD = «./datos/gesfact.db» (relativa al directorio de arranque)', function () {
    assert.equal(config.RUTA_BD, './datos/gesfact.db');
  });
});

describe('Nivel B del registro', function () {
  // ANO-032 (A-16): punto de miles
  it('CONGELA comportamiento actual: ANO-032 · «1.234,50» en el precio → 1,234 y factura de 1,49 €', async function () {
    await alta(linea1('1.234,50'));
    assert.deepEqual([lineasDe(10)[0].precio, facturasNuevas()[0].base, facturasNuevas()[0].total], [1.234, 1.23, 1.49]);
  });

  // ANO-007 (A-17) y ANO-008/ANO-022 (A-18): ver también 10-contradicciones (contradicción 01)
  it('CONGELA comportamiento actual: ANO-008 · baja el 15/03/2026 de 90 €: la pantalla indica 45,00 y la remesa de marzo factura además 43,55', async function () {
    var r = await post(contratos, '/:id/baja', '1', { fecha_baja: '2026-03-15' });
    assert.equal(r.url, '/contratos?prorrateo=45.00');
    var rem = remesa('2026-03', '2026-04-01T09:00:00', comun.contratosRemesa([1], { 1: { fecha_baja: '2026-03-15' } }));
    assert.equal(rem.estado.facturas[0].base, 43.55);
  });

  // ANO-011 (A-19): la remesa no mira si el cliente está activo
  it('CONGELA comportamiento actual: ANO-011 · la consulta de la remesa no filtra clientes.activo y factura al cliente de baja', function () {
    var filas = comun.contratosRemesa([4]);
    filas[0].activo = 0;
    var r = remesa('2026-11', '2026-12-01T09:00:00', filas);
    assert.doesNotMatch(r.llamadas[0].sql, /activo/);
    assert.deepEqual([r.estado.facturas[0].numero, r.estado.facturas[0].cliente_id, r.estado.facturas[0].total], ['FA-2026-000109', 6, 108.9]);
  });

  // ANO-031 (A-19): el alta manual no mira si el cliente está activo
  it('CONGELA comportamiento actual: ANO-031 · POST /facturas/nueva factura a un cliente con activo = 0', async function () {
    var s = semilla.semilla(); s.clientes[5].activo = 0; db.reiniciar(s);
    assert.equal((await alta(linea1('10', { cliente_id: '6' }))).tipo, 'redirect');
  });

  // ANO-064 (A-20): fila con precio pero sin descripción
  it('CONGELA comportamiento actual: ANO-064 · la fila sin descripción con 50 € se descarta sin aviso', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: ['Portes', ''], cant: ['1', '1'], precio: ['6', '50'], iva: ['21', '21'] });
    assert.deepEqual([facturasNuevas()[0].base, lineasDe(10).length], [6, 1]);
  });

  // ANO-061 (A-21): salto del descuento en el umbral
  it('CONGELA comportamiento actual: ANO-061 · 1.000,00 € paga 1.210,00 y 1.000,01 € paga 1.185,81 (24,19 € menos)', function () {
    assert.deepEqual([calculo.calcularFactura([L(1, 1000, 21)], {}).total, calculo.calcularFactura([L(1, 1000.01, 21)], {}).total], [1210, 1185.81]);
  });

  // ANO-066 (A-22): descuento a cualquier cliente
  it('CONGELA comportamiento actual: ANO-066 · una ferretería en recargo recibe el 2 % (no solo hostelería)', function () {
    assert.equal(calculo.calcularFactura([L(1, 1200, 21)], { recargo_equivalencia: 1 }).descuentoPct, 2);
  });

  // ANO-035 (A-24) y ANO-036 (A-55): descuento en la cuota de remesa, sin aviso
  it('CONGELA comportamiento actual: ANO-035/ANO-036 · cuota de 1.200 € en remesa → 1.176 € y observaciones sin aviso de descuento', function () {
    var r = remesa('2026-07', '2026-08-01T09:00:00', comun.contratosRemesa([1], { 1: { cuota: 1200 } }));
    assert.deepEqual([r.estado.lineas[0].precio, r.estado.facturas[0].observaciones], [1176, 'Remesa julio 2026']);
  });

  // ANO-005 (A-25): rectificación de una factura sin líneas
  it('CONGELA comportamiento actual: ANO-005 · rectificar una factura sin líneas deja la petición sin respuesta, la RE grabada y la original «emitida»', async function () {
    var s = semilla.semilla();
    s.facturas.push({ id: 10, numero: 'FA-2026-000109', serie: 'FA', cliente_id: 1, fecha: '2026-11-01', vencimiento: null, base: 0, iva: 0, recargo: 0, total: 0, estado: 'emitida', rectifica_a: null, observaciones: null });
    db.reiniciar(s);
    var r = await post(facturas, '/:id/rectificar', '10');
    assert.deepEqual(r, { tipo: 'sin-respuesta', estado: 200 });
    var re = db.estado().facturas[10];
    assert.deepEqual([re.numero, re.base, re.total, db.estado().facturas[9].estado], ['RE-2026-000002', -0, -0, 'emitida']);
  });
  it('CONGELA comportamiento actual: ANO-005 · los errores al grabar las líneas de la rectificativa se ignoran y la original pasa a «rectificada»', async function () {
    var s = semilla.semilla(); s.fallarInsert = { lineas: true }; db.reiniciar(s);
    var r = await post(facturas, '/:id/rectificar', '9');
    assert.deepEqual(r, { tipo: 'redirect', url: '/facturas/10', estado: 302 });
    assert.deepEqual([lineasDe(10).length, db.estado().facturas[8].estado], [0, 'rectificada']);
  });

  // ANO-044 (A-26): dos rectificaciones simultáneas
  it('CONGELA comportamiento actual: ANO-044 · dos rectificaciones entrelazadas de FA-2026-000108 graban dos RE con el mismo número', async function () {
    var r = await Promise.all([post(facturas, '/:id/rectificar', '9'), post(facturas, '/:id/rectificar', '9')]);
    assert.deepEqual(r.map(function (x) { return x.tipo; }), ['redirect', 'redirect']);
    assert.deepEqual(facturasNuevas().map(function (f) { return [f.numero, f.total]; }), [['RE-2026-000002', -154.24], ['RE-2026-000002', -154.24]]);
  });

  // ANO-045 (A-27): doble envío del alta
  it('CONGELA comportamiento actual: ANO-045 · dos envíos entrelazados del mismo formulario graban dos facturas (con el mismo número, ANO-001)', async function () {
    var r = await Promise.all([alta(linea1('10')), alta(linea1('10'))]);
    assert.deepEqual(r.map(function (x) { return x.url; }), ['/facturas/10', '/facturas/11']);
    assert.deepEqual(facturasNuevas().map(function (f) { return f.numero; }), ['FA-2026-000109', 'FA-2026-000109']);
  });

  // ANO-040 (A-38, A-28): tipo de IVA no validado
  it('CONGELA comportamiento actual: ANO-040 · tipo 5 % para un cliente en recargo → IVA 5,00 y recargo 0,00 sin aviso', async function () {
    await alta(linea1('100', { cliente_id: '2', iva: '5' }));
    assert.deepEqual([facturasNuevas()[0].iva, facturasNuevas()[0].recargo, facturasNuevas()[0].total], [5, 0, 105]);
  });

  // ANO-053 (A-29): un segundo envío sobrescribe la baja; fechas sin validar
  it('CONGELA comportamiento actual: ANO-053 · una segunda baja sobrescribe la primera; «15/03/2026» → prorrateo «NaN»', async function () {
    await post(contratos, '/:id/baja', '1', { fecha_baja: '2026-03-15' });
    var r = await post(contratos, '/:id/baja', '1', { fecha_baja: '15/03/2026' });
    assert.deepEqual([r.url, db.estado().contratos[0].fecha_baja], ['/contratos?prorrateo=NaN', '15/03/2026']);
  });

  // ANO-042 (A-29): baja anterior al alta
  it('CONGELA comportamiento actual: ANO-042 · alta 20/03 y baja 10/03: la remesa emite FA de −31,62 €; la pantalla indica 30,00', async function () {
    var r = remesa('2026-03', '2026-04-01T09:00:00', comun.contratosRemesa([4], { 4: { fecha_alta: '2026-03-20', fecha_baja: '2026-03-10' } }));
    assert.deepEqual([r.estado.facturas[0].numero, r.estado.facturas[0].total], ['FA-2026-000109', -31.62]);
    assert.equal(calculo.calcularProrrateo(90, '2026-03-01', '2026-03-10'), 30);
  });

  // ANO-070 (A-30): baja futura (ver también contradicción 11)
  it('CONGELA comportamiento actual: ANO-070 · con baja el 15/12/2026, la remesa de noviembre factura el mes completo', function () {
    var r = remesa('2026-11', '2026-12-01T09:00:00', comun.contratosRemesa([1], { 1: { fecha_baja: '2026-12-15' } }));
    assert.deepEqual([r.estado.lineas[0].descripcion, r.estado.facturas[0].base], ['Alquiler máquina de café Futurmat F3 (noviembre 2026)', 90]);
  });

  // ANO-049 (A-31): fechas como texto sin validar
  it('CONGELA comportamiento actual: ANO-049 · la fecha «2026-1-5» se graba tal cual y se imprime «5/1/2026»', async function () {
    await alta(linea1('10', { fecha: '2026-1-5' }));
    assert.deepEqual([facturasNuevas()[0].fecha, u.fechaBonita(facturasNuevas()[0].fecha), facturasNuevas()[0].vencimiento], ['2026-1-5', '5/1/2026', '2026-02-04']);
  });

  // ANO-048 (A-32): meses imposibles y futuros en la remesa
  it('CONGELA comportamiento actual: ANO-048 · la remesa acepta un mes futuro (2030-05) y lo numera con el año del reloj', function () {
    var r = remesa('2030-05', '2026-11-16T10:00:00', comun.contratosRemesa([1]));
    assert.deepEqual([r.estado.facturas[0].numero, r.estado.facturas[0].fecha], ['FA-2026-000109', '2030-05-31']);
  });
});

describe('Nivel C del registro', function () {
  // ANO-023 (A-33): «a partir de» frente a «estrictamente mayor»
  it('CONGELA comportamiento actual: ANO-023 · base de 1.000,00 y de 5.000,00 justas → 0 % y 2 % (no 2 % y 5 %)', function () {
    assert.deepEqual([calculo.porcentajeDescuento(1000), calculo.porcentajeDescuento(5000)], [0, 2]);
  });

  // ANO-043 (A-35): febrero en el prorrateo comercial
  it('CONGELA comportamiento actual: ANO-043 · baja el último día de febrero no cobra la cuota entera (84 de 90; 87 en bisiesto)', function () {
    assert.deepEqual([calculo.calcularProrrateo(90, '2026-02-01', '2026-02-28'), calculo.calcularProrrateo(90, '2028-02-01', '2028-02-29')], [84, 87]);
  });

  // ANO-062 (A-36): descuento sobre el precio unitario redondeado
  it('CONGELA comportamiento actual: ANO-062 · 20 platos con 2 % → 566,40 (sobre la base serían 566,44); a 0,01 € no hay descuento', function () {
    assert.equal(calculo.calcularFactura([L(20, 28.9, 21), L(1, 1000, 21)], {}).lineas[0].base, 566.4);
    assert.equal(calculo.calcularFactura([L(110000, 0.01, 21)], {}).lineas[0].precio, 0.01);
  });

  // ANO-025 y ANO-059 (A-37): coma flotante y mitades negativas
  it('CONGELA comportamiento actual: ANO-025 · redondear2(1,005) = 1 y redondear2(0,285) = 0,28', function () {
    assert.deepEqual([u.redondear2(1.005), u.redondear2(0.285)], [1, 0.28]);
  });
  it('CONGELA comportamiento actual: ANO-059 · la línea −1 × 2,50 al 21 % lleva IVA −0,52 (la positiva, 0,53)', function () {
    assert.equal(calculo.calcularLinea(-1, 2.5, 21, false).cuotaIva, -0.52);
  });

  // ANO-060 (A-40): toFixed frente a redondear2
  it('CONGELA comportamiento actual: ANO-060 · 2,675 se muestra «2,67» pero se calcula 2,68; 0,3 − 0,1 − 0,2 se muestra «-0,00»', function () {
    assert.deepEqual([u.formatearImporte(2.675), u.redondear2(2.675), u.formatearImporte(0.3 - 0.1 - 0.2)], ['2,67', 2.68, '-0,00']);
  });

  // ANO-069 (A-42): el cálculo solo cobra recargo con == 1
  it('CONGELA comportamiento actual: ANO-069 · recargo_equivalencia = 2 o «S» → sin recargo en el cálculo', function () {
    assert.deepEqual([2, 'S'].map(function (m) { return calculo.calcularFactura([L(1, 100, 21)], { recargo_equivalencia: m }).recargo; }), [0, 0]);
  });

  // ANO-006/ANO-033/ANO-034 (A-39)
  it('CONGELA comportamiento actual: ANO-006 · el servidor rectifica una factura «cobrada» (FA-2026-000101)', async function () {
    assert.equal((await post(facturas, '/:id/rectificar', '1')).tipo, 'redirect');
    assert.equal(db.estado().facturas[0].estado, 'rectificada');
  });
  it('CONGELA comportamiento actual: ANO-033 · el servidor marca «cobrada» una rectificativa y no avisa con una factura inexistente', async function () {
    await post(facturas, '/:id/cobrar', '7');
    assert.equal(db.estado().facturas[6].estado, 'cobrada');
    assert.deepEqual(await post(facturas, '/:id/cobrar', '99'), { tipo: 'redirect', url: '/facturas/99', estado: 302 });
  });
  it('CONGELA comportamiento actual: ANO-034 · al rectificar una cobrada no queda rastro del cobro (su estado pasa a «rectificada»)', async function () {
    await post(facturas, '/:id/rectificar', '2');
    assert.deepEqual(db.estado().facturas[1], Object.assign(semilla.semilla().facturas[1], { estado: 'rectificada' }));
  });
});

describe('Nivel D del registro', function () {
  // ANO-041 (A-47): dias_pago = 0
  it('CONGELA comportamiento actual: ANO-041 · un cliente con dias_pago = 0 (contado) vence a 30 días', async function () {
    var s = semilla.semilla(); s.clientes[0].dias_pago = 0; db.reiniciar(s);
    await alta(linea1('10'));
    assert.equal(facturasNuevas()[0].vencimiento, '2026-12-16');
  });

  // ANO-012 (A-47): ver contradicción 05 en 10-contradicciones.test.js

  // ANO-030 (A-48): ver contradicción 12 en 10-contradicciones.test.js

  // ANO-018 (A-49): NIF por longitud
  it('CONGELA comportamiento actual: ANO-018 · «ABCDEFGHI» es un NIF válido', function () {
    assert.equal(u.validarNIF('ABCDEFGHI'), true);
  });

  // ANO-015 (A-52): CSV sin escapar
  it('CONGELA comportamiento actual: ANO-015 · un nombre con «;», comillas y salto de línea se copia sin escapar en el CSV', async function () {
    db.reiniciar({ filasInforme: [{ numero: 'FA-2026-000110', fecha: '2026-06-01', nombre: 'Bar; "Pepe"\nnuevo', nif: null, base: 1234.5, iva: 259.25, recargo: 0, total: 1493.75, estado: 'emitida' }] });
    var r = await entorno.invocar(informes, 'GET', '/export-gestoria', { query: { anyo: '2026' } });
    assert.equal(r.cuerpo.split('\r\n')[2], 'FA-2026-000110;01/06/2026;Bar; "Pepe"\nnuevo;;1.234,50;259,25;0,00;1.493,75;emitida');
  });

  // ANO-026 y ANO-063 (A-53)
  it('CONGELA comportamiento actual: ANO-026/ANO-063 · trimestre ausente o 0 → 1T sin aviso', async function () {
    db.reiniciar({ filasInforme: [] });
    await entorno.invocar(informes, 'GET', '/iva', { query: { trimestre: '0' } });
    assert.deepEqual(db.llamadas()[0].params, ['2026-01-01', '2026-03-31']);
  });

  // ANO-037 (A-54): orden sin ORDER BY
  it('CONGELA comportamiento actual: ANO-037 · la remesa numera en el orden que devuelve la BD (sin ORDER BY); la rectificativa lee las líneas sin ORDER BY', async function () {
    var filas = comun.contratosRemesa([1, 4]).reverse(); // la BD devuelve primero el contrato 4
    var r = remesa('2026-02', '2026-03-01T09:00:00', filas);
    assert.doesNotMatch(r.llamadas[0].sql, /ORDER BY/);
    assert.deepEqual(r.estado.facturas.map(function (f) { return [f.numero, f.cliente_id]; }), [['FA-2026-000109', 6], ['FA-2026-000110', 1]]);
    await post(facturas, '/:id/rectificar', '9');
    assert.equal(db.llamadas()[1].sql, 'SELECT * FROM lineas WHERE factura_id = ?');
  });

  // ANO-024, ANO-038, ANO-065 (A-55): textos automáticos
  it('CONGELA comportamiento actual: ANO-024 · el aviso de descuento empieza por un espacio', async function () {
    await alta(linea1('1200'));
    assert.equal(facturasNuevas()[0].observaciones, ' Descuento volumen 2% aplicado');
  });
  it('CONGELA comportamiento actual: ANO-038 · rectificar sin motivo deja «Rectifica FA-2026-000108. »', async function () {
    await post(facturas, '/:id/rectificar', '9');
    assert.equal(facturasNuevas()[0].observaciones, 'Rectifica FA-2026-000108. ');
  });
  it('CONGELA comportamiento actual: ANO-065 · la línea de un mes parcial dice «(14 dias)» sin indicar el mes', function () {
    var r = remesa('2026-02', '2026-03-01T09:00:00', comun.contratosRemesa([4]));
    assert.equal(r.estado.lineas[0].descripcion, 'Alquiler máquina de café Futurmat F3 (14 dias)');
  });

  // ANO-039 (A-15): las facturas de remesa de la semilla no tienen la forma del script
  it('CONGELA comportamiento actual: ANO-039 · la remesa de enero de 2026 genera 1 línea y «Remesa enero 2026», no la forma de FA-2026-000101', function () {
    var r = remesa('2026-01', '2026-02-01T09:00:00', comun.contratosRemesa([1]));
    var semillaFA101 = semilla.semilla();
    assert.deepEqual([r.estado.lineas.length, r.estado.facturas[0].observaciones, r.estado.lineas[0].descripcion],
      [1, 'Remesa enero 2026', 'Alquiler máquina de café Futurmat F3 (enero 2026)']);
    assert.deepEqual([semillaFA101.lineas.filter(function (l) { return l.factura_id === 1; }).length, semillaFA101.facturas[0].observaciones, semillaFA101.lineas[0].descripcion],
      [4, 'Remesa enero', 'Alquiler máquina de café Futurmat F3 (enero)']);
  });

  // ANO-054 (A-46): correo desactivado
  it('CONGELA comportamiento actual: ANO-054 · enviarFactura solo escribe un aviso y devuelve sin error', async function () {
    var r = await comun.capturarConsola(function () {
      return new Promise(function (resolve) { email.enviarFactura({ numero: 'FA-2026-000109' }, { email: null }, resolve); });
    });
    assert.deepEqual([r.valor, r.consola], [null, ['[email] AVISO: envio desactivado. Factura FA-2026-000109 pendiente de enviar a mano a (sin email)']]);
  });

  // ANO-056 (A-59): datos personales en la consola
  it('CONGELA comportamiento actual: ANO-056 · el alta escribe el correo del cliente en la consola y la remesa su nombre', async function () {
    var r = await comun.capturarConsola(function () { return entorno.invocar(facturas, 'POST', '/nueva', { body: linea1('10') }); });
    assert.match(r.consola[0], /laparada@gmail\.com$/);
    assert.match(remesa('2026-02', '2026-03-01T09:00:00', comun.contratosRemesa([1])).consola, /Cafetería La Parada, S\.C\./);
  });
});

describe('Hallazgos nuevos de la caracterización (16/11/2026, registrados como A-63 a A-67)', function () {
  // ANO-072 (A-63): sumarDias acepta fechas imposibles y las desborda al mes siguiente
  it('CONGELA comportamiento actual: ANO-072 · sumarDias(«2026-02-30», 0) = «2026-03-02»; + 30 = «2026-04-01»; «2026-04-31» → «2026-05-01»', function () {
    assert.deepEqual([u.sumarDias('2026-02-30', 0), u.sumarDias('2026-02-30', 30), u.sumarDias('2026-04-31', 0), u.sumarDias('2026-02-32', 0)],
      ['2026-03-02', '2026-04-01', '2026-05-01', 'NaN-NaN-NaN']);
  });
  it('CONGELA comportamiento actual: ANO-072 · una factura manual con fecha «2026-02-30» se graba así y vence el 01/04/2026', async function () {
    await alta(linea1('10', { fecha: '2026-02-30' }));
    assert.deepEqual([facturasNuevas()[0].fecha, facturasNuevas()[0].vencimiento], ['2026-02-30', '2026-04-01']);
  });

  // ANO-073 (A-64): formatearImporte con valores no finitos o enormes
  it('CONGELA comportamiento actual: ANO-073 · formatearImporte(Infinity) = «Infinity,undefined»; 1e21 → «1e+21,undefined»', function () {
    assert.deepEqual([u.formatearImporte(Infinity), u.formatearImporte(-Infinity), u.formatearImporte(1e21)],
      ['Infinity,undefined', '-Infinity,undefined', '1e+21,undefined']);
  });
  it('CONGELA comportamiento actual: ANO-073 · precio «1e400» en el formulario → factura con total Infinity', async function () {
    await alta(linea1('1e400'));
    assert.deepEqual([facturasNuevas()[0].base, facturasNuevas()[0].total, facturasNuevas()[0].observaciones], [Infinity, Infinity, ' Descuento volumen 5% aplicado']);
  });

  // ANO-074 (A-64): formatear no valida el número
  it('CONGELA comportamiento actual: ANO-074 · formatear con 0 → «FA-2026-000000»; con −5 → «FA-2026-0000-5»; un contador en −6 da ese número', async function () {
    assert.deepEqual([num.formatear('FA', 2026, 0), num.formatear('FA', 2026, -5)], ['FA-2026-000000', 'FA-2026-0000-5']);
    db.reiniciar({ contadores: [{ serie: 'FA', anyo: 2026, ultimo: -6 }] });
    assert.deepEqual(await siguiente('FA'), [null, 'FA-2026-0000-5']);
  });

  // ANO-075 (A-65): la rectificativa envía ceros negativos
  it('CONGELA comportamiento actual: ANO-075 · rectificar una factura sin recargo envía recargo −0 en la cabecera y en cada línea', async function () {
    await post(facturas, '/:id/rectificar', '9');
    var cab = db.llamadas()[4].params;
    assert.ok(Object.is(cab[7], -0), 'recargo de cabecera −0');
    assert.ok(lineasDe(10).every(function (l) { return Object.is(l.cuota_recargo, -0); }));
    assert.equal(u.formatearImporte(cab[7]), '0,00');
  });

  // ANO-076 (A-66): año de los informes sin validar
  it('CONGELA comportamiento actual: ANO-076 · año «26» → periodo «26-04-01»..«26-06-31» y CSV «26-%»; «2026abc» → 2026; «abc» → año en curso', async function () {
    db.reiniciar({ filasInforme: [] });
    await entorno.invocar(informes, 'GET', '/iva', { query: { anyo: '26', trimestre: '2' } });
    await entorno.invocar(informes, 'GET', '/export-gestoria', { query: { anyo: '26' } });
    await entorno.invocar(informes, 'GET', '/iva', { query: { anyo: '2026abc', trimestre: '2' } });
    await entorno.invocar(informes, 'GET', '/iva', { query: { anyo: 'abc', trimestre: '2' } });
    assert.deepEqual(db.llamadas().map(function (l) { return l.params; }),
      [['26-04-01', '26-06-31'], ['26-%'], ['2026-04-01', '2026-06-31'], ['2026-04-01', '2026-06-31']]);
  });
  it('CONGELA comportamiento actual: ANO-076 · trimestre negativo («-1») → excepción TypeError, igual que el 5', async function () {
    var r = await entorno.invocar(informes, 'GET', '/iva', { query: { trimestre: '-1' } });
    assert.deepEqual(r, { tipo: 'excepcion', error: "TypeError: Cannot read properties of undefined (reading '0')", estado: 200 });
  });

  // ANO-077 (A-63): remesa de un mes imposible: vencimiento y línea
  it('CONGELA comportamiento actual: ANO-077 · remesa «2026-13» → vencimiento «NaN-NaN-NaN» y línea «(undefined 2026)»', function () {
    var r = remesa('2026-13', '2026-11-16T10:00:00', comun.contratosRemesa([1]));
    assert.deepEqual([r.estado.facturas[0].vencimiento, r.estado.lineas[0].descripcion], ['NaN-NaN-NaN', 'Alquiler máquina de café Futurmat F3 (undefined 2026)']);
  });

  // ANO-078 (A-67): los campos del formulario se emparejan por posición
  it('CONGELA comportamiento actual: ANO-078 · si llegan menos cantidades o tipos que descripciones, la línea sobrante va con cantidad y tipo NaN', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: ['a', 'b'], cant: ['1'], precio: ['10', '20'], iva: ['21'] });
    assert.deepEqual(lineasDe(10).map(function (l) { return [l.descripcion, l.cantidad, l.precio, l.tipo_iva, l.base]; }),
      [['a', 1, 10, 21, 10], ['b', NaN, 20, NaN, NaN]]);
    assert.deepEqual([facturasNuevas()[0].base, facturasNuevas()[0].total], [NaN, NaN]);
  });
  it('CONGELA comportamiento actual: ANO-078 · con un tipo de menos en medio, los tipos se desplazan una línea', async function () {
    await alta({ cliente_id: '1', fecha: '2026-11-16', desc: ['a', 'b', 'c'], cant: ['1', '1', '1'], precio: ['10', '10', '10'], iva: ['21', '4'] });
    assert.deepEqual(lineasDe(10).map(function (l) { return l.tipo_iva; }), [21, 4, NaN]);
  });
});
