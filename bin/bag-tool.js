#!/usr/bin/env node

const fs = require('fs');
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
    spawn('gulp init');
    break;
  case 'clean':
    spawn('gulp clean');
    break;
  case 'build':
    spawn('gulp build');
    break;
  case 'start':
    spawn('gulp watch');
    break;
  default:
    console.log('bag-tool: Incorrect command, maybe you need \`bag-tool help\`.');
}