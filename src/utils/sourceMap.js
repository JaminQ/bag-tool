const sourceMap = {};

module.exports = {
  set(key, value) {
    if (!this.hasKey(key)) sourceMap[key] = []; // 初始化key
    if (sourceMap[key].indexOf(value) > -1) return; // 已存在的话忽略
    sourceMap[key].push(value);
  },
  get(key) {
    return sourceMap[key] || [];
  },
  getData() {
    return sourceMap;
  },
  getKeys() {
    return Object.keys(sourceMap);
  },
  getValues() {
    return Object.values(sourceMap);
  },
  hasKey(key) {
    return sourceMap[key] !== undefined;
  }
};