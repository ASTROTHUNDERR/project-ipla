import styles from './AvatarComp.module.css';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeneral } from '../../../../../../context/GeneralProvider';
import { useApi } from '../../../../../../context/ApiProvider';

import { UploadedImage, WindowPopupData } from '../../types';
import { onImageRemove, onImageUpload } from '../../functions';

import SettingsField from '../../../../components/Field';
import Button from '../../../../../../components/Button';
import DefaultAvatar from '../../../../../../assets/defaults/Avatar';

const avatarCSS: React.CSSProperties = {
    width: 100,
    height: 100,
    borderRadius: '100%',
    backgroundPosition: 'center',   
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
}

type Props = {
    imageUrl?: string;
    username?: string;
    setUploadedImageData: React.Dispatch<React.SetStateAction<UploadedImage | null>>;
    setWindowPopupData: React.Dispatch<React.SetStateAction<WindowPopupData | null>>;
}

export default function SettingsProfileAvatarComp({ 
    imageUrl, 
    username, 
    setUploadedImageData,
    setWindowPopupData
}: Props) {
    const { t } = useTranslation('settings');
    const { setInfoData } = useGeneral();
    const { loading, protectedDeleteRequest } = useApi();

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    // const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.currentTarget.files?.[0];

    //     if (file) {
    //         if (file.size <= 1_000_000) {
    //             const imageUrl = URL.createObjectURL(file);
    //             setUploadedImageData({ part: 'avatar', imageSrc: imageUrl});
    //             event.currentTarget.value = '';
    //         } else {
    //             setInfoData({
    //                 content: t('profile.avatar.upload_popup.error_messages.limit'),
    //                 danger: true
    //             });
    //         }
    //     }
    // };

    return (
        <SettingsField 
            headerText={t('profile.avatar.header')}
            additionalClassname={styles['avatar-field']}
            content={
                <div className='flex column'>
                    <div className='flex items-center content-center'>
                        <div 
                            style={
                                imageUrl ? {
                                    ...avatarCSS,
                                    backgroundImage: `url(${imageUrl})`
                                } : {
                                    ...avatarCSS
                                }
                            }
                        >
                            { !imageUrl && (
                                <DefaultAvatar  
                                    width={100} 
                                    height={100}
                                    username={username}
                                />
                            ) }
                        </div>
                    </div>
                    <div className={`${styles['buttons-wrapper']} flex items-center content-center margin-top-20`}>
                        <input 
                            ref={imageInputRef} 
                            type="file" 
                            accept='image/*' 
                            hidden
                            onChange={(e) => onImageUpload(
                                e, 
                                'avatar',
                                t, 
                                setUploadedImageData,
                                setInfoData
                            )}
                        />
                        <Button 
                            innerElement={t('profile.avatar.remove_button')}
                            className='settings-field-button'
                            onClick={() => setWindowPopupData({
                                width: 400,
                                header: t('profile.avatar.remove_popup.header'),  
                                content: t('profile.avatar.remove_popup.description'),
                                cancelButton: true,
                                cancelButtonText: t('general_words.cancel', { ns: 'translation' }),
                                cancelButtonOnClick: () => setWindowPopupData(null),
                                dangerSubmitButton: true,
                                submitLoading: loading,
                                submitButtonInnerElement: t('profile.avatar.remove_popup.submit_button'),
                                onFormSubmit: (e) => onImageRemove(
                                    e, 
                                    'remove-avatar', 
                                    protectedDeleteRequest
                                )
                            })}
                        />
                        <Button 
                            innerElement={t('profile.avatar.upload_button')}
                            className='settings-field-button primary'
                            onClick={() => imageInputRef.current?.click()}
                        />
                    </div>
                </div>
            }
        />
    )
};