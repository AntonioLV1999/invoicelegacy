// Caracterización de services/calculo.js (criticidad ALTA, mapa-sistema.md §2.1).
// Cada describe es la batería de una regla de reglas-de-negocio.md; su primer test usa el
// ejemplo numérico del documento como caso de contraste. Todos los ejemplos coinciden con la
// ejecución real del 16/11/2026: no ha hecho falta investigar ninguna discrepancia.

'use strict';

require('../ayudas/comun');
var test = require('node:test');
var describe = test.describe;
var it = test.it;
var assert = require('node:assert/strict');
var c = require('../../services/calculo');
var semilla = require('../ayudas/semilla');

function L(cantidad, precio, tipoIva, descripcion) {
  return { descripcion: descripcion || 'Artículo', cantidad: cantidad, precio: precio, tipoIva: tipoIva };
}
var SIN_RECARGO = { recargo_equivalencia: 0 };
var CON_RECARGO = { recargo_equivalencia: 1 };

// Resumen numérico de una factura calculada: [descuentoPct, base, iva, recargo, total]
function resumen(f) { return [f.descuentoPct, f.base, f.iva, f.recargo, f.total]; }

describe('RN-01 · Base de la línea = cantidad × precio, redondeada al céntimo', function () {
  it('ejemplo del documento: 0,44 × 21,60 = 9,504 → 9,50 (FA-2026-000101)', function () {
    assert.equal(c.calcularLinea(0.44, 21.6, 21, false).base, 9.5);
  });
  it('cantidades decimales y coma flotante: 3 × 0,1 = 0,30; 3 × 1,005 = 3,01 (no 3,02)', function () {
    assert.equal(c.calcularLinea(3, 0.1, 21, false).base, 0.3);
    assert.equal(c.calcularLinea(3, 1.005, 21, false).base, 3.01);
  });
  it('cero: cantidad 0 da base 0, IVA 0 y recargo 0', function () {
    assert.deepEqual(c.calcularLinea(0, 5, 21, true), { base: 0, cuotaIva: 0, cuotaRecargo: 0 });
  });
});

describe('RN-02 · La cuota de IVA se calcula sobre la base ya redondeada', function () {
  it('ejemplo del documento: 9,50 × 21 % = 1,995 → 2,00', function () {
    assert.equal(c.calcularLinea(0.44, 21.6, 21, false).cuotaIva, 2);
  });
  it('1 × 1,115 → base 1,12 → IVA 0,24; 1 × 0,125 → base 0,13 → IVA 0,03', function () {
    assert.deepEqual(c.calcularLinea(1, 1.115, 21, false), { base: 1.12, cuotaIva: 0.24, cuotaRecargo: 0 });
    assert.deepEqual(c.calcularLinea(1, 0.125, 21, false), { base: 0.13, cuotaIva: 0.03, cuotaRecargo: 0 });
  });
});

describe('RN-03 · IVA y recargo de la factura = suma de los de cada línea', function () {
  it('ejemplo del documento: FA-2026-000103 recalculada → IVA 205,81 (118,94 + 66,69 + 19,04 + 1,14)', function () {
    var f = c.calcularFactura(semilla.lineasParaCalculo(3), SIN_RECARGO);
    assert.deepEqual(f.lineas.map(function (l) { return l.cuotaIva; }), [118.94, 66.69, 19.04, 1.14]);
    assert.equal(f.iva, 205.81);
  });
});

describe('RN-04 · Partir una cantidad en varias líneas puede cambiar el IVA', function () {
  it('ejemplo del documento: 2 × 2,50 en una línea → IVA 1,05; en dos líneas de 1 × 2,50 → IVA 1,06', function () {
    assert.equal(c.calcularFactura([L(2, 2.5, 21)], SIN_RECARGO).iva, 1.05);
    assert.equal(c.calcularFactura([L(1, 2.5, 21), L(1, 2.5, 21)], SIN_RECARGO).iva, 1.06);
  });
});

