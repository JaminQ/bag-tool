const fs = require('fs');
const path = require('path').posix;
const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const requireDir = require('require-dir');
const makeDir = require('make-dir');

const tasks = requireDir('./src/tasks');
const {
  sourceMap,
  changedFiles,
  config: {
    src: SRC,
    fullSrc: FULLSRC,
    fullDest: FULLDEST,
    template: TEMPLATE,
    liveReload: LIVERELOAD,
    startPath: STARTPATH,
    project: PROJECT,
    noConfig: NOCONFIG,
    encoding: ENCODING
  }
} = requireDir('./src/utils');

// 设置build为默认task
gulp.task('default', ['build']);

gulp.task('init', () => {
  // 如果没有用户配置文件，就新建一个
  NOCONFIG && fs.writeFile(path.join(PROJECT, 'bag-tool-config.json'), `{}`, {
    encoding: ENCODING
  }, () => {});

  // 创建src目录
  !fs.existsSync(FULLSRC) && makeDir.sync(FULLSRC);

  // 创建template目录
  const templateDir = path.join(FULLSRC, TEMPLATE);
  !fs.existsSync(templateDir) && makeDir.sync(templateDir);
});

gulp.task('build', ['html', 'css', 'js', 'copy']);

gulp.task('watch', ['build'], () => {
  console.log(`[BAG-TOOL INFO]begin to watch the dir: ${FULLDEST}`);

  // 在本地起一个服务并调起浏览器访问该服务
  if (LIVERELOAD) {
    browserSync.init({
      server: {
        baseDir: FULLDEST
      },
      startPath: STARTPATH
    });
  }

  changedFiles.init(); // 初始化

  // 监听src文件改动
  const stream = watch(SRC, {
    cwd: PROJECT
  }, vinyl => {
    vinyl.history.forEach(file => {
      file = file.replace(/\\/g, '/');
      if (sourceMap.hasKey(file)) {
        sourceMap.get(file).forEach(_file => changedFiles.add(_file));
      } else {
        changedFiles.add(file, vinyl.event);
      }
    });
    gulp.start('reload');
  });

  stream.on('error', e => {
    console.log('watch task error:', e);
  });

  return stream;
});

gulp.task('reload', ['html_watch', 'css_watch', 'js_watch', 'copy_watch', 'clean_watch'], () => {
  if (changedFiles.getLen('all')) {
    if (LIVERELOAD) browserSync.reload(); // 自动刷新页面
    changedFiles.init(); // 重置
  }
});