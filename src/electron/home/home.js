const path = require('path');
const {
  ipcRenderer,
  shell
} = require('electron');
const {
  dialog
} = require('electron').remote;

const spawn = require('../../common/spawn');
const Base = require('../common/base');

const bagToolSpawn = ({
  command,
  idx,
  cwd
}) => {
  cwd = cwd.replace(/\\/g, '/');
  spawn(Object.assign({}, {
    cwd,
    env: {
      PROJECT: cwd // 运行命令时的当前路径
    },
    stdout(data) {
      console.log(`${data}`);
    },
    stderr(data) {
      console.log(`${data}`);
    },
    error(err) {
      console.log(`${err}`);
    }
  }, {
    begin: () => {
      Vue.set(vm.workingArr, idx, command);
    },
    close: () => {
      Vue.set(vm.workingArr, idx, '');
    }
  }))(`bag-tool  ${command}`);
}

const vm = new Base({
  data: {
    projects: ipcRenderer.sendSync('getData', ['projects']).projects || [],
    workingArr: [],
    nowProjectIdx: '',
    removeMode: false,
    infoMode: false
  },
  methods: {
    // gulp-area
    build(idx) {
      bagToolSpawn({
        command: 'build',
        idx,
        cwd: this.projects[this.nowProjectIdx].path
      });
    },
    watch(idx) {
      console.log('watch', idx);
    },
    init(idx) {
      bagToolSpawn({
        command: 'init',
        idx,
        cwd: this.projects[this.nowProjectIdx].path
      });
    },
    clean(idx) {
      bagToolSpawn({
        command: 'clean',
        idx,
        cwd: this.projects[this.nowProjectIdx].path
      });
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

    infoProject(idx) {
      console.log('info', idx);
      this.infoMode = true;
    },
    removeProject(idx) {
      this.projects.splice(idx, 1);
      ipcRenderer.sendSync('setData', {
        projects: this.projects
      });
    }
  }
});