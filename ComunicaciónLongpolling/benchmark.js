// ============================================================
//  Benchmark: 10.000 peticiones Long Polling
//  CIS 2026
//
//  Envía 10.000 mensajes POST al servidor y mide:
//    - Tiempo total
//    - Mensajes por segundo
//    - Tiempo medio por petición
// ============================================================
'use strict';

const BASE = 'http://localhost:4001';
const TOTAL = 10000;

async function postMensaje(i) {
  const res = await fetch(BASE + '/mensaje', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto: `Mensaje #${i}` }),
  });
  return res.json();
}

async function benchmark() {
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('  Benchmark: 10.000 peticiones Long Polling');
  console.log('══════════════════════════════════════════════════════');
  console.log('');

  // ── Resetear servidor ──────────────────────────────────────
  await fetch(BASE + '/reset', { method: 'POST' });
  console.log('  Servidor reseteado. Comenzando...');
  console.log('');

  // ── Enviar 10.000 POST ─────────────────────────────────────
  const inicio = performance.now();
  let completados = 0;
  let errores = 0;

  // Enviar en lotes de 100 para no saturar
  const LOTE = 100;
  for (let lote = 0; lote < TOTAL; lote += LOTE) {
    const promesas = [];
    for (let i = lote; i < lote + LOTE && i < TOTAL; i++) {
      promesas.push(
        postMensaje(i + 1)
          .then(() => { completados++; })
          .catch(() => { errores++; })
      );
    }
    await Promise.all(promesas);

    // Progreso cada 1000
    if ((lote + LOTE) % 1000 === 0 || lote + LOTE >= TOTAL) {
      const pct = Math.min(100, Math.round(((lote + LOTE) / TOTAL) * 100));
      const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
      process.stdout.write(`\r  [${bar}] ${pct}%  (${completados.toLocaleString()} enviados)`);
    }
  }

  const fin = performance.now();
  const duracion = (fin - inicio) / 1000; // segundos
  const porSegundo = Math.round(completados / duracion);
  const mediaPorPeticion = ((fin - inicio) / completados).toFixed(3);

  console.log('');
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('  RESULTADOS');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Total enviados:       ${completados.toLocaleString()}`);
  console.log(`  Errores:              ${errores}`);
  console.log(`  Tiempo total:         ${duracion.toFixed(2)} s`);
  console.log(`  Mensajes/segundo:     ${porSegundo.toLocaleString()}`);
  console.log(`  Media por petición:   ${mediaPorPeticion} ms`);
  console.log('══════════════════════════════════════════════════════');
  console.log('');
}

benchmark().catch(err => {
  console.error('Error en el benchmark:', err.message);
  process.exit(1);
});
