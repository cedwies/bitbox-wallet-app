import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIncognitoMode } from '@/hooks/incognitoMode';
import { Toggle } from '@/components/toggle/toggle';
import { SettingsItem } from '@/routes/settings/components/settingsItem/settingsItem';
import { useKeystores } from '@/hooks/backend';
import { IncognitoModeDeviceConnectedDialog } from './dialogs/incognitoModeDeviceConnectedDialog';
import { IncognitoModePasswordSetupDialog } from './dialogs/incognitoModePasswordSetupDialog';

// this is the toggle switch you see in settings -> appearance
// it handles all the logic for enabling/disabling incognito mode
export const IncognitoModeToggleSetting = () => {
  const { t } = useTranslation();
  const { toggleIncognitoMode, isIncognitoMode } = useIncognitoMode();
  const [deviceConnectedDialogOpen, setDeviceConnectedDialogOpen] = useState(false);
  const [passwordSetupDialogOpen, setPasswordSetupDialogOpen] = useState(false);

  // check if hardware wallet is connected
  const keystores = useKeystores() || [];
  const hasConnectedDevice = keystores.length > 0;

  const handleToggleClick = () => {
    // first check: if device is connected, show warning dialog
    if (hasConnectedDevice) {
      setDeviceConnectedDialogOpen(true);
      return;
    }

    if (!isIncognitoMode) {
      // turning incognito ON -> need to set up password first
      setPasswordSetupDialogOpen(true);
    } else {
      // turning incognito OFF -> just disable it, no password needed
      toggleIncognitoMode(false, '');
    }
  };

  const handlePasswordSubmit = (password: string) => {
    // user entered password in the setup dialog, now enable incognito
    console.log(`Password submitted: ${password}, enabling incognito mode`);
    toggleIncognitoMode(true, password); // send password to backend
    setPasswordSetupDialogOpen(false); // close dialog
  };

  return (
    <>
      {/* dialog that shows when device is connected */}
      <IncognitoModeDeviceConnectedDialog
        open={deviceConnectedDialogOpen}
        onClose={() => setDeviceConnectedDialogOpen(false)}
      />
      {/* dialog for setting up password when enabling incognito */}
      <IncognitoModePasswordSetupDialog
        open={passwordSetupDialogOpen}
        onClose={() => setPasswordSetupDialogOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
      {/* the actual toggle switch */}
      <SettingsItem
        settingName={t('incognitoMode.toggle')}
        secondaryText={t('newSettings.appearance.incognitoMode.description')}
        extraComponent={<Toggle checked={isIncognitoMode} onChange={handleToggleClick} />}
      />
    </>
  );
};
