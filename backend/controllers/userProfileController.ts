import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Response } from 'express';
import { Sequelize, Op, fn, col } from 'sequelize';

import logger from '../config/logger';
import { User, UserProfile, Follower } from '../db/models';

import { AuthenticatedRequest } from '../utils/types';
import { processAndSaveImage, deleteFile } from '../utils/profileUtils';
import { profanity } from '../utils/profanity';

class Schemas {
    static userProfileUpdate = z.object({
        bannerBase64: z.string()
            .regex(/^data:image\/[a-zA-Z]+;base64,[\s\S]+$/, 'Invalid Base64 image string')
            .optional(),
        avatarBase64: z.string()
            .regex(/^data:image\/[a-zA-Z]+;base64,[\s\S]+$/, 'Invalid Base64 image string')
            .optional(),
        about: z.string()
            .max(140)
            .refine((value) => !profanity.exists(value), {
                message: 'About contains inappropriate words'
            })
            .optional(),
    });

    static followUser = z.object({
        second_person_username: z.string(),
        method: z.enum(['follow', 'unfollow'])
    });

    static getFollowers = z.object({
        username: z.string(),
    });

    static getFollowerUsersData = z.object({
        userProfileUsername: z.string(),
        part: z.enum(['followers', 'followings']),
        start: z.number(),
        limit: z.number()
    });
}

