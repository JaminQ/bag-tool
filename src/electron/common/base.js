const {
  ipcRenderer
} = require('electron');

module.exports = Vue.extend({
  el: '#app',
  data() {
    return {
      isMaximized: false,
      windowTitle: 'Bag Tool',
      globalTips: '',
      globalTipsType: ''
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

    globalTip(tip = '', type = 'suc') {
      if (tip === '') return;

      this.globalTipsType = type;
      this.globalTips = tip;
      this.globalTipsTimeout !== null && clearTimeout(this.globalTipsTimeout);
      this.globalTipsTimeout = setTimeout(() => {
        this.globalTipsType = '';
        this.globalTips = '';
        this.globalTipsTimeout = null;
      }, 3000);
    }
  }
});