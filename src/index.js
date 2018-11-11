const fs = require('fs');
const path = require('path').posix;

// const gulpPath = path.join(__dirname.replace(/\\/g, '/'), '../node_modules/gulp/bin/gulp.js');
const gulpPath = 'gulp';

module.exports = {
  getVersion() {
    console.log(JSON.parse(fs.readFileSync(path.join(__dirname.replace(/\\/g, '/'), '../package.json'), {
      encoding: 'utf8'
    })).version);
  },
  getHelp(lang = '') {
    console.log(fs.readFileSync(path.join(__dirname.replace(/\\/g, '/'), `../help${lang}.txt`), {
      encoding: 'utf8'
    }));
  },
  init(spawn) {
    return spawn(`${gulpPath} init`);
  },
  clean(spawn) {
    return spawn(`${gulpPath} clean`);
  },
  build(spawn) {
    return spawn(`${gulpPath} build`);
  },
  start(spawn) {
    return spawn(`${gulpPath} start`);
  }
};