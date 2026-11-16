// doble-bd.js - doble de prueba de la conexión de db.js (objeto sqlite3.Database).
//
// POR QUÉ EXISTE: no hay node_modules (sqlite3 no está instalado) y la constitución
// prohíbe tocar package.json/package-lock.json y el código fuente. Para poder caracterizar
// desde fuera la lógica JavaScript de lib/numeracion.js, routes/*.js y
// scripts/remesa_mensual.js, este doble sustituye a db.js en la caché de require.
//
// QUÉ NO CARACTERIZA: el SQL en sí (filtros WHERE, SUM, ORDER BY, conversión de tipos de
// SQLite). Para eso hace falta sqlite3 real; ver pruebas/LEEME.md, «Cobertura pendiente».
// Lo que sí se congela es el texto SQL y los parámetros exactos que el código envía.
//
// Solo entiende las sentencias que el código actual envía. Cualquier otra lanza un error,
// para que un cambio en el SQL de producción no pase desapercibido.

'use strict';

function normalizar(sql) {
  return sql.replace(/\s+/g, ' ').trim();
}

function columnasDeInsert(sql) {
  var m = /INSERT INTO \w+ \(([^)]*)\)/.exec(sql);
  return m[1].split(',').map(function (c) { return c.trim(); });
}

function crearDobleBD() {
  var estado;
  var llamadas;
  var siguienteId;

  var db = {};

  db.reiniciar = function (inicial) {
    inicial = inicial || {};
    estado = {
      clientes: (inicial.clientes || []).map(copiar),
      contratos: (inicial.contratos || []).map(copiar),
      facturas: (inicial.facturas || []).map(copiar),
      lineas: (inicial.lineas || []).map(copiar),
      contadores: (inicial.contadores || []).map(copiar),
      articulos: (inicial.articulos || []).map(copiar),
      // filas que devolverá cualquier SELECT de informes (las sumas las haría SQLite)
      filasInforme: (inicial.filasInforme || []).map(copiar),
      // { facturas: true } o { lineas: true } para simular un fallo al grabar
      fallarInsert: inicial.fallarInsert || null
    };
    siguienteId = {};
    ['facturas', 'lineas', 'clientes', 'contratos', 'articulos'].forEach(function (t) {
      siguienteId[t] = maxId(estado[t]) + 1;
    });
    llamadas = [];
  };

  db.estado = function () { return estado; };
  db.llamadas = function () { return llamadas; };

  function copiar(o) { return Object.assign({}, o); }
  function maxId(filas) {
    return filas.reduce(function (m, f) { return Math.max(m, f.id || 0); }, 0);
  }

  function despachar(metodo, sql, params, cb) {
    if (typeof params === 'function') { cb = params; params = []; }
    params = params || [];
    var s = normalizar(sql);
    llamadas.push({ metodo: metodo, sql: s, params: params.slice() });
    var res;
    try {
      res = resolver(metodo, s, params);
    } catch (e) {
      res = { err: e };
    }
    // sqlite3 llama a los callbacks de forma asíncrona y con `this` = sentencia
    setImmediate(function () {
      if (!cb) return;
      cb.call({ lastID: res.lastID, changes: res.changes || 0 }, res.err || null, res.valor);
    });
  }

  function resolver(metodo, s, p) {
    var m, fila;

    // ---- contadores (lib/numeracion.js) ----
    if (s === 'SELECT ultimo FROM contadores WHERE serie = ? AND anyo = ?') {
      fila = estado.contadores.find(function (c) { return c.serie === p[0] && c.anyo === p[1]; });
      return { valor: fila ? { ultimo: fila.ultimo } : undefined };
    }
    if (s === 'INSERT INTO contadores (serie, anyo, ultimo) VALUES (?,?,0)') {
      if (estado.contadores.some(function (c) { return c.serie === p[0] && c.anyo === p[1]; })) {
        throw new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: contadores.serie, contadores.anyo');
      }
      estado.contadores.push({ serie: p[0], anyo: p[1], ultimo: 0 });
      return { changes: 1 };
    }
    if (s === 'UPDATE contadores SET ultimo = ? WHERE serie = ? AND anyo = ?') {
      fila = estado.contadores.find(function (c) { return c.serie === p[1] && c.anyo === p[2]; });
      if (fila) fila.ultimo = p[0];
      return { changes: fila ? 1 : 0 };
    }

    // ---- inserts genéricos (facturas, lineas, clientes, contratos, articulos) ----
    if ((m = /^INSERT INTO (facturas|lineas|clientes|contratos|articulos) \(/.exec(s))) {
      var tabla = m[1];
      if (estado.fallarInsert && estado.fallarInsert[tabla]) {
        throw new Error('SQLITE_ERROR: fallo simulado al grabar en ' + tabla);
      }
      var cols = columnasDeInsert(s);
      fila = { id: siguienteId[tabla]++ };
      cols.forEach(function (c, i) { fila[c] = p[i]; });
      estado[tabla].push(fila);
      return { lastID: fila.id, changes: 1 };
    }

    // ---- clientes ----
    if (s === 'SELECT * FROM clientes WHERE id = ?') {
      return { valor: estado.clientes.find(function (c) { return c.id === p[0]; }) };
    }

    // ---- detalle de factura / rectificación ----
    if (/^SELECT f\.\*, c\.nombre AS cliente.* FROM facturas f JOIN clientes c ON c\.id = f\.cliente_id WHERE f\.id = \?$/.test(s)) {
      fila = estado.facturas.find(function (f) { return String(f.id) === String(p[0]); });
      if (!fila) return { valor: undefined };
      var cli = estado.clientes.find(function (c) { return c.id === fila.cliente_id; }) || {};
      return { valor: Object.assign({}, fila, { cliente: cli.nombre }) };
    }
    if (/^SELECT \* FROM lineas WHERE factura_id = \?( ORDER BY id)?$/.test(s)) {
      return {
        valor: estado.lineas.filter(function (l) { return String(l.factura_id) === String(p[0]); }).map(copiar)
      };
    }

    // ---- cambios de estado ----
    if (s === "UPDATE facturas SET estado = 'cobrada' WHERE id = ? AND estado = 'emitida'") {
      fila = estado.facturas.find(function (f) { return String(f.id) === String(p[0]) && f.estado === 'emitida'; });
      if (fila) fila.estado = 'cobrada';
      return { changes: fila ? 1 : 0 };
    }
    if (s === "UPDATE facturas SET estado = 'rectificada' WHERE id = ?") {
      fila = estado.facturas.find(function (f) { return String(f.id) === String(p[0]); });
      if (fila) fila.estado = 'rectificada';
      return { changes: fila ? 1 : 0 };
    }

    // ---- contratos ----
    if (s === 'SELECT * FROM contratos WHERE id = ?') {
      return { valor: estado.contratos.find(function (c) { return String(c.id) === String(p[0]); }) };
    }
    if (s === 'UPDATE contratos SET fecha_baja = ? WHERE id = ?') {
      fila = estado.contratos.find(function (c) { return String(c.id) === String(p[1]); });
      if (fila) fila.fecha_baja = p[0];
      return { changes: fila ? 1 : 0 };
    }
    // consulta de la remesa: el doble devuelve los contratos tal cual se le dan
    // (el filtro de fechas lo haría SQLite; aquí se congelan solo los parámetros)
    if (/^SELECT co\.\*, cl\.nombre, cl\.recargo_equivalencia, cl\.dias_pago FROM contratos co JOIN clientes cl/.test(s)) {
      return { valor: estado.contratos.map(copiar) };
    }

    // ---- desplegables del formulario de nueva factura: solo se congela el SQL ----
    if (s === 'SELECT * FROM clientes WHERE activo = 1 ORDER BY nombre' ||
        s === 'SELECT * FROM articulos WHERE activo = 1 ORDER BY referencia') {
      return { valor: [] };
    }

    // ---- informes: devuelve las filas preparadas por el test ----
    if (metodo === 'all' && /^SELECT .* FROM (lineas l JOIN facturas f|facturas f JOIN clientes c)/.test(s)) {
      return { valor: estado.filasInforme.map(copiar) };
    }

    throw new Error('Doble BD: SQL no previsto (' + metodo + '): ' + s);
  }

  db.get = function (sql, params, cb) { despachar('get', sql, params, cb); };
  db.all = function (sql, params, cb) { despachar('all', sql, params, cb); };
  db.run = function (sql, params, cb) { despachar('run', sql, params, cb); };
  db.serialize = function (fn) { fn(); };
  db.inicializar = function (cb) { setImmediate(function () { cb(null); }); };

  db.reiniciar();
  return db;
}

module.exports = { crearDobleBD: crearDobleBD };
