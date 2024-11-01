import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: path.join(__dirname, '..', '.env')
});

interface Config {
    env: string;
    port: number;
    database: {
        url: string;
        username: string;
        password: string;
        host: string;
        port: number;
        dbName: string;
    };
    jwtSecret: string;
    api: {
        baseUrl: string;
    };
    allowedOrigin: string;
}

const config: Config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3011', 10),
    database: {
        url: process.env.DATABASE_URL || 'mysql://localhost:3306/ipla',
        username: process.env.DB_USERNAME || '',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dbName: process.env.DB_NAME || 'ipla',
    },
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3011/api',
    },
    allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
};

export default config;