const fs = require('fs');

const defaultConfig = require('../config-default.json');
let userConfig = {};

try {
  userConfig = require('../config-user.json');
} catch(e) {}

module.exports = Object.assign(defaultConfig, userConfig);