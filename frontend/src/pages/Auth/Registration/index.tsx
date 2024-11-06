import { RegistrationProvider } from '../../../context/RegistrationProvider';

import RegistrationUI from './UI';

function Registration() {

    return (
        <RegistrationProvider>
            <RegistrationUI />
        </RegistrationProvider>
    )
};

export default Registration;