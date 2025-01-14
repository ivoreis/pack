import {StdioOptions} from 'child_process';
import Config from '../config.js';
import {MessageError} from '@pika/types';
import {ProcessTermError} from '../errors.js';
import * as child from './child.js';
import {fixCmdWinSlashes} from './fix-cmd-win-slashes.js';

// import path from 'path';

export type LifecycleReturn = Promise<{
  cwd: string;
  command: string;
  stdout: string;
}>;

// export const IGNORE_MANIFEST_KEYS: Set<string> = new Set(['readme', 'notice', 'licenseText']);

// // We treat these configs as internal, thus not expose them to process.env.
// // This helps us avoid some gyp issues when building native modules.
// // See https://github.com/yarnpkg/yarn/issues/2286.
// const IGNORE_CONFIG_KEYS = ['lastUpdateCheck'];

// async function getPnpParameters(config: Config): Promise<Array<string>> {
//   if (await fs.exists(`${config.lockfileFolder}/${constants.PNP_FILENAME}`)) {
//     return ['-r', `${config.lockfileFolder}/${constants.PNP_FILENAME}`];
//   } else {
//     return [];
//   }
// }

// let wrappersFolder = null;

// export async function getWrappersFolder(config: Config): Promise<string> {
//   if (wrappersFolder) {
//     return wrappersFolder;
//   }

//   wrappersFolder = await fs.makeTempDir();

//   await makePortableProxyScript(process.execPath, wrappersFolder, {
//     proxyBasename: 'node',
//     prependArguments: [...(await getPnpParameters(config))],
//   });

//   await makePortableProxyScript(process.execPath, wrappersFolder, {
//     proxyBasename: 'pika',
//     prependArguments: [process.argv[1]],
//   });

//   return wrappersFolder;
// }

// const INVALID_CHAR_REGEX = /\W/g;

export async function makeEnv(): Promise<{[key: string]: string}> {
// stage: string,
// cwd: string,
// config: Config,
  const env = {
    NODE: process.execPath,
    INIT_CWD: process.cwd(),
    // This lets `process.env.NODE` to override our `process.execPath`.
    // This is a bit confusing but it is how `npm` was designed so we
    // try to be compatible with that.
    ...process.env,
  };
  return env;
}

//   // Merge in the `env` object specified in .pikarc
//   const customEnv = config.getOption('env');
//   if (customEnv && typeof customEnv === 'object') {
//     Object.assign(env, customEnv);
//   }

//   env.npm_lifecycle_event = stage;
//   env.npm_node_execpath = env.NODE;
//   env.npm_execpath = env.npm_execpath || (process.mainModule && process.mainModule.filename);

//   // Set the env to production for npm compat if production mode.
//   // https://github.com/npm/npm/blob/30d75e738b9cb7a6a3f9b50e971adcbe63458ed3/lib/utils/lifecycle.js#L336
//   if (config.production) {
//     env.NODE_ENV = 'production';
//   }

//   // Note: npm_config_argv environment variable contains output of nopt - command-line
//   // parser used by npm. Since we use other parser, we just roughly emulate it's output. (See: #684)
//   env.npm_config_argv = JSON.stringify({
//     remain: [],
//     cooked: config.commandName === 'run' ? [config.commandName, stage] : [config.commandName],
//     original: process.argv.slice(2),
//   });

//   const manifest = await config.maybeReadManifest(cwd);
//   if (manifest) {
//     if (manifest.scripts && Object.prototype.hasOwnProperty.call(manifest.scripts, stage)) {
//       env.npm_lifecycle_script = manifest.scripts[stage];
//     }

//     // add npm_package_*
//     const queue = [['', manifest]];
//     while (queue.length) {
//       const [key, val] = queue.pop();
//       if (typeof val === 'object') {
//         for (const subKey in val) {
//           const fullKey = [key, subKey].filter(Boolean).join('_');
//           if (fullKey && fullKey[0] !== '_' && !IGNORE_MANIFEST_KEYS.has(fullKey)) {
//             queue.push([fullKey, val[subKey]]);
//           }
//         }
//       } else {
//         let cleanVal = String(val);
//         if (cleanVal.indexOf('\n') >= 0) {
//           cleanVal = JSON.stringify(cleanVal);
//         }

//         //replacing invalid chars with underscore
//         const cleanKey = key.replace(INVALID_CHAR_REGEX, '_');

