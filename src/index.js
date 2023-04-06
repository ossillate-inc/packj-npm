import auditPackage from "./lib/auditPackage.js";
import getAuthCode from "./lib/getAuthCode.js";
import getAuthToken from "./lib/getAuthToken.js";
import setupSession from "./lib/setupSession.js";

// set up session -> gives you ID
const clientID = await setupSession();
if (!clientID) process.exit(1);

// get auth code
const authCode = await getAuthCode(clientID);
if (!authCode) process.exit(1);

// get auth token
const { access_token } = await getAuthToken(clientID, authCode);
if (!access_token) process.exit(1);

// audit package
const response = await auditPackage("npm", "react", access_token);
console.log(response);
