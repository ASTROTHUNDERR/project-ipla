import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as DiscordStrategy } from 'passport-discord';

import { User, AuthProvider } from '../db/models';
import { getYouTubeChannelLink } from '../utils/profileUtils';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(null, {
                        redirectToFrontend: true,
                        profile: null
                    });
                }

                let user = await User.findOne({ where: { email } });

                if (!user) {
                    return done(null, {
                        redirectToFrontend: true,
                        profile: {
                            username: profile.displayName,
                            email: email,
                            id: profile.id,
                        },
                    });
                }

                await AuthProvider.findOrCreate({
                    where: {
                        user_id: user.id,
                        provider: 'google',
                        provider_user_id: profile.id,
                    },
                });

                done(null, user);
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            callbackURL: '/api/auth/discord/callback',
            scope: ['identify', 'email'], 
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ where: { email: profile.email } });

                if (!user) {
                    return done(null, {
                        redirectToFrontend: true,
                        profile: {
                            username: profile.username,
                            email: profile.email,
                            id: profile.id,
                        },
                    });
                }

                await AuthProvider.findOrCreate({
                    where: {
                        user_id: user.id,
                        provider: 'discord',
                        provider_user_id: profile.id,
                    },
                });

                done(null, user);
            } catch (error) {
                done(error);
            }
        }
    )
);

export default passport;