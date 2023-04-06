import axios from "axios";
import { AUTH_ENDPOINT, BASE_URL, HOSTNAME } from "../config/config.js";
import QueryString from "qs";
import chalk from "chalk";
import crypto from "crypto";
import { AuthCodeData } from "../types/types.js";

export default async function getAuthCode(clientID: string) {
  try {
    const state = crypto
      .createHash("sha1")
      .update(Math.random().toString())
      .digest("hex");

    const params = {
      client_id: clientID,
      response_type: "code",
      scope: "audit",
      state,
    };

    const config = {
      headers: {
        "User-Agent": "npm",
        From: HOSTNAME,
      },
    };

    const url = BASE_URL + AUTH_ENDPOINT;

    const { data }: { data: AuthCodeData } = await axios.post(
      url + "?" + QueryString.stringify(params),
      config
    );

    // Validate data
    if (!data.code) throw new Error("Invalid auth code");
    if (!data.state) throw new Error("Invalid auth code");

    return data.code;
  } catch (error) {
    console.error(chalk.red("Error getting auth code"));
    console.error(chalk.red(error));
    return;
  }
}
