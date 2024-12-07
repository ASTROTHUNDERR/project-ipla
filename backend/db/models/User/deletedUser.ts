import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import User from './user';

class DeletedUser extends Model {
    declare id: number;
    declare user_id: number;
    declare deletion_scheduled_at: Date;
    declare permanently_deleted_at: Date;
}

DeletedUser.init(
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
        deletion_scheduled_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        permanently_deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'deleted_users'
    }
);

export default DeletedUser;