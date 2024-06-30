import express from 'express';
import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;

//This returns an instance of an HTTP server (app.listen)
const expressServer = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// Socket.io needs to work with an HTTP server because it operates over WS, a protocol that starts as an HTTP request and then upgrades to a WebSocket connection.

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"],
    },
});

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    socket.on('message', data => {
        console.log(data);
        io.emit('message',`${socket.id.substring(0,5)} says: ${data}`);
    })
});





