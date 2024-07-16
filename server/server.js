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

    // Send initial messages to the new client
    ws.send(JSON.stringify({ type: 'initialMessages', data: messages }));

    // Notify other clients that a new user has joined
    const username = getRandomUsername();
    const joinMessage = { name: username, text: 'has joined the chat', timestamp: new Date().toLocaleString() };
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

function getRandomUsername() {
    const adjectives = ['Cool', 'Awesome', 'Fantastic', 'Epic'];
    const nouns = ['Dude', 'Ninja', 'Warrior', 'Wizard'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // Generate random two-digit number
    return `${randomAdj}${randomNoun}${randomNumber}`;
}

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
