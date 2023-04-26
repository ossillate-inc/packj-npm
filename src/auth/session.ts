import { BASE_URL, GRANT_TYPE, HOSTNAME, SESSION_ENDPOINT } from "../config";

import axios from "axios";
import * as QueryString from "qs";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line node/no-missing-import
import * as readline from "node:readline/promises";

import { SessionData } from "./types";

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

export default async function setupSession(): Promise<undefined | SessionData> {
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

    const { data }: { data: SessionData } = await axios.post(
      url,
      QueryString.stringify(params),
      config
    );

    // Validate data
    if (!data.auth_url) throw "Invalid session data"
    if (!data.id) throw "Invalid session data"

    // Manual user auth
    const prompt =
      "Visit the site below in your browser, follow the steps to authenticate, and then come back here to continue [ENTER]\n\t" +
      data.auth_url +
      "\n";

    await rl.question(prompt, { signal });

    return data;
  } catch (error) {
    console.error(error)
    return;
  }
}
