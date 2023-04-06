export type SessionData = {
  auth_url: string;
  id: string;
};

export type AuthCode = {
  code: string;
  state: string;
};
