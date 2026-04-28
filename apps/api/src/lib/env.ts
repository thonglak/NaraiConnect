const required = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};

const optional = (key: string, fallback: string): string => process.env[key] ?? fallback;

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),

  DB_HOST: optional('DB_HOST', 'back_db'),
  DB_PORT: Number(optional('DB_PORT', '3306')),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: required('DB_PASSWORD'),
  DB_NAME: optional('DB_NAME', 'narai_portal2'),

  API_PORT: Number(optional('API_PORT', '3100')),
  API_PUBLIC_URL: optional('API_PUBLIC_URL', 'http://localhost:3100'),
  WEB_PUBLIC_URL: optional('WEB_PUBLIC_URL', 'http://localhost:3001'),

  // Path prefix when served behind a reverse proxy (e.g. "/sso_man").
  // Empty string in dev means cookie path stays at "/".
  APP_BASE_PATH: optional('APP_BASE_PATH', ''),

  SESSION_SECRET: required('SESSION_SECRET'),
  SESSION_COOKIE_NAME: optional('SESSION_COOKIE_NAME', 'ncadm_sid'),
  SESSION_MAX_AGE_SECONDS: Number(optional('SESSION_MAX_AGE_SECONDS', '28800')),

  OAUTH_CLIENT_ID: required('OAUTH_CLIENT_ID'),
  OAUTH_CLIENT_SECRET: required('OAUTH_CLIENT_SECRET'),
  OAUTH_AUTHORIZE_URL: required('OAUTH_AUTHORIZE_URL'),
  OAUTH_TOKEN_URL: required('OAUTH_TOKEN_URL'),
  OAUTH_USERINFO_URL: required('OAUTH_USERINFO_URL'),
  OAUTH_REDIRECT_URI: required('OAUTH_REDIRECT_URI'),
  OAUTH_SCOPE: optional('OAUTH_SCOPE', 'email'),
} as const;

export const isProd = env.NODE_ENV === 'production';
