const del = require('del');
const gulp = require('gulp');

const {
  fullSrc: FULLSRC,
  fullDest: FULLDEST
} = require('../utils/config');
const changedFiles = require('../utils/changedFiles');

gulp.task('clean', () => {
  return del([`${FULLDEST}/**`], {
    force: true
  });
});

gulp.task('clean_watch', () => {
  return del(changedFiles.get('del').map(src => src.replace(FULLSRC, FULLDEST)), {
    force: true
  });
});