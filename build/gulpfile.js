const gulp = require('gulp');
const del = require('del');
const path = require('path').posix;
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const requireDir = require('require-dir');

const tasks = requireDir('./tasks');
const {
  common,
  tmpl,
  through,
  config: {
    src: SRC,
    dest: DEST,
    template: TEMPLATE,
    extname: EXTNAME,
    startPath: STARTPATH
  }
} = requireDir('./utils');

gulp.task('default', ['build']);

gulp.task('build', ['clean'], () => {
  const stream = gulp.src(common.getSrc(SRC, EXTNAME))
    .pipe(through((content, basePath) => {
      return tmpl(content, basePath)
    }))
    .pipe(gulp.dest(DEST));

  stream.on('error', e => {
    console.log('build task error:', e);
  });

  return stream;
});

gulp.task('clean', () => {
  return del([`${DEST}/**`, `!${DEST}`], {
    force: true
  });
});

gulp.task('watch', ['build'], () => {
  // 在本地起一个服务并调起浏览器访问该服务
  browserSync.init({
    server: {
      baseDir: DEST
    },
    startPath: STARTPATH
  });

  const stream = watch(SRC, () => {
    gulp.start('build');
  });

  stream.on('error', e => {
    console.log('watch task error:', e);
  });

  return stream;
});

gulp.task('reload', ['build'], () => {
  browserSync.reload();
});