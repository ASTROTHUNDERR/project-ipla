import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';

import logger from '../config/logger';

export async function processAndSaveImage(
    base64Image: string, 
    outputPath: string,
    width?: number,
    height?: number,
): Promise<void | string> {
    try {
        const directory = path.dirname(outputPath);
        if (!fs.existsSync(directory)) {
            await fs.promises.mkdir(directory, { recursive: true });
        }

        const base64Data = base64Image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length >= 1_000_000) {
            return 'Original image size exceeds 1MB';
        }
        
        const image = sharp(buffer);

        if (width && height) {
            await image
                .resize({ width, height })
                .webp({ quality: 85 })
                .toFile(outputPath);
        } else {
            await image
                .webp({ quality: 85 })
                .toFile(outputPath);
        }
    } catch (error) {
        logger.error('Error processing image: ', error);
    }
};

export async function deleteFile(filePath: string) {
    try {
        if (!fs.existsSync(filePath)) {
            logger.info(`File not found at ${filePath}, nothing to delete.`);
            return;
        }

        await fs.promises.unlink(filePath);
        logger.info(`File at ${filePath} deleted successfully.`);
    } catch (error) {
        logger.error('Error deleting image: ', error);
    }
};

export async function getYouTubeChannelLink(accessToken: string): Promise<string | null> {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                part: 'snippet',
                mine: 'true',
            },
        });

        const channels = response.data.items;
        if (channels && channels.length > 0) {
            const channel = channels[0];
            const channelId = channel.id;
            
            return `https://www.youtube.com/channel/${channelId}`;
        }
        return null;
    } catch (error) {
        logger.error('Error fetching YouTube channel data: ', error);
        return null;
    }
};