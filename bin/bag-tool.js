#!/usr/bin/env node

const path = require('path').posix;
const {
  showDetailLog
} = require('../src/utils/config');
const spawn = require('../src/common/spawn')({
  cwd: path.join(__dirname.replace(/\\/g, '/'), '../'),
  env: {
    PROJECT: process.cwd().replace(/\\/g, '/') // 运行命令时的当前路径
  },
  stdout(data) {
    showDetailLog && process.stdout.write(`${data}`);
  },
  stderr(data) {
    process.stdout.write(`${data}`);
  },
  error(err) {
    process.stdout.write(`${err}`);
  },
  close() {
    console.log('done');
  }
});
const main = require('../src/index');

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
    main.getVersion();
    break;
  case 'help':
    main.getHelp(argv.indexOf('-c') > -1 ? '_CN' : '');
    break;
  case 'init':
    main.init(spawn);
    break;
  case 'clean':
    main.clean(spawn);
    break;
  case 'build':
    main.build(spawn);
    break;
  case 'start':
    main.start(spawn);
    break;
  default:
    console.log('bag-tool: Incorrect command, maybe you need \`bag-tool help\`.');
}