import axios from "axios";
import * as QueryString from "qs";
import { AUDIT_ENDPOINT, BASE_URL } from "../config";

type AuditPackageResponse = {
  package_manager: string
  packages: { name: string, risks: null | string[], version: string }[]
  request_name: string
  request_type: string
  url: string
}

export default async function auditPackage(
  packageManager: string,
  packageName: string,
  packageVersion: string,
  accessToken: string
): Promise<{
  success: AuditPackageResponse | false,
  error: {
    message: string
  } | false
}> {
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
    const { data } = await axios.post(url, QueryString.stringify(params), config);

    return { success: data, error: false }
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data
    }
  }
}
