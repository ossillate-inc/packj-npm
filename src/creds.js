import fs from "fs";
import path from "path";

export default class Creds {
  __id = null;
  __code = null;
  __token = null;
  __auth_url = null;
  __file = null;

  constructor(creds_file) {
    try {
      this.__file = path.resolve(creds_file);
      if (!fs.existsSync(this.__file)) {
        console.info(`${creds_file} does not exist!`);
        return;
      }
      const data = JSON.parse(fs.readFileSync(this.__file, "utf8"));
      this.__auth_url = data.auth_url || null;
      this.__code = data.code || null;
      this.__id = data.id || null;
      this.__token = data.token || null;
      console.info(`Loaded user ${this.__id} creds`);
    } catch (e) {
      throw new Error(`Failed to get user creds: ${e.message}`);
    }
  }

  save() {
    try {
      const data = {
        auth_url: this.__auth_url,
        code: this.__code,
        id: this.__id,
        token: this.__token,
      };
      fs.writeFileSync(this.__file, JSON.stringify(data));
    } catch (e) {
      log.error(`Failed to save user creds: ${e.message}`);
    }
  }

  get(typ) {
    try {
      switch (typ) {
        case "id":
          return this.__id;
        case "token":
          return this.__token;
        case "code":
          return this.__code;
        case "type":
          return "code";
        default:
          throw new Error(`Invalid cred type ${typ}`);
      }
    } catch (e) {
      log.error(`Failed to get cred: ${e.message}`);
      return null;
    }
  }

  update(typ, val) {
    try {
      switch (typ) {
        case "id":
          this.__id = val;
          break;
        case "code":
          this.__code = val;
          break;
        case "token":
          this.__token = val;
          break;
        case "auth_url":
          this.__auth_url = val;
          break;
        default:
          throw new Error(`Invalid cred type ${typ}`);
      }
      console.info(`Updated ${typ} to ${val}`);
    } catch (e) {
      log.error(`Failed to update cred: ${e.message}`);
    }
  }
}
