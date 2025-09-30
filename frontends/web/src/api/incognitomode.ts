import { apiGet, apiPost } from '@/utils/request';

// what the backend tells us about incognito state
export interface IncognitoStatus {
  incognito: boolean; // is incognito mode turned on?
  locked: boolean; // are accounts encrypted and password not in memory?
}

// api calls for the new incognito endpoints

// ask backend what the current incognito situation is
export const getIncognitoStatus = (): Promise<IncognitoStatus> => {
  return apiGet('incognito/status');
};

// turn on incognito mode with a password
export const enableIncognitoMode = (password: string): Promise<{ success: boolean }> => {
  return apiPost('incognito/enable', { password });
};

// turn off incognito mode completely
export const disableIncognitoMode = (): Promise<{ success: boolean }> => {
  return apiPost('incognito/disable', {});
};

// unlock encrypted accounts with password
export const unlockIncognitoAccounts = (password: string): Promise<{ success: boolean }> => {
  return apiPost('incognito/unlock', { password });
};

// lock accounts back up (clear password from memory)
export const lockIncognitoAccounts = (): Promise<{ success: boolean }> => {
  return apiPost('incognito/lock', {});
};


