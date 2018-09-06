const gulp = require('gulp');
const babel = require('gulp-babel');
const requireDir = require('require-dir');
const lazypipe = require('lazypipe');

const {
  common: {
    getSrc
  },
  changedFiles,
  config: {
    fullSrc: FULLSRC,
    dest: DEST,
    jsExtname: JSEXTNAME
  }
} = requireDir('../utils');

const getParseJsPipe = () => {
  return lazypipe()
    .pipe(babel, {
      presets: ['@babel/env']
    })
    .pipe(gulp.dest, DEST);
};

gulp.task('js', ['clean'], () => {
  const stream = gulp.src(getSrc(FULLSRC, JSEXTNAME), {
      base: FULLSRC
    })
    .pipe(getParseJsPipe()());

  stream.on('error', e => {
    console.log('js task error:', e);
  });

  return stream;
});

gulp.task('js_watch', () => {
  const jsFiles = changedFiles.get('js');
  const stream = gulp.src(jsFiles.length ? jsFiles.concat(getSrc(FULLSRC)) : jsFiles, {
      base: FULLSRC
    })
    .pipe(getParseJsPipe()());

  stream.on('error', e => {
    console.log('js_watch task error:', e);
  });

  return stream;
});

module.exports = {
  getPipe: getParseJsPipe
};