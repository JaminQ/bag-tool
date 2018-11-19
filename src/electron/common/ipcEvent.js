const {
  ipcRenderer
} = require('electron');

module.exports = vm => {
  ipcRenderer.on('maximize', () => {
    vm.isMaximized = true;
  });

  ipcRenderer.on('unmaximize', () => {
    vm.isMaximized = false;
  });
};