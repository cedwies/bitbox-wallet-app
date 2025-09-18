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
import { Dialog, DialogButtons } from '@/components/dialog/dialog';
import { Button } from '@/components/forms';

type Props = {
  open: boolean;
  onClose: () => void;
}

// this is the little popup that shows up if you try to toggle incognito with a device plugged in
export const IncognitoModeDeviceConnectedDialog = ({ open, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog title={t('incognitoMode.deviceConnected.title')} medium onClose={onClose} open={open}>
      <p>{t('incognitoMode.deviceConnected.message')}</p>
      <DialogButtons>
                {/* just a simple confirm button, since it's only an info box */}
        <Button primary onClick={onClose}>{t('dialog.confirm')}</Button>
      </DialogButtons>
    </Dialog>
  );
};
