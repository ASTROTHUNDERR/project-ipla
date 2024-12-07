import './styles.css';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGeneral } from '../../context/GeneralProvider';

import InfoPopup from '../../components/InfoPopup';

import AuthorizedNavbar from '../../components/Navbar/Authorized';
import SettingsNavbar from './components/Navbar';

import SettingsAccount from './pages/Account';
import SettingsProfile from './pages/Profile';

const PAGES = [
    'account', 'profile'
]

export default function Settings() {
    const navigate = useNavigate();
    const { page } = useParams();
    const { infoData } = useGeneral();

    useEffect(() => {
        if (page) {
            if (!PAGES.includes(page)) {
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
                <main className='settings-main-wrapper'>
                    <SettingsNavbar 
                        currentPage={page}
                    />
                    { page && (
                        <>
                            {page === 'account' && (
                                <SettingsAccount />
                            )}
                            {page === 'profile' && (
                                <SettingsProfile />
                            )}
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