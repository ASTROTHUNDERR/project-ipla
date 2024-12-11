export type UserHeadData = {
    username: string;
    bannerUrl?: string;
    avatarUrl?: string;
    userType: 'player' | 'manager' | 'team_owner';
    followers?: number;
    followings?: number;
    createdAt: string
};

export type Followers = {
    followers: number;
    followings: number;
    is_following: boolean;
};

export type FollowersData = {
    username: string;
    country: string;
    type: 'player' | 'manager' | 'team_owner';
    avatar_path: string;
    current_user_follows: boolean;
};

export type Tab = 'followers' | 'followings';