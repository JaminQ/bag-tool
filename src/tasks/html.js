const gulp = require('gulp');
const requireDir = require('require-dir');
const lazypipe = require('lazypipe');

const {
  common: {
    getSrc
  },
  tmpl,
  through,
  changedFiles,
  config: {
    fullSrc: FULLSRC,
    dest: DEST,
    tmplExtname: TMPLEXTNAME
  }
} = requireDir('../utils');

const parseHtml = lazypipe()
  .pipe(through, ({
    content,
    file,
    basePath
  }) => {
    return tmpl(content, file, basePath);
  })
  .pipe(gulp.dest, DEST);

gulp.task('html', ['clean'], () => {
  const stream = gulp.src(getSrc(FULLSRC, TMPLEXTNAME), {
      base: FULLSRC
    })
    .pipe(parseHtml());

  stream.on('error', e => {
    console.log('html task error:', e);
  });

  return stream;
});

gulp.task('html_watch', () => {
  const htmlFiles = changedFiles.get('html');
  const stream = gulp.src(htmlFiles.length ? htmlFiles.concat(getSrc(FULLSRC)) : htmlFiles, {
      base: FULLSRC
    })
    .pipe(parseHtml());

  stream.on('error', e => {
    console.log('html_watch task error:', e);
  });

  return stream;
});