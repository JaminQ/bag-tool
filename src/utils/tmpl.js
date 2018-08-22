const fs = require('fs');
const path = require('path').posix;
const iconv = require('iconv-lite');

const {
  attrs2obj
} = require('./common');
const {
  encoding: ENCODING,
  template: TEMPLATE
} = require('../config');

function include(content, basePath) {
  return content.replace(/<bagjs-include([\s\S]*?)>([\s\S]*?)<\/bagjs-include>/g, (w, attrs, content) => {
    attrs = attrs.trim();
    content = content.trim();

    let _content = '';
    if (attrs) { // 必须要有属性
      const attrsObj = attrs2obj(attrs);
      if (attrsObj.file) { // 必须指定文件及路径
        const _filePath = path.join(basePath, TEMPLATE, attrsObj.file);
        if (fs.existsSync(_filePath)) { // 检查文件是否存在
          _content = fs.readFileSync(_filePath);
          _content = iconv.decode(_content, ENCODING);

          if (attrsObj.part) { // 如果指定了part，则取指定part内容
            const reg = new RegExp(`<%#${attrsObj.part}%>([\\s\\S]*?)<%#/${attrsObj.part}%>`);
            _content = _content.match(reg);
            _content = _content ? _content[1] : '';
          }

          // 处理slot
          content && (_content = slot(content, _content));
        }
      }
    }

    return _content;
  });
}

function slot(slotContent, html) {
  slotContent.replace(/<bagjs-slot([\s\S]*?)>([\s\S]*?)<\/bagjs-slot>/g, (w, attrs, content) => {
    attrs = attrs.trim();
    content = content.trim();

    if (attrs) { // 必须要有属性
      const attrsObj = attrs2obj(attrs);
      const reg = new RegExp(`<%\\$slot-${attrsObj.name}%>`, 'g');
      html = html.replace(reg, content);
    }
  });

  return html;
}

module.exports = (content, basePath) => {
  content = include(content, basePath);
  return content;
};