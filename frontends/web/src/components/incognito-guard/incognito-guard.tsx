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
import { getIncognitoMode, getIncognitoPasswordStatus } from '@/api/incognitomode';
import { IncognitoUnlock } from '@/routes/incognito-unlock/incognito-unlock';

type Props = {
  children: ReactNode;
}

// this is like a bouncer at the door - checks if you need to enter a password
// before you can access the app. only matters when incognito mode is on
export const IncognitoGuard = ({ children }: Props) => {
  const [isIncognitoMode, setIsIncognitoMode] = useState(false); // is incognito on?
  const [hasPassword, setHasPassword] = useState(false); // has password been set?
  const [isLoading, setIsLoading] = useState(true); // still checking backend

  useEffect(() => {
    const checkIncognitoStatus = async () => {
      try {
        // ask backend both questions at once to save time
        const [incognitoMode, passwordStatus] = await Promise.all([
          getIncognitoMode(), // is incognito mode enabled?
          getIncognitoPasswordStatus() // does the backend have a password stored?
        ]);

        setIsIncognitoMode(incognitoMode);
        setHasPassword(passwordStatus);
      } catch (error) {
        console.error('Failed to check incognito status:', error);
        // if something goes wrong, just assume everything is fine
        // better to let user through than block them forever
        setIsIncognitoMode(false);
        setHasPassword(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkIncognitoStatus();
  }, []);

  // show loading spinner while we check the backend
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // the key logic: if incognito is ON but no password is set,
  // show the password gate page instead of the normal app
  if (isIncognitoMode && !hasPassword) {
    return <IncognitoUnlock />;
  }

  // everything is fine, show the normal app
  return <>{children}</>;
};
