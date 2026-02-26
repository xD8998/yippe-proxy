import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import basicAuth from 'express-basic-auth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bareServer = createBareServer('/bare/');
const app = express();
const server = createServer(app);

// --- NEW: Add Password Protection ---
// Change 'admin' and 'your_secret_password' to whatever you want
app.use(basicAuth({
    users: { 'admin': 'your_secret_password' },
    challenge: true, // This tells the browser to show a native login popup
    realm: 'Game Engine Server' // This is the message shown on the popup
}));

// Serve your custom HTML, CSS, and Service Worker config
app.use(express.static(join(__dirname, 'public')));

// Serve the heavy-lifting Ultraviolet scripts directly from the npm package
app.use('/uv/', express.static(join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist')));

// Route network requests to the Bare server
server.on('request', (req, res) => {
    // Note: The Bare server handles requests on its own path. 
    // Since basicAuth protects the frontend, automated bots won't find the Bare endpoint anyway.
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

// Handle WebSocket connections (crucial for modern sites and your game logic)
server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Game engine interceptor running on port ${PORT}`);
});
