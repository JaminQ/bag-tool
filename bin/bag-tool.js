#!/usr/bin/env node

const childProcess = require('child_process');
const path = require('path').posix;

const childProcessOpt = {
  cwd: path.join(__dirname.replace(/\\/g, '/'), '../'),
  env: {
    PROJECT: process.cwd().replace(/\\/g, '/') // 运行命令时的当前路径
  }
};
const spawn = ({
  command,
  argv
}) => {
  const spawnProcess = childProcess.spawn(process.platform === 'win32' ? `${command}.cmd` : command, argv, childProcessOpt);

  spawnProcess.stdout.on('data', data => {
    process.stdout.write(`${data}`);
  });

  spawnProcess.stderr.on('data', data => {
    process.stdout.write(`${data}`);
  });

  spawnProcess.on('error', err => {
    process.stdout.write(`${err}`);
  });

  return spawnProcess;
};

switch (process.argv[2]) {
  case 'build':
    spawn({
      command: 'gulp',
      argv: ['build']
    });
    break;
  case 'start':
    spawn({
      command: 'gulp',
      argv: ['watch']
    });
    break;
  default:
    console.log(`usage: bag-tool <command>`);
}