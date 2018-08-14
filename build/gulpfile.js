const gulp = require('gulp');
const del = require('del');
const changed = require('gulp-changed');
const browserSync = require('browser-sync').create();
const requireDir = require('require-dir');
const through2 = require('through2');

const {
  src: SRC,
  dest: DEST
} = require('./config.json');
const tasks = requireDir('./tasks');

gulp.task('default', ['build'], () => {});

gulp.task('build', ['clean'], () => {
  return gulp.src(`${SRC}/*.*`)
    .pipe(changed(DEST)) // 仅传递更改过的文件
    .pipe(gulp.dest(DEST));
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
    }
  });

  return gulp.watch(['*'], {
    cwd: SRC
  }, ['reload']);
});

gulp.task('reload', ['build'], () => {
  browserSync.reload();
});

function through(callback) {
  return through2.obj(function(file, enc, cb) {
    let contentStr = '';
    if (file.isBuffer()) {
      contentStr = file.contents.toString();
    } else {
      contentStr = file;
    }
    console.log(contentStr);
    if (typeof callback === 'function') {
      contentStr = callback(contentStr, enc, cb);
    }
    file.contents = new Buffer(contentStr);
    this.push(file);
    cb(null, file);
  });
}