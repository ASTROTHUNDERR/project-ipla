import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageProvider';
import LanguageRedirect from './components/LanguageRedirect';
import AppRoutes from './routes/AppRoutes';

export default function App() {
    return (
        <LanguageProvider>
            <Router>
                <LanguageRedirect>
                    <AppRoutes />
                </LanguageRedirect>
            </Router>
        </LanguageProvider>
    );
};