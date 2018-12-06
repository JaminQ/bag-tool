const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const makeDir = require('make-dir');

module.exports = (inputFile, outputFile, encoding) => {
  if (!fs.existsSync(outputFile)) {
    // 将文件内容处理成一个字符串，每行trim，处理引号，处理换行符
    let str = `'${iconv.decode(fs.readFileSync(inputFile), encoding).split('\n').map(line => {
      return line.trim().replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
    }).join('\\n')}'`;

    // 如果没有该目录，则创建
    const outputDir = path.dirname(outputFile);
    !fs.existsSync(outputDir) && makeDir.sync(outputDir);

    // 根据文件类型添加对应的js代码
    switch (path.extname(inputFile)) {
      case '.tpl':
        str = `module.exports = ${str};`;
        break;
      case '.less':
      case '.scss':
        str = `var style = document.createElement('style');
style.innerHTML = ${str};
document.getElementsByTagName('head')[0].appendChild(style);`;
        break;
      default:
    }

    // 写入文件
    fs.writeFileSync(outputFile, str, {
      encoding
    });
  }
};