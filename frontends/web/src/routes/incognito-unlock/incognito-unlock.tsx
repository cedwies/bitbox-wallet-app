import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/forms';
import { Input } from '@/components/forms';
import { unlockIncognitoAccounts, disableIncognitoMode } from '@/api/incognitomode';
import styles from './incognito-unlock.module.css';

// the password screen that shows when incognito is locked
export const IncognitoUnlock = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState(''); // what user typed
  const [error, setError] = useState(''); // error message to show
  const [isLoading, setIsLoading] = useState(false); // unlocking in progress
  const [isDeactivating, setIsDeactivating] = useState(false); // deactivating in progress

  const handleSubmit = async () => {
    // need a password to do anything
    if (!password) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // try to unlock with the password
      await unlockIncognitoAccounts(password);
      // if it worked, reload the page so everything refreshes
      window.location.reload();
    } catch (err) {
      // probably wrong password
      setError('wrong password, try again');
      setIsLoading(false);
    }
  };

  // let people hit enter instead of clicking
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // turn off incognito completely
  const handleDeactivate = async () => {
    setIsDeactivating(true);
    setError('');

    try {
      // tell backend to disable incognito
      await disableIncognitoMode();
      // reload to go back to normal mode
      window.location.reload();
    } catch (err) {
      // something went wrong
      setError('couldnt turn off incognito mode');
      setIsDeactivating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Hello</h1>
        <p>Please enter your incognito password to continue.</p>

        <div className={styles.form}>
          <Input
            type="password"
            label={t('incognitoMode.passwordSetup.password')}
            value={password}
            onInput={e => setPassword(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            autoFocus // cursor starts here automatically
          />

          {/* show error message if password was wrong */}
          {error && <p className={styles.error}>{error}</p>}

          <Button
            primary
            disabled={!password || isLoading || isDeactivating} // disable if no password or loading
            onClick={handleSubmit}
          >
            {isLoading ? 'Unlocking...' : 'Confirm'}
          </Button>

          {/* Deactivate incognito mode button */}
          <Button
            secondary
            disabled={isLoading || isDeactivating}
            onClick={handleDeactivate}
          >
            {isDeactivating ? 'Deactivating...' : t('incognitoMode.deactivate')}
          </Button>
        </div>
      </div>
    </div>
  );
};
