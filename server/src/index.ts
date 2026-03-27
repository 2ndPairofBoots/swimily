import 'dotenv/config';
import { createServer } from './server';

const { app, server } = createServer();

const port = Number(process.env.PORT) || 3000;
// Railway/containers need an explicit bind address (not only localhost).
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`swimily-server listening on http://${host}:${port}`);
});

export { app };

