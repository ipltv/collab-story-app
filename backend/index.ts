import type { Server as HttpServer } from 'http';
import type { Server as SocketIOServerType } from 'socket.io';

const { createServer, Server } = require('node:http');
const { PORT } = require('./config/env');
const express = require('express');
const { Server: SocketIOServer } = require('socket.io');


const app = express();
const server: HttpServer = createServer(app);
const io: SocketIOServerType = new SocketIOServer(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});