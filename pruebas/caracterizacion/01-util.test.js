// Caracterización de lib/util.js (criticidad ALTA, mapa-sistema.md §2.5).
// Valores esperados = lo que produce el código actual (ejecutado el 16/11/2026, Node 26.13.0,
// TZ Europe/Madrid). Si un test falla, se ha cambiado el comportamiento: NO se corrige el test
// sin una decisión de negocio escrita (constitución, Principio I).

'use strict';

require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var comun = require('../ayudas/comun');
var u = require('../../lib/util');

describe('Entorno de los tests', function () {
  it('la zona horaria del proceso es Europe/Madrid (UTC+2 en verano, UTC+1 en invierno)', function () {
    assert.equal(new Date('2026-07-01T12:00:00').getTimezoneOffset(), -120);
    assert.equal(new Date('2026-01-01T12:00:00').getTimezoneOffset(), -60);
  });
});

describe('RN-05 · Redondeo al céntimo: Math.round(x*100)/100 sobre coma flotante', function () {
  // Ejemplos de reglas-de-negocio.md RN-05 y apéndice A, caso 1
  var casos = [
    [0.125, 0.13], [-0.125, -0.12], [0.525, 0.53], [-0.525, -0.52],
    [2.675, 2.68], [-2.675, -2.67], [1.005, 1], [0.285, 0.28]
  ];
  casos.forEach(function (c) {
    it('redondear2(' + c[0] + ') = ' + c[1] + ' (ejemplo del documento)', function () {
      assert.equal(u.redondear2(c[0]), c[1]);
    });
  });

  it('frontera del medio céntimo positivo: 0,0049 → 0; 0,005 → 0,01; 0,0051 → 0,01', function () {
    assert.equal(u.redondear2(0.0049), 0);
    assert.equal(u.redondear2(0.005), 0.01);
    assert.equal(u.redondear2(0.0051), 0.01);
  });

  it('frontera del medio céntimo negativo: −0,004 → −0; −0,005 → −0 (hacia cero); −0,006 → −0,01', function () {
    assert.equal(u.redondear2(-0.004), -0);
    assert.equal(u.redondear2(-0.005), -0);
    assert.equal(u.redondear2(-0.006), -0.01);
  });

  it('más casos de coma flotante: 1,115 → 1,12; 1,255 → 1,25; 1,355 → 1,36; 8,675 → 8,68; 10,235 → 10,24', function () {
    assert.equal(u.redondear2(1.115), 1.12);
    assert.equal(u.redondear2(1.255), 1.25);
    assert.equal(u.redondear2(1.355), 1.36);
    assert.equal(u.redondear2(8.675), 8.68);
    assert.equal(u.redondear2(10.235), 10.24);
    assert.equal(u.redondear2(123456.785), 123456.79);
  });

  it('cero, cero negativo y residuos de coma flotante', function () {
    assert.equal(u.redondear2(0), 0);
    assert.equal(u.redondear2(-0), -0);
    assert.equal(u.redondear2(1e-14), 0);
    assert.equal(u.redondear2(-1e-14), -0);
    assert.equal(u.redondear2(0.1 + 0.2), 0.3);
  });

  it('valores vacíos o inexistentes: null → 0; undefined → NaN; NaN → NaN; texto numérico → se convierte', function () {
    assert.equal(u.redondear2(null), 0);
    assert.equal(u.redondear2(undefined), NaN);
    assert.equal(u.redondear2(NaN), NaN);
    assert.equal(u.redondear2('1.236'), 1.24);
  });
});

