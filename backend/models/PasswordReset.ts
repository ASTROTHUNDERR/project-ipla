import sequelize  from '../config/db';
import { DataTypes, Model } from 'sequelize';

import { User } from './User';

class PasswordReset extends Model {
    declare id: number;
    declare user_id: string;
    declare token: string;
}

PasswordReset.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'id'
            },
            unique: true,
            onDelete: 'CASCADE',
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'password_reset',
    }
);

export default PasswordReset;