class UserProfileController {
    static async getUserProfileData(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const { username } = req.params;

                const user = await User.findOne({
                    where: {
                        [Op.and]: [
                            Sequelize.where(fn('LOWER', col('username')), username.toLowerCase())
                        ] 
                    }
                });

                if (user) {
                    const userProfile = await UserProfile.findOne({ where: {
                        user_id: user.id
                    } });
    
                    if (!userProfile) {
                        res.status(404).send('User profile not found');
                        return;
                    }
    
                    const userProfileData = await UserProfile.getData(user.id);
                    
                    res.status(200).send(userProfileData);
                    return;
                } else {
                    res.status(404).send('User not found');
                    return;
                }
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER PROFLE: error caught at 'getUserProfileData': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async updateUserProfile(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.userProfileUpdate.parse(req.body);
                const { 
                    bannerBase64,
                    avatarBase64,
                    about
                } = validatedData;

                const userProfile = await UserProfile.findOne({ 
                    where: { user_id: req.currentUser.id }
                }); 

                if (userProfile) {
                    const userProfileDirPath = path.join(__dirname, '../static', `user_content/${userProfile.user_id}`);

                    if (bannerBase64) {
                        if (userProfile.banner_path) {
                            const imagePath = path.join(__dirname, '..', userProfile.banner_path);
                            await deleteFile(imagePath);
                        }

                        const fileName = uuidv4();
                        const bannerPath = path.join(userProfileDirPath, `${fileName}.webp`);

                        const errorMessage = await processAndSaveImage(bannerBase64, bannerPath);

                        if (errorMessage) {
                            res.status(400).send('Image size exceeded 1mb');
                            return;
                        }

                        await userProfile.update({
                            banner_path: `/static/user_content/${userProfile.user_id}/${fileName}.webp`
                        });
                    }

                    if (avatarBase64) {
                        if (userProfile.avatar_path) {
                            const imagePath = path.join(__dirname, '..', userProfile.avatar_path);
                            await deleteFile(imagePath);
                        }

                        const fileName = uuidv4();
                        const avatarPath = path.join(userProfileDirPath, `${fileName}.webp`);

                        const errorMessage = await processAndSaveImage(avatarBase64, avatarPath, 150, 150);

                        if (errorMessage) {
                            res.status(400).send('Image size exceeded 1mb');
                            return;
                        }

                        await userProfile.update({
                            avatar_path: `/static/user_content/${userProfile.user_id}/${fileName}.webp`
                        });
                    }

                    if (about) {
                        const trimmedContent = about.trim();
                        
                        await userProfile.update({ 
                            about: trimmedContent
                        });
                    } 

                    res.status(200).send('User profile was updated');
                    return;
                } else {
                    logger.error(
                        `User profile not found at 'USER PROFILE': 'updateUserProfile'. user_id=${req.currentUser.id}`
                    );
                    res.status(404).send('Invalid user profile');
                    return;
                }
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER PROFLE: error caught at 'updateUserProfile': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async removeProfileBanner(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const userProfile = await UserProfile.findOne({ 
                    where: { user_id: req.currentUser.id }
                }); 

                if (!userProfile) {
                    res.status(404).send('Profile not found');
                    return;
                }

                if (userProfile.banner_path) {
                    const bannerPath = path.join(__dirname, '..', userProfile.banner_path);
                    await deleteFile(bannerPath);

                    await userProfile.update({
                        banner_path: null
                    });

                    res.status(200).send('Successfully removed profile banner');
                    return;
                } else {
                    res.status(400).send('Profile does not have banner');
                    return;
                }
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER PROFLE: error caught at 'removeProfileBanner': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async removeProfileAvatar(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const userProfile = await UserProfile.findOne({ 
                    where: { user_id: req.currentUser.id }
                }); 

                if (!userProfile) {
                    res.status(404).send('Profile not found');
                    return;
                }

                if (userProfile.avatar_path) {
                    const imagePath = path.join(__dirname, '..', userProfile.avatar_path);
                    await deleteFile(imagePath);

                    await userProfile.update({
                        avatar_path: null
                    });

                    res.status(200).send('Successfully removed profile avatar');
                    return;
                } else {
                    res.status(400).send('Profile does not have avatar');
                    return;
                }
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER PROFLE: error caught at 'removeProfileAvatar': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async followUser(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.followUser.parse(req.body);
                const { second_person_username, method } = validatedData;

                const secondUser = await User.findOne({
                    where:  {
                        [Op.and]: [
                            Sequelize.where(fn('LOWER', col('username')), second_person_username.toLowerCase())
                        ] 
                    }
                });

                if (secondUser) {
                    if (req.currentUser.id === secondUser.id) {
                        res.status(400).send('You can not follow yourself');
                        return;
                    }   

                    const currentUserProfile = await UserProfile.findOne({
                        where: { user_id: req.currentUser.id }
                    });
                    const secondUserProfile = await UserProfile.findOne({
                        where: { user_id: secondUser.id }
                    });

                    if (currentUserProfile && secondUserProfile) {
                        if (method === 'follow') {
                            await Follower.create({
                                follower_user_id: currentUserProfile.id,
                                following_user_id: secondUserProfile.id
                            });

                            const followersData = await Follower.getFollowersData(req.currentUser.id, secondUserProfile.id);

                            res.status(200).send(followersData);
                            return;
                        } else {
                            const followerObject = await Follower.findOne({
                                where: {
                                    follower_user_id: currentUserProfile.id,
                                    following_user_id: secondUserProfile.id
                                }
                            });

                            if (!followerObject) {
                                res.status(404).send('You are not following the user');
                                return;
                            }

                            await followerObject.destroy();

                            const followersData = await Follower.getFollowersData(req.currentUser.id, secondUserProfile.id);

                            res.status(200).send(followersData);
                            return;
                        }
                    } else {
                        res.status(404).send('Profile(s) not found');
                        return;
                    }
                } else {
                    res.status(404).send('User not found');
                    return;
                }
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER PROFLE: error caught at 'followUser': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async getFollowers(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.getFollowers.parse(req.body);
                const { username } = validatedData;

                const user = await User.findOne({
                    where:  {
                        [Op.and]: [
                            Sequelize.where(fn('LOWER', col('username')), username.toLowerCase())
                        ] 
                    }
                });

                if (user) {
                    const followersData = await Follower.getFollowersData(req.currentUser.id, user.id);

                    res.status(200).send(followersData);
                    return;
                } else {
                    res.status(404).send('User not found');
                    return;
                }
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER PROFLE: error caught at 'getFollowers': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async getFollowersData(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.getFollowerUsersData.parse(req.body);
                const { userProfileUsername, part, start, limit } = validatedData;
    
    
                const followerUsersData = await Follower.getFollowerUserData(
                    req.currentUser.id, userProfileUsername, part, start, limit
                );
    
                res.status(200).send(followerUsersData);
                return;
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER PROFLE: error caught at 'getFollowerUserData': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
} 

export default UserProfileController;