describe('RN-24 (parte de util) · sumarDias: días naturales, cruza meses y años', function () {
  it('ejemplos del documento: 31/01/2026 + 30 = 02/03/2026; 20/02/2026 + 60 = 21/04/2026', function () {
    assert.equal(u.sumarDias('2026-01-31', 30), '2026-03-02');
    assert.equal(u.sumarDias('2026-02-20', 60), '2026-04-21');
  });

  it('fin de año: 31/12/2026 + 30 = 30/01/2027; 31/12/2026 + 1 = 01/01/2027', function () {
    assert.equal(u.sumarDias('2026-12-31', 30), '2027-01-30');
    assert.equal(u.sumarDias('2026-12-31', 1), '2027-01-01');
  });

  it('febrero bisiesto y no bisiesto: 28/02/2028 + 1 = 29/02; 28/02/2026 + 1 = 01/03; 28/02/2024 + 1 = 29/02; 28/02/2100 + 1 = 01/03', function () {
    assert.equal(u.sumarDias('2028-02-28', 1), '2028-02-29');
    assert.equal(u.sumarDias('2026-02-28', 1), '2026-03-01');
    assert.equal(u.sumarDias('2024-02-28', 1), '2024-02-29');
    assert.equal(u.sumarDias('2100-02-28', 1), '2100-03-01');
  });

  it('febrero + 30 y + 60: 28/02/2026 → 30/03/2026 y 29/04/2026', function () {
    assert.equal(u.sumarDias('2026-02-28', 30), '2026-03-30');
    assert.equal(u.sumarDias('2026-02-28', 60), '2026-04-29');
  });

  it('cambios de hora en Madrid (marzo y octubre) no desplazan el día', function () {
    assert.equal(u.sumarDias('2026-03-28', 1), '2026-03-29');
    assert.equal(u.sumarDias('2026-03-29', 1), '2026-03-30');
    assert.equal(u.sumarDias('2026-10-25', 1), '2026-10-26');
  });

  it('cero y negativos: + 0 devuelve la misma fecha; 31/03/2026 − 31 = 28/02/2026', function () {
    assert.equal(u.sumarDias('2026-01-31', 0), '2026-01-31');
    assert.equal(u.sumarDias('2026-03-31', -31), '2026-02-28');
  });

  it('los ocho vencimientos FA de la semilla salen con esta regla (apéndice A, caso 17)', function () {
    assert.deepEqual([
      u.sumarDias('2026-01-31', 30), u.sumarDias('2026-02-06', 30), u.sumarDias('2026-02-20', 60),
      u.sumarDias('2026-03-05', 30), u.sumarDias('2026-03-31', 60), u.sumarDias('2026-04-30', 30),
      u.sumarDias('2026-05-06', 30), u.sumarDias('2026-05-31', 30)
    ], ['2026-03-02', '2026-03-08', '2026-04-21', '2026-04-04', '2026-05-30', '2026-05-30', '2026-06-05', '2026-06-30']);
  });

  it('fecha vacía o mal formada → "NaN-NaN-NaN" (registro-riesgos.md, apéndice A, caso 2)', function () {
    assert.equal(u.sumarDias('31/12/2026', 30), 'NaN-NaN-NaN');
    assert.equal(u.sumarDias('', 30), 'NaN-NaN-NaN');
  });
});

describe('diasDelMes (base de RN-40 y RN-43)', function () {
  it('febrero normal 28, bisiesto 29, secular no bisiesto 2100 → 28, 2000 → 29', function () {
    assert.equal(u.diasDelMes('2026-02-01'), 28);
    assert.equal(u.diasDelMes('2028-02-01'), 29);
    assert.equal(u.diasDelMes('2024-02-29'), 29);
    assert.equal(u.diasDelMes('2100-02-01'), 28);
    assert.equal(u.diasDelMes('2000-02-01'), 29);
  });
  it('meses de 30 y 31: abril 30, diciembre 31', function () {
    assert.equal(u.diasDelMes('2026-04-15'), 30);
    assert.equal(u.diasDelMes('2026-12-01'), 31);
  });
  it('meses imposibles 13 y 00 → 31 (apéndice A, caso 16)', function () {
    assert.equal(u.diasDelMes('2026-13-01'), 31);
    assert.equal(u.diasDelMes('2026-00-01'), 31);
  });
});

describe('RN-50 · Formato de importes: coma decimal, punto de miles, toFixed(2)', function () {
  // Ejemplos de RN-50 y apéndice A, caso 19
  it('ejemplos del documento: 1234,5 → «1.234,50»; −101,61 → «-101,61»; NaN → «0,00»; 2,675 → «2,67»; −0,001 → «-0,00»', function () {
    assert.equal(u.formatearImporte(1234.5), '1.234,50');
    assert.equal(u.formatearImporte(-101.61), '-101,61');
    assert.equal(u.formatearImporte(NaN), '0,00');
    assert.equal(u.formatearImporte(2.675), '2,67');
    assert.equal(u.formatearImporte(-0.001), '-0,00');
  });
  it('vacíos e inexistentes: null, undefined y texto no numérico → «0,00»; cero negativo → «0,00»', function () {
    assert.equal(u.formatearImporte(null), '0,00');
    assert.equal(u.formatearImporte(undefined), '0,00');
    assert.equal(u.formatearImporte('abc'), '0,00');
    assert.equal(u.formatearImporte(-0), '0,00');
    assert.equal(u.formatearImporte(0), '0,00');
  });
  it('fronteras del punto de miles: 999,99 / 1.000,00 / 1.000,01 y millones', function () {
    assert.equal(u.formatearImporte(999.99), '999,99');
    assert.equal(u.formatearImporte(1000), '1.000,00');
    assert.equal(u.formatearImporte(1000.01), '1.000,01');
    assert.equal(u.formatearImporte(1000000), '1.000.000,00');
    assert.equal(u.formatearImporte(-1234567.891), '-1.234.567,89');
  });
  it('redondeo propio de toFixed: 999,995 → «1.000,00»; −999,995 → «-1.000,00»; 0,005 → «0,01»; 1,005 → «1,00»', function () {
    assert.equal(u.formatearImporte(999.995), '1.000,00');
    assert.equal(u.formatearImporte(-999.995), '-1.000,00');
    assert.equal(u.formatearImporte(0.005), '0,01');
    assert.equal(u.formatearImporte(1.005), '1,00');
  });
  it('sumas de coma flotante: 0,1 + 0,2 → «0,30»; 0,3 − 0,1 − 0,2 → «-0,00»', function () {
    assert.equal(u.formatearImporte(0.1 + 0.2), '0,30');
    assert.equal(u.formatearImporte(0.3 - 0.1 - 0.2), '-0,00');
  });
  it('texto numérico se acepta: «1234.5» → «1.234,50»', function () {
    assert.equal(u.formatearImporte('1234.5'), '1.234,50');
  });
});

