import chalk from "chalk";
import {
  BASE_URL,
  GRANT_TYPE,
  HOSTNAME,
  SESSION_ENDPOINT,
} from "../config/config.js";
import axios from "axios";
import QueryString from "qs";
import create from "prompt-sync";

const prompt = create();

export default async function setupSession() {
  try {
    const params = {
      hostname: HOSTNAME,
      auth_type: GRANT_TYPE,
    };

    const config = {
      headers: {
        "User-Agent": "npm",
        From: HOSTNAME,
      },
    };

    const url = BASE_URL + SESSION_ENDPOINT;

    const { data, error } = await axios.post(
      url,
      QueryString.stringify(params),
      config
    );

    if (error) throw error;

    // Validate data
    if (!data.auth_url) throw new Error("Invalid session data");
    if (!data.id) throw new Error("Invalid session data");

    // Manual user auth
    prompt(
      "Visit the site below in your browser, follow the steps to authenticate, and then come back here to continue [ENTER]\n\t" +
        data.auth_url
    );

    return data.id;
  } catch (error) {
    console.error(chalk.red("Error setting up session"));
    console.error(chalk.red(error));
    return;
  }
}
