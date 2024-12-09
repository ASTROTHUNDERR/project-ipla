import styles from './BannerComp.module.css';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeneral } from '../../../../../../context/GeneralProvider';
import { useApi } from '../../../../../../context/ApiProvider';

import { UploadedImage, WindowPopupData } from '../../types';
import { onImageRemove, onImageUpload } from '../../functions';

import SettingsField from '../../../../components/Field';
import Button from '../../../../../../components/Button';
import DefaultBanner from '../../../../../../assets/defaults/Banner';

const bannerCSS: React.CSSProperties = {
    width: '100%',
    height: 150,
    borderRadius: 6,
    backgroundPosition: 'center',   
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
};

type Props = {
    imageUrl?: string;
    setUploadedImageData: React.Dispatch<React.SetStateAction<UploadedImage | null>>;
    setWindowPopupData: React.Dispatch<React.SetStateAction<WindowPopupData | null>>;
}

export default function SettingsProfileBannerComp({
    imageUrl,
    setUploadedImageData,
    setWindowPopupData
}: Props) {
    const { t } = useTranslation('settings');
    const { setInfoData } = useGeneral();
    const { loading, protectedDeleteRequest } = useApi();

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <SettingsField
            headerText={t('profile.banner.header')}
            content={
                <div className='flex column'>
                    <div 
                        className={styles['banner-wrapper']}
                        style={
                            imageUrl ? {
                                ...bannerCSS,
                                backgroundImage: `url(${imageUrl})`
                            } : {
                                ...bannerCSS
                            }
                        }
                    >
                        { !imageUrl && (
                            <DefaultBanner 
                                width={'100%'}
                                height={'100%'}
                                iconWidth={24}
                                iconHeight={24}
                                borderRadius={6}
                            />
                        )}
                    </div>
                    <div className={`${styles['buttons-wrapper']} flex items-center content-center margin-top-20`}>
                        <input 
                            ref={imageInputRef} 
                            type="file" 
                            accept='image/*' 
                            hidden
                            onChange={(e) => onImageUpload(
                                e, 
                                'banner',
                                t, 
                                setUploadedImageData, 
                                setInfoData
                            )}
                        />
                        <Button 
                            innerElement={t('profile.banner.remove_button')}
                            className='settings-field-button'
                            onClick={() => setWindowPopupData({
                                width: 400,
                                header: t('profile.banner.remove_button'),  
                                content: t('profile.banner.remove_popup.description'),
                                cancelButton: true,
                                cancelButtonText: t('general_words.cancel', { ns: 'translation' }),
                                cancelButtonOnClick: () => setWindowPopupData(null),
                                dangerSubmitButton: true,
                                submitLoading: loading,
                                submitButtonInnerElement: t('profile.banner.remove_popup.submit_button'),
                                onFormSubmit: (e) => onImageRemove(
                                    e,
                                    'remove-banner',
                                    protectedDeleteRequest
                                )
                            })}
                        />
                        <Button 
                            innerElement={t('profile.banner.upload_button')}
                            className='settings-field-button primary'
                            onClick={() => imageInputRef.current?.click()}
                        />
                    </div>
                </div>
            }
        />
    )
};