const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const requireDir = require('require-dir');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');

const {
  common: {
    getSrc
  },
  through,
  sourceMap,
  changedFiles,
  parseFile2Js,
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
    .pipe(babel, {
      presets: ['@babel/env']
    })
    .pipe(through, ({
      content,
      file
    }) => {
      // 检测到引用`.tpl`,`.less`,`.scss`文件时把这些文件转换为.js文件
      return content.replace(/require\(['"]([^'"]*?)['"]\)/g, (w, filePath) => {
        switch (path.extname(filePath)) {
          case '.tpl':
          case '.less':
          case '.scss':
          case '.css':
            const inputFile = path.join(path.dirname(file), filePath);
            sourceMap.set(inputFile, `__to__js__${inputFile}`);
            parseFile2Js(inputFile);
            return `require('${filePath}.js')`;
          default:
            return w;
        }
      });
    })
    .pipe(gulp.dest, FULLDEST);
};

gulp.task('js', ['html', 'css', 'clean'], () => {
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

gulp.task('js_watch', ['html_watch', 'css_watch'], () => {
  const jsFiles = changedFiles.get('js');
  const jsStream = gulp.src(jsFiles.length ? jsFiles.concat(getSrc({
      src: FULLSRC
    })) : jsFiles, {
      base: FULLSRC
    })
    .pipe(getParseJsPipe()());

  jsStream.on('error', e => {
    console.error('js_watch task error:', e);
  });

  const parseFile2JsFiles = changedFiles.get('parseFile2Js');
  if (parseFile2JsFiles.length) {
    const parseFile2JsStream = gulp.src(parseFile2JsFiles.concat(getSrc({
        src: FULLSRC
      })), {
        base: FULLSRC
      })
      .pipe(through(({
        file
      }) => {
        parseFile2Js(file, true);
        return '';
      }));

    parseFile2JsStream.on('error', e => {
      console.error('parse file to js task error:', e);
    });

    return merge(jsStream, parseFile2JsStream);
  } else {
    return jsStream;
  }
});

module.exports = {
  getPipe: getParseJsPipe
};