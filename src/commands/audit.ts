import { Args, Command, Flags } from '@oclif/core'
import auditPackage from '../audit/main'
import { existsSync, readFileSync } from 'fs'
import { CREDS_FILE_PATH } from '../config'

export default class Audit extends Command {
  static description = 'Audit packages for malware/risky attributes'

  static examples = [
    '<%= config.bin %> <%= command.id %> npm:axios:1.3.5',
    '<%= config.bin %> <%= command.id %> pypi:requests:1.0',
  ]

  static flags = {
    file: Flags.boolean({ char: 'f' }),
  }

  static args = {
    package: Args.string({
      required: true
    })
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Audit)

    if (flags.file) return

    const [packageManager, packageName, packageVersion] = args.package.split(":");

    if (!packageManager || !packageName || !packageVersion) this.error('Wrong package format', {
      exit: 1
    })

    if (!existsSync(CREDS_FILE_PATH)) {
      this.error("User not authenticated. Please run 'auth' before 'audit'", {
        exit: 1
      })
    }

    const fileText = readFileSync(CREDS_FILE_PATH, "utf8");
    const accessToken = JSON.parse(fileText).token.access_token;
    if (!accessToken) this.error("Invalid client ID", {
      exit: 1
    })

    // Audit package
    const { success, error } = await auditPackage(
      packageManager,
      packageName,
      packageVersion,
      accessToken
    );
    if (error) this.error(error.message + " Please run 'auth' again.", {
      exit: 1
    })

    console.log(success);
    this.log("Audit successfully!")
  }
}
