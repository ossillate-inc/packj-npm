import { Args, Command, Flags, ux } from '@oclif/core'
import auditPackage from '../audit/main'
import { existsSync, readFileSync } from 'fs'
import { CREDS_FILE_PATH } from '../config'
import * as readline from 'node:readline'
import * as fs from 'node:fs'
export default class Audit extends Command {
  static description = 'Audit packages for malware/risky attributes'

  static examples = [
    '<%= config.bin %> <%= command.id %> npm:axios:1.3.5',
    '<%= config.bin %> <%= command.id %> pypi:requests:1.0',
    '<%= config.bin %> <%= command.id %> --file npm:package.json',
    '<%= config.bin %> <%= command.id %> -f pypi:requirements.txt',
  ]

  static flags = {
    file: Flags.string({
      char: 'f',
      name: 'Package file',
      description: 'Package name for auditing. Eg: npm:package.json, pypi:requirements.txt, etc.',
      exists: true
    }),
  }

  static args = {
    package: Args.string({
      name: 'Package name',
      description: 'Package name for auditing. Eg: npm:axios:1.3.5, pypi:requests:1.0, etc.'
    })
  }

  private async auditPackage(packageManager: string,
    packageName: string,
    packageVersion: string) {
    if (!existsSync(CREDS_FILE_PATH)) this.error("User not authenticated. Please run 'auth' before 'audit'", {
      exit: 1
    })

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
    if (!success) this.error('Error auditing package.', {
      exit: 1
    })

    return success
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Audit)

    // Audit file package
    if (flags.file) {
      const [packageManager, filePath] = flags.file.split(':')

      if (!packageManager || !filePath) this.error('Invalid package file format.', {
        exit: 1
      })

      if (packageManager === 'pypi') {
        const readInterface = readline.createInterface({
          input: fs.createReadStream(filePath),
        });

        let index = 0
        for await (const line of readInterface) {
          const [packageName, packageVersion] = line.split('==')
          const response = await this.auditPackage(packageManager, packageName, packageVersion as string)

          ux.table([response], {
            package_manager: {},
            package_name: {
              get: row => row.packages[0].name,
              minWidth: 25
            },
            version: {
              get: row => row.packages[0].version
            },
            risks: {
              get: row => row.packages[0].risks
            },
            url: {},
          }, {
            "no-header": index > 0,
          })

          index++
        }
        return
      }


      const packageFile = readFileSync(filePath, 'utf8')
      const dependencyObject = JSON.parse(packageFile).dependencies
      Object.entries(dependencyObject).forEach(async ([packageName, packageVersion], index) => {
        const response = await this.auditPackage(packageManager, packageName, packageVersion as string)

        ux.table([response], {
          package_manager: {},
          package_name: {
            get: row => row.packages[0].name,
            minWidth: 25
          },
          version: {
            get: row => row.packages[0].version
          },
          risks: {
            get: row => row.packages[0].risks
          },
          url: {},
        }, {
          "no-header": index > 0
        })
      })
      return
    }

    // Audit packagse
    if (!flags.file) {
      const packageInput = args.package
      if (!packageInput) this.error('Package is not defined!', {
        exit: 1
      })

      const [packageManager, packageName, packageVersion] = packageInput.split(":");
      if (!packageManager || !packageName || !packageVersion) this.error('Wrong package format', {
        exit: 1
      })

      const response = await this.auditPackage(packageManager, packageName, packageVersion)

      ux.table([response], {
        package_manager: {},
        package_name: {
          get: row => row.packages[0].name,
          minWidth: 25
        },
        version: {
          get: row => row.packages[0].version
        },
        risks: {
          get: row => row.packages[0].risks
        },
        url: {},
      })
    }
  }
}
