const gulp = require('gulp');
const requireDir = require('require-dir');
const lazypipe = require('lazypipe');
const merge = require('merge-stream');

const {
  common: {
    getSrc
  },
  changedFiles,
  config: {
    fullSrc: FULLSRC,
    fullDest: FULLDEST,
    tmplExtname: TMPLEXTNAME,
    styleExtname: STYLEEXTNAME,
    jsExtname: JSEXTNAME,
    whiteList: WHITELIST
  }
} = requireDir('../utils');

const getParseCopyPipe = () => {
  return lazypipe()
    .pipe(gulp.dest, FULLDEST);
};

gulp.task('copy', ['clean'], () => {
  const copyStream = gulp.src(getSrc({
      src: FULLSRC,
      includeExtname: ['*.*'],
      excludeExtname: TMPLEXTNAME.concat(STYLEEXTNAME, JSEXTNAME)
    }), {
      base: FULLSRC
    })
    .pipe(getParseCopyPipe()());

  copyStream.on('error', e => {
    console.error('copy task error:', e);
  });

  if (WHITELIST.length) {
    const copyWhiteListStream = gulp.src(getSrc({
        src: FULLSRC,
        include: WHITELIST
      }), {
        base: FULLSRC
      })
      .pipe(getParseCopyPipe()());

    copyWhiteListStream.on('error', e => {
      console.error('copy whiteList task error:', e);
    });

    return merge(copyStream, copyWhiteListStream);
  } else {
    return copyStream;
  }
});

gulp.task('copy_watch', () => {
  const copyFiles = changedFiles.get('copy');
  const stream = gulp.src(copyFiles.length ? copyFiles.concat(getSrc({
      src: FULLSRC
    })) : copyFiles, {
      base: FULLSRC
    })
    .pipe(getParseCopyPipe()());

  stream.on('error', e => {
    console.error('copy_watch task error:', e);
  });

  return stream;
});

module.exports = {
  getPipe: getParseCopyPipe
};