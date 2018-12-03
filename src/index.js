const fs = require('fs');
const path = require('path');

module.exports = {
  getVersion() {
    console.log(JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), {
      encoding: 'utf8'
    })).version);
  },
  getHelp(lang = '') {
    console.log(fs.readFileSync(path.join(__dirname, `../help${lang}.txt`), {
      encoding: 'utf8'
    }));
  },
  gulp(gulpFork, args) {
    return gulpFork(args);
  }
};