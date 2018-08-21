const fs = require('fs');
const path = require('path').posix;

const defaultConfig = require('../config.json');
let userConfig = {};

try {
  userConfig = require('../config-user.json');
} catch(e) {}

Object.assign(defaultConfig, userConfig);

defaultConfig.fullSrc = defaultConfig.src.map(src => path.join(process.env.PROJECT, src)); // 绝对路径
defaultConfig.dest = path.join(process.env.PROJECT || '', defaultConfig.dest);

module.exports = defaultConfig;