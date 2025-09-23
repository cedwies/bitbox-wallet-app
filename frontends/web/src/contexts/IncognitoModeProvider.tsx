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

import { useState, useEffect, ReactNode } from 'react';
import { getConfig, setConfig } from '@/utils/config';
import { setIncognitoMode, getIncognitoMode } from '@/api/incognitomode';
import { IncognitoModeContext } from './IncognitoModeContext';

type TProps = {
  children: ReactNode;
}

// this provider wraps parts of the app that need to know about incognito mode
export const IncognitoModeProvider = ({ children }: TProps) => {
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // track if we've loaded config yet

  // when the component loads, we check the config for a saved incognito state
  useEffect(() => {
    getConfig()
      .then(config => {
        // use config if it exists
        if (!!config.frontend && 'incognitoMode' in config.frontend) {
          setIsIncognitoMode(config.frontend.incognitoMode);
          setIsInitialized(true);
          return;
        }
        // fallback to backend if no frontend config
        getIncognitoMode().then(mode => {
          setIsIncognitoMode(mode);
          setIsInitialized(true);
        });
      })
      .catch(console.error);
  }, []);

  // sync changes to backend, but wait until we've read config first
  // this prevents clearing accounts on startup
  useEffect(() => {
    if (isInitialized) {
      setIncognitoMode(isIncognitoMode);
    }
  }, [isIncognitoMode, isInitialized]);

  // this function is what the toggle button calls to change the mode
  const toggleIncognitoMode = (incognitoMode: boolean) => {
    setIsIncognitoMode(incognitoMode);
    getConfig()
      .then(config => {
        // Save incognito mode state to config
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
