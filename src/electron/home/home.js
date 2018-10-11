const path = require('path');
const {
  ipcRenderer,
  shell
} = require('electron');
const {
  dialog
} = require('electron').remote;

const {
  showDetailLog
} = require('../../utils/config');
const spawn = require('../../common/spawn');
const Base = require('../common/base');

const spawnOpt = {
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
  }
};

const vm = new Base({
  data: {
    projects: ipcRenderer.sendSync('getData', ['projects']).projects || [],
    workingArr: [],
    nowProjectIdx: '',
    removeMode: false
  },
  methods: {
    // gulp-area
    build(idx) {
      spawn(Object.assign({}, spawnOpt, {
        begin: () => {
          Vue.set(this.workingArr, idx, true);
        },
        close: () => {
          console.log('done');
          Vue.set(this.workingArr, idx, false);
        }
      }))('gulp build');
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

    // bottom-bar
    addProject() {
      dialog.showOpenDialog({
        title: '添加新项目',
        properties: ['openDirectory']
      }, filePaths => {
        if (!filePaths) return;

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
    },
    removeProjects() {
      this.removeMode = !this.removeMode;
    },
    openProject() {
      shell.showItemInFolder(this.projects[this.nowProjectIdx].path);
    },

    removeProject(idx) {
      this.projects.splice(idx, 1);
      ipcRenderer.sendSync('setData', {
        projects: this.projects
      });
    }
  }
});