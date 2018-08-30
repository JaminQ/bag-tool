const path = require('path').posix;
const gulp = require('gulp');
const less = require('gulp-less');
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
    styleExtname: STYLEEXTNAME
  }
} = requireDir('../utils');

const parseCss = lazypipe()
  .pipe(less, {
    // paths: [
    //   path.join(__dirname, 'less', 'includes')
    // ]
  })
  .pipe(gulp.dest, DEST);

gulp.task('css', ['clean'], () => {
  const stream = gulp.src(getSrc(FULLSRC, STYLEEXTNAME), {
      base: FULLSRC
    })
    .pipe(parseCss());

  stream.on('error', e => {
    console.log('css task error:', e);
  });

  return stream;
});

gulp.task('css_watch', () => {
  const cssFiles = changedFiles.get('css');
  const stream = gulp.src(cssFiles.length ? cssFiles.concat(getSrc(FULLSRC)) : cssFiles, {
      base: FULLSRC
    })
    .pipe(parseCss());

  stream.on('error', e => {
    console.log('css_watch task error:', e);
  });

  return stream;
});