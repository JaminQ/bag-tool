const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const {
  ipcRenderer,
  shell
} = require('electron');
const {
  dialog
} = require('electron').remote;
const ansiHTML = require('ansi-html');

const fork = require('../../../common/fork');
const Base = require('../../common/base');
const defaultConfig = require('../../../config.json');
const main = require('../../../index');

const {
  projects = [],
  logHeight = 200
} = ipcRenderer.sendSync('getDataSync', ['projects', 'logHeight']);

const vm = new Base({
  data: {
    globalTips: '',

    projects,
    workingArr: [],
    nowProjectIdx: '',

    removeMode: false,
    logMode: true,
    infoMode: false,
    aboutMode: false,

    logContent: {},
    logHeight,
    logMoveStatus: false,

    info: {}
  },
  created() {
    this.configFile = '';
    this.globalTipsTimeout = null;
    this.forkList = {}; // 记录fork子进程

    this.logMoveEnd = () => {
      this.logMoveStatus = false;
      const maxHeight = window.innerHeight - 164;
      const minHeight = 80;
      if (this.logHeight > maxHeight) {
        this.logHeight = maxHeight;
      } else if (this.logHeight < minHeight) {
        this.logHeight = minHeight;
      }
      ipcRenderer.send('setData', {
        logHeight: this.logHeight
      });
    };
    document.addEventListener('mouseup', this.logMoveEnd);
  },
  methods: {
    // gulp-area
    gulp(idx, command) {
      const working = this.workingArr[idx];
      if (!working) {
        bagToolSpawn({
          command,
          idx
        });
      } else if (working === command) {
        if (this.forkList[idx]) {
          if (process.platform === 'win32') {
            childProcess.exec(`taskkill /PID ${this.forkList[idx].pid} /T /F`);
          } else {
            process.kill(this.forkList[idx].pid);
          }
        }
      } else {
        this.globalTip('请先等待任务执行完毕');
      }
    },

    // log
    addLog(idx = 0, content, type = 'log') {
      // init
      typeof this.logContent[idx] === 'undefined' && this.clearLog(idx);

      let logContent = this.logContent[idx];

      switch (type) {
        case 'command':
        case 'finish':
        case 'cancel':
          logContent += `<span class="log-${type}">${content}</span>\n`;
          break;
        case 'error':
          logContent += `<span class="log-${type}">${content}</span>`;
          break;
        default:
          logContent += ansiHTML(content);
      }

      this.$set(this.logContent, idx, logContent);
    },
    clearLog(idx) {
      if (typeof idx !== 'number') return;
      this.$set(this.logContent, idx, '');
    },
    logMoveBegin() {
      this.logMoveStatus = true;
    },
    logMoving(e) {
      if (!this.logMoveStatus) return;

      const windowHeight = window.innerHeight;
      const y = e.movementY;
      const clientY = e.clientY;
      const height = this.logHeight;
      const top = windowHeight - height - 24;
      const maxHeight = windowHeight - 164;
      const minHeight = 80;
      if ((y < 0 && height < maxHeight && clientY <= top) || (y > 0 && height > minHeight && clientY >= top)) {
        this.logHeight -= y;
      }
    },

    // bottom-bar
    addProject() {
      dialog.showOpenDialog({
          title: '添加新项目',
          properties: ['openDirectory']
        },
        filePaths => {
          if (!filePaths) return;

          filePaths.forEach(filePath => {
            this.projects.push({
              title: path.basename(filePath),
              path: filePath
            });
            this.gulp(this.projects.length - 1, 'init');
          });
          ipcRenderer.send('setData', {
            projects: this.projects
          });
        }
      );
    },
    removeProjects() {
      this.removeMode = !this.removeMode;
    },
    openProject() {
      shell.showItemInFolder(this.projects[this.nowProjectIdx].path);
    },
    aboutUs() {
      this.logMode = false;
      this.aboutMode = true;
      this.windowTitle = '';
    },

    infoProject(idx, title) {
      this.configFile = this.getConfigFile(idx);
      this.info = this.getConfig(this.configFile);
      this.logMode = false;
      this.infoMode = true;
      this.windowTitle = `${title} 配置`;
    },
    removeProject(idx) {
      this.projects.splice(idx, 1);
      ipcRenderer.send('setData', {
        projects: this.projects
      });
    },

    // info-page
    closeInfoPage() {
      this.infoMode = false;
      this.windowTitle = 'Bag Tool';
      this.configFile = '';
    },
    saveInfo() {
      if (this.configFile !== '') {
        fs.writeFile(
          this.configFile,
          JSON.stringify(this.info), {
            encoding: 'utf8'
          },
          () => {
            this.closeInfoPage();
          }
        );
      } else {
        this.closeInfoPage();
      }
    },

    // about-page
    closeAboutPage() {
      this.aboutMode = false;
      this.windowTitle = 'Bag Tool';
    },

    // common
    globalTip(tip = '') {
      if (tip === '') return;
      this.globalTips = tip;
      this.globalTipsTimeout !== null && clearTimeout(this.globalTipsTimeout);
      this.globalTipsTimeout = setTimeout(() => {
        this.globalTips = '';
        this.globalTipsTimeout = null;
      }, 3000);
    },
    arrAdd(arr, val = '') {
      arr.push(val);
    },
    arrRemove(arr, idx = 0, len = 1) {
      arr.splice(idx, len);
    },
    getConfigFile(idx) {
      return path.join(this.projects[idx].path, 'bag-tool-config.json');
    },
    getConfig(file) {
      if (fs.existsSync(file)) {
        return Object.assign({},
          defaultConfig,
          JSON.parse(
            fs.readFileSync(file, {
              encoding: 'utf8'
            })
          )
        );
      } else {
        return Object.assign({}, defaultConfig);
      }
    },
    openUrl(url) {
      shell.openExternal(url);
    }
  },
  beforeDestroy() {
    if (this.infoMode) this.saveInfo();
  },
  destroyed() {
    document.removeEventListener('mouseup', this.logMoveEnd);
  }
});

const bagToolSpawn = ({
  command,
  idx
}) => {
  const USERCONFIG = vm.getConfig(vm.getConfigFile(idx));
  vm.forkList[idx] = main[command](fork(
    Object.assign({}, {
      modulePath: './../node_modules/gulp/bin/gulp.js',
      cwd: path.join(__dirname, '../../../').replace(/\\/g, '/'),
      env: {
        USERCONFIG: JSON.stringify(USERCONFIG),
        PROJECT: vm.projects[idx].path.replace(/\\/g, '/') // 运行命令时的当前路径
      },
      stdout(data) {
        const dataStr = `${data}`;
        if (/\[BAG-TOOL\]/.test(dataStr)) vm.addLog(idx, dataStr.replace(/\[BAG-TOOL\]/, '$& '));
        else USERCONFIG.showDetailLog && vm.addLog(idx, dataStr);
      },
      stderr(data) {
        vm.addLog(idx, `${data}`, 'error');
      },
      error(err) {
        vm.addLog(idx, `${data}`, 'error');
      },
      begin: () => {
        vm.logMode = true;
        vm.addLog(idx, `bag-tool ${command}`, 'command');
        Vue.set(vm.workingArr, idx, command);
      },
      close: code => {
        if (code === 0) vm.addLog(idx, 'done', 'finish');
        else vm.addLog(idx, 'stop', 'cancel');
        vm.forkList[idx] = null;
        Vue.set(vm.workingArr, idx, '');
      }
    })
  ));
};

require('../../common/ipcEvent')(vm);