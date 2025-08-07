import { createServer } from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';
import router from './routes/index.js';
import { PORT } from './config/env.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(router);

const server = createServer(app);
const io = new SocketIOServer(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});