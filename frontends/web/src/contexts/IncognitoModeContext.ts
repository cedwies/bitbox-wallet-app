import { createContext } from 'react';

// defines what data the incognito mode context provides
// basically just the current state and a function to change it
type IncognitoModeContextProps = {
  isIncognitoMode: boolean; // is incognito mode currently on?
  toggleIncognitoMode: (incognitoMode: boolean, password?: string) => void; // function to turn it on/off
}

// create the actual context that components can use
export const IncognitoModeContext = createContext<IncognitoModeContextProps>({} as IncognitoModeContextProps);
