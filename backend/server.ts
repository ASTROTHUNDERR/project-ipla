import http from 'http';
import express from 'express';
import cors from 'cors';

import { syncModels } from './models';
import corsOptions from './config/corsOptions';
import authRouter from './routes/authRoutes';

const port = 3011;
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors(corsOptions));

app.use('/api/auth', authRouter);


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