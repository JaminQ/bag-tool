const path = require('path').posix;

const {
  template: TEMPLATE
} = require('./config');

module.exports = {
  /*
  * 获取glob src
  * srcs: 原src
  * include: 支持的文件后缀名列表，如['*.html']
  * exclude: 不支持的文件名后缀名列表，如['*.js']
  */
  getSrc(srcs = [], include = [], exclude = []) {
    const res = [];

    srcs.forEach(src => {
      const _src = path.join(src, TEMPLATE);

      include.forEach(extname => {
        res.push(path.join(src, '/**/', extname));
      });
      exclude.forEach(extname => {
        res.push(`!${path.join(src, '/**/', extname)}`);
      });

      res.push(`!${path.join(_src, '/**/*')}`, `!${_src}`); // 排除template目录
    });

    return res;
  }
};