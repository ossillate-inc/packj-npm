import chalk from "chalk";

import {
  BASE_URL,
  HOSTNAME,
  REDIRECT_ENDPOINT,
  TOKEN_ENDPOINT,
} from "../config.js";

import axios from "axios";
import QueryString from "qs";

import { AuthTokenData } from "./types.js";

export default async function getAuthToken(clientID: string, authCode: string) {
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

    if (!data.access_token) throw new Error("Invalid auth token");
    if (!data.token_type) throw new Error("Invalid auth token");
    if (!data.scope) throw new Error("Invalid auth token");
    if (!data.refresh_token) throw new Error("Invalid auth token");

    return data;
  } catch (error) {
    console.error(chalk.red("Error getting auth token"));
    console.error(chalk.red(error));
    return;
  }
}
