const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

module.exports = (inputDir, outputFile) => {
  // 如果存在该输出文件，先删除
  fs.existsSync(outputFile) && fs.unlinkSync(outputFile);

  const output = fs.createWriteStream(outputFile);
  const archive = archiver('zip', {
    zlib: {
      level: 9 // 设置压缩级别
    }
  });

  output.on('close', () => {
    console.info(`[BAG-TOOL][output file] ${outputFile}`);
    console.info(`[BAG-TOOL][total bytes] ${archive.pointer()}`);
  });

  output.on('end', () => {
    console.info('Data has been drained');
  });

  archive.on('warning', err => {
    if (err.code === 'ENOENT') {
      // log warning
      console.warn(err);
    } else {
      // throw error
      throw err;
    }
  });

  archive.on('error', err => {
    throw err;
  });

  archive.pipe(output);

  archive.directory(inputDir, path.basename(inputDir));

  archive.finalize();
};