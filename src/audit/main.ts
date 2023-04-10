import axios from "axios";
import qs from "qs";
import chalk from "chalk";

import { AUDIT_ENDPOINT, BASE_URL } from "../config.js";

export default async function auditPackage(
  packageManager: string,
  packageName: string,
  accessToken: string
) {
  try {
    const params = {
      package_manager: packageManager,
      request_type: "package",
      request_name: "test-npm",
      packages: JSON.stringify([{ name: packageName, version: "" }]),
    };

    const config = {
      headers: {
        "User-Agent": "npm",
        From: "host",
        Authorization: "Bearer " + accessToken,
      },
    };

    const url = BASE_URL + AUDIT_ENDPOINT;
    const { data } = await axios.post(url, qs.stringify(params), config);

    return data;
  } catch (error) {
    console.error(chalk.red(error));
    return;
  }
}
