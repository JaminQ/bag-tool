const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const requireDir = require('require-dir');
const lazypipe = require('lazypipe')
const iconv = require('iconv-lite');
const makeDir = require('make-dir');

const {
  common: {
    getSrc
  },
  through,
  changedFiles,
  config: {
    fullSrc: FULLSRC,
    fullDest: FULLDEST,
    jsExtname: JSEXTNAME,
    whiteList: WHITELIST,
    encoding: ENCODING
  }
} = requireDir('../utils');

const getParseJsPipe = () => {
  return lazypipe()
    .pipe(through, ({
      content,
      file
    }) => {
      return content.replace(/require\(['"]([^'"]*?)['"]\)/g, (w, filePath) => {
        const extname = path.extname(filePath);
        if (extname === '.tpl' || extname === '.less' || extname === '.scss') {
          parseFile2Js(path.join(path.dirname(file), filePath), extname);
          return `require('${filePath}.js')`;
        } else {
          return w;
        }
      });
    })
    .pipe(babel, {
      presets: ['@babel/env']
    })
    .pipe(gulp.dest, FULLDEST);
};

// 将文件转换为js
const parseFile2Js = (file, extname) => {
  const outputFile = `${file.replace(FULLSRC, FULLDEST)}.js`;
  if (!fs.existsSync(outputFile)) {
    let str = `'${iconv.decode(fs.readFileSync(file), ENCODING).split('\n').map(line => {
      return line.trim().replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
    }).join('\\n')}'`;
    const outputDir = path.dirname(outputFile);
    !fs.existsSync(outputDir) && makeDir.sync(outputDir); // 如果没有该目录，则创建

    switch (extname) {
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

    fs.writeFileSync(outputFile, str); // 写文件
  }
};

gulp.task('js', ['clean'], () => {
  const stream = gulp.src(getSrc({
      src: FULLSRC,
      includeExtname: JSEXTNAME,
      exclude: WHITELIST
    }), {
      base: FULLSRC
    })
    .pipe(getParseJsPipe()());

  stream.on('error', e => {
    console.error('js task error:', e);
  });

  return stream;
});

gulp.task('js_watch', () => {
  const jsFiles = changedFiles.get('js');
  const stream = gulp.src(jsFiles.length ? jsFiles.concat(getSrc({
      src: FULLSRC
    })) : jsFiles, {
      base: FULLSRC
    })
    .pipe(getParseJsPipe()());

  stream.on('error', e => {
    console.error('js_watch task error:', e);
  });

  return stream;
});

module.exports = {
  getPipe: getParseJsPipe
};