const del = require('del');
const path = require('path').posix;
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
  const delFiles = changedFiles.get('del');
  const pos = FULLSRC.length;
  return del(delFiles.map(src => path.join(FULLDEST, src.slice(pos))), {
    force: true
  });
});