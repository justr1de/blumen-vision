export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL — redireciona para página de login local
export const getLoginUrl = (returnTo?: string) => {
  const path = returnTo || window.location.pathname;
  return `/login?returnTo=${encodeURIComponent(path)}`;
};
