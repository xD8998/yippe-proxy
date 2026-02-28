import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bareServer = createBareServer('/bare/');
const app = express();
const server = createServer(app);

// 1. Serve your own public files (index.html, uv.config.js, sw.js)
app.use(express.static(join(__dirname, 'public')));

// 2. FIXED: Explicitly point to the Ultraviolet dist folder
// This replaces the broken 'uvPath' import
app.use('/uv/', express.static(join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist')));

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
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy active on port ${PORT}`);
});
