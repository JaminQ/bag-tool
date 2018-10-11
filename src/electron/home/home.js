const {
  ipcRenderer
} = require('electron');
const path = require('path');
const {
  dialog
} = require('electron').remote;

const {
  showDetailLog
} = require('../../utils/config');
const spawn = require('../../common/spawn')({
  cwd: path.join(__dirname.replace(/\\/g, '/'), '../../../'),
  env: {
    PROJECT: process.cwd().replace(/\\/g, '/') // 运行命令时的当前路径
  },
  stdout(data) {
    showDetailLog && console.log(`${data}`);
  },
  stderr(data) {
    console.log(`${data}`);
  },
  error(err) {
    console.log(`${err}`);
  },
  close() {
    console.log('done');
  }
});
const Base = require('../common/base');

new Base({
  data: {
    projects: ipcRenderer.sendSync('getData', ['projects']).projects || []
  },
  methods: {
    build() {
      spawn('gulp build');
    },
    watch() {
      console.log('watch');
    },
    init() {
      console.log('init');
    },
    clean() {
      spawn('gulp clean');
    },

    addProject() {
      dialog.showOpenDialog({
        title: '添加新项目',
        properties: ['openDirectory']
      }, filePaths => {
        filePaths.forEach(filePath => {
          this.projects.push({
            title: path.basename(filePath),
            path: filePath
          });
        });
        ipcRenderer.sendSync('setData', {
          projects: this.projects
        });
      });
    }
  }
});