describe('RN-05 (en el cálculo) · Mitades negativas hacia cero', function () {
  it('ejemplo del documento: 1 × 2,50 al 21 % → IVA 0,53; −1 × 2,50 → IVA −0,52', function () {
    assert.equal(c.calcularLinea(1, 2.5, 21, false).cuotaIva, 0.53);
    assert.equal(c.calcularLinea(-1, 2.5, 21, false).cuotaIva, -0.52);
  });
  it('al 10 % con recargo: ±1 × 2,50 → IVA 0,25 / −0,25 y recargo 0,04 / −0,04', function () {
    assert.deepEqual(c.calcularLinea(1, 2.5, 10, true), { base: 2.5, cuotaIva: 0.25, cuotaRecargo: 0.04 });
    assert.deepEqual(c.calcularLinea(-1, 2.5, 10, true), { base: -2.5, cuotaIva: -0.25, cuotaRecargo: -0.04 });
  });
});

describe('RN-06 · Totales de la factura', function () {
  it('ejemplo del documento: líneas de FA-2026-000101 → base 133,20, IVA 24,27, total 157,47', function () {
    var f = c.calcularFactura(semilla.lineasParaCalculo(1), SIN_RECARGO);
    assert.deepEqual(resumen(f), [0, 133.2, 24.27, 0, 157.47]);
  });
  it('estructura completa del resultado (campos y orden de líneas)', function () {
    var f = c.calcularFactura([L(3, 0.1, 21, 'A'), L(1, 0.7, 10, 'B')], SIN_RECARGO);
    assert.deepEqual(f, {
      lineas: [
        { descripcion: 'A', cantidad: 3, precio: 0.1, tipoIva: 21, base: 0.3, cuotaIva: 0.06, cuotaRecargo: 0 },
        { descripcion: 'B', cantidad: 1, precio: 0.7, tipoIva: 10, base: 0.7, cuotaIva: 0.07, cuotaRecargo: 0 }
      ],
      base: 1, iva: 0.13, recargo: 0, total: 1.13, descuentoPct: 0
    });
  });
  it('vacío: sin líneas → todo a cero', function () {
    assert.deepEqual(c.calcularFactura([], SIN_RECARGO), { lineas: [], base: 0, iva: 0, recargo: 0, total: 0, descuentoPct: 0 });
  });
  it('precio NaN → base, IVA y total NaN; recargo 0 (flujo-factura.md, apéndice A, caso 5)', function () {
    var f = c.calcularFactura([L(1, NaN, 21)], SIN_RECARGO);
    assert.deepEqual(resumen(f), [0, NaN, NaN, 0, NaN]);
  });
});

describe('RN-07 · El recargo solo se cobra a clientes marcados (== 1)', function () {
  it('ejemplo del documento: Ferretería El Tornillo, 4 × 18,50 → base 74, IVA 15,54, recargo 3,85', function () {
    assert.deepEqual(c.calcularLinea(4, 18.5, 21, true), { base: 74, cuotaIva: 15.54, cuotaRecargo: 3.85 });
    assert.deepEqual(resumen(c.calcularFactura([L(4, 18.5, 21)], CON_RECARGO)), [0, 74, 15.54, 3.85, 93.39]);
  });
  it('marca 1, «1», true y « 1» → con recargo 5,20 por 100 € al 21 %', function () {
    [1, '1', true, ' 1'].forEach(function (marca) {
      assert.equal(c.calcularFactura([L(1, 100, 21)], { recargo_equivalencia: marca }).recargo, 5.2, String(marca));
    });
  });
  it('marca 0, 2, null, «S» → sin recargo (apéndice A, caso 10)', function () {
    [0, 2, null, 'S'].forEach(function (marca) {
      assert.equal(c.calcularFactura([L(1, 100, 21)], { recargo_equivalencia: marca }).recargo, 0, String(marca));
    });
  });
  it('cliente null o inexistente → sin recargo', function () {
    assert.equal(c.calcularFactura([L(1, 10, 21)], null).total, 12.1);
    assert.equal(c.calcularFactura([L(1, 10, 21)]).total, 12.1);
  });
});

describe('RN-08 · Tabla de recargos vigente: 21 → 5,2; 10 → 1,4; 4 → 0,5', function () {
  it('ejemplo del documento: Panadería, 8 × 14,20 al 4 % → base 113,60, IVA 4,54, recargo 0,57', function () {
    assert.deepEqual(c.calcularLinea(8, 14.2, 4, true), { base: 113.6, cuotaIva: 4.54, cuotaRecargo: 0.57 });
  });
  it('recargoPara(21/10/4) = 5,2 / 1,4 / 0,5', function () {
    assert.deepEqual([c.recargoPara(21), c.recargoPara(10), c.recargoPara(4)], [5.2, 1.4, 0.5]);
  });
});

