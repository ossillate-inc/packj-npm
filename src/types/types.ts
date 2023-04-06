export type SessionData = {
  auth_url: string;
  id: string;
};

export type AuthCode = {
  code: string;
  state: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token: string;
};
