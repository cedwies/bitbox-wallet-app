/**
 * Copyright 2025 Shift Crypto AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
