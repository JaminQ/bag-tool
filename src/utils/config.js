const path = require('path').posix;

const PROJECT = process.env.PROJECT || process.cwd() || '';
const defaultConfig = require('../config.json');
let userConfig = {};

try {
  userConfig = require(path.join(PROJECT, 'bag-tool-config.json')); // 拉取用户配置文件
} catch (e) {
  userConfig = {
    noConfig: true // 表示没有用户配置文件
  };
}

Object.assign(defaultConfig, userConfig); // 将用户配置覆盖默认配置

// 获取css编译器后缀名
const STYLEEXTNAME = [];
defaultConfig.cssEngine.forEach(engine => {
  switch (engine) {
    case 'less':
      STYLEEXTNAME.push('*.less');
      break;
    case 'sass':
      STYLEEXTNAME.push('*.scss');
      break;
    default:
  }
});

Object.assign(defaultConfig, {
  fullSrc: path.join(PROJECT, defaultConfig.src), // src绝对路径
  fullDest: path.join(PROJECT || '', defaultConfig.dest), // dest绝对路径
  project: PROJECT,
  styleExtname: STYLEEXTNAME,
  jsExtname: ['*.js'],
  whiteList: defaultConfig.whiteList.map(file => file.replace(/^\//, '')) // 删掉前面的/
});

module.exports = defaultConfig;