import bcrypt from 'bcrypt';
import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import { Role } from '../Role';
import TwoFactorAuthenticator from './twoFactorAuthenticator';
import { UserData } from '../../../utils/types';

class User extends Model {
    declare id: number;
    declare first_name: string;
    declare last_name: string;
    declare native_name: string;
    declare username: string;
    declare email: string;
    declare password: string;
    declare birthDate: Date;
    declare country: string;
    declare type: 'player' | 'manager' | 'team_owner';
    declare is_deleted: boolean;
    declare Roles: typeof Role[];

    static async getUserData(userId: number): Promise<UserData | null> {
        try {
            const user = await User.findByPk(userId, {
                include: Role
            });
            if (user) {
                const has2FA = await TwoFactorAuthenticator.findOne({
                    where: { user_id: user.id }
                });

                const userData = {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    native_name: user.native_name,
                    username: user.username,
                    email: user.email,
                    birthDate: user.birthDate,
                    country: user.country,
                    roles: user.Roles.map(role => ({
                        name: role.name,
                    })),
                    tfa_enabled: has2FA ? true : false,
                    is_deleted: user.is_deleted
                }
                
                return userData
            } else {    
                return null;
            }

        } catch (error) {
            return null;
        }
    }

    static async isAdmin(userId: number) {
        try {
            const user = await User.findByPk(userId, {
                include: Role
            });
            if (user) {
                return user.Roles.some(role => role.name === 'admin') === true;
            } else {    
                return null;
            }

        } catch (error) {
            return null;
        }
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        native_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                min: 4,
                max: 14
            },
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                min: 8
            }
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['player', 'manager', 'team_owner']
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        sequelize,
        tableName: 'users',
        hooks: {
            beforeCreate: async (user: User) => {
                if (user.password) {
                    const hashedPassword = await bcrypt.hash(user.password, 11);
                    user.password = hashedPassword;
                }
            }
        }
    }
);

export default User;