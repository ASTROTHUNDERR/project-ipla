import React from 'react';

import { ReactComponent as ImageIcon } from '../icons/image.svg';

const CSS: React.CSSProperties = {
    backgroundColor: 'var(--additional-400)',
    userSelect: 'none'
}

const bgCSS: React.CSSProperties = {
    width: '100%',
    height: '100%'
}

type Props = {
    width: number | string;
    height: number | string;
    borderRadius?: number | string;
    iconWidth: number | string;
    iconHeight: number | string;
    additionalProperties?: React.CSSProperties;
}

export default function DefaultBanner({
    width,
    height,
    borderRadius,
    iconWidth,
    iconHeight,
    additionalProperties
}: Props) {
    return (
        <div  
            style={{
                ...CSS,
                width,
                height,
                borderRadius,
                ...additionalProperties
            }}
        >
            <span className='flex items-center content-center' style={bgCSS}>
                <ImageIcon width={iconWidth} height={iconHeight} stroke='var(--secondary-600)' />
            </span>
        </div>
    )
};