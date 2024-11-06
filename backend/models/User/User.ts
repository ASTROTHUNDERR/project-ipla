import bcrypt from 'bcrypt';
import sequelize  from '../../config/db';
import { DataTypes, Model } from 'sequelize';

import { Role } from '../Role';
import { UserData } from '../../utils/types';

class User extends Model {
    declare id: number;
    declare username: string;
    declare email: string;
    declare password: string;
    declare type: 'player' | 'manager' | 'team_owner';
    declare Roles: typeof Role[];

    static async getUserData(userId: number): Promise<UserData | null> {
        try {
            const user = await User.findByPk(userId, {
                include: Role
            });
            if (user) {
                const userData = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: user.Roles.map(role => ({
                        name: role.name,
                    }))
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
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                min: 8
            }
        },
        type: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['player', 'manager', 'team_owner']
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