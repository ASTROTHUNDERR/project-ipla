import { TFunction } from 'i18next';
import { InfoData } from '../../../../context/GeneralProvider';
import { UploadedImage } from './types';
import { ApiResponse } from '../../../../utils/types';

export async function onImageRemove(
    event: React.FormEvent<HTMLFormElement>,
    endpoint: string,
    protectedDeleteRequest: (url: string) => Promise<ApiResponse<any>>
) {
    event.preventDefault();
    const response = await protectedDeleteRequest(`/user-profile/${endpoint}`);
    if (!response.error) {
        window.location.reload();
    }
};

export function onImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    part: 'avatar' | 'banner',
    t: TFunction<"settings", undefined>,
    setUploadedImageData: (value: React.SetStateAction<UploadedImage | null>) => void,
    setInfoData: (value: React.SetStateAction<InfoData | null>) => void
) {
    const file = event.currentTarget.files?.[0];

    if (file) {
        if (file.size <= 1_000_000) {
            const imageUrl = URL.createObjectURL(file);
            setUploadedImageData({ part: part, imageSrc: imageUrl});
            event.currentTarget.value = '';
        } else {
            setInfoData({
                content: t(`profile.${part}.upload_popup.error_messages.limit`),
                danger: true
            });
        }
    }
};

export async function onImageSet(
    data: object,
    protectedPutRequest: (url: string, data: any) => Promise<ApiResponse<any>>
) {
    const response = await protectedPutRequest('/user-profile/update', data);
    if (!response.error) {
        window.location.reload();
    }
};