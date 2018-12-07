const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const makeDir = require('make-dir');

const {
  fullSrc: FULLSRC,
  fullDest: FULLDEST,
  encoding: ENCODING
} = require('./config');

module.exports = (inputFile, isForce = false) => {
  inputFile = inputFile.replace(FULLSRC, FULLDEST);
  const outputFile = `${inputFile}.js`;
  if (isForce || !fs.existsSync(outputFile)) {
    // 如果没有该目录，则创建
    const outputDir = path.dirname(outputFile);
    !fs.existsSync(outputDir) && makeDir.sync(outputDir);

    // 根据文件类型添加对应的js代码或修改输入文件的后缀名
    const extname = path.extname(inputFile);
    let strPrefix = ''; // 字符串前缀
    let strSuffix = ''; // 字符串后缀
    switch (extname) {
      case '.tpl':
        strPrefix = 'module.exports = ';
        strSuffix = ';';
        break;
      case '.less':
      case '.scss':
        // 修改输入文件的后缀为css
        inputFile = `${inputFile.slice(0, -extname.length)}.css`;
      case '.css':
        strPrefix = `var style = document.createElement('style');
style.innerHTML = `;
        strSuffix = `;
document.getElementsByTagName('head')[0].appendChild(style);`;
        break;
      default:
    }

    // 将文件内容处理成一个字符串，每行trim，处理引号，处理换行符
    const str = `${strPrefix}'${iconv.decode(fs.readFileSync(inputFile), ENCODING).split('\n').map(line => {
      return line.trim().replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
    }).join('\\n')}'${strSuffix}`;

    // 写入文件
    fs.writeFileSync(outputFile, str, {
      encoding: ENCODING
    });
  }
};