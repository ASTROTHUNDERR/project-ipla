import path from 'path';
import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
        }),
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'combined.log'),
        }),
    ],
});

logger.exceptions.handle(
    new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'exceptions.log') })
);

logger.rejections.handle(
    new winston.transports.File({ filename: path.join(__dirname, 'logs', 'rejections.log') })
);

export default logger;