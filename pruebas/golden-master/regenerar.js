// regenerar.js - reescribe master-ciclo-factura.json con la salida del código ACTUAL.
//
// USO:  node pruebas/golden-master/regenerar.js --decision "<referencia a la decisión escrita>"
//
// Solo debe usarse cuando un cambio de comportamiento está autorizado por una decisión de
// negocio documentada (quién, cuándo, qué; constitución, Principio I y «Decisiones del
// negocio»). Sin --decision se niega a escribir. La referencia queda anotada en
// pruebas/golden-master/HISTORIAL.md para que el cambio del master sea trazable.

'use strict';

var fs = require('node:fs');
var path = require('node:path');
var gm = require('./generar');

var MASTER = path.join(__dirname, 'master-ciclo-factura.json');
var HISTORIAL = path.join(__dirname, 'HISTORIAL.md');

var i = process.argv.indexOf('--decision');
var decision = i >= 0 ? (process.argv[i + 1] || '').trim() : '';
var primeraVez = !fs.existsSync(MASTER);

if (!decision) {
  console.error('Falta --decision "<referencia a la decisión de negocio escrita>". No se escribe nada.');
  console.error('Lee pruebas/golden-master/LEEME.md antes de regenerar el master.');
  process.exit(2);
}

gm.generar().then(function (salida) {
  var texto = gm.serializar(salida);
  if (texto.indexOf('CLAVE;') >= 0) {
    console.error('El master contiene la línea de clave de la gestoría: se aborta (no debe copiarse).');
    process.exit(3);
  }
  var anterior = primeraVez ? null : fs.readFileSync(MASTER, 'utf8');
  if (anterior === texto) {
    console.log('El master ya coincide con la salida actual. No se escribe nada.');
    return;
  }
  fs.writeFileSync(MASTER, texto, 'utf8');
  var hoy = new Date().toISOString().slice(0, 10);
  if (!fs.existsSync(HISTORIAL)) {
    fs.writeFileSync(HISTORIAL, '# Historial de regeneraciones del golden master\n\n| Fecha | Decisión que lo autoriza | Casos |\n|---|---|---|\n', 'utf8');
  }
  fs.appendFileSync(HISTORIAL, '| ' + hoy + ' | ' + decision.replace(/\|/g, '/') + ' | ' + Object.keys(salida.casos).length + ' |\n', 'utf8');
  console.log((primeraVez ? 'Master creado' : 'Master regenerado') + ': ' + path.relative(process.cwd(), MASTER));
});
