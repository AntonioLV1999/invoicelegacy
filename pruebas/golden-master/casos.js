// casos.js - juego FIJO de entradas del golden master del ciclo de vida de una factura
// (flujo-factura.md: camino A, alta manual, y camino C, rectificación). El camino B (remesa)
// tiene su propia batería en pruebas/caracterizacion/07-remesa.test.js.
//
// NO MODIFICAR estos casos sin regenerar el master siguiendo pruebas/golden-master/LEEME.md.
// Cada caso parte de la semilla de db.js (pruebas/ayudas/semilla.js), con el reloj fijado al
// 16/11/2026 10:00 (Europe/Madrid), salvo los cambios que indique `cambiosClientes`.

'use strict';

module.exports = [
  {
    id: 'GM-01',
    titulo: 'Líneas de FA-2026-000101 (semilla) para un cliente sin recargo',
    ejercita: ['RN-01', 'RN-02', 'RN-03', 'RN-06', 'RN-24', 'ANO-013'],
    accion: 'alta',
    body: { cliente_id: '1', fecha: '2026-01-31', obs: 'Remesa enero', desc: ['Alquiler máquina de café Futurmat F3 (enero)', 'Café en grano natural 1kg', 'Azúcar blanquilla 10kg', 'Vaso caña 20cl (caja 72)'], cant: ['1', '2', '1', '0,44'], precio: ['90,00', '11,95', '9,80', '21,60'], iva: ['21', '10', '10', '21'] }
  },
  {
    id: 'GM-02',
    titulo: 'Ferretería en recargo de equivalencia, coma decimal y tipo de IVA antiguo (18 %)',
    ejercita: ['RN-07', 'RN-08', 'RN-09', 'RN-19', 'RN-21'],
    accion: 'alta',
    body: { cliente_id: '2', fecha: '2026-11-16', desc: ['Desengrasante cocinas 10L', 'Portes y manipulación', 'Regularización ejercicio antiguo'], cant: ['4', '1,5', '1'], precio: ['18,50', '2.5', '100'], iva: ['21', '21', '18'] }
  },
  {
    id: 'GM-03',
    titulo: 'Base de 1.000,00 justos (sin descuento), cliente a 60 días, fecha de fin de año',
    ejercita: ['RN-11', 'RN-24', 'ANO-023'],
    accion: 'alta',
    body: { cliente_id: '5', fecha: '2026-12-31', desc: ['Plato llano hostelería 25cm (caja 12)'], cant: ['1'], precio: ['1000'], iva: ['21'] }
  },
  {
    id: 'GM-04',
    titulo: 'Base de 1.000,01 (salto del 2 %) con observaciones, a 60 días desde el 28 de febrero',
    ejercita: ['RN-11', 'RN-13', 'RN-16', 'ANO-061', 'ANO-024'],
    accion: 'alta',
    body: { cliente_id: '3', fecha: '2026-02-28', obs: 'Pedido temporada', desc: ['Pedido'], cant: ['1'], precio: ['1000,01'], iva: ['21'] }
  },
  {
    id: 'GM-05',
    titulo: 'Tramo del 5 % con tres tipos de IVA para una panadería en recargo, fecha en año bisiesto',
    ejercita: ['RN-11', 'RN-14', 'RN-15', 'RN-08', 'ANO-062', 'ANO-066'],
    accion: 'alta',
    body: { cliente_id: '4', fecha: '2028-02-28', desc: ['Plato llano hostelería 25cm (caja 12)', 'Aceite de oliva virgen extra 5L', 'Café en grano natural 1kg'], cant: ['100', '80', '10'], precio: ['28,90', '27,45', '11,95'], iva: ['21', '4', '10'] }
  },
  {
    id: 'GM-06',
    titulo: 'Líneas de FA-2026-000103: la base bruta pasa a 1.000,02 por el redondeo de una línea',
    ejercita: ['RN-12', 'RN-14', 'ANO-013', 'ANO-062'],
    accion: 'alta',
    body: { cliente_id: '5', fecha: '2026-02-20', obs: 'Pedido apertura temporada', desc: ['Plato llano hostelería 25cm (caja 12)', 'Vaso caña 20cl (caja 72)', 'Desengrasante cocinas 10L', 'Portes y manipulación'], cant: ['20', '15', '5', '0,92'], precio: ['28,90', '21,60', '18,50', '6,00'], iva: ['21', '21', '21', '21'] }
  },
  {
    id: 'GM-07',
    titulo: 'Abono metido como líneas negativas en una FA (mitades negativas hacia cero)',
    ejercita: ['RN-05', 'RN-20', 'ANO-059', 'ANO-071'],
    accion: 'alta',
    body: { cliente_id: '1', fecha: '2026-03-31', obs: 'Abono', desc: ['Portes', 'Azúcar'], cant: ['-1', '-1'], precio: ['2,50', '1,25'], iva: ['21', '10'] }
  },
  {
    id: 'GM-08',
    titulo: 'Formulario con trampas: punto de miles, fila sin descripción con precio y tipo 5 % para cliente en recargo',
    ejercita: ['RN-17', 'RN-19', 'RN-10', 'ANO-032', 'ANO-064', 'ANO-040'],
    accion: 'alta',
    body: { cliente_id: '2', fecha: '2026-11-16', desc: ['Aceite de oliva virgen extra 5L', '', 'Servicio especial'], cant: ['1', '1', '2'], precio: ['1.234,50', '50', '10'], iva: ['4', '21', '5'] }
  },
  {
    id: 'GM-09',
    titulo: 'Precio y fecha vacíos (NaN en importes; fecha de hoy)',
    ejercita: ['RN-19', 'RN-22', 'RN-52', 'ANO-003'],
    accion: 'alta',
    body: { cliente_id: '6', fecha: '', desc: ['Café en grano natural 1kg'], cant: ['1'], precio: [''], iva: ['10'] }
  },
  {
    id: 'GM-10',
    titulo: 'Cliente al contado (dias_pago 0) con marca de recargo 2 y precios con coma flotante',
    ejercita: ['RN-07', 'RN-05', 'ANO-041', 'ANO-069', 'ANO-025'],
    accion: 'alta',
    cambiosClientes: { 1: { dias_pago: 0, recargo_equivalencia: 2 } },
    body: { cliente_id: '1', fecha: '2026-11-16', desc: ['Tornillería', 'Bolsas'], cant: ['3', '1'], precio: ['1,005', '1,115'], iva: ['21', '10'] }
  },
  {
    id: 'GM-11',
    titulo: 'Rectificación de FA-2026-000105 (cabecera que no cuadra con sus líneas), con motivo',
    ejercita: ['RN-33', 'RN-34', 'RN-35', 'ANO-013', 'ANO-075'],
    accion: 'rectificar',
    id_factura: '5',
    body: { motivo: 'Error en precios' }
  },
  {
    id: 'GM-12',
    titulo: 'Rectificación de FA-2026-000102 (cobrada, con recargo), sin motivo',
    ejercita: ['RN-31', 'RN-34', 'RN-35', 'ANO-006', 'ANO-034', 'ANO-038'],
    accion: 'rectificar',
    id_factura: '2',
    body: {}
  }
];
