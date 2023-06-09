import os from "os";

export const BASE_URL = "https://packj.dev";

export const AUTH_ENDPOINT = "/oauth/authorize";
export const SESSION_ENDPOINT = "/api/v1/cli/npm/sessions";
export const TOKEN_ENDPOINT = "/oauth/token";
export const REDIRECT_ENDPOINT = "/oauth/code/callback";
export const AUDIT_ENDPOINT = "/api/v1/audit";

export const PACKJ_VERSION = "0.15";

export const HOSTNAME = os.hostname();

export const GRANT_TYPE = "code";
