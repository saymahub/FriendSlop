import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Starts the Firebase emulators on a JDK 21 or newer.
 *
 * firebase-tools refuses anything older, and this machine has Java 11 ahead of
 * 21 on PATH for other tools' sake. The CLI checks JAVA_HOME first, so pointing
 * that at a new enough JDK avoids reordering PATH for everything else.
 */

const JDK_ROOTS = [
  'C:/Program Files/Eclipse Adoptium',
  'C:/Program Files/Java',
  'C:/Program Files/Microsoft/jdk',
];

const MINIMUM_VERSION = 21;

function findModernJdk() {
  for (const root of JDK_ROOTS.filter(existsSync)) {
    for (const entry of readdirSync(root)) {
      const major = Number(entry.match(/(?:jdk-?)(\d+)/i)?.[1]);

      if (major >= MINIMUM_VERSION && existsSync(join(root, entry, 'bin', 'java.exe'))) {
        return join(root, entry);
      }
    }
  }

  return undefined;
}

const javaHome = process.env.JAVA_HOME ?? findModernJdk();

if (!javaHome) {
  console.error(`No JDK ${MINIMUM_VERSION}+ found. Install one, or set JAVA_HOME yourself.`);
  process.exit(1);
}

console.log(`Using JAVA_HOME=${javaHome}`);

const args = ['firebase', 'emulators:start', '--import=emulator-data', '--export-on-exit=emulator-data'];

spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, JAVA_HOME: javaHome, PATH: `${join(javaHome, 'bin')};${process.env.PATH}` },
}).on('exit', (code) => process.exit(code ?? 0));
