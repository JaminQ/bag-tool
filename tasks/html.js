const gulp = require('gulp');
const changed = require('gulp-changed');
const requireDir = require('require-dir');

const {
  common: {
    getSrc
  },
  tmpl,
  through,
  config: {
    src: SRC,
    dest: DEST,
    tmplExtname: TMPLEXTNAME
  }
} = requireDir('../utils');

gulp.task('html', ['clean'], () => {
  const stream = gulp.src(getSrc(SRC, TMPLEXTNAME))
    .pipe(changed(DEST))
    .pipe(through((content, basePath) => {
      return tmpl(content, basePath)
    }))
    .pipe(gulp.dest(DEST));

  stream.on('error', e => {
    console.log('html task error:', e);
  });

  return stream;
});