// 简单封装fork
const childProcess = require('child_process');

module.exports = ({
  modulePath = '',
  cwd = '',
  env = {},
  begin,
  stdout,
  stderr,
  error,
  close
}) => {
  return command => {
    typeof begin === 'function' && begin();

    command.push('--colors'); // 保留颜色

    const fork = childProcess.fork(modulePath, command, {
      cwd,
      // env: Object.assign({}, process.env, env),
      env,
      silent: true // 将log导流到父进程中
    });

    fork.stdout.on('data', data => {
      typeof stdout === 'function' && stdout(data);
    });

    fork.stderr.on('data', data => {
      typeof stderr === 'function' && stderr(data);
    });

    fork.on('error', err => {
      typeof error === 'function' && error(err);
    });

    fork.on('close', code => {
      typeof close === 'function' && close(code);
    });

    return fork;
  };
};