describe('RN-51 · Formato de fechas: AAAA-MM-DD → DD/MM/AAAA sin comprobar', function () {
  it('ejemplos del documento: «2026-01-31» → «31/01/2026»; null → «»; «31/12/2026» → «undefined/undefined/31/12/2026»', function () {
    assert.equal(u.fechaBonita('2026-01-31'), '31/01/2026');
    assert.equal(u.fechaBonita(null), '');
    assert.equal(u.fechaBonita('31/12/2026'), 'undefined/undefined/31/12/2026');
  });
  it('vacío e inexistente → «»; fecha sin ceros «2026-1-5» → «5/1/2026»; solo año → «undefined/undefined/2026»', function () {
    assert.equal(u.fechaBonita(''), '');
    assert.equal(u.fechaBonita(undefined), '');
    assert.equal(u.fechaBonita('2026-1-5'), '5/1/2026');
    assert.equal(u.fechaBonita('2026'), 'undefined/undefined/2026');
  });
});

describe('RN-52 · «Hoy» es la fecha local del equipo', function () {
  test.afterEach(comun.soltarReloj);

  it('el 16/11/2026 a las 00:30 en Madrid, hoy() = «2026-11-16» (ejemplo del documento)', function () {
    comun.fijarReloj('2026-11-16T00:30:00');
    assert.equal(u.hoy(), '2026-11-16');
  });
  it('nochevieja y año nuevo: 31/12/2026 23:59 → «2026-12-31»; 01/01/2027 00:00 → «2027-01-01»', function () {
    comun.fijarReloj('2026-12-31T23:59:59');
    assert.equal(u.hoy(), '2026-12-31');
    comun.fijarReloj('2027-01-01T00:00:00');
    assert.equal(u.hoy(), '2027-01-01');
  });
  it('29 de febrero de 2028 → «2028-02-29» (relleno con ceros de mes y día)', function () {
    comun.fijarReloj('2028-02-29T12:00:00');
    assert.equal(u.hoy(), '2028-02-29');
  });
});

describe('RN-53 · NIF: 9 caracteres tras quitar espacios y guiones, sin comprobar la letra', function () {
  // Ejemplos de RN-53 y apéndice A, caso 21
  var casos = [
    ['B45812390', true], ['70355910k', true], ['B-4581-2390', true], [' B 45812390', true],
    ['ABCDEFGHI', true], ['12345678', false], ['', false], [null, false]
  ];
  casos.forEach(function (c) {
    it('validarNIF(' + JSON.stringify(c[0]) + ') = ' + c[1] + ' (ejemplo del documento)', function () {
      assert.equal(u.validarNIF(c[0]), c[1]);
    });
  });
  it('frontera de longitud: 8 → false; 9 → true; 10 → false', function () {
    assert.equal(u.validarNIF('12345678'), false);
    assert.equal(u.validarNIF('12345678Z'), true);
    assert.equal(u.validarNIF('1234567890'), false);
  });
  it('quita cualquier espacio en blanco (también tabuladores y el final), pero no otros separadores', function () {
    assert.equal(u.validarNIF('B\t45812390'), true);
    assert.equal(u.validarNIF('12345678Z '), true);
    assert.equal(u.validarNIF('B 4581 239 0'), true);
    assert.equal(u.validarNIF('B_45812390'), false);
  });
  it('acepta números (se convierten a texto) y rechaza undefined', function () {
    assert.equal(u.validarNIF(123456789), true);
    assert.equal(u.validarNIF(undefined), false);
  });
});