describe('RN-09 · Recargos de tipos antiguos: 18 y 16 → 4; 8 y 7 → 1', function () {
  it('ejemplo del documento: 100 € al 18 % con recargo → IVA 18,00, recargo 4,00', function () {
    assert.deepEqual(c.calcularLinea(1, 100, 18, true), { base: 100, cuotaIva: 18, cuotaRecargo: 4 });
  });
  it('16 → 4; 8 → 1; 7 → 1', function () {
    assert.deepEqual([c.recargoPara(16), c.recargoPara(8), c.recargoPara(7)], [4, 1, 1]);
    assert.equal(c.calcularLinea(1, 100, 7, true).cuotaRecargo, 1);
  });
});

describe('RN-10 · Cualquier otro tipo no lleva recargo', function () {
  it('ejemplo del documento: 100 € al 5 % con recargo → IVA 5,00, recargo 0,00; «21» como texto → 0', function () {
    assert.deepEqual(c.calcularLinea(1, 100, 5, true), { base: 100, cuotaIva: 5, cuotaRecargo: 0 });
    assert.equal(c.recargoPara('21'), 0);
  });
  it('0, 2, null, undefined y −21 → 0', function () {
    assert.deepEqual([0, 2, null, undefined, -21].map(c.recargoPara), [0, 0, 0, 0, 0]);
  });
});

describe('RN-11 · Tramos del descuento: > 1.000 → 2 %; > 5.000 → 5 % (estrictamente mayor)', function () {
  it('ejemplo del documento: 1.000,00 → total 1.210,00; 1.000,01 → 1.185,81; 5.000,00 → 5.929,00; 5.000,01 → 5.747,51', function () {
    assert.deepEqual(resumen(c.calcularFactura([L(1, 1000, 21)], SIN_RECARGO)), [0, 1000, 210, 0, 1210]);
    assert.deepEqual(resumen(c.calcularFactura([L(1, 1000.01, 21)], SIN_RECARGO)), [2, 980.01, 205.8, 0, 1185.81]);
    assert.deepEqual(resumen(c.calcularFactura([L(1, 5000, 21)], SIN_RECARGO)), [2, 4900, 1029, 0, 5929]);
    assert.deepEqual(resumen(c.calcularFactura([L(1, 5000.01, 21)], SIN_RECARGO)), [5, 4750.01, 997.5, 0, 5747.51]);
  });
  it('umbral 1.000: justo debajo (999,99) → 0 %; exacto (1.000) → 0 %; justo encima (1.000,01) → 2 %', function () {
    assert.deepEqual([c.porcentajeDescuento(999.99), c.porcentajeDescuento(1000), c.porcentajeDescuento(1000.01)], [0, 0, 2]);
    assert.deepEqual(resumen(c.calcularFactura([L(1, 999.99, 21)], SIN_RECARGO)), [0, 999.99, 210, 0, 1209.99]);
  });
  it('umbral 5.000: justo debajo (4.999,99) → 2 %; exacto (5.000) → 2 %; justo encima (5.000,01) → 5 %', function () {
    assert.deepEqual([c.porcentajeDescuento(4999.99), c.porcentajeDescuento(5000), c.porcentajeDescuento(5000.01)], [2, 2, 5]);
    assert.deepEqual(resumen(c.calcularFactura([L(1, 4999.99, 21)], SIN_RECARGO)), [2, 4899.99, 1029, 0, 5928.99]);
  });
  it('fracciones de céntimo: 1.000,004 → 2 %; cero y negativos → 0 %; NaN → 0 %', function () {
    assert.deepEqual([c.porcentajeDescuento(1000.004), c.porcentajeDescuento(0), c.porcentajeDescuento(-1), c.porcentajeDescuento(NaN)], [2, 0, 0, 0]);
  });
  it('base bruta muy negativa (−6.000) → sin descuento', function () {
    assert.deepEqual(resumen(c.calcularFactura([L(-1, 6000, 21)], SIN_RECARGO)), [0, -6000, -1260, 0, -7260]);
  });
});

