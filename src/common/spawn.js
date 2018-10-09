const childProcess = require('child_process');
const path = require('path').posix;

module.exports = command => {
  let file = '';
  let args = [];
  if (process.platform === 'win32') {
    file = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', command];
  } else {
    file = '/bin/sh';
    args = ['-c', command];
  }

  const spawnProcess = childProcess.spawn(file, args, {
    cwd: path.join(__dirname.replace(/\\/g, '/'), '../../'),
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

  spawnProcess.on('close', () => {
    console.log('done');
  });

  return spawnProcess;
};