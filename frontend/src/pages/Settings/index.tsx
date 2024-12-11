import './styles.css';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGeneral } from '../../context/GeneralProvider';

import InfoPopup from '../../components/InfoPopup';

import AuthorizedNavbar from '../../components/Navbar/Authorized';
import SettingsNavbar from './components/Navbar';

import SettingsAccount from './pages/Account';
import SettingsProfile from './pages/Profile';
import SettingsBilling from './pages/Billing';

type Pages = 'account' | 'profile' | 'billing';

function isPage(value: string | undefined): value is Pages {
    return value === 'account' || value === 'profile' || value === 'billing';
}

export default function Settings() {
    const navigate = useNavigate();
    const { page } = useParams<{ page?: Pages }>();
    const { infoData } = useGeneral();

    useEffect(() => {
        if (page) {
            if (!isPage(page)) {
                navigate('/');
                return;
            }
        } else {
            navigate('/settings/account');
            return;
        }
    }, [page, navigate])
    
    
    return (
        <>
            <AuthorizedNavbar />
            <div className='flex items-center content-center'>
                <main className='main-wrapper'>
                    <SettingsNavbar 
                        currentPage={page}
                    />
                    { page && (
                        <>
                            {page === 'account' ? (
                                <SettingsAccount />
                            ) : page === 'profile' ? (
                                <SettingsProfile />
                            ) : page === 'billing' && (
                                <SettingsBilling />
                            ) }
                        </>
                    ) }
                    { infoData && (
                        <InfoPopup />
                    ) }
                </main>
            </div>
        </>
    )
};