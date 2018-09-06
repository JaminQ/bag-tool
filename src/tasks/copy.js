const gulp = require('gulp');
const requireDir = require('require-dir');
const lazypipe = require('lazypipe');

const {
  common: {
    getSrc
  },
  changedFiles,
  config: {
    fullSrc: FULLSRC,
    fullDest: FULLDEST,
    tmplExtname: TMPLEXTNAME,
    styleExtname: STYLEEXTNAME,
    jsExtname: JSEXTNAME
  }
} = requireDir('../utils');

const getParseCopyPipe = () => {
  return lazypipe()
    .pipe(gulp.dest, FULLDEST);
};

gulp.task('copy', ['clean'], () => {
  const stream = gulp.src(getSrc(FULLSRC, ['*.*'], TMPLEXTNAME.concat(STYLEEXTNAME, JSEXTNAME)), {
      base: FULLSRC
    })
    .pipe(getParseCopyPipe()());

  stream.on('error', e => {
    console.log('copy task error:', e);
  });

  return stream;
});

gulp.task('copy_watch', () => {
  const copyFiles = changedFiles.get('copy');
  const stream = gulp.src(copyFiles.length ? copyFiles.concat(getSrc(FULLSRC)) : copyFiles, {
      base: FULLSRC
    })
    .pipe(getParseCopyPipe()());

  stream.on('error', e => {
    console.log('copy_watch task error:', e);
  });

  return stream;
});

module.exports = {
  getPipe: getParseCopyPipe
};