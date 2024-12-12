import styles from './SettingsNavbar.module.css';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as Bar3Icon } from '../../../../assets/icons/bar-3.svg';

import Button from '../../../../components/Button';

type Props = {
    currentPage: string;
}

export default function SettingsNavbar({
    currentPage
}: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation('settings');

    const navbarSmallWrapperRef = useRef<HTMLDivElement | null>(null);
    const navbarRestPagesWrapperRef = useRef<HTMLDivElement | null>(null);

    const pages: { id: string, value: string }[] = t('general.pages', { returnObjects: true }) as { id: string, value: string }[];
    const restPages = pages.filter(p => p.id !== currentPage);

    useEffect(() => {
        function onDocumenClick(e: Event) {
            if (
                navbarSmallWrapperRef.current && navbarRestPagesWrapperRef.current
                && !navbarSmallWrapperRef.current.contains(e.target as Node)
            ) {
                collapseNavbar();
            }
        };

        document.addEventListener('mousedown', onDocumenClick);

        return () => {
            document.removeEventListener('mousedown', onDocumenClick);
        }
    }, []);

    useEffect(() => {
        if (currentPage && navbarSmallWrapperRef.current) {
            if (navbarSmallWrapperRef.current.classList.contains(styles['expand'])) {
                navbarSmallWrapperRef.current.classList.remove(styles['expand'])
            }
        }
    }, [currentPage])

    function collapseNavbar() {
        if (navbarSmallWrapperRef.current && navbarRestPagesWrapperRef.current) {
            navbarSmallWrapperRef.current.classList.remove(styles['expand']);
            navbarSmallWrapperRef.current.classList.add(styles['collapse']);
            setTimeout(() => {
                navbarRestPagesWrapperRef.current?.classList.remove(styles['visible']);

            }, 300);
        }
    };

    function onNavbarMenuClick() {
        if (navbarSmallWrapperRef.current && navbarRestPagesWrapperRef.current) {
            const state = navbarSmallWrapperRef.current.classList.contains(styles['expand']);
            
            if (state) {
                collapseNavbar();
            } else {
                navbarSmallWrapperRef.current.classList.remove(styles['collapse']);
                navbarSmallWrapperRef.current.classList.add(styles['expand']);
                navbarRestPagesWrapperRef.current.classList.add(styles['visible']);
            }
        }
    };

    return (
        <nav className={`${styles['navbar']} flex`}>
            <div className={`${styles['navbar-wide-wrapper']} flex`}>
                { pages.map((page, index) => (
                    <div 
                        key={index}
                        className={`${styles['tab']} ${currentPage === page.id ? styles['selected'] : ''}`}
                        onClick={() => navigate(`/settings/${page.id}`)}
                    >
                        <span>{page.value}</span>
                    </div>
                )) }
            </div>
            <div
                ref={navbarSmallWrapperRef} 
                className={`${styles['navbar-small-wrapper']} flex column`}
            >
                <div className={`${styles['navbar-currentpage-wrapper']} ${styles['current']} flex space-between`}>
                    <span className='flex items-center'>
                        {pages.find(page => page.id === currentPage)?.value}
                    </span>
                    <Button 
                        innerElement={
                            <Bar3Icon width={24} height={24} stroke='inherit' />
                        }
                        className={styles['navbar-menu-btn']}
                        onClick={onNavbarMenuClick}
                    />
                </div>
                <div ref={navbarRestPagesWrapperRef} className={`${styles['rest-pages-wrapper']} flex column`}>
                    { restPages.map((page, index) => (
                        <div 
                            key={index}
                            className={`${styles['navbar-currentpage-wrapper']} ${styles['rest']}`}
                            onClick={() => navigate(`/settings/${page.id}`)}
                        >
                            <span className='flex items-center'>
                                {page.value}
                            </span>
                        </div>
                    )) }
                </div>
            </div>
        </nav>
    )
};