import http from 'http';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import passport from 'passport';

import './config/passport';
import config from './config/environment';
import logger from './config/logger';

import { RateLimit, sanitizeMiddleware } from './middlewares/authMiddleware';
import { isPathSafe } from './utils/authUtils';

import { syncModels } from './db/models';
import corsOptions from './config/corsOptions';
import { authRouter, passwordRouter, userRouter, userProfileRouter } from './routes';

const rateLimit = new RateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again later.');

const port = 3011;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.allowedOrigin,
        methods: ['GET', 'POST']
    },
});
const staticDir = path.resolve(__dirname, 'static');

export { io };

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(sanitizeMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/pass', passwordRouter);
app.use('/api/user', userRouter);
app.use('/api/user-profile', userProfileRouter);

app.use('/static', rateLimit.apply(), (req: Request, res: Response, next: NextFunction) => {
    const requestedPath = req.path.slice(1);
    if (!isPathSafe(staticDir, requestedPath)) {
        res.status(403).send('Forbidden');
    } else {
        next();
    }
}, express.static(staticDir, {
    maxAge: '1d',
    etag: true,
}));

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
};

startServer();