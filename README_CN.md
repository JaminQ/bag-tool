[English](./README.md) | 简体中文

bag-tool
==============================
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]

这是一款针对某前端开发程序媛在写代码时遇到的痛点而设计的工具，功能简单，喜欢就拿去，不喜勿喷（**反正也不是为你而设计的**）。

## 功能

- **母版**：你可以把重复的代码（默认支持`.html`和`.tpl`，你可以在配置中修改，以便支持更多类型）写在母版文件中，然后在主文件里引用母版文件，支持全引用、部分引用以及代码注入；
- **CSS编译**：喜欢写[less](http://lesscss.org/)或[sass](https://sass-lang.com/)但又懒得搭构建工具的你可以通过bag-tool来非常方便地编译；
- **Babel编译**：放心写es6吧，bag-tool会通过[babel](https://babeljs.io/)帮你把es6编译成es5的；
- **实时预览**：别浪费时间在F5手动刷新上了，来体验下保存文件后浏览器自动刷新的快感吧；
- 暂时没遇到其余前端痛点，如果你有想要的功能，可以[联系我](mailto:jaminqian@outlook.com)或提[Issues](https://github.com/MiniCai/bag-tool/issues/new)，有空我就加一下。

## 安装

```shell
npm install -g bag-tool
```

## 使用

直接在你的项目目录里执行`bag-tool <command>`，支持以下`<command>`：

- `-v` 查看bag-tool当前版本。
- `help` 获取帮助。
- `init` 初始化src目录以及配置文件。
- `clean` 清空dest目录。
- `build` 编译src目录并输出到dest目录。
- `start` 编译后自动打开默认浏览器并加载，然后监听src目录并实时刷新浏览器。

## 配置

默认配置可以参考[src/config.json](./src/config.json)文件。

当然，如果你对这份默认配置感到很不爽，你可以针对你的项目去单独写配置文件，只要在你的项目里新增`bag-tool-config.json`文件然后编辑你的配置内容就可以了，或者执行`bag-tool init`自动创建`bag-tool-config.json`文件。**注意**：配置编写必须符合JSON规范。

```shell
cd your-path
vi bag-tool-config.json

# or

cd your-path
bag-tool init
```

### 配置项

#### src

Type: `String`

Default: `"src/"`

项目源码路径。

#### dest

Type: `String`

Default: `"dest/"`

项目输出路径。

#### template

Type: `String`

Default: `"template/"`

母版目录，所有母版文件都必须在母版目录下，不支持引用母版目录以外的文件，路径相对`src/`，编译时不会把母版目录输出到dest。

#### tmplExtname

Type: `Array`

Default: `["*.html", "*.tpl"]`

支持的母版文件后缀名。

#### cssEngine

Type: `Array`

Default: `["less"]`

启用的css预处理器，支持`less`和`sass`。

#### startPath

Type: `String`

Default: `"index.html"`

本地服务开启后默认加载的路径。

#### encoding

Type: `String`

Default: `"utf8"`

字符集编码。

#### showDetailLog

Type: `Boolean`

Default: `true`

是否显示详细日志。

#### ignore

Type: `Boolean`

Default: `["**/.DS_Store"]`

忽略的文件或目录，请参考[node-glob语法](https://github.com/isaacs/node-glob)，你也可以直接写文件的路径。**注意**：路径相对`src/`。

## 母版语法

### 引用母版文件

使用`<bag-include file="path/file.html"></bag-include>`来引用母版文件`path/file.html`，`file`属性相对母版目录。**注意**：母版文件必须在母版目录里。

```html
<!-- src/template/head.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bag-tool test</title>
</head>
<body>


<!-- src/template/foot.html -->
</body>
</html>


<!-- src/index.html -->
<bag-include file="head.html"></bag-include>
  <p>hello world</p>
<bag-include file="foot.html"></bag-include>
```

编译后

```html
<!-- dest/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bag-tool test</title>
</head>
<body>
  <p>hello world</p>
</body>
</html>
```

当然，你也可以在母版文件中嵌套引用其它母版文件。**注意**：路径依旧相对于母版目录。

### 引用母版文件的部分内容

在母版文件中使用`<%#partName%><%#/partName%>`将母版划分各个模块，`part`为各个模块的id，通过这个id可以指定该模块内容。

```html
<!-- src/template/content.html -->
<%#title%>
  <h1>This is a title.</h1>
<%#/title%>

<%#nav%>
  <ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
  </ul>
<%#/nav%>
```

使用`<bag-include file="path/file.html" part="partName"></bag-include>`来引用母版文件`path/file.html`的`partName`模块内容。

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bag-tool test</title>
</head>
<body>
  <bag-include file="content.html" part="title"></bag-include>
  <p>hello world</p>
  <bag-include file="content.html" part="nav"></bag-include>
</body>
</html>
```

编译后

```html
<!-- dest/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bag-tool test</title>
</head>
<body>
  
  <h1>This is a title.</h1>

  <p>hello world</p>
  
  <ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
  </ul>

</body>
</html>
```

### 注入代码

在母版文件中使用`<%$slotName%><%$/slotName%>`来设置一个代码注入口，可在其中设置默认内容，当没有代码注入时就注入默认内容。

```html
<!-- src/template/layout.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%$title%><%$/title%></title>
  <%$link%><link rel="stylesheet" type="text/css" href="default.css"><%$/link%>
</head>
<body>
  <%$body%><%$/body%>
</body>
</html>
```

使用`<bag-slot name="slotName"></bag-slot>`来注入代码，`<bag-slot>`必须写在`<bag-include>`里。

```html
<!-- src/index.html -->
<bag-include file="layout.html">
  <bag-slot name="title">bag-tool test</bag-slot>
  <bag-slot name="body">
    <p>hello world</p>
  </bag-slot>
</bag-include>
```

编译后

```html
<!-- dest/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bag-tool test</title>
  <link rel="stylesheet" type="text/css" href="default.css">
</head>
<body>
  <p>hello world</p>
</body>
</html>
```

## TODO

- 新增英文文档；
- 兼容Mac；
- 开发GUI版本。

[npm-url]: https://www.npmjs.com/package/bag-tool
[npm-image]: https://img.shields.io/npm/v/bag-tool.svg
[downloads-image]: https://img.shields.io/npm/dm/bag-tool.svg