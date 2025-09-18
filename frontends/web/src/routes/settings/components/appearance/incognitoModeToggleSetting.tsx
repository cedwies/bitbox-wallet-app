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

// this is the actual toggle component that you see in the settings
export const IncognitoModeToggleSetting = () => {
  const { t } = useTranslation();
  const { toggleIncognitoMode, isIncognitoMode } = useIncognitoMode();
    const [dialogOpen, setDialogOpen] = useState(false); // for the 'device connected' popup

    // useKeystores is practical, it updates automatically when a device is connected or disconnected
  const keystores = useKeystores() || [];
  const hasConnectedDevice = keystores.length > 0;

    // this is what happens when you click the toggle
  const handleToggleClick = () => {
        // if a device is plugged in, we show the popup instead of toggling
    if (hasConnectedDevice) {
      setDialogOpen(true);
    } else {
      // no device? cool, just toggle the mode
      toggleIncognitoMode(!isIncognitoMode);
    }
  };

  return (
    <>
            {/* the popup dialog, it's hidden until you click the toggle with a device connected */}
      <IncognitoModeDeviceConnectedDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
      <SettingsItem
        settingName={t('incognitoMode.toggle')}
        secondaryText={t('newSettings.appearance.incognitoMode.description')}
        extraComponent={<Toggle checked={isIncognitoMode} onChange={handleToggleClick} />}
      />
    </>
  );
};
