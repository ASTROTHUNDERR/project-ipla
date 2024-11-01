import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
    return (
        <div className={`${styles['not-found-page']} flex items-center content-center`}>
            <div className={styles['not-found-inner']}>
                <span className={styles['not-found-status']}>404</span>
                <div className={styles['not-found-line']}></div>
                <span className={`${styles['not-found-text']} text-center`}>Page not found</span>
            </div>
        </div>
    )
}