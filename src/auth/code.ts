import axios from "axios";

import { AUTH_ENDPOINT, BASE_URL, HOSTNAME } from "../config";

import * as QueryString from "qs";
import * as crypto from "node:crypto";

import { AuthCodeData } from "./types";

export default async function getAuthCode(clientID: string): Promise<undefined | string> {
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
    if (!data.code) throw "Invalid auth code"
    if (!data.state) throw "Invalid auth code"

    return data.code;
  } catch (error) {
    console.error(error)
    return;
  }
}
