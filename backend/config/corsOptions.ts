import config from './environment';

const corsOptions = {
    origin: (origin: string | undefined, callback:  (err: Error | null, origin?: any) => void) => {
        if (!origin || config.allowedOrigin.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

export default corsOptions;