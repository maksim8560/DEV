const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let listeners = new Set(); 

server.on('connection', (socket) => {
    let isPlaying = false;

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'play' && !isPlaying) {
                isPlaying = true;
                listeners.add(socket);
                broadcast({ type: 'count', count: listeners.size });
            } else if (data.type === 'pause' && isPlaying) {
                isPlaying = false;
                listeners.delete(socket);
                broadcast({ type: 'count', count: listeners.size });
            }
        } catch (e) {}
    });

    socket.on('close', () => {
        if (isPlaying) {
            listeners.delete(socket);
            broadcast({ type: 'count', count: listeners.size });
        }
    });


    socket.send(JSON.stringify({ type: 'count', count: listeners.size }));
});

function broadcast(data) {
    const message = JSON.stringify(data);
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log('WebSocket сервер слушателей запущен на ws://localhost:8080');
