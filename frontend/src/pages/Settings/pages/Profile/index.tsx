import styles from './Profile.module.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../context/ApiProvider';
import { useAuth } from '../../../../context/AuthProvider';

import { UserProfile } from '../../../../utils/types';
import { BASE_URL } from '../../../../utils/api';
import { UploadedImage, WindowPopupData } from './types';
import { getUserProfileData } from '../../../../utils/api';
import { onImageSet } from './functions';

import SettingsProfileBannerComp from './components/BannerComp';
import SettingsProfileAvatarComp from './components/AvatarComp';
import SettingsProfileAboutComp from './components/AboutComp';
import SettingsProfileSocialsComp from './components/SocialsComp';

import WindowPopup from '../../../../components/WindowPopup';
import ImageCrop from '../../../../components/ImageCrop';

export default function SettingsProfile() {
    const { t } = useTranslation('settings');
    const { user } = useAuth();
    const { protectedPutRequest } = useApi();

    const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
    const [windowPopupData, setWindowPopupData] = useState<WindowPopupData | null>(null);

    const [uploadedImageData, setUploadedImageData] = useState<UploadedImage | null>(null);


    useEffect(() => {
        async function fetchUserProfileData() {
            if (user) {
                const response = await getUserProfileData(user.id);

                if (response.error) {
                    window.location.href = '/';
                } else {
                    setUserProfileData(response.data);
                }
            }
        }
        fetchUserProfileData();
    }, [user]);

    const onBannerUpload = async (croppedImageBase64: string) => await onImageSet({
        bannerBase64: croppedImageBase64
    }, protectedPutRequest);
    
    const onAvatarUpload = async (croppedImageBase64: string) => await onImageSet({
        avatarBase64: croppedImageBase64
    }, protectedPutRequest);

    return (
        <div>
            { user && userProfileData && (
                <>
                    { windowPopupData && (
                        <WindowPopup {...windowPopupData} />
                    ) }
                    { uploadedImageData && uploadedImageData.part === 'banner' && (
                        <ImageCrop 
                            windowTitle={t('profile.banner.upload_popup.header')}
                            submitButtonText={t('profile.banner.upload_popup.submit_button')}
                            uploadedImageData={uploadedImageData}
                            setUploadedImageData={setUploadedImageData}
                            locked
                            minWidth={100}
                            minHeight={100}
                            aspect={3 / 1}
                            onSubmit={onBannerUpload}
                        />
                    ) }
                    { uploadedImageData && uploadedImageData.part === 'avatar' && (
                        <ImageCrop 
                            windowTitle={t('profile.avatar.upload_popup.header')}
                            submitButtonText={t('profile.avatar.upload_popup.submit_button')}
                            uploadedImageData={uploadedImageData}
                            setUploadedImageData={setUploadedImageData}
                            minWidth={100}
                            minHeight={100}
                            aspect={1}
                            keepSelection
                            circularCrop
                            onSubmit={onAvatarUpload}
                        />
                    ) }
                    <SettingsProfileBannerComp
                        imageUrl={
                            userProfileData.banner_path 
                                ? `${BASE_URL}${userProfileData.banner_path}` 
                                : undefined
                        }
                        setUploadedImageData={setUploadedImageData}
                        setWindowPopupData={setWindowPopupData}
                    />
                    <div className={`${styles['small-column']} flex space-between margin-top-30`}>
                        <SettingsProfileAvatarComp
                            imageUrl={
                                userProfileData.avatar_path 
                                    ? `${BASE_URL}${userProfileData.avatar_path}` 
                                    : undefined
                            }
                            username={user.username}
                            setUploadedImageData={setUploadedImageData}
                            setWindowPopupData={setWindowPopupData}
                        />
                        <SettingsProfileAboutComp 
                            about={
                                userProfileData.about 
                                    ? userProfileData.about 
                                    : ''
                            }
                        />
                    </div>
                    <SettingsProfileSocialsComp
                        socials={userProfileData.socials}
                    />
                </>
            ) }
        </div>
    )
};