const path = require('path').posix;

const {
  template: TEMPLATE
} = require('./config');

module.exports = {
  /*
  * 获取glob src
  * [input]
  * srcs: 原src
  * include: 支持的文件后缀名列表，如['*.html']
  * exclude: 不支持的文件名后缀名列表，如['*.js']
  * [ouput]
  * glob src数组
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
  },

  /*
  * html attrs 转换为 attrs对象
  * [input]
  * attrs: html attrs字符串
  * char: attr分隔字符，默认空格
  * [ouput]
  * attrs对象
  */
  attrs2obj(attrs = '', char = ' ') {
    const attrsObj = {};
    const reg = new RegExp(`${char}+`, 'g');

    attrs.replace(reg, char).split(char).forEach(expression => {
      const expressionArr = expression.split('=');
      expressionArr.length === 2 && (attrsObj[expressionArr[0]] = expressionArr[1].replace(/'|"/g, ''));
    });

    return attrsObj;
  }
};