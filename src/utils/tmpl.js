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

function include(html, basePath) {
  while (/<bag-include([\s\S]*?)>/.test(html)) { // 遍历替代递归，处理层级引用
    html = html.replace(/<bag-include([\s\S]*?)>([\s\S]*?)<\/bag-include>/g, (w, attrs, content) => {
      attrs = attrs.trim();
      content = content.trim();

      let _html = '';
      if (attrs) { // 必须要有属性
        const attrsObj = attrs2obj(attrs);
        if (attrsObj.file) { // 必须指定文件及路径
          const _filePath = path.join(basePath, TEMPLATE, attrsObj.file);
          if (fs.existsSync(_filePath)) { // 检查文件是否存在
            _html = fs.readFileSync(_filePath);
            _html = iconv.decode(_html, ENCODING);

            if (attrsObj.part) { // 如果指定了part，则取指定part内容
              const reg = new RegExp(`<%#${attrsObj.part}%>([\\s\\S]*?)<%#/${attrsObj.part}%>`);
              _html = _html.match(reg);
              _html = _html ? _html[1] : '';
            }

            // 处理slot
            content && (_html = slot(content, _html));
          }
        }
      }

      return _html;
    });
  }

  return html;
}

function slot(slotContent, html) {
  slotContent.replace(/<bag-slot([\s\S]*?)>([\s\S]*?)<\/bag-slot>/g, (w, attrs, content) => {
    attrs = attrs.trim();
    content = content.trim();

    if (attrs) { // 必须要有属性
      const attrsObj = attrs2obj(attrs);
      const reg = new RegExp(`<%\\$${attrsObj.name}%>([\\s\\S]*?)<%\\$/${attrsObj.name}%>`, 'g');
      html = html.replace(reg, content);
    }
  });

  return html.replace(/<%\$(.*?)%>([\s\S]*?)<%\$\/.*?%>/g, (w, slotName, defaultSlot) => { // 清空未使用的slot，如果有默认值就赋予默认值
    return defaultSlot;
  });
}

module.exports = (html, basePath) => {
  html = include(html, basePath);
  return html;
};