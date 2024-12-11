// import styles from './Billing.module.css';
import { useTranslation } from 'react-i18next';

import SettingsField from '../../components/Field';

export default function SettingsBilling() {
    const { t } = useTranslation('settings');

    return (
        <div>
            <SettingsField 
                headerText={t('billing.billing_methods.header')}
            />
        </div>
    )
};