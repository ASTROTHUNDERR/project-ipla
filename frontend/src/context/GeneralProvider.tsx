import React, { createContext, useContext, useState } from 'react';

interface InfoData {
    content: string;
    danger?: boolean;
}

interface GeneralContextType {
    infoData: InfoData | null;
    setInfoData: React.Dispatch<React.SetStateAction<InfoData | null>>;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

export const GeneralProvider = ({ children }: { children: React.ReactNode }) => {
    const [infoData, setInfoData] = useState<InfoData | null>(null);

    return (
        <GeneralContext.Provider value={{ infoData, setInfoData }}>
            {children}
        </GeneralContext.Provider>
    );
};

export const useGeneral = () => {
    const context = useContext(GeneralContext);
    if (!context) {
        throw new Error('useGeneral must be used within an GeneralProvider');
    }
    return context;
};