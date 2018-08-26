const gulp = require('gulp');
const requireDir = require('require-dir');

const {
  common: {
    getSrc
  },
  tmpl,
  through,
  config: {
    fullSrc: SRC,
    dest: DEST,
    tmplExtname: TMPLEXTNAME
  }
} = requireDir('../utils');

gulp.task('html', ['clean'], () => {
  const stream = gulp.src(getSrc(SRC, TMPLEXTNAME))
    .pipe(through(({
      content,
      file,
      basePath
    }) => {
      return tmpl(content, file, basePath);
    }))
    .pipe(gulp.dest(DEST));

  stream.on('error', e => {
    console.log('html task error:', e);
  });

  return stream;
});

gulp.task('html_watch', () => {
  const stream = gulp.src(global.changedFiles || [])
    .pipe(through(({
      content,
      file,
      basePath
    }) => {
      console.log(global.changedFiles);
      return tmpl(content, file, basePath);
    }))
    .pipe(gulp.dest(DEST));

  stream.on('error', e => {
    console.log('html task error:', e);
  });

  return stream;
});