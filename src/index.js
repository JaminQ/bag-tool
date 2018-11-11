const fs = require('fs');
const path = require('path').posix;

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
    return spawn('gulp init');
  },
  clean(spawn) {
    return spawn('gulp clean');
  },
  build(spawn) {
    return spawn('gulp build');
  },
  start(spawn) {
    return spawn('gulp watch');
  }
};