describe('RN-12 · El tramo se decide con la suma de líneas ya redondeadas', function () {
  it('ejemplo del documento: FA-2026-000103 recalculada → base bruta 1.000,02 → 2 %: base 980,01, total 1.185,82', function () {
    var f = c.calcularFactura(semilla.lineasParaCalculo(3), SIN_RECARGO);
    assert.deepEqual(resumen(f), [2, 980.01, 205.81, 0, 1185.82]);
  });
});

describe('RN-13 · El descuento afecta a toda la base: salto en cada umbral', function () {
  it('ejemplo del documento: hasta 1.020,41 € de base bruta no se vuelve a pagar 1.210,00', function () {
    assert.deepEqual(resumen(c.calcularFactura([L(1, 1020.40, 21)], SIN_RECARGO)), [2, 999.99, 210, 0, 1209.99]);
    assert.deepEqual(resumen(c.calcularFactura([L(1, 1020.41, 21)], SIN_RECARGO)), [2, 1000, 210, 0, 1210]);
  });
  it('ejemplo del documento: hasta unos 5.157,89 € no se vuelve a la base de 4.900', function () {
    assert.equal(c.calcularFactura([L(1, 5157.89, 21)], SIN_RECARGO).base, 4900);
    assert.equal(c.calcularFactura([L(1, 5157.90, 21)], SIN_RECARGO).base, 4900);
    assert.deepEqual(resumen(c.calcularFactura([L(1, 5263.15, 21)], SIN_RECARGO)), [5, 4999.99, 1050, 0, 6049.99]);
  });
});

describe('RN-14 · El descuento rebaja el precio unitario, redondeado antes de multiplicar', function () {
  it('ejemplo del documento: platos 28,90 − 2 % = 28,32 × 20 = 566,40 (FA-2026-000103)', function () {
    var f = c.calcularFactura(semilla.lineasParaCalculo(3), SIN_RECARGO);
    assert.deepEqual(f.lineas.map(function (l) { return [l.precio, l.base]; }),
      [[28.32, 566.4], [21.17, 317.55], [18.13, 90.65], [5.88, 5.41]]);
  });
  it('ejemplo del documento: un precio de 0,01 no baja con el 2 % (110.000 × 0,01 → base 1.100)', function () {
    var f = c.calcularFactura([L(110000, 0.01, 21)], SIN_RECARGO);
    assert.equal(f.lineas[0].precio, 0.01);
    assert.deepEqual(resumen(f), [2, 1100, 231, 0, 1331]);
  });
  it('sin descuento el precio se devuelve tal cual, sin redondear (1,115 sigue siendo 1,115)', function () {
    assert.equal(c.calcularFactura([L(1, 1.115, 21)], SIN_RECARGO).lineas[0].precio, 1.115);
  });
  it('5 % sobre varias líneas y tipos con recargo: precios 27,46 / 26,08 / 11,35', function () {
    var f = c.calcularFactura([L(100, 28.9, 21), L(80, 27.45, 4), L(10, 11.95, 10)], CON_RECARGO);
    assert.deepEqual(f.lineas.map(function (l) { return [l.precio, l.base, l.cuotaIva, l.cuotaRecargo]; }),
      [[27.46, 2746, 576.66, 142.79], [26.08, 2086.4, 83.46, 10.43], [11.35, 113.5, 11.35, 1.59]]);
    assert.deepEqual(resumen(f), [5, 4945.9, 671.47, 154.81, 5772.18]);
  });
});

describe('RN-15 · El descuento no distingue cliente, tipo de IVA ni signo', function () {
  it('ejemplo del documento: Ferretería (recargo), 1 × 1.200 → precio 1.176, IVA 246,96, recargo 61,15, total 1.484,11', function () {
    var f = c.calcularFactura([L(1, 1200, 21)], CON_RECARGO);
    assert.equal(f.lineas[0].precio, 1176);
    assert.deepEqual(resumen(f), [2, 1176, 246.96, 61.15, 1484.11]);
  });
  it('ejemplo del documento: 1.050 y −60 → base bruta 990 → sin descuento, total 1.197,90', function () {
    assert.deepEqual(resumen(c.calcularFactura([L(1, 1050, 21), L(-1, 60, 21)], SIN_RECARGO)), [0, 990, 207.9, 0, 1197.9]);
  });
});

