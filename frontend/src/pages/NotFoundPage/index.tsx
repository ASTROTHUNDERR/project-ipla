import styles from './NotFoundPage.module.css';

type Props = {
    value?: string;
}

export default function NotFoundPage({ value }: Props) {
    return (
        <div className={`${styles['not-found-page']} flex items-center content-center`}>
            <div className={styles['not-found-inner']}>
                <span className={styles['not-found-status']}>404</span>
                <div className={styles['not-found-line']}></div>
                <span className={`${styles['not-found-text']} text-center`}>{value ? value : 'Page'} not found</span>
            </div>
        </div>
    )
}