const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');

const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

let clients = [];
let messages = [];

wss.on('connection', (ws) => {
    clients.push(ws);

    ws.send(JSON.stringify({ type: 'initialMessages', data: messages }));

    const joinMessage = { name: 'System', text: 'A new user has joined the chat', timestamp: new Date().toLocaleString() };
    messages.push(joinMessage);
    broadcast(JSON.stringify(joinMessage));

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        parsedMessage.timestamp = new Date().toLocaleString();
        messages.push(parsedMessage);
        broadcast(JSON.stringify(parsedMessage));
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

app.get('/', (req, res) => {
    res.send('WebSocket server is running');
});

const PORT = process.env.PORT || 443;

const getLocalIPs = () => {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let interfaceName in interfaces) {
        for (let iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses;
};

httpServer.listen(PORT, () => {
    const addresses = getLocalIPs();
    console.log(`Server is listening on port ${PORT}`);
    addresses.forEach(address => {
        console.log(`Server IP: ${address}`);
    });
});
