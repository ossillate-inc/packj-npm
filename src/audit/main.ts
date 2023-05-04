import axios, { AxiosError } from "axios";
import qs from "qs";
import chalk from "chalk";

import { AUDIT_ENDPOINT, BASE_URL } from "../config.js";
import { AuditPackageResponse } from "./types.js";

export default async function auditPackage(
  requestName: string,
  requestType: string,
  packageManager: string,
  packageName: string,
  packageVersion: string,
  accessToken: string
): Promise<undefined | AuditPackageResponse> {
  try {
    const payload = {
      request_type: requestType,
      request_name: requestName,
      package_manager: packageManager,
      packages: [
        { name: packageName, version: packageVersion },
      ],
    };

    const config = {
      headers: {
        "User-Agent": "npm",
        "From": "host",
        "Content-length": Buffer.byteLength(JSON.stringify(payload)),
        "Authorization": "Bearer " + accessToken,
      },
    };

    const url = BASE_URL + AUDIT_ENDPOINT;
    const { data } = await axios.post(url, payload, config);

    return data;
  } catch (error: any) {
    console.error(chalk.red(JSON.stringify(error.response.data)));
    return;
  }
}
