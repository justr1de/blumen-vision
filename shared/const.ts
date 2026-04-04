export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
export const NOT_SUPER_ADMIN_ERR_MSG = 'Super admin access required (10003)';

// Emails autorizados como super_admin
export const SUPER_ADMIN_EMAILS = [
  'contato@dataro-it.com.br',
  'anderson@blumenbiz.com',
  'camila@blumenbiz.com',
];

// Domínios que recebem admin automaticamente
export const ADMIN_EMAIL_DOMAINS = ['dataro-it.com.br'];
