const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Map();
app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
    const id = uuidv4();
    clients.set(ws, { id, address: ws._socket.remoteAddress });

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'file') {
            clients.forEach((client, clientWs) => {
                if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({
                        type: 'file',
                        fileName: data.fileName,
                        fileContent: data.fileContent,
                        senderId: id
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        broadcastClients();
    });

    broadcastClients();
});

function broadcastClients() {
    const clientList = Array.from(clients.values()).map(client => ({ id: client.id, address: client.address }));
    clients.forEach((client, clientWs) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'clients', clients: clientList }));
        }
    });
}

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
