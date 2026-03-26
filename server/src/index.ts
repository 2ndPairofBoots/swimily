import 'dotenv/config';
import { createServer } from './server';

const { app, server } = createServer();

server.listen(process.env.PORT ? Number(process.env.PORT) : 3000, () => {
  // eslint-disable-next-line no-console
  console.log(`swimily-server listening on :${process.env.PORT ? process.env.PORT : 3000}`);
});

export { app };

