const gulp = require('gulp');
const requireDir = require('require-dir');
const lazypipe = require('lazypipe');

const {
  common: {
    getSrc
  },
  tmpl,
  through,
  changedFiles,
  config: {
    fullSrc: FULLSRC,
    fullDest: FULLDEST,
    tmplExtname: TMPLEXTNAME,
    whiteList: WHITELIST
  }
} = requireDir('../utils');

const getParseHtmlPipe = () => {
  return lazypipe()
    .pipe(through, ({
      content,
      file,
      basePath
    }) => {
      return tmpl(content, file, basePath);
    })
    .pipe(gulp.dest, FULLDEST);
};

gulp.task('html', ['clean'], () => {
  const stream = gulp.src(getSrc({
      src: FULLSRC,
      includeExtname: TMPLEXTNAME,
      exclude: WHITELIST
    }), {
      base: FULLSRC
    })
    .pipe(getParseHtmlPipe()());

  stream.on('error', e => {
    console.log('html task error:', e);
  });

  return stream;
});

gulp.task('html_watch', () => {
  const htmlFiles = changedFiles.get('html');
  const stream = gulp.src(htmlFiles.length ? htmlFiles.concat(getSrc({
      src: FULLSRC
    })) : htmlFiles, {
      base: FULLSRC
    })
    .pipe(getParseHtmlPipe()());

  stream.on('error', e => {
    console.log('html_watch task error:', e);
  });

  return stream;
});

module.exports = {
  getPipe: getParseHtmlPipe
};