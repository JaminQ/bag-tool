const path = require('path').posix;
const gulp = require('gulp');
const filter = require('gulp-filter');
const less = require('gulp-less');
// const sass = require('gulp-sass');
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
    cssEngine: CSSENGINE,
    styleExtname: STYLEEXTNAME,
    whiteList: WHITELIST
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
        // const sassFilter = filter(['**/*.scss'], {
        //   restore: true
        // });

        // pipe = pipe
        //   .pipe(() => sassFilter)
        //   .pipe(() => sass({}).on('error', sass.logError))
        //   .pipe(() => sassFilter.restore);

        break;
      default:
    }
  });

  return pipe.pipe(gulp.dest, FULLDEST);
};

gulp.task('css', ['clean'], () => {
  const stream = gulp.src(getSrc({
      src: FULLSRC,
      includeExtname: STYLEEXTNAME,
      exclude: WHITELIST
    }), {
      base: FULLSRC
    })
    .pipe(getParseCssPipe()());

  stream.on('error', e => {
    console.error('css task error:', e);
  });

  return stream;
});

gulp.task('css_watch', () => {
  const cssFiles = changedFiles.get('css');
  const stream = gulp.src(cssFiles.length ? cssFiles.concat(getSrc({
      src: FULLSRC
    })) : cssFiles, {
      base: FULLSRC
    })
    .pipe(getParseCssPipe()());

  stream.on('error', e => {
    console.error('css_watch task error:', e);
  });

  return stream;
});

module.exports = {
  getPipe: getParseCssPipe
};