const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const WebSocket = require('ws');
const os = require('os');
const path = require('path');

const app = express();

// HTTPS configuration
const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'server.cert'))
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

const wss = new WebSocket.Server({ noServer: true });

let clients = [];
let messages = [];

wss.on('connection', (ws) => {
    clients.push(ws);

    ws.send(JSON.stringify({ type: 'initialMessages', data: messages }));

    const joinMessage = { name: 'System', text: 'A new user has joined the chat', timestamp: new Date().toLocaleString() };
    messages.push(joinMessage);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(joinMessage));
        }
    });

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        parsedMessage.timestamp = new Date().toLocaleString();
        messages.push(parsedMessage);

        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(parsedMessage));
            }
        });
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const serverHandler = (server) => {
    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });
};

serverHandler(httpServer);
serverHandler(httpsServer);

app.get('/', (req, res) => {
    res.send('WebSocket server is running');
});

const PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

const getLocalIPs = () => {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let interfaceName in interfaces) {
        for (let interface of interfaces[interfaceName]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                addresses.push(interface.address);
            }
        }
    }
    return addresses;
};

httpServer.listen(PORT, () => {
    const addresses = getLocalIPs();
    console.log(`HTTP Server is listening on port ${PORT}`);
    addresses.forEach(address => {
        console.log(`Server IP: ${address}`);
    });
});

httpsServer.listen(HTTPS_PORT, () => {
    const addresses = getLocalIPs();
    console.log(`HTTPS Server is listening on port ${HTTPS_PORT}`);
    addresses.forEach(address => {
        console.log(`Server IP: ${address}`);
    });
});
