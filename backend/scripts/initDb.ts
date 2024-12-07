import { sequelize } from '../db/models';

async function initDb() {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Error syncing the database:', error);
        throw error;
    }
};

initDb();