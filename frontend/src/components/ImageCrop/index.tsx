import styles from './ImageCrop.module.css';
import { useState, useEffect, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { blobToBase64 } from '../../utils/functions';
import { UploadedImage } from '../../pages/Settings/pages/Profile/types';

import { ReactComponent as XMarkIcon } from '../../assets/icons/xmark.svg';

import Button from '../Button';

function getCroppedImage(canvas: HTMLCanvasElement, crop: PixelCrop) {
    return new Promise<Blob | null>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Canvas is empty');
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 1);
    });
};

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: 'px',
                width: Math.min(mediaWidth, mediaHeight * aspect),
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
};

type Props = {
    windowTitle: string;
    submitButtonText: string;
    uploadedImageData: UploadedImage;
    setUploadedImageData: React.Dispatch<React.SetStateAction<UploadedImage | null>>;
    minWidth: number;
    minHeight: number;
    aspect: number;
    locked?: boolean;
    keepSelection?: boolean;
    circularCrop?: boolean;
    onSubmit: (imageData: string) => Promise<void>;
}

const ImageCrop: React.FC<Props> = ({ 
    windowTitle,
    submitButtonText,
    uploadedImageData,
    setUploadedImageData,
    minWidth,
    minHeight,
    aspect,
    locked,
    keepSelection,
    circularCrop,
    onSubmit
}) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    const mainRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        function onDocumentClick(event: Event) {
            if (mainRef.current && !mainRef.current.contains(event.target as Node)) {
                setUploadedImageData(null);
            }
        };

        document.addEventListener('mousedown', onDocumentClick);

        return () => {
            document.removeEventListener('mousedown', onDocumentClick);
        }
    }, [setUploadedImageData]);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    };
    

    const handleCropSubmit = async () => {
        if (completedCrop && imgRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const image = imgRef.current;
    
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const ctx = canvas.getContext('2d');
    
            if (!ctx) return;
    
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalWidth / aspect;
    
            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                canvas.width,
                canvas.height
            );
    
            const croppedBlob = await getCroppedImage(canvas, completedCrop);
    
            if (croppedBlob) {
                const croppedImageBase64 = await blobToBase64(croppedBlob);
                await onSubmit(croppedImageBase64);
            }
        }
    };

    return (
        <div className='z-1 absolute flex content-center full-size' style={{ left: 0, top: 0 }} >
            <div ref={mainRef} className={`${styles['window']} flex column`}>
                <header className={`${styles['header']} flex items-center space-between`}>
                    <span>{windowTitle}</span>
                    <Button 
                        innerElement={
                            <XMarkIcon width={20} height={20} stroke={'var(--secondary-50)'} />
                        }
                        className={`${styles['close-button']} flex items-center content-center`}
                        onClick={() => setUploadedImageData(null)}
                    />
                </header>
                <div className={`${styles['image-crop-wrapper']} flex items-center content-center`}>
                    <ReactCrop 
                        crop={crop} 
                        aspect={aspect}
                        minWidth={minWidth}
                        minHeight={minHeight}
                        locked={locked}
                        keepSelection={keepSelection}
                        circularCrop={circularCrop}
                        className={`${styles['image-crop']} flex`}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                    >
                        <img 
                            src={uploadedImageData.imageSrc}
                            ref={imgRef}
                            alt='image-crop'
                            className={styles['crop-image']}
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ padding: 20, borderTop: '1px solid var(--secondary-400)' }}>
                    <Button 
                        innerElement={submitButtonText}
                        className={`${styles['submit-button']} primary`}
                        onClick={handleCropSubmit}
                    />
                </div>
            </div>
            <div className='overlay'></div>
        </div>
    )
};

export default ImageCrop;