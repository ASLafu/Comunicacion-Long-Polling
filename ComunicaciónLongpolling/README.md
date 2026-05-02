# Demo de Long Polling con Node.js y Express

## Archivos incluidos

- `server.js`: servidor Express con dos endpoints:
  - `GET /poll` para long polling
  - `GET /poll-normal` para polling normal
  - `POST /send` para enviar mensajes
- `public/client-long-polling.html`: cliente de long polling
- `public/client-polling-normal.html`: cliente de polling clásico
- `package.json`: dependencias y script de arranque

## Instalación

```bash
npm install
npm start
```

## Uso

Abre en el navegador:

- `http://localhost:3000/client-long-polling.html`
- `http://localhost:3000/client-polling-normal.html`

## Idea básica

### Polling normal
El navegador pregunta al servidor cada cierto intervalo aunque no haya novedades.

### Long polling
El navegador hace una petición y el servidor la mantiene abierta hasta que haya datos o hasta que expire el timeout.