describe('RN-20 (en el cálculo) · Cantidades negativas', function () {
  it('ejemplo del documento: −5 × 10,00 al 21 % → base −50,00, IVA −10,50, total −60,50', function () {
    assert.deepEqual(resumen(c.calcularFactura([L(-5, 10, 21)], SIN_RECARGO)), [0, -50, -10.5, 0, -60.5]);
  });
});

describe('RN-36 · Prorrateo comercial de la baja: cuota / 30 × días, máximo 30', function () {
  it('ejemplo del documento: 90 € baja 15/03 → 45,00; 30/03 y 31/03 → 90,00; 01/03 → 3,00; 145 € baja 07/03 → 33,83', function () {
    assert.equal(c.calcularProrrateo(90, '2026-03-01', '2026-03-15'), 45);
    assert.equal(c.calcularProrrateo(90, '2026-03-01', '2026-03-30'), 90);
    assert.equal(c.calcularProrrateo(90, '2026-03-01', '2026-03-31'), 90);
    assert.equal(c.calcularProrrateo(90, '2026-03-01', '2026-03-01'), 3);
    assert.equal(c.calcularProrrateo(145, '2026-03-01', '2026-03-07'), 33.83);
  });
  it('tope de 30 días: 29 días → 96,67; 30 → 100; 31 → 100 (cuota 100)', function () {
    assert.equal(c.calcularProrrateo(100, '2026-03-01', '2026-03-29'), 96.67);
    assert.equal(c.calcularProrrateo(100, '2026-03-01', '2026-03-30'), 100);
    assert.equal(c.calcularProrrateo(100, '2026-01-01', '2026-01-31'), 100);
  });
  it('tope inferior: 1 día → 3; 0 días → 0; días negativos → 0', function () {
    assert.equal(c.calcularProrrateo(90, '2026-03-10', '2026-03-10'), 3);
    assert.equal(c.calcularProrrateo(90, '2026-03-10', '2026-03-09'), 0);
    assert.equal(c.calcularProrrateo(90, '2026-03-20', '2026-03-10'), 0);
  });
  it('cuota cero y negativa: 0 → 0; −90 en 15 días → −45', function () {
    assert.equal(c.calcularProrrateo(0, '2026-03-01', '2026-03-15'), 0);
    assert.equal(c.calcularProrrateo(-90, '2026-03-01', '2026-03-15'), -45);
  });
  it('fin de año: diciembre completo (31 días) → cuota entera', function () {
    assert.equal(c.calcularProrrateo(90, '2026-12-01', '2026-12-31'), 90);
  });
});

describe('RN-37 · Prorrateo comercial en febrero y entre meses distintos', function () {
  it('ejemplo del documento: 90 € baja 28/02/2026 → 84,00; 29/02/2028 → 87,00; del 20/01 al 05/02 → 0,00', function () {
    assert.equal(c.calcularProrrateo(90, '2026-02-01', '2026-02-28'), 84);
    assert.equal(c.calcularProrrateo(90, '2028-02-01', '2028-02-29'), 87);
    assert.equal(c.calcularProrrateo(90, '2026-01-20', '2026-02-05'), 0);
  });
  it('alta a mitad de mes de la semilla: 145 € del 15/01/2023 al 31/01/2023 → 82,17', function () {
    assert.equal(c.calcularProrrateo(145, '2023-01-15', '2023-01-31'), 82.17);
  });
});

describe('RN-41 (en el cálculo) · Una cuota pasa por el cálculo normal', function () {
  it('ejemplo del documento: 45,00 al 21 % → IVA 9,45, total 54,45; cuota 1.200 → precio 1.176, total 1.422,96', function () {
    assert.deepEqual(resumen(c.calcularFactura([L(1, 45, 21)], SIN_RECARGO)), [0, 45, 9.45, 0, 54.45]);
    var f = c.calcularFactura([L(1, 1200, 21)], SIN_RECARGO);
    assert.equal(f.lineas[0].precio, 1176);
    assert.deepEqual(resumen(f), [2, 1176, 246.96, 0, 1422.96]);
  });
});
