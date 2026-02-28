import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

app.use(express.static(join(process.cwd(), 'public')));

server.listen(port, () => {
  console.log(`Proxy is running on port ${port}`);
});
