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

var vm = new Vue({
  el: '#body',
  data: {
    title: 'Bag Tool'
  },
  methods: {
    build() {
      spawn('gulp build');
    },
    clean() {
      spawn('gulp clean');
    }
  }
});