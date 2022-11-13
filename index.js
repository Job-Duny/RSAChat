import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server as SocketServer} from "socket.io";
import morgan from "morgan";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const server = createServer(app);
const io = new SocketServer(server);


app.use(morgan("dev"));

app.use(express.static(join(__dirname, "cliente")));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    console.log('http://localhost:3000');
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'cliente/index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.broadcast.emit("user-connected", "user connected");

    socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', "an user disconnected");
    })

    socket.on('chat-message', (message) => {
    socket.broadcast.emit('chat-message', message);
    });

    socket.on('typing', (message) => {
    socket.broadcast.emit('typing', message);
    });

});

