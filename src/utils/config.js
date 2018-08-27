const fs = require('fs');
const path = require('path').posix;

const PROJECT = process.env.PROJECT || '';
const defaultConfig = require('../config.json');
let userConfig = {};

try {
  userConfig = require(path.join(PROJECT, 'bag-tool-config.json')); // 拉取用户配置文件
} catch(e) {
  userConfig = {
    noConfig: true // 表示没有用户配置文件
  };
}

Object.assign(defaultConfig, userConfig);
Object.assign(defaultConfig, {
  fullSrc: path.join(PROJECT, defaultConfig.src), // src绝对路径
  dest: path.join(PROJECT || '', defaultConfig.dest),
  project: PROJECT
});

module.exports = defaultConfig;