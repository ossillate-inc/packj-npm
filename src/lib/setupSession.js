import chalk from "chalk";
import {
  BASE_URL,
  GRANT_TYPE,
  HOSTNAME,
  SESSION_ENDPOINT,
} from "../config/config.js";
import axios from "axios";
import QueryString from "qs";
import * as readline from "node:readline/promises";

const signal = AbortSignal.timeout(60_000); // 1 minute
signal.addEventListener(
  "abort",
  () => {
    console.log("\nSession 1 minute timed out!");
  },
  { once: true }
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
    const prompt =
      "Visit the site below in your browser, follow the steps to authenticate, and then come back here to continue [ENTER]\n\t" +
      data.auth_url +
      "\n";

    const _ = await rl.question(prompt, { signal });

    return data.id;
  } catch (error) {
    console.error(chalk.red("Error setting up session"));
    console.error(chalk.red(error));
    return;
  }
}