//         env[`npm_package_${cleanKey}`] = cleanVal;
//       }
//     }
//   }

//   // add npm_config_* and npm_package_config_* from pika config
//   const keys: Set<string> = new Set([
//     ...Object.keys(config.registries.pika.config),
//     ...Object.keys(config.registries.npm.config),
//   ]);
//   const cleaned = Array.from(keys)
//     .filter(key => !key.match(/:_/) && IGNORE_CONFIG_KEYS.indexOf(key) === -1)
//     .map(key => {
//       let val = config.getOption(key);
//       if (!val) {
//         val = '';
//       } else if (typeof val === 'number') {
//         val = '' + val;
//       } else if (typeof val !== 'string') {
//         val = JSON.stringify(val);
//       }

//       if (val.indexOf('\n') >= 0) {
//         val = JSON.stringify(val);
//       }
//       return [key, val];
//     });
//   // add npm_config_*
//   for (const [key, val] of cleaned) {
//     const cleanKey = key.replace(/^_+/, '');
//     const envKey = `npm_config_${cleanKey}`.replace(INVALID_CHAR_REGEX, '_');
//     env[envKey] = val;
//   }
//   // add npm_package_config_*
//   if (manifest && manifest.name) {
//     const packageConfigPrefix = `${manifest.name}:`;
//     for (const [key, val] of cleaned) {
//       if (key.indexOf(packageConfigPrefix) !== 0) {
//         continue;
//       }
//       const cleanKey = key.replace(/^_+/, '').replace(packageConfigPrefix, '');
//       const envKey = `npm_package_config_${cleanKey}`.replace(INVALID_CHAR_REGEX, '_');
//       env[envKey] = val;
//     }
//   }

//   // split up the path
//   const envPath = env[constants.ENV_PATH_KEY];
//   const pathParts = envPath ? envPath.split(path.delimiter) : [];

//   // Include the directory that contains node so that we can guarantee that the scripts
//   // will always run with the exact same Node release than the one use to run Pika
//   const execBin = path.dirname(process.execPath);
//   if (pathParts.indexOf(execBin) === -1) {
//     pathParts.unshift(execBin);
//   }

//   // Include node-gyp version that was bundled with the current Node.js version,
//   // if available.
//   pathParts.unshift(path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'node-gyp-bin'));
//   pathParts.unshift(
//     path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'node-gyp-bin'),
//   );
//   // Include node-gyp version from homebrew managed npm, if available.
//   pathParts.unshift(
//     path.join(path.dirname(process.execPath), '..', 'libexec', 'lib', 'node_modules', 'npm', 'bin', 'node-gyp-bin'),
//   );

//   // Add global bin folder if it is not present already, as some packages depend
//   // on a globally-installed version of node-gyp.
//   const globalBin = await getGlobalBinFolder(config, {});
//   if (pathParts.indexOf(globalBin) === -1) {
//     pathParts.unshift(globalBin);
//   }

//   // Add node_modules .bin folders to the PATH
//   for (const registry of Object.keys(registries)) {
//     const binFolder = path.join(config.registries[registry].folder, '.bin');
//     if (config.workspacesEnabled && config.workspaceRootFolder) {
//       pathParts.unshift(path.join(config.workspaceRootFolder, binFolder));
//     }
//     pathParts.unshift(path.join(config.linkFolder, binFolder));
//     pathParts.unshift(path.join(cwd, binFolder));
//     if (config.modulesFolder) {
//       pathParts.unshift(path.join(config.modulesFolder, '.bin'));
//     }
//   }

//   if (await fs.exists(`${config.lockfileFolder}/${constants.PNP_FILENAME}`)) {
//     // TODO: Fix. import()? Do we even like that it does this?
//     throw new Error("pnp temporarily not supported");
//     const pnpApi = {}; //dynamicRequire(`${config.lockfileFolder}/${constants.PNP_FILENAME}`);

//     const packageLocator = pnpApi.findPackageLocator(`${config.cwd}/`);
//     const packageInformation = pnpApi.getPackageInformation(packageLocator);

//     for (const [name, reference] of packageInformation.packageDependencies.entries()) {
//       const dependencyInformation = pnpApi.getPackageInformation({name, reference});

//       if (!dependencyInformation || !dependencyInformation.packageLocation) {
//         continue;
//       }

//       pathParts.unshift(`${dependencyInformation.packageLocation}/.bin`);
//     }
//   }

//   pathParts.unshift(await getWrappersFolder(config));

