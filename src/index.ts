import chalk from "chalk";
import auditPackage from "./audit/main.js";
import getAuthCode from "./auth/code.js";
import getAuthToken from "./auth/token.js";
import setupSession from "./auth/session.js";
import { readFileSync, writeFileSync } from "node:fs";
import { CREDS_FILE_PATH } from "./config.js";

const args = process.argv;

if (args.length < 3) {
  const usageText = `
    usage: main [options] args

    Packj flags malicious/risky open-source packages

    args:
      auth                Authenticate user with the server.
      audit               Audit packages for malware/risky attributes
  `;
  console.log(usageText);
  process.exit();
}

const option = args[2] as "auth" | "audit";

if (option === "auth") {
  const data = await setupSession();
  if (!data) process.exit(1);

  const { id: clientID, auth_url } = data;

  // get auth code
  const authCode = await getAuthCode(clientID);
  if (!authCode) process.exit(1);

  // get auth token
  const authTokenData = await getAuthToken(clientID, authCode);
  if (!authTokenData) process.exit(1);

  // TODO: Write data to ~/.packj.creds
  const content = {
    auth_url,
    code: authCode,
    id: clientID,
    token: {
      ...authTokenData,
      expires: "<expire>", // TODO: change
    },
  };
  writeFileSync(CREDS_FILE_PATH, JSON.stringify(content), { flag: "w" });
  process.exit();
}

if (option === "audit") {
  if (args.length < 4) {
    const usageText = `
    usage: main audit PACKAGES

    args: 
      PACKAGES: Audit packages (e.g., axios:1.3.5)
  `;
    console.log(usageText);
    process.exit();
  }

  if (args[3].split(":").length < 2) {
    console.log(chalk.red("Error: Invalid package"));
    process.exit(1);
  }

  const [packageName, packageVersion] = args[3].split(":");

  const fileText = readFileSync(CREDS_FILE_PATH, "utf8");
  const accessToken = JSON.parse(fileText).token.access_token; // TODO: read from ~/.packj.creds
  if (!accessToken) {
    console.log(chalk.red("Error: Invalid client ID"));
    process.exit(1);
  }

  // Audit package
  const response = await auditPackage(
    "npm",
    packageName,
    packageVersion,
    accessToken
  );
  if (!response) process.exit(1);

  console.log(response);
  console.log();
  console.log(chalk.greenBright("Audit successfully!"));
  process.exit();
}
