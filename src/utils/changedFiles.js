const path = require('path').posix;
const {
  tmplExtname: TMPLEXTNAME,
  styleExtname: STYLEEXTNAME
} = require('./config');

const changedFiles = {};

const reset = () => {
  changedFiles.html = [];
  changedFiles.css = [];
  changedFiles.copy = [];
};

module.exports = {
  reset,
  add(file) {
    const extname = `*${path.extname(file)}`;
    let key = '';

    if (TMPLEXTNAME.indexOf(extname) > -1) {
      key = 'html';
    } else if (STYLEEXTNAME.indexOf(extname) > -1) {
      key = 'css';
    } else {
      key = 'copy';
    }

    changedFiles[key].indexOf(file) === -1 && changedFiles[key].push(file);
  },
  get(key) {
    return changedFiles[key] || [];
  },
  getData() {
    return changedFiles;
  }
};