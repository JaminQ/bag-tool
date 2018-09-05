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

const getParseCssPipe = (cssEngine = CSSENGINE) => {
  let pipe = lazypipe();

  cssEngine.forEach(engine => {
    switch (engine) {
      case 'less':
        const lessFilter = filter(['**/*.less'], {
          restore: true
        });

        pipe = pipe
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

        pipe = pipe
          .pipe(() => sassFilter)
          .pipe(() => sass({}).on('error', sass.logError))
          .pipe(() => sassFilter.restore);

        break;
      default:
    }
  });

  return pipe.pipe(gulp.dest, DEST);
};

gulp.task('css', ['clean'], () => {
  const stream = gulp.src(getSrc(FULLSRC, STYLEEXTNAME), {
      base: FULLSRC
    })
    .pipe(getParseCssPipe()());

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
    .pipe(getParseCssPipe()());

  stream.on('error', e => {
    console.log('css_watch task error:', e);
  });

  return stream;
});

module.exports = {
  getPipe: getParseCssPipe
};