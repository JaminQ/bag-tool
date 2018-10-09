// const {
//   ipcRenderer
// } = require('electron');

// ipcRenderer.on('test-res', (event, arg) => {
//   console.log(arg);
// });
// ipcRenderer.send('test', 'ping');

const spawn = require('../../common/spawn');

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