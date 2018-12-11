const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const requireDir = require('require-dir');
const makeDir = require('make-dir');

requireDir('./src/tasks');
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
  },
  zip
} = requireDir('./src/utils');

let argv;
if (process.env.ARGV !== undefined) {
  argv = JSON.parse(process.env.ARGV);
} else {
  argv = require('minimist')(process.argv.slice(2));
}

// 设置build为默认task
gulp.task('default', ['build']);

// 初始化
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

// 编译
gulp.task('build', ['html', 'css', 'js', 'copy']);

// 编译+监听
gulp.task('start', ['build'], () => {
  console.info(`[BAG-TOOL]begin to watch the dir: ${FULLDEST}`);

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
      if (sourceMap.hasKey(file)) {
        sourceMap.get(file).forEach(_file => changedFiles.set(_file));
      }
      changedFiles.set(file, vinyl.event);
    });
    gulp.start('reload');
  });

  stream.on('error', e => {
    console.error('watch task error:', e);
  });

  return stream;
});

// 重载浏览器页面（刷新浏览器页面）
gulp.task('reload', ['html_watch', 'css_watch', 'js_watch', 'copy_watch', 'clean_watch'], () => {
  if (changedFiles.getLen()) {
    if (LIVERELOAD) browserSync.reload(); // 自动刷新页面
    changedFiles.init(); // 重置
  }
});

// 导出dest并zip压缩
gulp.task('export', () => {
  if (!fs.existsSync(FULLDEST)) { // 没有dest目录，提示
    console.error(`Did't find your dest-dir(${FULLDEST}), maybe you need \`bag-tool build\` first.`);
    process.exitCode = -1;
  } else {
    let outputFile = argv.output || 'out.zip';
    if (!path.isAbsolute(outputFile)) outputFile = path.join(PROJECT, outputFile); // 如果是相对路径，转化为绝对路径
    zip({
      inputDir: FULLDEST,
      outputFile,
      close: archive => {
        console.info(`[BAG-TOOL][output file] ${outputFile}`);
        console.info(`[BAG-TOOL][total bytes] ${archive.pointer()}`);
      }
    });
  }
});