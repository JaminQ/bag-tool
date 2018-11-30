const sourceMap = {};

const getRelatedFiles = (key, result) => {
  (sourceMap[key] || []).forEach(file => {
    if (result.indexOf(file) === -1) {
      result.push(file);
      getRelatedFiles(file, result);
    }
  });
  return result;
};

module.exports = {
  set(key, value) {
    if (!this.hasKey(key)) sourceMap[key] = []; // 初始化key
    if (sourceMap[key].indexOf(value) > -1) return; // 已存在的话忽略
    sourceMap[key].push(value);
  },
  get(key = 'all') {
    if (key === 'all') return sourceMap;
    return getRelatedFiles(key, []);
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