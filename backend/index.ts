import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { PORT, ORIGIN_URL } from './config/env.js';

import router from './routes/index.js';

const corsOptions = {
    origin: ORIGIN_URL,
}

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(router);

const server = createServer(app);
const io = new SocketIOServer(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});