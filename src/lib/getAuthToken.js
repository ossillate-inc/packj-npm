import chalk from "chalk";
import {
  BASE_URL,
  HOSTNAME,
  REDIRECT_ENDPOINT,
  TOKEN_ENDPOINT,
} from "../config/config.js";
import axios from "axios";
import QueryString from "qs";

export default async function getAuthToken(clientID, authCode) {
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

    const { data, error } = await axios.post(
      url,
      QueryString.stringify(params),
      config
    );

    if (error) throw error;

    console.log("auth token:", data);

    return data;
  } catch (error) {
    console.error(chalk.red("Error getting auth token"));
    console.error(chalk.red(error));
    return;
  }
}
