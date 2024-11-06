import React, { createContext, useContext, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

type RegistrationContextType = {
    registrationType: string | null;
}

const REGISTRATION_TYPES = [
    'player', 'manager', 'team owner'
]

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider = ({ children }: { children: React.ReactNode })  => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const registrationType = searchParams.get('type');

    useEffect(() => {
        if (registrationType && !REGISTRATION_TYPES.includes(registrationType)) {
            navigate('/register');
        }
    }, [registrationType, navigate])

    return (
        <RegistrationContext.Provider value={{ 
            registrationType,
        }}>
            {children}
        </RegistrationContext.Provider>
    );
};

export function useRegistrationContext() {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error('useRegistrationContext must be used within an AdminProvider');
    }
    return context;
};