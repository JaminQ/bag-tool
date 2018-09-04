const path = require('path').posix;
const gulp = require('gulp');
const filter = require('gulp-filter');
const less = require('gulp-less');
const sass = require('gulp-sass');
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
    cssEngine: CSSENGINE,
    styleExtname: STYLEEXTNAME
  }
} = requireDir('../utils');
let parseCss = lazypipe();

CSSENGINE.forEach(engine => {
  switch (engine) {
    case 'less':
      const lessFilter = filter(['**/*.less'], {
        restore: true
      });
      parseCss = parseCss
        .pipe(() => lessFilter)
        .pipe(less, {
          // paths: [
          //   path.join(__dirname, 'less', 'includes')
          // ]
        })
        .pipe(() => lessFilter.restore);
      break;
    case 'sass':
      const sassFilter = filter(['**/*.scss'], {
        restore: true
      });
      parseCss = parseCss
        .pipe(() => sassFilter)
        .pipe(() => sass({}).on('error', sass.logError))
        .pipe(() => sassFilter.restore);
      break;
    default:
  }
});

parseCss = parseCss
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