const path = require('path');

const {
  template: TEMPLATE,
  ignore: IGNORE
} = require('./config');

module.exports = {
  /*
   * 获取glob src
   * [input]
   * src: 原src
   * includeExtname: 支持的文件后缀名列表，如['*.html']
   * excludeExtname: 不支持的文件名后缀名列表，如['*.js']
   * include: 支持的文件，不支持glob，如['a.html']
   * exclude: 不支持的文件，不支持glob，如['a.js']
   * [ouput]
   * glob src数组
   */
  getSrc({
    src = '',
    includeExtname = [],
    excludeExtname = [],
    include = [],
    exclude = []
  }) {
    const res = [];
    const _src = path.join(src, TEMPLATE);

    includeExtname.forEach(extname => {
      res.push(path.join(src, '/**/', extname));
    });
    excludeExtname.forEach(extname => {
      res.push(`!${path.join(src, '/**/', extname)}`);
    });

    include.forEach(file => {
      res.push(path.join(src, file));
    });
    exclude.forEach(file => {
      res.push(`!${path.join(src, file)}`);
    });

    res.push(`!${path.join(_src, '/**/*')}`, `!${_src}`); // 排除template目录

    // 添加忽略目录
    IGNORE.forEach(dir => {
      res.push(`!${path.join(src, dir.replace(/^!/, ''))}`);
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