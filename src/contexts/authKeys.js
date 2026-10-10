// ─── Storage Key Maps ─────────────────────────────────────────────────────────
export const TOKEN_KEY = {
  superadmin: 'superadmin_token',
  admin:      'cityadmin_token',
  cityAdmin:  'cityadmin_token',
  partner:    'partner_token',
  customer:   'user_token',
};

export const USER_KEY = {
  superadmin: 'superadmin_user',
  admin:      'cityadmin_user',
  cityAdmin:  'cityadmin_user',
  partner:    'partner_user',
  customer:   'user_data',
};

export const LEGACY_TOKEN_KEY = 'norozz_token';
export const LEGACY_USER_KEY  = 'norozz_user';

export const getTokenKey = (role) => TOKEN_KEY[role] || 'user_token';
export const getUserKey  = (role) => USER_KEY[role]  || 'user_data';
