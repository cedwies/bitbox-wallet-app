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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogButtons } from '@/components/dialog/dialog';
import { Button } from '@/components/forms';
import { Input } from '@/components/forms';
import { A } from '@/components/anchor/anchor';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

// this is the dialog that pops up when you enable incognito mode
export const IncognitoModePasswordSetupDialog = ({ open, onClose, onSubmit }: Props) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // clear state when dialog is closed/opened
  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
    setError('');
  }, [open]);

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      setError(t('incognitoMode.passwordSetup.passwordsDonotMatch'));
      return;
    }
    if (!password) {
      // this case should be prevented by the disabled button, but as a fallback
      return;
    }
    onSubmit(password);
  };

  const passwordsMatch = password === confirmPassword && password !== '';

  return (
    <Dialog title={t('incognitoMode.passwordSetup.title')} medium onClose={onClose} open={open}>
      <p>{t('incognitoMode.passwordSetup.description')}</p>
      <p>For more info, see the <A href="/faq#incognito">FAQ</A>.</p>
      <div className="flex flex-col gap-4">
        <Input
          type="password"
          label={t('incognitoMode.passwordSetup.password')}
          value={password}
          onInput={e => setPassword(e.currentTarget.value)}
          autoFocus
        />
        <Input
          type="password"
          label={t('incognitoMode.passwordSetup.confirmPassword')}
          value={confirmPassword}
          onInput={e => setConfirmPassword(e.currentTarget.value)}
        />
      </div>
      {error && <p className="text-red-500 m-0">{error}</p>}
      <DialogButtons>
        <Button primary disabled={!passwordsMatch} onClick={handleSubmit}>
          {t('dialog.set')}
        </Button>
        <Button secondary onClick={onClose}>
          {t('dialog.cancel')}
        </Button>
      </DialogButtons>
    </Dialog>
  );
};
