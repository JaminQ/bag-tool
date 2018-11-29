const through2 = require('through2');

module.exports = callback => {
  return through2.obj(function(file, enc, cb) {
    let contentStr = '';
    if (file.isBuffer()) {
      contentStr = file.contents.toString();
    } else {
      contentStr = file;
    }
    typeof callback === 'function' && (contentStr = callback({
      content: contentStr,
      file: file.history[0],
      basePath: file.base,
      enc,
      cb
    }));
    file.contents = Buffer.from(contentStr);
    this.push(file);
    cb(null, file);
  });
};