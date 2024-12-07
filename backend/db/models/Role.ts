import sequelize from '../../config/db';
import { DataTypes, Model } from 'sequelize';

import { User } from './User';

class Role extends Model {
    declare id: number;
    declare name: string;
}

Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false
        }
    },
    { 
        sequelize,
        tableName: 'roles'
    }
);

class UserRole extends Model {
    declare id: number;
    declare user_id: number;
    declare role_id: number;
}

UserRole.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Role,
                key: 'id'
            },
            onDelete: 'CASCADE',
        }
    },
    { 
        sequelize,
        tableName: 'user_roles'
    }
);

export { Role, UserRole };