const through2 = require('through2');

module.exports = callback => {
  return through2.obj(function(file, enc, cb) {
    let contentStr = '';
    if (file.isBuffer()) {
      contentStr = file.contents.toString();
    } else {
      contentStr = file;
    }
    typeof callback === 'function' && (contentStr = callback(contentStr, file.base.replace(/\\/g, '/'), enc, cb));
    file.contents = new Buffer(contentStr);
    this.push(file);
    cb(null, file);
  });
};