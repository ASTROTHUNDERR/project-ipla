import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import { User } from '../User';

class TwoFactorAuthHold extends Model {
    declare id: number;
    declare user_id: number;
    declare secret: string;
}

TwoFactorAuthHold.init(
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
        secret: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'two_factor_auth_hold'
    }
);

export default TwoFactorAuthHold;