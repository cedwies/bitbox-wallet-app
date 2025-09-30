import { useState, useEffect, ReactNode } from 'react';
import { getIncognitoStatus, IncognitoStatus } from '@/api/incognitomode';
import { IncognitoUnlock } from '@/routes/incognito-unlock/incognito-unlock';

type Props = {
  children: ReactNode;
}

// acts like a bouncer - if incognito is on and locked, shows password screen
// otherwise lets you into the app normally
export const IncognitoGuard = ({ children }: Props) => {
  const [status, setStatus] = useState<IncognitoStatus>({ incognito: false, locked: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIncognitoStatus = async () => {
      try {
        // ask backend what the situation is
        const incognitoStatus = await getIncognitoStatus();
        setStatus(incognitoStatus);
      } catch (error) {
        console.error('couldnt check incognito status:', error);
        // if we can't reach backend, be safe and assume locked
        setStatus({ incognito: true, locked: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkIncognitoStatus();
  }, []);

  // show loading while we figure out what's going on
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // if incognito is on AND locked, show the unlock screen
  if (status.incognito && status.locked) {
    return <IncognitoUnlock />;
  }

  // otherwise show the normal app
  return <>{children}</>;
};
