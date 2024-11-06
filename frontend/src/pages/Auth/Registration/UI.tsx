import '../index.css';
import { useRegistrationContext } from '../../../context/RegistrationProvider';

import AuthFooter from '../../../components/Footers/Auth';
import RegistrationIntro from './components/Intro';
import RegistrationFormPage from './components/Form';

export default function RegistrationUI() {
    const { registrationType } = useRegistrationContext();

    return (
        <div className='auth-component relative flex column'>
            <header className='auth-header'></header>
            {!registrationType ? (
                <RegistrationIntro />
            ) : (
                <RegistrationFormPage />
            )}
            <AuthFooter />
        </div>
    )
};