import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bareServer = createBareServer('/bare/');
const app = express();
const server = createServer(app);

// 1. Serve the main UI and your custom config files
app.use(express.static(join(__dirname, 'public')));

// 2. Serve the Ultraviolet engine files from the folder created by postinstall
app.use('/uv/dist/', express.static(join(__dirname, 'public/uv/dist')));

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
