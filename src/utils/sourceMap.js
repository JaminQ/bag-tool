const sourceMap = {};

module.exports = {
  set(key, value) {
    if (sourceMap[key] === undefined) sourceMap[key] = [];
    sourceMap[key].push(value);
  },
  get(key) {
    return sourceMap[key] || [];
  },
  getAll() {
    return sourceMap;
  }
};