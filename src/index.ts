import chalk from "chalk";
import auditPackage from "./audit/main.js";
import getAuthCode from "./auth/code.js";
import getAuthToken from "./auth/token.js";
import setupSession from "./auth/session.js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { CREDS_FILE_PATH } from "./config.js";

const usageText = `
  usage: main audit PACKAGES [PACKAGES ...]
  
  args: 
    PACKAGES: Audit packages (e.g., npm:axios), optionally specific version (e.g., npm:axios:1.3.5) 
`;

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
  var fetch = 0;
  try {

    const fileText = readFileSync(CREDS_FILE_PATH, "utf8");
    const token = JSON.parse(fileText).token;
	const expiresAt = new Date(token.expires).valueOf()

    if (expiresAt < Date.now()) {
      throw Error('Tokens expired!')
    }
    console.log("Already authenticated. Nothing to do.");
    process.exit(1);
  } catch (err: any) {
      console.log(err)
      if (err.code !== 'ENOENT') {
		// nothing to do, fall through
      } else if (err.code !== 'ENOENT') {
      } else {
        console.log(chalk.red("Error loading credentials. Ignoring."));
      }
  };

  try {
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
        expires: new Date(Date.now() + 3600*1000),
      },
    };
    writeFileSync(CREDS_FILE_PATH, JSON.stringify(content), { flag: "w" });
    console.log("Successfully authenticated (account activated).");
  } catch (err) {
    console.log(chalk.red("Failed to authenticate: @{err}"));
  }
  process.exit();
}

if (option === "audit") {
  if (args.length < 4) {
    console.log(usageText);
    process.exit();
  }

  const [packageManager, packageName, packageVersion] = args[3].split(":");
  if (!packageManager || !packageName) {
    console.log(chalk.red("Error: Invalid input"));
    console.log(usageText);
    process.exit(1);
  }

  if (!existsSync(CREDS_FILE_PATH)) {
      console.log(chalk.red("User not authenticated. Run 'auth' before 'audit'"));
      process.exit(1);
  }

  const fileText = readFileSync(CREDS_FILE_PATH, "utf8");
  const accessToken = JSON.parse(fileText).token.access_token;
  if (!accessToken) {
    console.log(chalk.red("Invalid client ID"));
    process.exit(1);
  }

  // Audit package
  const response = await auditPackage(
    packageManager,
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
