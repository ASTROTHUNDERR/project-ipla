import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import UserProfile from './userProfile';

class UserProfileSocial extends Model {
    declare id: number;
    declare user_profile_id: number;
    declare profile_url: string;
    declare profile_nickname: string;
    declare provider: 'yt' | 'fb' | 'ig' | 'x';
}

UserProfileSocial.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_profile_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UserProfile,
                key: 'id'
            },
            onDelete: 'CASCADE',
        },
        profile_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profile_nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        provider: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['yt', 'fb', 'ig', 'x']
        }
    },
    {
        sequelize,
        tableName: 'user_profile_socials'
    }
);

export default UserProfileSocial;