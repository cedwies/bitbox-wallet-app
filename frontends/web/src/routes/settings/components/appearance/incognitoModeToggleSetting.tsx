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

import { useTranslation } from 'react-i18next';
import { useIncognitoMode } from '@/hooks/incognitoMode';
import { Toggle } from '@/components/toggle/toggle';
import { SettingsItem } from '@/routes/settings/components/settingsItem/settingsItem';

// this is the actual toggle component that you see in the settings
export const IncognitoModeToggleSetting = () => {
  const { t } = useTranslation();
  const { toggleIncognitoMode, isIncognitoMode } = useIncognitoMode();
  return (
    <SettingsItem
      settingName={t('incognitoMode.toggle')}
      secondaryText={t('newSettings.appearance.incognitoMode.description')}
      extraComponent={<Toggle checked={isIncognitoMode} onChange={() => toggleIncognitoMode(!isIncognitoMode)} />}
    />
  );
};
