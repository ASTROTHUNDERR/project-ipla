import { v4 as uuidv4 } from 'uuid';
import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import User from '../User/user';
import UserProfileSocial from './userSocial';
import Follower from './follower';

class UserProfile extends Model {
    declare id: number;
    declare uuid: string;
    declare user_id: number;
    declare banner_path: string;
    declare avatar_path: string;
    declare about: string;
    declare User: User;
    declare Socials?: UserProfileSocial[]; 
    declare Followers?: Follower;
    declare Followings?: Follower;

    static async getData(userId: number) {
        try {
            const userProfile = await UserProfile.findOne({
                where: { user_id: userId },
                include: [
                    {
                        model: UserProfileSocial,
                        as: 'Socials',
                        required: false,
                    },
                    {
                        model: User,
                        as: 'User',
                        required: true
                    }
                ]
            });

            if (!userProfile) {
                return null;
            }

            const data = {
                username: userProfile.User.username,
                type: userProfile.User.type,
                banner_path: userProfile.banner_path,
                avatar_path: userProfile.avatar_path,
                about: userProfile.about,
                socials: userProfile.Socials?.map(social => ({
                    url: social.profile_url,
                    nickname: social.profile_nickname,
                    provider: social.provider
                })),
            }

            return data;
        } catch (error) {
            console.log(error)
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
        banner_path: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        avatar_path: {
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
        tableName: 'user_profiles',
        hooks: {
            beforeCreate: async (userProfile: UserProfile) => {
                const profileUUID = uuidv4();
                userProfile.uuid = profileUUID;
            }
        }
    }
);

export default UserProfile;