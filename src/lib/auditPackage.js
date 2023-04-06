import axios from "axios";
import { AUDIT_ENDPOINT, BASE_URL } from "../config/config.js";
import qs from "qs";
import chalk from "chalk";

export default async function auditPackage(packageManager, packageName, token) {
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
        Authorization: "Bearer " + token,
      },
    };

    const url = BASE_URL + AUDIT_ENDPOINT;
    const { data, error } = await axios.post(url, qs.stringify(params), config);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(chalk.red(error));
    return;
  }
}
