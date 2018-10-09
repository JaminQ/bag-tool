const path = require('path').posix;
const {
  tmplExtname: TMPLEXTNAME,
  styleExtname: STYLEEXTNAME,
  jsExtname: JSEXTNAME,
  whiteList: WHITELIST,
  fullSrc: FULLSRC
} = require('./config');

const changedFiles = {};

module.exports = {
  init() {
    changedFiles.html = [];
    changedFiles.css = [];
    changedFiles.js = [];
    changedFiles.copy = [];
    changedFiles.del = [];
  },
  add(file, type) {
    if (/\/\..*/.test(file)) return; // 如果有.开头的文件或文件夹，则忽略

    const extname = `*${path.extname(file)}`;
    let key = '';

    if (type === 'unlink') { // 删除
      key = 'del';
    } else {
      if (WHITELIST.indexOf(file.slice(FULLSRC.length)) > -1) {
        key = 'copy';
      } else if (TMPLEXTNAME.indexOf(extname) > -1) {
        key = 'html';
      } else if (STYLEEXTNAME.indexOf(extname) > -1) {
        key = 'css';
      } else if (JSEXTNAME.indexOf(extname) > -1) {
        key = 'js';
      } else {
        key = 'copy';
      }
    }

    changedFiles[key].indexOf(file) === -1 && changedFiles[key].push(file);
  },
  get(key = 'all') {
    if (key === 'all') return changedFiles;
    return changedFiles[key] || [];
  },
  getLen(key = 'all') {
    if (key === 'all') {
      let len = 0;
      Object.keys(changedFiles).forEach(key => {
        key !== 'del' && (len += changedFiles[key].length);
      });
      return len;
    } else {
      return (changedFiles[key] || []).length;
    }
  }
};