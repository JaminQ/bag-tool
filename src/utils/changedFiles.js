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
    if (/\/\..*/.test(file)) return; // 如果有.开头的文件或文件夹，则忽略

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
  get(key = 'all') {
    if (key === 'all') return changedFiles;
    return changedFiles[key] || [];
  },
  getLen(key = 'all') {
    if (key === 'all') return changedFiles.html.length + changedFiles.css.length + changedFiles.copy.length;
    return (changedFiles[key] || []).length;
  }
};