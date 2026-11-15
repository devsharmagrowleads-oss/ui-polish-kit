#!/usr/bin/env node
// Entry point for `npx ui-polish <command>`.
//
//   ui-polish install <agent...> [--target dir]   install the kit into a project
//   ui-polish audit [path] [--json] …             run the static checker
//   ui-polish build [--check]                     regenerate agent formats (kit development)

import process from 'node:process';

const [command, ...rest] = process.argv.slice(2);

const HELP = `ui-polish-kit

  ui-polish install <agent...> [--target <dir>] [--dry-run]
      agents: codex, claude, cursor, windsurf, devin, copilot, gemini, all
  ui-polish audit [path] [--json] [--min-score n] [--fail-on error|warning|never]
  ui-polish build [--check]

Run a command with --help for its options.`;

async function run() {
  switch (command) {
    case 'install': return (await import('./scripts/install.mjs')).main(rest);
    case 'audit': return (await import('./audit/cli.mjs')).main(rest);
    case 'build': return (await import('./scripts/build.mjs')).main(rest);
    case undefined:
    case '-h':
    case '--help':
    case 'help':
      console.log(HELP);
      return 0;
    default:
      console.error(`Unknown command "${command}".\n\n${HELP}`);
      return 2;
  }
}

run().then((code) => { process.exitCode = code; });
