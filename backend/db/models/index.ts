import sequelize from '../../config/db';
import { User, AuthProvider, AuthProviderHold, TwoFactorAuthHold, TwoFactorAuthenticator, DeletedUser } from './User';
import { Role, UserRole } from './Role';
import PasswordReset from './Temporaries/passwordReset';
import EmailChangeVerification from './Temporaries/emailChangeVerification';

import { UserProfile, UserProfileSocial } from './UserProfile';

User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', onDelete: 'CASCADE' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', onDelete: 'CASCADE' });

User.hasOne(PasswordReset, { foreignKey: 'user_id', onDelete: 'CASCADE' });
PasswordReset.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

User.hasOne(AuthProvider, { foreignKey: 'user_id', onDelete: 'CASCADE' });
AuthProvider.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

User.hasOne(TwoFactorAuthHold, { foreignKey: 'user_id', onDelete: 'CASCADE' });
TwoFactorAuthHold.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

User.hasOne(TwoFactorAuthenticator, { foreignKey: 'user_id', onDelete: 'CASCADE' });
TwoFactorAuthenticator.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

User.hasOne(DeletedUser, { foreignKey: 'user_id', onDelete: 'CASCADE' });
DeletedUser.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

User.hasOne(EmailChangeVerification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
EmailChangeVerification.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

User.hasOne(UserProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

UserProfile.hasMany(UserProfileSocial, { foreignKey: 'user_profile_id', onDelete: 'CASCADE', as: 'Socials' });
UserProfileSocial.belongsTo(UserProfile, { foreignKey: 'user_profile_id', onDelete: 'CASCADE' });

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
    User, AuthProvider, AuthProviderHold, 
    UserProfile, UserProfileSocial,
    DeletedUser,
    TwoFactorAuthHold, TwoFactorAuthenticator,
    Role, UserRole,
    PasswordReset,
    EmailChangeVerification,
};