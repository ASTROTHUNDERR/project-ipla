import React, { createContext, useContext, useState } from 'react';

import { HelperMessage } from '../pages/Auth/types';

type TwoFactorAuthContextType = {
    helperMessages: {
        token?: HelperMessage;
    } | undefined;
    setHelperMessages: React.Dispatch<React.SetStateAction<{
        token?: HelperMessage;
    } | undefined>>;
}

const TwoFactorAuthContext = createContext<TwoFactorAuthContextType | undefined>(undefined);

export const TwoFactorAuthProvider = ({ children }: { children: React.ReactNode })  => {
    const [helperMessages, setHelperMessages] = useState<{ token?: HelperMessage } | undefined>(undefined);

    return (
        <TwoFactorAuthContext.Provider value={{ helperMessages, setHelperMessages }}>
            {children}
        </TwoFactorAuthContext.Provider>
    );
};

export function use2FA() {
    const context = useContext(TwoFactorAuthContext);
    if (!context) {
        throw new Error('use2FA must be used within an AdminProvider');
    }
    return context;
};