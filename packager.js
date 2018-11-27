// electron-packager . BagTool --out ./out_app --overwrite
const fs = require('fs');
const del = require('del');
const makeDir = require('make-dir');

const TEMPPATH = './packager-temp';

// 如果临时目录存在，先清空
fs.existsSync(TEMPPATH) && del([`${TEMPPATH}/**`], {
  force: true
});

// 创建临时目录
makeDir.sync(TEMPPATH);