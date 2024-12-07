import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import User from '../User/user';
import UserProfileSocial from './userSocial';

class UserProfile extends Model {
    declare id: number;
    declare user_id: number;
    declare banner_url: string;
    declare avatar_url: string;
    declare about: string;
    declare Socials?: UserProfileSocial[]; 

    static async getData(userId: number) {
        try {
            const userProfile = await UserProfile.findOne({
                where: { user_id: userId },
                include: {
                    model: UserProfileSocial,
                    as: 'Socials',
                    required: false
                }
            });

            if (!userProfile) {
                return null;
            }

            const data = {
                user_id: userProfile.user_id,
                banner_url: userProfile.banner_url,
                avatar_url: userProfile.avatar_url,
                about: userProfile.about,
                socials: userProfile.Socials?.map(social => ({
                    url: social.profile_url,
                    nickname: social.profile_nickname,
                    provider: social.provider
                }))
            }

            return data;
        } catch (error) {
            return null;
        }
    }
}

UserProfile.init(
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
        banner_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        about: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                max: 140
            }
        }
    },
    {
        sequelize,
        tableName: 'user_profiles'
    }
);

export default UserProfile;