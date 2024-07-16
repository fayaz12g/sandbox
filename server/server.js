const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const os = require('os');

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

let clients = [];
let messages = [];

wss.on('connection', (ws) => {
    clients.push(ws);

    // Send all previous messages to the new client
    ws.send(JSON.stringify({ type: 'initialMessages', data: messages }));

    // Announce new user
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

app.get('/', (req, res) => {
    res.send('WebSocket server is running');
});

const PORT = process.env.PORT || 8080;

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

server.listen(PORT, () => {
    const addresses = getLocalIPs();
    console.log(`Server is listening on port ${PORT}`);
    addresses.forEach(address => {
        console.log(`Server IP: ${address}`);
    });
});