//   // join path back together
//   env[constants.ENV_PATH_KEY] = pathParts.join(path.delimiter);

//   return env;
// }

export async function executeLifecycleScript({
  // config,
  cwd,
  cmd,
  args,
  isInteractive,
  onProgress,
  customShell,
}: {
  // config: Config;
  cwd: string;
  args: string[];
  cmd: string;
  isInteractive?: boolean;
  onProgress?: (chunk: Buffer | string) => void;
  customShell?: string;
}): LifecycleReturn {
  const env = await makeEnv();

  // await checkForGypIfNeeded(config, cmd, env[constants.ENV_PATH_KEY].split(path.delimiter));

  if (process.platform === 'win32' && (!customShell || customShell === 'cmd')) {
    // handle windows run scripts starting with a relative path
    cmd = fixCmdWinSlashes(cmd);
  }

  // By default (non-interactive), pipe everything to the terminal and run child process detached
  // as long as it's not Windows (since windows does not have /dev/tty)
  let stdio: StdioOptions = ['ignore', 'pipe', 'pipe'];
  let detached = process.platform !== 'win32';

  if (isInteractive) {
    stdio = 'inherit';
    detached = false;
  }

  const shell = customShell || true;
  const stdout = await child.spawn(cmd, args, {cwd, env, stdio, detached, shell}, onProgress);

  return {cwd, command: cmd, stdout};
}

export default executeLifecycleScript;

// let checkGypPromise: Promise<void> = null;
// // /**
// //  * Special case: Some packages depend on node-gyp, but don't specify this in
// //  * their package.json dependencies. They assume that node-gyp is available
// //  * globally. We need to detect this case and show an error message.
// //  */
// function checkForGypIfNeeded(config: Config, cmd: string, paths: Array<string>): Promise<void> {
//   if (cmd.substr(0, cmd.indexOf(' ')) !== 'node-gyp') {
//     return Promise.resolve();
//   }

//   // Ensure this only runs once, rather than multiple times in parallel.
//   if (!checkGypPromise) {
//     checkGypPromise = _checkForGyp(config, paths);
//   }
//   return checkGypPromise;
// }

// async function _checkForGyp(config: Config, paths: Array<string>): Promise<void> {
//   const {reporter} = config;

//   // Check every directory in the PATH
//   const allChecks = await Promise.all(paths.map(dir => fs.exists(path.join(dir, 'node-gyp'))));
//   if (allChecks.some(Boolean)) {
//     // node-gyp is available somewhere
//     return;
//   }

//   reporter.info(reporter.lang('packageRequiresNodeGyp'));
// }

// export async function execFromDistributions(config: Config, cwd: string, dist: string, step: string): Promise<void> {
//   const pkg = await config.maybeReadManifest(cwd);
//   if (!pkg || !pkg.distributions || !pkg.distributions[dist] || typeof pkg.distributions[dist][step] !== 'string') {
//     return false;
//   }
//   const cmd: ?string = pkg.distributions[dist][step];
//   await execCommand({stage: 'build', config, cmd, cwd, isInteractive: true});
//   return true;
// }

// export async function execFromManifest(config: Config, commandName: string, cwd: string): Promise<void> {
//   const pkg = await config.maybeReadManifest(cwd);
//   if (!pkg || !pkg.scripts) {
//     return;
//   }

//   const cmd: ?string = pkg.scripts[commandName];
//   if (cmd) {
//     await execCommand({stage: commandName, config, cmd, cwd, isInteractive: true});
//   }
// }

// export async function execCommand({
//   stage,
//   config,
//   cmd,
//   cwd,
//   isInteractive,
//   customShell,
// }: {
//   stage: string;
//   config: Config;
//   cmd: string;
//   cwd: string;
//   isInteractive: boolean;
//   customShell?: string;
// }): Promise<void> {
//   const {reporter} = config;
//   try {
//     reporter.command(cmd);
//     await executeLifecycleScript({config, cwd, cmd, isInteractive, customShell});
//     return Promise.resolve();
//   } catch (err) {
//     if (err instanceof ProcessTermError) {
//       throw new MessageError(
//         err.EXIT_SIGNAL
//           ? reporter.lang('commandFailedWithSignal', err.EXIT_SIGNAL)
//           : reporter.lang('commandFailedWithCode', err.EXIT_CODE),
//       );
//     } else {
//       throw err;
//     }
//   }
// }
