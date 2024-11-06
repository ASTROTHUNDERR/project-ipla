import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageProvider';
import { ApiProvider } from './context/ApiProvider';
import { AuthProvider } from './context/AuthProvider';

import LanguageRedirect from './components/LanguageRedirect';
import AppRoutes from './routes/AppRoutes';

export default function App() {
    return (
        <LanguageProvider>
            <ApiProvider>
                <Router>
                    <AuthProvider>
                        <LanguageRedirect>
                            <AppRoutes />
                        </LanguageRedirect>
                    </AuthProvider>
                </Router>
            </ApiProvider>
        </LanguageProvider>
    );
};