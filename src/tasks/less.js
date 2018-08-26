const path = require('path').posix;
const gulp = require('gulp');
const less = require('gulp-less');
const requireDir = require('require-dir');

const {
  common: {
    getSrc
  },
  config: {
    fullSrc: SRC,
    dest: DEST,
    styleExtname: STYLEEXTNAME
  }
} = requireDir('../utils');

gulp.task('less', ['clean'], () => {
  const stream = gulp.src(getSrc(SRC, STYLEEXTNAME))
    .pipe(less({
      // paths: [
      //   path.join(__dirname, 'less', 'includes')
      // ]
    }))
    .pipe(gulp.dest(DEST));

  stream.on('error', e => {
    console.log('less task error:', e);
  });

  return stream;
});

gulp.task('less_watch', () => {
  // const stream = gulp.src(getSrc(SRC, STYLEEXTNAME))
  //   .pipe(less({
  //     // paths: [
  //     //   path.join(__dirname, 'less', 'includes')
  //     // ]
  //   }))
  //   .pipe(gulp.dest(DEST));

  // stream.on('error', e => {
  //   console.log('less task error:', e);
  // });

  // return stream;
});