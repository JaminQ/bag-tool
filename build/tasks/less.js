const gulp = require('gulp');
const path = require('path').posix;
const less = require('gulp-less');
const requireDir = require('require-dir');

const {
  common,
  config: {
    src: SRC,
    dest: DEST,
    template: TEMPLATE
  }
} = requireDir('../utils');

gulp.task('less', () => {
  const stream = gulp.src(common.getSrc(SRC, ['*.less', '*.css']))
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