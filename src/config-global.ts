import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  apiUrl: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Property Management System',
  appVersion: packageJson.version,
  apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
};
