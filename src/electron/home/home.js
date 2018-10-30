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

const spawn = require('../../common/spawn');
const Base = require('../common/base');
const defaultConfig = require('../../config.json');
const main = require('../../index');

const bagToolSpawn = ({
  command,
  idx,
  cwd
}) => {
  cwd = cwd.replace(/\\/g, '/');
  vm.spawnList[idx] = main[command](spawn(
    Object.assign({}, {
      cwd: path.join(__dirname, '../../../').replace(/\\/g, '/'),
      env: {
        PROJECT: cwd // 运行命令时的当前路径
      },
      stdout(data) {
        vm.addLog({
          content: `${data}`,
          idx
        });
      },
      stderr(data) {
        vm.addLog({
          content: `${data}`,
          idx,
          type: 'error'
        });
      },
      error(err) {
        vm.addLog({
          content: `${err}`,
          idx,
          type: 'error'
        });
      },
      begin: () => {
        vm.logMode = true;
        vm.addLog({
          content: `bag-tool ${command}`,
          idx,
          type: 'command'
        });
        Vue.set(vm.workingArr, idx, command);
      },
      close: code => {
        vm.addLog({
          content: code === 0 ? 'done' : 'cancel',
          idx,
          type: 'finish'
        });
        vm.spawnList[idx] = null;
        Vue.set(vm.workingArr, idx, '');
      }
    })
  ));
};

const vm = new Base({
  data: {
    globalTips: '',

    projects: ipcRenderer.sendSync('getData', ['projects']).projects || [],
    workingArr: [],
    nowProjectIdx: '',

    removeMode: false,
    logMode: false,
    infoMode: false,
    configFile: '',
    aboutMode: false,

    logContent: {},

    info: {}
  },
  created() {
    this.globalTipsTimeout = null;
    this.spawnList = {}; // 记录spawn子进程
  },
  methods: {
    // gulp-area
    gulp(idx, command) {
      const working = this.workingArr[idx];
      if (!working) {
        bagToolSpawn({
          command,
          idx,
          cwd: this.projects[idx].path
        });
      } else if (working === command) {
        if (this.spawnList[idx]) {
          if (process.platform === 'win32') {
            childProcess.exec(`taskkill /PID ${this.spawnList[idx].pid} /T /F`);
          } else {
            process.kill(this.spawnList[idx].pid);
          }
        }
      } else {
        this.globalTip('请先等待任务执行完毕');
      }
    },

    // log
    addLog({
      content,
      idx = 0,
      type = 'log'
    }) {
      // init
      typeof this.logContent[idx] === 'undefined' && this.clearLog(idx);

      const logContent = this.logContent[idx];

      switch (type) {
        case 'command':
          logContent.push({
            cls: 'log-command',
            content,
            end: true
          });
          break;
        case 'finish':
          logContent.push({
            cls: 'log-finish',
            content,
            end: true
          });
          break;
        case 'log':
        case 'error':
        default:
          content.split(/\s/).forEach(cnt => {
            if (cnt !== '') {
              let cls = type === 'error' ? 'log-error' : '';
              let end = false;

              if (/\[\d{2}:\d{2}:\d{2}\]/.test(cnt)) {
                cls = cls || 'log-begin';
                end = true;
              } else if (/\d+(\.\d+)?/.test(cnt)) {
                cls = cls || 'log-time';
              } else if (
                cnt === 'ms' ||
                cnt === 'μs' ||
                cnt === 's'
              ) {
                cls = cls || 'log-time';
              } else if (cnt === '[Browsersync]') {
                cls = cls || 'log-begin';
                end = true;
              }

              logContent.push({
                cls,
                content: cnt,
                end
              });
            }
          });
      }
    },
    clearLog(idx) {
      this.$set(this.logContent, idx, []);
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
            this.init(this.projects.length - 1);
          });
          ipcRenderer.sendSync('setData', {
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
      this.aboutMode = true;
    },

    infoProject(idx) {
      this.configFile = path.join(
        this.projects[idx].path,
        'bag-tool-config.json'
      );
      if (fs.existsSync(this.configFile)) {
        this.info = Object.assign({},
          defaultConfig,
          JSON.parse(
            fs.readFileSync(this.configFile, {
              encoding: 'utf8'
            })
          )
        );
      } else {
        this.info = Object.assign({}, defaultConfig);
      }
      this.infoMode = true;
    },
    removeProject(idx) {
      this.projects.splice(idx, 1);
      ipcRenderer.sendSync('setData', {
        projects: this.projects
      });
    },

    // info-page
    closeInfoPage() {
      this.infoMode = false;
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
    openUrl(url) {
      shell.openExternal(url);
    }
  }
});