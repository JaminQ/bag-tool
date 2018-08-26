const del = require('del');
const gulp = require('gulp');

const {
  dest: DEST
} = require('../utils/config');

gulp.task('clean', () => {
  return del([`${DEST}/**`], {
    force: true
  });
});