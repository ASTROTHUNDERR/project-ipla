import sequelize from '../config/db';
import { User, AuthProvider, AuthHold } from './User';
import { Role, UserRole } from './Role';
import PasswordReset from './PasswordReset';

User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', onDelete: 'CASCADE' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', onDelete: 'CASCADE' });

User.hasOne(PasswordReset, { foreignKey: 'user_id', onDelete: 'CASCADE' });
PasswordReset.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

User.hasOne(AuthProvider, { foreignKey: 'user_id', onDelete: 'CASCADE' });
AuthProvider.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

async function syncModels() {
    try {
        await sequelize.sync();
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Error syncing the database:', error);
        throw error;
    }
};

export { 
    sequelize, syncModels,
    User, AuthProvider, AuthHold,
    Role, UserRole,
    PasswordReset
};