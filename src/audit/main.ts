import axios, { AxiosError } from "axios";
import qs from "qs";
import chalk from "chalk";

import { AUDIT_ENDPOINT, BASE_URL } from "../config.js";
import { AuditPackageResponse } from "./types.js";

export default async function auditPackage(
  packageManager: string,
  packageName: string,
  packageVersion: string,
  accessToken: string
): Promise<undefined | AuditPackageResponse> {
  try {
    const params = {
      package_manager: packageManager,
      request_type: "package",
      request_name: "test-npm",
      packages: JSON.stringify([
        { name: packageName, version: packageVersion },
      ]),
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
  } catch (error: any) {
    console.error(chalk.red(JSON.stringify(error.response.data)));
    return;
  }
}
