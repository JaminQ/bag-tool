const {
  ipcRenderer
} = require('electron');

module.exports = Vue.extend({
  el: '#app',
  data() {
    return {
      isMaximized: false,
      windowTitle: 'Bag Tool',
      globalTips: ''
    };
  },
  created() {
    this.globalTipsTimeout = null;
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
    },

    globalTip(tip = '') {
      if (tip === '') return;
      this.globalTips = tip;
      this.globalTipsTimeout !== null && clearTimeout(this.globalTipsTimeout);
      this.globalTipsTimeout = setTimeout(() => {
        this.globalTips = '';
        this.globalTipsTimeout = null;
      }, 3000);
    }
  }
});