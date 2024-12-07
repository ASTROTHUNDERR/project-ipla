import logger from '../config/logger';
import { z } from 'zod';
import { Response } from 'express';

import { UserProfile, UserProfileSocial } from '../db/models/UserProfile';

import { AuthenticatedRequest } from '../utils/types';

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
}

export default UserProfileController;