import styles from './SupportCard.module.css';

type Props = {
    header: string;
    description: string;
    link: string;
    buttonText: string;
    iconData: {
        Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        width: number;
        height: number;
    }
}

export default function SupportCard({
    header,
    description,
    link,
    buttonText,
    iconData
}: Props) {
    return (
        <div className={`${styles['card']} flex column relative`}>
            <div style={{ paddingBottom: 8 }}>
                <header className={styles['header']}>{header}</header>
            </div>
            <div style={{ marginBottom: 35, lineHeight: 1 }}>
                <span className={styles['description']}>{description}</span>
            </div>
            <div style={{ marginTop: 'auto' }} className='flex'>
                <a href={link} className={`${styles['button']} flex items-center content-center`}>{buttonText}</a>
            </div>
            <iconData.Icon width={iconData.width} height={iconData.height} 
                style={{
                    position: 'absolute',
                    zIndex: 0,
                    stroke: 'var(--secondary-50)',
                    opacity: '0.1',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            />
        </div>
    )
};