import crypto from 'crypto';
import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import User from './user';

class AuthProvider extends Model {
    declare id: number;
    declare user_id: number;
    declare provider: string;
    declare provider_user_id: string;

    static async getData(id: number) {
        try {
            const authProvider = await AuthProvider.findByPk(id);

            if (authProvider) {
                const data = {
                    user_id: authProvider.user_id,
                    provider: authProvider.provider,
                };

                return data;
            } else {
                return null;
            }
            
        } catch (err) {
            return null;
        }
    }
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

export default AuthProvider;