import http from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import passport from 'passport';
import './config/passport';

import config from './config/environment';
import logger from './config/logger';

import { sanitizeMiddleware } from './middlewares/authMiddleware';

import { syncModels } from './db/models';
import corsOptions from './config/corsOptions';
import { authRouter, passwordRouter, userRouter, userProfileRouter } from './routes';

const port = 3011;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.allowedOrigin,
        methods: ['GET', 'POST'],
    },
});

export { io };

app.use(express.json());
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(sanitizeMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/pass', passwordRouter);
app.use('/api/user', userRouter);
app.use('/api/user-profile', userProfileRouter);

io.on('connection', (socket: Socket) => {
    logger.log('info', `A user connected: ${socket.id}`);

    socket.use((packet, next) => {
        logger.log('info', `Received packet: ${packet}`);
        next();
    });

    socket.on('disconnect', () => {
        logger.log('info', `A user disconnected: ${socket.id}`);
    });
});

async function startServer() {
    try {
        await syncModels();
        server.listen(port, '0.0.0.0', () => {
            console.log('Server is running on port ', port);
        });
    } catch (error) {
        console.error('Failed to sync database:', error);
        process.exit(1);
    }
}

startServer();