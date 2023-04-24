import { Command } from '@oclif/core'
import { readFileSync, writeFileSync } from "node:fs";
import { CREDS_FILE_PATH } from '../config';
import setupSession from '../auth/session';
import getAuthCode from '../auth/code';
import getAuthToken from '../auth/token';

export default class Auth extends Command {
  static description = 'Authenticate user with the server.'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  private async setupSession() {
    try {
      const data = await setupSession();
      if (!data) throw 'Error setting up session'

      const { id: clientID, auth_url } = data;

      // get auth code
      const authCode = await getAuthCode(clientID);
      if (!authCode) throw 'Error getting auth code'

      // get auth token
      const authTokenData = await getAuthToken(clientID, authCode);
      if (!authTokenData) throw 'Error getting auth token'

      // Write data to ~/.packj.creds
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
      this.log("Successfully authenticated (account activated). You can run 'audit'.");
    } catch (err) {
      this.error("Failed to authenticate: " + err, {
        exit: 1
      });
    }
  }

  public async run(): Promise<void> {
    try {
      const fileText = readFileSync(CREDS_FILE_PATH, "utf8");
      const token = JSON.parse(fileText).token;
      const expiresAt = new Date(token.expires).valueOf();

      if (expiresAt < Date.now()) throw "Tokens expired!"
      this.log("Already authenticated. Nothing to do.");
    } catch (err: any) {
      this.log('Error loading credentials. Setup new credentials!')
      this.setupSession()
    }
  }
}
