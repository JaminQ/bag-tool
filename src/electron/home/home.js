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

const fork = require('../../common/fork');
const Base = require('../common/base');
const defaultConfig = require('../../config.json');
const main = require('../../index');

console.log(path.join(__dirname, '../../../').replace(/\\/g, '/'));

const bagToolSpawn = ({
  command,
  idx
}) => {
  const USERCONFIG = vm.getConfig(vm.getConfigFile(idx));
  vm.forkList[idx] = main[command](fork(
    Object.assign({}, {
      modulePath: './node_modules/gulp/bin/gulp.js',
      cwd: path.join(__dirname, '../../../').replace(/\\/g, '/'),
      env: {
        USERCONFIG: JSON.stringify(USERCONFIG),
        PROJECT: vm.projects[idx].path.replace(/\\/g, '/') // 运行命令时的当前路径
      },
      stdout(data) {
        const dataStr = `${data}`;
        if (/\[BAG-TOOL\]/.test(dataStr)) vm.addLog(idx, dataStr.replace(/\[BAG-TOOL\]/, ''));
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

const vm = new Base({
  data: {
    globalTips: '',

    projects: ipcRenderer.sendSync('getData', ['projects']).projects || [],
    workingArr: [],
    nowProjectIdx: '',

    removeMode: false,
    logMode: false,
    infoMode: false,
    aboutMode: false,

    logContent: {},

    info: {}
  },
  created() {
    this.configFile = '';
    this.globalTipsTimeout = null;
    this.forkList = {}; // 记录fork子进程
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
        case 'log':
        default:
          logContent += content
            .replace(/\[\d{2}:\d{2}:\d{2}\]/g, '<span class="log-begin">$&</span>')
            .replace(/\[Browsersync\]/g, '<span class="log-begin">$&</span>')
            .replace(/\d+(\.\d+)? (m|μ)?s/g, '<span class="log-time">$&</span>');
      }

      this.$set(this.logContent, idx, logContent);
    },
    clearLog(idx) {
      this.$set(this.logContent, idx, '');
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
      this.configFile = this.getConfigFile(idx);
      this.info = this.getConfig(this.configFile);
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
  }
});