const gulp = require('gulp');
const changed = require('gulp-changed');
const requireDir = require('require-dir');

const {
  common: {
    getSrc
  },
  config: {
    fullSrc: SRC,
    dest: DEST,
    tmplExtname: TMPLEXTNAME,
    styleExtname: STYLEEXTNAME
  }
} = requireDir('../utils');

gulp.task('copy', ['clean'], () => {
  const stream = gulp.src(getSrc(SRC, ['*.*'], TMPLEXTNAME.concat(STYLEEXTNAME)))
    .pipe(changed(DEST))
    .pipe(gulp.dest(DEST));

  stream.on('error', e => {
    console.log('copy task error:', e);
  });

  return stream;
});