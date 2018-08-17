const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const requireDir = require('require-dir');

const tasks = requireDir('./tasks');
const {
  src: SRC,
  dest: DEST,
  startPath: STARTPATH
} = require('./utils/config');

gulp.task('default', ['build']);

gulp.task('build', ['html', 'less', 'copy']);

gulp.task('watch', ['build'], () => {
  global.isWatch = true;

  // 在本地起一个服务并调起浏览器访问该服务
  browserSync.init({
    server: {
      baseDir: DEST
    },
    startPath: STARTPATH
  });

  const stream = watch(SRC, () => {
    gulp.start('reload');
  });

  stream.on('error', e => {
    console.log('watch task error:', e);
  });

  return stream;
});

gulp.task('reload', ['build'], () => {
  browserSync.reload();
});