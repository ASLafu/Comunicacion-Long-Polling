// ============================================================
//  Servidor Long Polling – Ejercicio 10.000 peticiones
//  CIS 2026
// ============================================================
'use strict';

const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = 4001;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Almacén ─────────────────────────────────────────────────
const mensajes = [];
let waitingClients = [];

// ── POST /mensaje → publica y despierta a los que esperan ───
app.post('/mensaje', (req, res) => {
  const msg = {
    id: mensajes.length + 1,
    texto: req.body.texto || '',
    timestamp: Date.now(),
  };
  mensajes.push(msg);

  const clients = waitingClients.splice(0);
  clients.forEach(c => {
    clearTimeout(c.timer);
    c.res.json({ ok: true, mensajes: [msg] });
  });

  res.json({ ok: true, mensaje: msg });
});

// ── GET /esperar?desde=ID → Long Polling ────────────────────
app.get('/esperar', (req, res) => {
  const desde = parseInt(req.query.desde) || 0;

  const nuevos = mensajes.filter(m => m.id > desde);
  if (nuevos.length > 0) {
    return res.json({ ok: true, mensajes: nuevos });
  }

  const timer = setTimeout(() => {
    waitingClients = waitingClients.filter(c => c.res !== res);
    res.json({ ok: true, mensajes: [], timeout: true });
  }, 25000);

  waitingClients.push({ res, timer });

  req.on('close', () => {
    clearTimeout(timer);
    waitingClients = waitingClients.filter(c => c.res !== res);
  });
});

// ── POST /reset ─────────────────────────────────────────────
app.post('/reset', (_req, res) => {
  mensajes.length = 0;
  waitingClients.forEach(c => {
    clearTimeout(c.timer);
    c.res.json({ ok: true, mensajes: [], reset: true });
  });
  waitingClients = [];
  res.json({ ok: true });
});

// ── Arrancar ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║   Servidor Long Polling                              ║
║   Puerto: ${PORT}                                       ║
║   Listo para recibir 10.000 peticiones               ║
╚══════════════════════════════════════════════════════╝
  `);
});
