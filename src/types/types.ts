export type SessionData = {
  auth_url: string;
  id: string;
};

export type AuthCodeData = {
  code: string;
  state: string;
};

export type AuthTokenData = {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token: string;
};
