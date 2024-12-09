import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Response } from 'express';
import logger from '../config/logger';

import { UserProfile, UserProfileSocial } from '../db/models/UserProfile';

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
}

class UserProfileController {
    static async getUserProfileData(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const { userId } = req.params;

                const userProfile = await UserProfile.findOne({ where: {
                    user_id: parseInt(userId)
                } });

                if (!userProfile) {
                    res.status(404).send('User profile not found');
                    return;
                }

                const userProfileData = await UserProfile.getData(parseInt(userId));
                
                res.status(200).send(userProfileData);
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
}

export default UserProfileController;