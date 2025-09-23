import { useState } from 'react';
import { Button } from '@/components/forms';
import { Input } from '@/components/forms';
import { apiPost } from '@/utils/request';
import styles from './incognito-unlock.module.css';

// this is basically the "password gate" page - when incognito mode is on
// but no password has been set yet, this page blocks everything else
export const IncognitoUnlock = () => {
  const [password, setPassword] = useState(''); // what the user types
  const [error, setError] = useState(''); // error message if password is wrong
  const [isLoading, setIsLoading] = useState(false); // show spinner while checking

  const handleSubmit = async () => {
    // dont do anything if theres no password
    if (!password) {
      return;
    }

    setIsLoading(true); // show loading state
    setError(''); // clear any previous errors

    try {
      // send password to backend to unlock accounts
      await apiPost('unlock-incognito', { password });
      // if we get here, password was correct! reload the page
      // and the app should work normally now
      window.location.reload();
    } catch (err) {
      // password was wrong, show error and stop loading
      setError('Wrong password. Please try again.');
      setIsLoading(false);
    }
  };

  // let user press enter to submit instead of clicking button
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
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
            label="Password"
            value={password}
            onInput={e => setPassword(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            autoFocus // cursor starts here automatically
          />

          {/* show error message if password was wrong */}
          {error && <p className={styles.error}>{error}</p>}

          <Button
            primary
            disabled={!password || isLoading} // disable if no password or loading
            onClick={handleSubmit}
          >
            {isLoading ? 'Unlocking...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
};
