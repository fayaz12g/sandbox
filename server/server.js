const fs = require('fs');
const https = require('https');
const express = require('express');
const WebSocket = require('ws');
const os = require('os');

const app = express();

const server = https.createServer({
    key: fs.readFileSync('path/to/your/key.pem'),
    cert: fs.readFileSync('path/to/your/cert.pem')
}, app);

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);
    ws.on('message', (message) => {
        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
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
