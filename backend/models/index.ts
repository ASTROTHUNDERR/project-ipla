import sequelize from '../config/db';
import User from './User';


async function syncModels() {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Error syncing the database:', error);
        throw error;
    }
};

export { 
    sequelize, syncModels,
    User
};