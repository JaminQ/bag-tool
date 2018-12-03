#!/usr/bin/env node

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const USERCONFIG = require('../src/utils/config');
const gulpFork = require('../src/utils/fork')({
  modulePath: './node_modules/gulp/bin/gulp.js',
  cwd: path.join(__dirname, '../'),
  env: {
    USERCONFIG: JSON.stringify(USERCONFIG),
    PROJECT: process.cwd(), // 运行命令时的当前路径
    ARGV: JSON.stringify(argv)
  },
  stdout(data) {
    const dataStr = `${data}`;
    if (/\[BAG-TOOL\]/.test(dataStr)) process.stdout.write(dataStr.replace(/\[BAG-TOOL\]/, ''));
    else USERCONFIG.showDetailLog && process.stdout.write(dataStr);
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

if (argv._.length === 0) { // 处理无command的情况
  if (argv.v || argv.version) { // bag-tool -v 获取版本号
    main.getVersion();
  } else { // bag-tool 默认执行help
    main.getHelp();
  }
} else {
  switch (argv._[0]) {
    case 'help':
      main.getHelp(argv.c ? '_CN' : '');
      break;
    case 'init':
    case 'clean':
    case 'build':
    case 'start':
    case 'export':
      main.gulp(gulpFork, [argv._[0]]);
      break;
    default:
      console.log('bag-tool: Incorrect command, maybe you need \`bag-tool help\`.');
  }
}