import chalk from "chalk";

import auditPackage from "./audit/main.js";
import getAuthCode from "./auth/code.js";
import getAuthToken from "./auth/token.js";
import setupSession from "./auth/session.js";

// set up session -> gives you ID
const clientID = await setupSession();
if (!clientID) process.exit(1);

// get auth code
const authCode = await getAuthCode(clientID);
if (!authCode) process.exit(1);

// get auth token
const access_token = await getAuthToken(clientID, authCode);
if (!access_token) process.exit(1);

// audit package
const response = await auditPackage("npm", "react", "latest", access_token);
console.log(response);
console.log(chalk.greenBright("Audit successfully!"));
process.exit();
