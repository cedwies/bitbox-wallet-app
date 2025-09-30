import { createContext } from 'react';
import { IncognitoStatus } from '@/api/incognitomode';

// what the incognito context gives you
type IncognitoModeContextProps = {
  // new stuff - use these
  status: IncognitoStatus; // current state from backend
  isInitialized: boolean; // have we loaded the initial status yet?
  enable: (password: string) => Promise<void>; // turn on incognito with password
  disable: () => Promise<void>; // turn off incognito completely
  unlock: (password: string) => Promise<void>; // unlock encrypted accounts
  lock: () => Promise<void>; // lock accounts (clear password from memory)
  refreshStatus: () => Promise<void>; // reload status from backend

  // old stuff - still works but use the new api instead
  isIncognitoMode: boolean; // just status.incognito
  toggleIncognitoMode: (incognitoMode: boolean, password?: string) => Promise<void>; // old toggle function
}

// the actual react context
export const IncognitoModeContext = createContext<IncognitoModeContextProps>({} as IncognitoModeContextProps);
