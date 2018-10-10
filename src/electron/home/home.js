// const {
//   ipcRenderer
// } = require('electron');

// ipcRenderer.on('test-res', (event, arg) => {
//   console.log(arg);
// });
// ipcRenderer.send('test', 'ping');

const path = require('path');
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

var vm = new Base({
  data: {
    title: 'Bag Tool GUI版',
    projects: [{
      title: 'wechat-game'
    }, {
      title: 'wechat-city'
    }]
  },
  methods: {
    build() {
      spawn('gulp build');
    },
    clean() {
      spawn('gulp clean');
    },

    addProject() {
      console.log('addProject');
    }
  }
});