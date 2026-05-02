const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let mensajes = [];
let clientesEsperando = [];

// LONG POLLING
// Si hay mensajes pendientes, responde inmediatamente.
// Si no, deja la petición abierta hasta 30 segundos.
app.get("/poll", (req, res) => {
  if (mensajes.length > 0) {
    return res.json({
      ok: true,
      modo: "long-polling",
      mensajes: mensajes.splice(0, mensajes.length)
    });
  }

  const timeout = setTimeout(() => {
    clientesEsperando = clientesEsperando.filter((c) => c.res !== res);
    res.json({
      ok: true,
      modo: "long-polling",
      mensajes: []
    });
  }, 30000);

  clientesEsperando.push({ res, timeout });

  req.on("close", () => {
    clientesEsperando = clientesEsperando.filter((c) => c.res !== res);
    clearTimeout(timeout);
  });
});

// POLLING NORMAL
// Responde siempre al momento, haya o no mensajes.
app.get("/poll-normal", (req, res) => {
  res.json({
    ok: true,
    modo: "polling-normal",
    mensajes: mensajes.splice(0, mensajes.length)
  });
});

// Enviar mensaje
app.post("/send", (req, res) => {
  const { texto } = req.body;

  if (!texto || typeof texto !== "string") {
    return res.status(400).json({
      ok: false,
      error: "Debes enviar un campo 'texto' de tipo string"
    });
  }

  const nuevoMensaje = {
    texto,
    fecha: new Date().toISOString()
  };

  if (clientesEsperando.length > 0) {
    clientesEsperando.forEach((cliente) => {
      clearTimeout(cliente.timeout);
      cliente.res.json({
        ok: true,
        modo: "long-polling",
        mensajes: [nuevoMensaje]
      });
    });
    clientesEsperando = [];
  } else {
    mensajes.push(nuevoMensaje);
  }

  res.json({
    ok: true,
    enviado: nuevoMensaje
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
