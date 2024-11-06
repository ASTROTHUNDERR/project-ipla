import crypto from 'crypto';
import sequelize  from '../../config/db';
import { DataTypes, Model } from 'sequelize';

import User from './User';

class AuthProvider extends Model {
    declare id: number;
    declare user_id: number;
    declare provider: string;
    declare provider_user_id: string;
}

AuthProvider.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            },
            onDelete: 'CASCADE',
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: false
        },
        provider_user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        sequelize,
        tableName: 'auth_providers'
    }
);

class AuthHold extends Model {
    declare id: number;
    declare token: string;
    declare username: string;
    declare email: string;
    declare provider: string;
    declare provider_user_id: string;
}

AuthHold.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: false
        },
        provider_user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        sequelize,
        tableName: 'auth_holds',
        hooks: {
            beforeCreate: async (authHold: AuthHold) => {
                const token = crypto.randomBytes(64).toString('hex')
                authHold.token = token;
            }
        }
    }
)

export { AuthProvider, AuthHold };