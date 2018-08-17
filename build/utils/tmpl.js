const fs = require('fs');
const path = require('path').posix;
const iconv = require('iconv-lite');

const {
  encoding: ENCODING,
  template: TEMPLATE
} = require('./config');

function include(content, basePath) {
  return content.replace(/<%@include\((.*?)\)%>/g, (w, m) => {
    let _partName = '',
      _content = '';
    m = m.split('#');
    m.length > 1 && (_partName = m[1]);

    if (m[0]) {
      const _filePath = path.join(basePath, TEMPLATE, m[0]);
      if (fs.existsSync(_filePath)) {
        _content = fs.readFileSync(_filePath);
        _content = iconv.decode(_content, ENCODING);

        if (_partName) {
          const reg = new RegExp(`<%#${_partName}%>([\\s\\S]*?)<%#/${_partName}%>`);
          _content = _content.match(reg);
          _content = _content ? _content[1] : '';
        }
      } else {
        _content = '';
      }
    } else {
      _content = '';
    }

    return _content;
  });
}

module.exports = (content, basePath) => {
  content = include(content, basePath);
  return content;
};