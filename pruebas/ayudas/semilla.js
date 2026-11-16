// semilla.js - transcripción literal de los datos semilla de db.js:93-180.
//
// db.js no se puede cargar sin sqlite3, así que se copian aquí a mano, en el mismo orden
// (los id son los que les daría AUTOINCREMENT). Son datos de referencia del código, no de
// producción (ANO-013, P-05). Si db.js cambia, esta copia debe revisarse.

'use strict';

var clientes = [
  { id: 1, nombre: 'Cafetería La Parada, S.C.', nif: 'J45771102', direccion: 'Av. de la Estación 12', cp: '45200', poblacion: 'Illescas', email: 'laparada@gmail.com', recargo_equivalencia: 0, dias_pago: null, activo: 1 },
  { id: 2, nombre: 'Ferretería El Tornillo', nif: '03488812K', direccion: 'C/ Mayor 4', cp: '45220', poblacion: 'Yeles', email: 'eltornillo4@hotmail.com', recargo_equivalencia: 1, dias_pago: null, activo: 1 },
  { id: 3, nombre: 'Restaurante Casa Ubaldo, S.L.', nif: 'B45610021', direccion: 'Ctra. de Toledo km 3', cp: '45200', poblacion: 'Illescas', email: 'reservas@casaubaldo.es', recargo_equivalencia: 0, dias_pago: 60, activo: 1 },
  { id: 4, nombre: 'Panadería Hnos. Cifuentes', nif: 'E45332218', direccion: 'Pza. del Grano 2', cp: '45223', poblacion: 'Seseña', email: null, recargo_equivalencia: 1, dias_pago: null, activo: 1 },
  { id: 5, nombre: 'Hotel Vega Baja, S.A.', nif: 'A45102939', direccion: 'Av. Castilla-La Mancha 55', cp: '45003', poblacion: 'Toledo', email: 'compras@hotelvegabaja.com', recargo_equivalencia: 0, dias_pago: 60, activo: 1 },
  { id: 6, nombre: 'Bar Nuevo Siglo', nif: '70355910k', direccion: 'C/ Real 31', cp: '45200', poblacion: 'Illescas', email: null, recargo_equivalencia: 0, dias_pago: null, activo: 1 }
];

var contratos = [
  { id: 1, cliente_id: 1, concepto: 'Alquiler máquina de café Futurmat F3', cuota: 90.00, tipo_iva: 21, fecha_alta: '2024-03-01', fecha_baja: null },
  { id: 2, cliente_id: 3, concepto: 'Mantenimiento cámaras frigoríficas', cuota: 145.00, tipo_iva: 21, fecha_alta: '2023-01-15', fecha_baja: null },
  { id: 3, cliente_id: 5, concepto: 'Alquiler lavavasos barra piscina', cuota: 60.00, tipo_iva: 21, fecha_alta: '2025-06-16', fecha_baja: '2025-09-15' },
  { id: 4, cliente_id: 6, concepto: 'Alquiler máquina de café Futurmat F3', cuota: 90.00, tipo_iva: 21, fecha_alta: '2026-02-15', fecha_baja: null }
];

// Líneas de las facturas de la semilla (db.js:127-171): [factura_id, descripcion, cantidad, precio, tipo_iva, base, cuota_iva, cuota_recargo]
var lineasCrudas = [
  [1, 'Alquiler máquina de café Futurmat F3 (enero)', 1, 90.00, 21, 90.00, 18.90, 0],
  [1, 'Café en grano natural 1kg', 2, 11.95, 10, 23.90, 2.39, 0],
  [1, 'Azúcar blanquilla 10kg', 1, 9.80, 10, 9.80, 0.98, 0],
  [1, 'Vaso caña 20cl (caja 72)', 0.44, 21.60, 21, 9.50, 2.00, 0],
  [2, 'Desengrasante cocinas 10L', 4, 18.50, 21, 74.00, 15.54, 3.85],
  [2, 'Plato llano hostelería 25cm (caja 12)', 1, 28.90, 21, 28.90, 6.07, 1.50],
  [2, 'Vaso caña 20cl (caja 72)', 0.5, 21.60, 21, 10.80, 2.27, 0.56],
  [2, 'Portes y manipulación', 0.32, 6.00, 21, 1.90, 0.40, 0.10],
  [3, 'Plato llano hostelería 25cm (caja 12)', 20, 28.90, 21, 578.00, 121.38, 0],
  [3, 'Vaso caña 20cl (caja 72)', 15, 21.60, 21, 324.00, 68.04, 0],
  [3, 'Desengrasante cocinas 10L', 5, 18.50, 21, 92.50, 19.43, 0],
  [3, 'Portes y manipulación', 0.92, 6.00, 21, 5.50, 1.15, 0],
  [4, 'Harina panificable 25kg', 8, 14.20, 4, 113.60, 4.54, 0.57],
  [4, 'Aceite de oliva virgen extra 5L', 1.41, 27.45, 4, 38.70, 1.55, 0.19],
  [5, 'Mantenimiento cámaras frigoríficas (marzo)', 1, 145.00, 21, 145.00, 30.45, 0],
  [5, 'Aceite de oliva virgen extra 5L', 24, 27.45, 4, 658.80, 26.35, 0],
  [5, 'Café en grano natural 1kg', 30, 11.95, 10, 358.50, 35.85, 0],
  [5, 'Plato llano hostelería 25cm (caja 12)', 40, 28.90, 21, 1156.00, 242.76, 0],
  [5, 'Portes y manipulación', 2.87, 6.00, 21, 17.20, 3.61, 0],
  [6, 'Alquiler máquina de café Futurmat F3 (abril)', 1, 90.00, 21, 90.00, 18.90, 0],
  [6, 'Café en grano natural 1kg', 0.97, 11.95, 10, 11.61, 1.16, 0],
  [7, 'Rectificación: Alquiler máquina de café Futurmat F3 (abril)', -1, 90.00, 21, -90.00, -18.90, 0],
  [7, 'Rectificación: Café en grano natural 1kg', -0.97, 11.95, 10, -11.61, -1.16, 0],
  [8, 'Alquiler máquina de café Futurmat F3 (abril)', 1, 90.00, 21, 90.00, 18.90, 0],
  [8, 'Café en grano natural 1kg', 0.97, 11.95, 10, 11.61, 1.16, 0],
  [9, 'Alquiler máquina de café Futurmat F3 (mayo)', 1, 90.00, 21, 90.00, 18.90, 0],
  [9, 'Café en grano natural 1kg', 2, 11.95, 10, 23.90, 2.39, 0],
  [9, 'Vaso caña 20cl (caja 72)', 0.66, 21.60, 21, 14.15, 2.97, 0]
];

