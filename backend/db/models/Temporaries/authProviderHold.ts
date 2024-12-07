import crypto from 'crypto';
import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

class AuthProviderHold extends Model {
    declare id: number;
    declare token: string;
    declare email: string;
    declare provider: string;
    declare provider_user_id: string;
}

AuthProviderHold.init(
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
            beforeCreate: async (authHold: AuthProviderHold) => {
                const token = crypto.randomBytes(64).toString('hex')
                authHold.token = token;
            }
        }
    }
);

export default AuthProviderHold;