import sequelize  from '../../../config/db';
import { DataTypes, Model, Op, Sequelize, fn, col } from 'sequelize';

import UserProfile from './userProfile';
import User from '../User/user';

class Follower extends Model {
    declare id: number;
    declare follower_user_id: number;
    declare following_user_id: number;
    declare FollowingUser?: UserProfile;
    declare FollowerUser?: UserProfile;

    static async getFollowersList(following_user_id: number) {
        try {
            const object = await Follower.findAll({
                where: { following_user_id }
            });

            if (object) {
                return object.length;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    static async getFollowingsList(follower_user_id: number, amount?: number) {
        try {
            const object = await Follower.findAll({
                where: { follower_user_id }
            });

            if (object) {
                return object.length;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    static async getFollowersData(currentUserId: number, profileUserId: number) {
        try {
            const followers = await Follower.getFollowersList(profileUserId);
            const followings = await Follower.getFollowingsList(profileUserId);
            const currentUserIsFollowing = await Follower.findOne({
                where: { 
                    follower_user_id: currentUserId,
                    following_user_id: profileUserId
                }
            });

            
            const data = {
                followers: followers,
                followings: followings,
                is_following: currentUserIsFollowing ? true : false
            }

            return data;
        } catch (error) {
            return null;
        }
    }

    static async getFollowerUserData(
        currentUserId: number,
        profileUsername: string, 
        part: 'followers' | 'followings', 
        start: number, 
        limit: number
    ) {
        try {
            const offset = start - 1;
    
            const user = await User.findOne({
                where: {
                    [Op.and]: [
                        Sequelize.where(fn('LOWER', col('username')), profileUsername.toLowerCase())
                    ]
                }
            });
    
            if (!user) return null;
    
            const userProfile = await UserProfile.findOne({
                where: {
                    user_id: user.id
                }
            });
    
            if (!userProfile) return null;
    
            const whereCondition = part === 'followers' 
                ? { following_user_id: userProfile.user_id }
                : { follower_user_id: userProfile.user_id };

            const foreignKey = part === 'followers'
                ? 'follower_user_id'
                : 'following_user_id';

            const as = part === 'followers'
                ? 'FollowerUser'
                : 'FollowingUser';
    
            const followers = await Follower.findAll({
                where: whereCondition,
                include: [
                    {
                        model: UserProfile,
                        foreignKey,
                        as,
                        include: [
                            {
                                model: User,
                                foreignKey: 'user_id',
                                as: 'User'
                            }
                        ]
                    }
                ],
                limit,
                offset
            });
    
            const followersData = await Promise.all(
                followers.map(async (follower) => {
                    const currentUserIsFollowing = await Follower.findOne({
                        where: { 
                            follower_user_id: currentUserId,
                            following_user_id: follower?.[as]?.User.id
                        }
                    });
            
                    return {
                        username: follower?.[as]?.User.username,
                        country: follower?.[as]?.User.country,
                        type: follower?.[as]?.User.type,
                        avatar_path: follower?.[as]?.getDataValue('avatar_path'),
                        current_user_follows: !!currentUserIsFollowing 
                    };
                })
            );

            const filteredFollowersData = followersData.filter(d => d.username !== undefined);
    
            return filteredFollowersData.length > 0 ? filteredFollowersData : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }    
}

Follower.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        follower_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UserProfile,
                key: 'user_id'
            },
            onDelete: 'CASCADE',
        },
        following_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UserProfile,
                key: 'user_id'
            },
            onDelete: 'CASCADE',
        }
    },
    {
        sequelize,
        tableName: 'followers'
    }
);

export default Follower;