import { readFileSync } from 'node:fs';
import { exit, argv } from 'node:process';
import { execFileSync } from 'node:child_process';

function getCommitMessagePath() {
  const commitMessageFlagIndex = argv.indexOf('-commitMessage');
  if (commitMessageFlagIndex === -1 || commitMessageFlagIndex === argv.length - 1) {
    throw new Error('Missing -commitMessage <path> argument.');
  }

  return argv[commitMessageFlagIndex + 1];
}

function getStagedFileList() {
  return execFileSync('git', ['diff', '--cached', '--name-only'], {
    encoding: 'utf8',
  });
}

function shouldAllowCommit(commitMessage) {
  return commitMessage.includes('build: ') || commitMessage.includes('Merge ');
}

try {
  const commitMessagePath = getCommitMessagePath();
  console.log(`Commit Message: ${commitMessagePath}`);

  const commitMessage = readFileSync(commitMessagePath, 'utf8');
  const stagedFiles = getStagedFileList()
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean);
  const touchesPackageJson = stagedFiles.some((file) => /(^|\/)package.*\.json$/.test(file));
  const touchesPnpmLock = stagedFiles.some((file) => /(^|\/)pnpm-lock\.yaml$/.test(file));

  if (touchesPackageJson && !shouldAllowCommit(commitMessage)) {
    console.log('"Computer says no": Commit not possible because of the following:');
    throw new Error(
      'You have package-lock.json or package.json in your staged files without declaring changes to the build process using "build: " commit message',
    );
  }

  if (touchesPnpmLock && !shouldAllowCommit(commitMessage)) {
    console.log('"Computer says no": Commit not possible because of the following:');
    throw new Error(
      'You have pnpm-lock.yaml in your staged files without declaring changes to the build process using "build: " commit message',
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
}
