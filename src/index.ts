import chalk from "chalk";
import auditPackage from "./audit/main.js";
import getAuthCode from "./auth/code.js";
import getAuthToken from "./auth/token.js";
import setupSession from "./auth/session.js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import * as readline from 'node:readline'
import * as fs from 'node:fs'
import { CREDS_FILE_PATH } from "./config.js";

const usageText = `
  usage: main COMMAND [-f] PACKAGE [DEPENDENCY_FILE]

  COMMAND:
    auth    Authenticate user with the server.
    audit   Audit packages for malware/risky attributes

  FLAGS:
    -f DEPENDENCY_FILE: Audit dependency file
  
  ARGS: 
    PACKAGES: Audit packages (e.g., npm:axios), optionally specific version (e.g., npm:axios:1.3.5) 
`;

const args = process.argv;

if (args.length < 3) {
  console.log(usageText);
  process.exit();
}

const option = args[2] as "auth" | "audit";

if (option === "auth") {
  var fetch = 0;

  try {
    const fileText = readFileSync(CREDS_FILE_PATH, "utf8");
    const token = JSON.parse(fileText).token;
    const expiresAt = new Date(token.expires).valueOf();

    if (expiresAt < Date.now()) {
      throw "Tokens expired! Reauthenticate..."
    }
    console.log("Already authenticated. Nothing to do.");
    process.exit(1);
  } catch (err: any) {
    console.log(err);
    if (err.code !== "ENOENT") {
      // nothing to do, fall through
    } else if (err.code !== "ENOENT") {
    } else {
      console.error(chalk.red("Error: Error loading credentials. Ignoring."));
    }
  }

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
        expires: new Date(Date.now() + 3600 * 1000),
      },
    };
    writeFileSync(CREDS_FILE_PATH, JSON.stringify(content), { flag: "w" });
    console.log("Successfully authenticated (account activated).");
  } catch (err) {
    console.error(chalk.red("Error: Failed to authenticate: @{err}"));
  }
  process.exit();
}

if (option === "audit") {
  if (args.length < 4) {
    console.log(usageText);
    process.exit();
  }

  if (!existsSync(CREDS_FILE_PATH)) {
    console.error(chalk.red("Error: User not authenticated. Run 'auth' before 'audit'"));
    process.exit(1);
  }

  const fileText = readFileSync(CREDS_FILE_PATH, "utf8");
  const accessToken = JSON.parse(fileText).token.access_token;
  if (!accessToken) {
    console.error(chalk.red("Error: Invalid client ID"));
    process.exit(1);
  }

  const flag = args[3]

  if (flag === '-f') {
    const dependencyFile = args[4]

    if (!dependencyFile || dependencyFile.split(':').length > 2) {
      console.log(usageText);
      process.exit();
    }

    const [packageManager, filePath] = dependencyFile.split(':')
    if (!packageManager || !filePath) {
      console.log(chalk.red('Error: Invalid package file format.'));
      process.exit(1)
    }

    if (!existsSync(filePath)) {
      console.error(chalk.red("Error: Invalid file path"));
      process.exit(1);
    }

    if (packageManager === 'pypi') {
      const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
      });

      const output = []
      for await (const line of readInterface) {
        const [packageName, packageVersion] = line.split('==')
        const response = await auditPackage(packageManager, packageName, packageVersion, accessToken)
        if (!response) {
          console.error(chalk.red('Error: Error auditing dependency file'));
          process.exit(1)
        }

        const formattedResponse = {
          package_manager: response.package_manager,
          package_name: response.packages[0].name,
          package_version: response.packages[0].version,
          risks: response.packages[0].risks,
          url: response.url
        }
        output.push(formattedResponse)
      }
      console.table(output, Object.keys(output[0]))
      process.exit()
    }

    const packageFile = readFileSync(filePath, 'utf8')
    const dependencyObject = JSON.parse(packageFile).dependencies

    const output = []
    for (const [packageName, packageVersion] of Object.entries(dependencyObject)) {
      const response = await auditPackage(packageManager, packageName, packageVersion as string, accessToken)
      if (!response) {
        console.error(chalk.red('Error: Error auditing package.'));
        process.exit(1)
      }

      const formattedResponse = {
        package_manager: response.package_manager,
        package_name: response.packages[0].name,
        package_version: response.packages[0].version,
        risks: response.packages[0].risks,
        url: response.url
      }
      output.push(formattedResponse)
    }

    console.table(output, Object.keys(output[0]))
    process.exit()
  }

  const [packageManager, packageName, packageVersion] = args[3].split(":");
  if (!packageManager || !packageName) {
    console.error(chalk.red("Error: Invalid input"));
    console.log(usageText);
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

  const formattedResponse = {
    package_manager: response.package_manager,
    package_name: response.packages[0].name,
    package_version: response.packages[0].version,
    risks: response.packages[0].risks,
    url: response.url
  }
  console.table([formattedResponse], Object.keys(formattedResponse))
  process.exit();
}
