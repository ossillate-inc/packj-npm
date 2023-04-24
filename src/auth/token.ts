import {
  BASE_URL,
  HOSTNAME,
  REDIRECT_ENDPOINT,
  TOKEN_ENDPOINT,
} from "../config";

import axios from "axios";
import * as QueryString from "qs";

import { AuthTokenData } from "./types";

export default async function getAuthToken(clientID: string, authCode: string): Promise<undefined | AuthTokenData> {
  try {
    const params = {
      client_id: clientID,
      code: authCode,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_ENDPOINT,
    };

    const config = {
      headers: {
        "User-Agent": "npm",
        From: HOSTNAME,
      },
    };

    const url = BASE_URL + TOKEN_ENDPOINT;

    const { data }: { data: AuthTokenData } = await axios.post(
      url,
      QueryString.stringify(params),
      config
    );

    if (!data.access_token) throw "Invalid auth token"
    if (!data.token_type) throw "Invalid auth token"
    if (!data.scope) throw "Invalid auth token"
    if (!data.refresh_token) throw "Invalid auth token"

    return data;
  } catch (error) {
    console.error(error)
    return;
  }
}
