import { Sequelize } from 'sequelize';
import config from './environment';

const sequelize = new Sequelize(
    config.database.dbName,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'mysql',
        logging: false,
    }
);

export default sequelize;