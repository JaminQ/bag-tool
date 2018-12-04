const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const copy = require('copy');
const del = require('del');
const makeDir = require('make-dir');

const zip = require('../src/utils/zip');

const TEMPPATH = './packager-temp';
const OUTPATH = './out_app';
const spawn = (command, options, success) => { // 简单封装spawn
  console.log(`> ${command}\n`);

  const spawn = childProcess.spawn(command, ['--colors'], Object.assign({
    shell: true
  }, options));

  spawn.stdout.on('data', data => {
    process.stdout.write(`${data}`);
  });

  spawn.stderr.on('data', data => {
    process.stdout.write(`${data}`);
  });

  spawn.on('close', code => {
    if (code === 0) {
      process.stdout.write('\n');
      typeof success === 'function' && success();
    } else {
      console.error(`${command} failed`);
    }
  });
}
const removeTempSync = () => {
  del.sync([`${TEMPPATH}/**`], {
    force: true
  });
};

console.log('> init data\n');

// 如果临时目录存在，先清空
fs.existsSync(TEMPPATH) && removeTempSync();

// 创建临时目录
makeDir.sync(TEMPPATH);

// 复制文件
copy(['gulpfile.js', 'dist/**/*.*', 'package.json'], TEMPPATH, () => {
  // 重写package.json，删除不必要的属性
  const packageJson = JSON.parse(fs.readFileSync(`${TEMPPATH}/package.json`, {
    encoding: 'utf8'
  }));
  delete packageJson.scripts;
  delete packageJson.dependencies['gulp-sass'];
  delete packageJson.dependencies['minimist'];
  delete packageJson.dependencies['node-sass'];
  delete packageJson.bin;
  delete packageJson.devDependencies;
  fs.writeFileSync(path.join(TEMPPATH, 'package.json'), JSON.stringify(packageJson));

  // 修改gulpfile.js的src引用
  const gulpFilePath = path.join(TEMPPATH, 'gulpfile.js');
  fs.writeFileSync(gulpFilePath, fs.readFileSync(gulpFilePath, {
    encoding: 'utf8'
  }).replace(/\/src/g, '/dist'));

  // 修改main.js，不打开开发者工具
  const mainPath = path.join(TEMPPATH, 'dist/electron/main.js');
  fs.writeFileSync(mainPath, fs.readFileSync(mainPath, {
    encoding: 'utf8'
  }).replace(/win\.webContents\.openDevTools\(\);/g, '// $&'));

  // 安装依赖
  spawn('npm i', {
    cwd: TEMPPATH
  }, () => {
    // 如果输出目录存在，先清空
    fs.existsSync(OUTPATH) && del.sync([`${OUTPATH}/**`], {
      force: true
    });

    // 打包
    spawn(`electron-packager ${TEMPPATH} BagTool --out ${OUTPATH} --overwrite`, {}, () => {
      // 清空临时目录
      removeTempSync();

      // 压缩（递归）
      const dirs = fs.readdirSync(OUTPATH);
      const zipRecursion = () => {
        if (dirs.length) {
          const dir = path.join(OUTPATH, dirs.shift());

          console.log(`> zip ${dir}\n`);

          zip({
            inputDir: dir,
            outputFile: dir + '.zip',
            close: archive => {
              console.log(`[output file] ${dir}.zip`);
              console.log(`[total bytes] ${archive.pointer()}\n`);

              zipRecursion();
            }
          });
        } else {
          // K.O.
          console.log('done');
        }
      };
      zipRecursion();
    });
  });
});