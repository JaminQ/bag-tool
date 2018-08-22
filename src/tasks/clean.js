const del = require('del');
const gulp = require('gulp');

const {
  dest: DEST
} = require('../utils/config');

gulp.task('clean', () => {
  if (!global.isWatch) { // watch的时候不clean
    return del([`${DEST}/**`], {
      force: true
    });
  }
});