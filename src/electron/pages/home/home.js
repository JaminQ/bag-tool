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
const Mousetrap = require('mousetrap');

const fork = require('../../../utils/fork');
const Base = require('../../common/base');
const defaultConfig = require('../../../config.json');
const main = require('../../../index');
const {
  arrAdd,
  arrRemove,
  arrChangeItem,
  arrDelEmptyItem,
  openUrl
} = require('../../common/common');

require('../../common/components/dialog/dialog');

const {
  projects = [],
    logHeight = 200
} = ipcRenderer.sendSync('getDataSync', ['projects', 'logHeight']);

const vm = new Base({
  data: {
    projects,
    nowProjectIdx: '',
    moveProjectIdx: '',
    delProjectIdx: '',
    projectTop: 0,

    editMode: false,
    logMode: false,
    infoMode: false,
    aboutMode: false,

    logHeight,
    logMoveStatus: false,

    info: {}
  },
  created() {
    this.configFile = '';

    this.documentMouseup = () => {
      if (this.logMoveStatus) {
        this.logMoveStatus = false;
        const maxHeight = window.innerHeight - 164;
        const minHeight = 80;
        if (this.logHeight > maxHeight) {
          this.logHeight = maxHeight;
        } else if (this.logHeight < minHeight) {
          this.logHeight = minHeight;
        }
        ipcRenderer.send('setData', [{
          key: 'logHeight',
          data: this.logHeight
        }]);
      }

      if (this.moveProjectIdx !== '') {
        this.moveProjectIdx = '';
      }
    };
    document.addEventListener('mouseup', this.documentMouseup);

    // 快捷键操作
    this.documentKeydown = e => {
      e.preventDefault();
    };
    document.addEventListener('keydown', this.documentKeydown);

    Mousetrap.bind(['command+.', 'ctrl+.'], () => { // 开关日志面板
      if (this.nowProjectIdx !== '') {
        this.logMode = !this.logMode;
      } else {
        this.globalTip('请先选择一个项目', 'err');
      }
    });

    Mousetrap.bind('up', () => { // 上移项目焦点
      if (this.nowProjectIdx !== '' && this.nowProjectIdx > 0) this.nowProjectIdx--;
    });

    Mousetrap.bind('down', () => { // 上移项目焦点
      if (this.nowProjectIdx === '') this.nowProjectIdx = 0;
      else if (this.nowProjectIdx < this.projects.length - 1) this.nowProjectIdx++;
    });

    Mousetrap.bind('esc', () => { // 取消项目焦点
      this.nowProjectIdx = '';
      this.logMode = false;
    });
  },
  computed: {
    nowProject() {
      return this.projects[this.nowProjectIdx] || {};
    }
  },
  methods: {
    dropProject(e) {
      this.addProject(Array.prototype.map.call(e.dataTransfer.files, file => file.path));
    },

    // gulp-area
    gulp(idx, command, argv, close) {
      const workStatus = this.projects[idx].workStatus;
      if (!workStatus) {
        bagToolSpawn({
          command,
          argv,
          idx,
          notOpenLogArea: command === 'init',
          close
        });
      } else if (workStatus === command) {
        this.killGulp(idx);
      } else {
        this.globalTip('请先等待任务执行完毕', 'err');
      }
    },
    killGulp(idx) {
      if (this.projects[idx].fork) {
        if (process.platform === 'win32') {
          childProcess.exec(`taskkill /PID ${this.projects[idx].fork.pid} /T /F`);
        } else {
          process.kill(this.projects[idx].fork.pid);
        }
      }
    },

    // log
    addLog(idx = 0, content, type = 'log') {
      // init
      typeof this.projects[idx].logContent === 'undefined' && this.clearLog(idx);

      let logContent = this.projects[idx].logContent;

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

      this.projects[idx].logContent = logContent;
    },
    clearLog(idx) {
      if (typeof idx !== 'number') return;
      this.$set(this.projects[idx], 'logContent', '');
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
    addProjects() {
      dialog.showOpenDialog({
          title: '添加新项目',
          properties: ['openDirectory', 'multiSelections', 'createDirectory', 'promptToCreate']
        },
        this.addProject
      );
    },
    openProject(filePath) {
      if (!filePath || typeof filePath !== 'string') return;
      shell.showItemInFolder(filePath);
    },
    exportProject() {
      dialog.showOpenDialog({
          title: '选择导出文件',
          defaultPath: path.join(this.projects[this.nowProjectIdx].path, 'out.zip'),
          buttonLabel: '导出并压缩',
          filters: [{
            name: 'Zips',
            extensions: ['zip']
          }],
          properties: ['openFile', 'createDirectory', 'promptToCreate']
        },
        filePaths => {
          if (!filePaths) return;

          const output = filePaths[0];
          this.gulp(this.nowProjectIdx, 'export', {
            output
          }, code => { // 完成后自动打开zip所在目录
            if (code === 0) this.openProject(output);
          });
        }
      );
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
      this.delProjectIdx = idx;
    },
    doRemoveProject() {
      const idx = this.delProjectIdx;
      this.delProjectIdx = '';
      if (this.nowProjectIdx === idx) {
        this.nowProjectIdx = '';
      } else if (this.nowProjectIdx > idx) {
        this.nowProjectIdx--;
      }
      this.projects.splice(idx, 1);
      ipcRenderer.send('setData', [{
        type: 'delete',
        key: 'projects',
        data: idx
      }]);
    },
    movingProject(e) {
      this.projectTop += e.movementY;

      const moveToIdx = Math.floor((this.projectTop + 25) / 50) + this.moveProjectIdx;
      if (moveToIdx >= 0 && moveToIdx < this.projects.length && moveToIdx !== this.moveProjectIdx) {
        this.arrChangeItem(this.projects, moveToIdx, this.moveProjectIdx);
        this.projectTop += (this.moveProjectIdx - moveToIdx) * 50;

        ipcRenderer.send('setData', [{
          type: 'change',
          key: 'projects',
          data: [moveToIdx, this.moveProjectIdx]
        }]);

        this.moveProjectIdx = moveToIdx;
      }
    },

    // info-page
    closeInfoPage() {
      this.infoMode = false;
      this.windowTitle = 'Bag Tool';
      this.configFile = '';
    },
    saveInfo() {
      if (this.configFile !== '') {
        this.info.tmplExtname = this.arrDelEmptyItem(this.info.tmplExtname);
        this.info.whiteList = this.arrDelEmptyItem(this.info.whiteList);
        this.info.ignore = this.arrDelEmptyItem(this.info.ignore);
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
    arrAdd,
    arrRemove,
    arrChangeItem,
    arrDelEmptyItem,
    openUrl,
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
    addProject(filePaths) {
      if (!filePaths) return;

      const projects = [];
      filePaths.forEach(filePath => {
        const project = {
          title: path.basename(filePath),
          path: filePath
        };
        projects.push(project);
        this.projects.push(Object.assign({}, project)); // 浅复制一下
        this.gulp(this.projects.length - 1, 'init');
      });
      ipcRenderer.send('setData', [{
        type: 'concat',
        key: 'projects',
        data: projects
      }]);
    },

    radioFocus(e) {
      e.target.blur();
    }
  },
  beforeDestroy() {
    if (this.infoMode) this.saveInfo();

    // 销毁前手动把所有子进程杀掉
    this.projects.forEach((project, idx) => {
      if (project.fork !== undefined) this.killGulp(idx);
    });

    document.removeEventListener('mouseup', this.documentMouseup);
    document.removeEventListener('keydown', this.documentKeydown);
  }
});

const bagToolSpawn = ({
  command,
  argv = {},
  idx,
  notOpenLogArea,
  close
}) => {
  const USERCONFIG = vm.getConfig(vm.getConfigFile(idx));
  vm.projects[idx].fork = main.gulp(fork(
    Object.assign({}, {
      modulePath: './../node_modules/gulp/bin/gulp.js',
      cwd: path.join(__dirname, '../../../'),
      env: {
        USERCONFIG: JSON.stringify(USERCONFIG),
        PROJECT: vm.projects[idx].path, // 运行命令时的当前路径
        ARGV: JSON.stringify(argv)
      },
      stdout(data) {
        const dataStr = `${data}`;
        if (/\[BAG-TOOL\]/.test(dataStr)) vm.addLog(idx, dataStr.replace(/\[BAG-TOOL\]/g, ''));
        else USERCONFIG.showDetailLog && vm.addLog(idx, dataStr);
      },
      stderr(data) {
        vm.addLog(idx, `${data}`, 'error');
      },
      error(err) {
        vm.addLog(idx, `${err}`, 'error');
      },
      begin: () => {
        if (!notOpenLogArea) vm.logMode = true;
        vm.addLog(idx, `bag-tool ${command}`, 'command');
        Vue.set(vm.projects[idx], 'workStatus', command);
      },
      close: code => {
        if (code === 0) vm.addLog(idx, 'done\n', 'finish');
        else vm.addLog(idx, 'stop\n', 'cancel');
        vm.projects[idx].fork = null;
        Vue.set(vm.projects[idx], 'workStatus', '');
        typeof close === 'function' && close(code);
      }
    })
  ), [command]);
};

require('../../common/ipcEvent')(vm);