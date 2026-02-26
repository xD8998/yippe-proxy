import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bareServer = createBareServer('/bare/');
const app = express();
const server = createServer(app);

// Serve your custom HTML, CSS, and Service Worker config
app.use(express.static(join(__dirname, 'public')));

// Serve the heavy-lifting Ultraviolet scripts directly from the npm package
app.use('/uv/', express.static(join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist')));

// Route network requests to the Bare server
server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

// Handle WebSocket connections (crucial for modern sites and games)
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
