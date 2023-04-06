import getAuthCode from "./lib/getAuthCode.js";
import getAuthToken from "./lib/getAuthToken.js";
import setupSession from "./lib/setupSession.js";

// 1. set up session -> gives you ID
const clientID = await setupSession();
if (!clientID) process.exit(1);

// 2. get auth code
const authCode = await getAuthCode(clientID);
if (!authCode) process.exit(1);

// 3. get auth token
const authToken = await getAuthToken(clientID, authCode);
console.log(authToken);
if (!authToken) process.exit(1);
