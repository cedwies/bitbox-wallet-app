import { apiGet, apiPost } from '@/utils/request';

// tells the backend to flip incognito mode on or off
// when turning ON, you need to provide a password
// when turning OFF, password can be empty string
export const setIncognitoMode = (isIncognito: boolean, password: string = ''): Promise<null> => {
  return apiPost('set-incognito-mode', { incognitoMode: isIncognito, password });
};

// asks the backend if incognito mode is currently enabled
export const getIncognitoMode = (): Promise<boolean> => {
  return apiGet('incognito-mode');
};

// checks if the backend has a password stored (length > 0)
// this is used to decide whether to show the password gate or not
export const getIncognitoPasswordStatus = (): Promise<boolean> => {
  return apiGet('incognito-password-status');
};
