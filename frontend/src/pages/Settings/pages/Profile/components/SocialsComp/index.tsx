// import styles from './SocialsComp.module.css';
import { useTranslation } from 'react-i18next';

import { Social } from '../../../../types';

import SettingsField from '../../../../components/Field';
import SocialsContent from './components/SocialsContent';


type Props = {
    socials?: Social[];
}

export default function SettingsProfileSocialsComp({
    socials
}: Props) {
    const { t } = useTranslation('settings');
    return (
        <SettingsField 
            headerText={t('profile.socials.header')}
            additionalClassname='margin-top-30'
            content={
                <SocialsContent 
                    socials={socials}
                />
            }
        />
    )
}