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

// 设置build为默认task
gulp.task('default', ['build']);

gulp.task('build', ['html', 'less', 'copy']);

gulp.task('watch', ['build'], () => {
  global.isWatch = true; // 全局标记为监听中

  // 在本地起一个服务并调起浏览器访问该服务
  browserSync.init({
    server: {
      baseDir: DEST
    },
    startPath: STARTPATH
  });

  // 监听src文件改动
  const stream = watch(SRC, {
    cwd: process.env.PROJECT
  }, () => {
    gulp.start('reload');
  });

  stream.on('error', e => {
    console.log('watch task error:', e);
  });

  return stream;
});

gulp.task('reload', ['build'], () => {
  browserSync.reload(); // 自动刷新页面
});