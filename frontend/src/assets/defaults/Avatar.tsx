import React from 'react';
import Avatar from 'boring-avatars';

const COLORS = [
    '#807070',
    '#9A8FC8',
    '#8DBDEB',
    '#A5E6C8',
    '#D9F5B5'
]

type Props = {
    username?: string;
    width?: number | string;
    height?: number | string;
    additionalProperties?: React.SVGAttributes<HTMLOrSVGElement>;
}

export default function DefaultAvatar({
    username,
    width,
    height,
    additionalProperties
}: Props) {
    return (
        <Avatar 
            name={username}
            width={width}
            height={height}
            colors={COLORS}
            variant='marble'
            {...additionalProperties}
        />
    )
};