const SITE_LINKS = {
  index: '/',
  register: '/register',
  login: '/login',
  confirm_email: '/confirm-email',
  forgot_password: '/forgot-password',

  dashboard: '/under_construction',
  crypto_dashboard: '/crypto_dashboard',
  stock_dashboard: '/under_construction',
  currency_dashboard: '/under_construction',

  email_digest: '/under_construction',
  profile: '/profile',
};

export type LinkName = keyof typeof SITE_LINKS

export default SITE_LINKS;
