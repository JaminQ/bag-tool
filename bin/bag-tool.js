#!/usr/bin/env node

const fs = require('fs');
const childProcess = require('child_process');
const path = require('path').posix;

// 简单封装spawn
const spawn = ({
  command,
  argv
}) => {
  const spawnProcess = childProcess.spawn(process.platform === 'win32' ? `${command}.cmd` : command, argv, {
    cwd: path.join(__dirname.replace(/\\/g, '/'), '../'),
    env: {
      PROJECT: process.cwd().replace(/\\/g, '/') // 运行命令时的当前路径
    }
  });

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

// 获取输入参数并排序，command在前面，其余在后面
const getStdinArgvs = ([, , ...argvs]) => {
  argvs.sort((item1, item2) => {
    return item1[0] === '-' ? 1 : -1;
  });

  return [...argvs];
};

const [command, ...argv] = getStdinArgvs(process.argv);
switch (command) {
  case '-v':
    console.log(JSON.parse(fs.readFileSync(path.join(__dirname.replace(/\\/g, '/'), '../package.json'), {
      encoding: 'utf8'
    })).version);
    break;
  case 'help':
    console.log(fs.readFileSync(path.join(__dirname.replace(/\\/g, '/'), `../help${argv.indexOf('-c') > -1 ? '_CN' : ''}.txt`), {
      encoding: 'utf8'
    }));
    break;
  case 'init':
    spawn({
      command: 'gulp',
      argv: ['init']
    });
    break;
  case 'clean':
    spawn({
      command: 'gulp',
      argv: ['clean']
    });
    break;
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
    console.log('bag-tool: Incorrect command, maybe you need \`bag-tool help\`.');
}