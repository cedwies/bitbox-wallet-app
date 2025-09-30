import { useState, useEffect, ReactNode } from 'react';
import {
  getIncognitoStatus,
  enableIncognitoMode,
  disableIncognitoMode,
  unlockIncognitoAccounts,
  lockIncognitoAccounts,
  IncognitoStatus
} from '@/api/incognitomode';
import { IncognitoModeContext } from './IncognitoModeContext';

type TProps = {
  children: ReactNode;
}

// manages incognito state for the whole app - backend is the source of truth
export const IncognitoModeProvider = ({ children }: TProps) => {
  const [status, setStatus] = useState<IncognitoStatus>({ incognito: false, locked: false });
  const [isInitialized, setIsInitialized] = useState(false);

  // grab the current status from backend
  const loadStatus = async () => {
    try {
      const newStatus = await getIncognitoStatus();
      setStatus(newStatus);
      setIsInitialized(true);
    } catch (error) {
      console.error('couldnt load incognito status:', error);
      // if we can't reach backend, assume worst case (locked)
      setStatus({ incognito: true, locked: true });
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // wrapper functions that components can call
  const enable = async (password: string) => {
    try {
      await enableIncognitoMode(password);
      await loadStatus(); // get fresh status after change
    } catch (error) {
      console.error('couldnt enable incognito:', error);
      throw error;
    }
  };

  const disable = async () => {
    try {
      await disableIncognitoMode();
      await loadStatus(); // get fresh status after change
    } catch (error) {
      console.error('couldnt disable incognito:', error);
      throw error;
    }
  };

  const unlock = async (password: string) => {
    try {
      await unlockIncognitoAccounts(password);
      await loadStatus(); // get fresh status after change
    } catch (error) {
      console.error('couldnt unlock accounts:', error);
      throw error;
    }
  };

  const lock = async () => {
    try {
      await lockIncognitoAccounts();
      await loadStatus(); // get fresh status after change
    } catch (error) {
      console.error('couldnt lock accounts:', error);
      throw error;
    }
  };

  // old way of doing things - kept so existing code doesn't break
  const toggleIncognitoMode = async (incognitoMode: boolean, password?: string) => {
    if (incognitoMode) {
      if (!password) {
        throw new Error('need password to turn on incognito');
      }
      await enable(password);
    } else {
      await disable();
    }
  };

  const contextValue = {
    // new api - use these
    status,
    isInitialized,
    enable,
    disable,
    unlock,
    lock,
    refreshStatus: loadStatus,

    // old api - still works but prefer the new stuff
    isIncognitoMode: status.incognito,
    toggleIncognitoMode,
  };

  return (
    <IncognitoModeContext.Provider value={contextValue}>
      {children}
    </IncognitoModeContext.Provider>
  );
};
