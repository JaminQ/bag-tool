const {
  ipcRenderer
} = require('electron');

module.exports = Vue.extend({
  el: '#app',
  data() {
    return {
      isMaximized: false,
      windowTitle: 'Bag Tool'
    };
  },
  methods: {
    windowClose() {
      ipcRenderer.send('closeWindow');
    },
    windowMinimize() {
      ipcRenderer.send('minimizeWindow');
    },
    windowFull() {
      ipcRenderer.send('maxmizeWindow');
    }
  }
});