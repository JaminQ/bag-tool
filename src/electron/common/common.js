const {
  shell
} = require('electron');

module.exports = {
  arrAdd(arr, val = '') {
    arr.push(val);
  },
  arrRemove(arr, idx = 0, len = 1) {
    arr.splice(idx, len);
  },
  arrChangeItem(arr, small, big) {
    if (small === big) return false;

    if (small > big) { // 如果small比big大，交换一下位置
      small = small + big;
      big = small - big;
      small = small - big;
    }
    arr.splice(big, 0, arr.splice(small, 1, arr.splice(big, 1)[0])[0]);
  },
  arrDelEmptyItem(arr) {
    const newArr = [];
    arr.forEach(item => {
      if (item !== '') newArr.push(item);
    });
    return newArr;
  },
  openUrl(url) {
    shell.openExternal(url);
  }
};