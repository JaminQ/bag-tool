const path = require('path').posix;

const {
  template: TEMPLATE
} = require('./config');

module.exports = {
  getSrc(srcs, extnames) {
    const res = [];

    srcs.forEach(src => {
      const _src = path.join(src, TEMPLATE);
      extnames.forEach(extname => {
        res.push(path.join(src, '/**/', extname));
      });
      res.push(`!${path.join(_src, '/**/*')}`, `!${_src}`);
    });

    return res;
  }
};