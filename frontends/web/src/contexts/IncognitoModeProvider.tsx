import { useState, useEffect, ReactNode } from 'react';
import { getConfig, setConfig } from '@/utils/config';
import { setIncognitoMode, getIncognitoMode } from '@/api/incognitomode';
import { IncognitoModeContext } from './IncognitoModeContext';

type TProps = {
  children: ReactNode;
}

// this provider manages incognito mode state across the whole app
// it handles syncing between frontend config and backend state
export const IncognitoModeProvider = ({ children }: TProps) => {
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // prevents race conditions on startup

  // on startup, load the incognito state from config
  useEffect(() => {
    getConfig()
      .then(config => {
        // first try to get it from frontend config (saved locally)
        if (!!config.frontend && 'incognitoMode' in config.frontend) {
          setIsIncognitoMode(config.frontend.incognitoMode);
          setIsInitialized(true);
          return;
        }
        // if no frontend config, ask the backend
        getIncognitoMode().then(mode => {
          setIsIncognitoMode(mode);
          setIsInitialized(true);
        });
      })
      .catch(console.error);
  }, []);

  // sync state changes to backend, but only after we've loaded initial state
  // this prevents accidentally clearing accounts on startup
  useEffect(() => {
    if (isInitialized) {
      setIncognitoMode(isIncognitoMode, ''); // empty password for regular syncing
    }
  }, [isIncognitoMode, isInitialized]);

  // this is the main function that components call to toggle incognito mode
  const toggleIncognitoMode = (incognitoMode: boolean, password?: string) => {
    setIsIncognitoMode(incognitoMode); // update local state

    // tell backend about the change (with password if provided)
    setIncognitoMode(incognitoMode, password || '');

    // also save to frontend config so it persists across restarts
    getConfig()
      .then(config => {
        setConfig({
          frontend: {
            ...config.frontend,
            incognitoMode,
          }
        });
      });
  };

  return (
    <IncognitoModeContext.Provider value={{ isIncognitoMode, toggleIncognitoMode }}>
      {children}
    </IncognitoModeContext.Provider>
  );
};