var lineas = lineasCrudas.map(function (l, i) {
  return { id: i + 1, factura_id: l[0], descripcion: l[1], cantidad: l[2], precio: l[3], tipo_iva: l[4], base: l[5], cuota_iva: l[6], cuota_recargo: l[7] };
});

// Cabeceras (db.js:126-168): [numero, serie, cliente_id, fecha, vencimiento, base, iva, recargo, total, estado, rectifica_a, observaciones]
var facturasCrudas = [
  ['FA-2026-000101', 'FA', 1, '2026-01-31', '2026-03-02', 133.20, 27.97, 0, 161.17, 'cobrada', null, 'Remesa enero'],
  ['FA-2026-000102', 'FA', 2, '2026-02-06', '2026-03-08', 115.60, 24.28, 6.01, 145.89, 'cobrada', null, null],
  ['FA-2026-000103', 'FA', 5, '2026-02-20', '2026-04-21', 1000.00, 210.00, 0, 1210.00, 'cobrada', null, 'Pedido apertura temporada'],
  ['FA-2026-000104', 'FA', 4, '2026-03-05', '2026-04-04', 152.30, 6.09, 0.76, 159.15, 'cobrada', null, null],
  ['FA-2026-000105', 'FA', 3, '2026-03-31', '2026-05-30', 2287.75, 468.63, 0, 2756.38, 'emitida', null, 'Descuento volumen 2% aplicado'],
  ['FA-2026-000106', 'FA', 6, '2026-04-30', '2026-05-30', 101.61, 20.62, 0, 122.23, 'rectificada', null, 'Remesa abril. ERROR cuota duplicada, ver RE-2026-000001'],
  ['RE-2026-000001', 'RE', 6, '2026-05-06', null, -101.61, -20.62, 0, -122.23, 'emitida', 'FA-2026-000106', 'Rectifica FA-2026-000106 (cuota abril duplicada)'],
  ['FA-2026-000107', 'FA', 6, '2026-05-06', '2026-06-05', 101.61, 20.62, 0, 122.23, 'emitida', null, 'Sustituye a FA-2026-000106'],
  ['FA-2026-000108', 'FA', 1, '2026-05-31', '2026-06-30', 128.05, 26.19, 0, 154.24, 'emitida', null, 'Remesa mayo']
];

var facturas = facturasCrudas.map(function (f, i) {
  return { id: i + 1, numero: f[0], serie: f[1], cliente_id: f[2], fecha: f[3], vencimiento: f[4], base: f[5], iva: f[6], recargo: f[7], total: f[8], estado: f[9], rectifica_a: f[10], observaciones: f[11] };
});

var contadores = [
  { serie: 'FA', anyo: 2026, ultimo: 108 },
  { serie: 'RE', anyo: 2026, ultimo: 1 }
];

// Devuelve una copia profunda para que ningún test contamine a otro.
function semilla() {
  return JSON.parse(JSON.stringify({ clientes: clientes, contratos: contratos, facturas: facturas, lineas: lineas, contadores: contadores }));
}

// Líneas de una factura de la semilla en el formato de entrada de calcularFactura.
function lineasParaCalculo(facturaId) {
  return lineas.filter(function (l) { return l.factura_id === facturaId; }).map(function (l) {
    return { descripcion: l.descripcion, cantidad: l.cantidad, precio: l.precio, tipoIva: l.tipo_iva };
  });
}

module.exports = { semilla: semilla, lineasParaCalculo: lineasParaCalculo };
