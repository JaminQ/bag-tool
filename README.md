English | [简体中文](./README_CN.md)

bag-tool
==============================
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]

This is a tool designed for the pain of a front-end development program when writing code.

## Features

- **Layout**: You can write duplicate code in the layout file (default supports `.html` and `.tpl`, which you can modify in the configuration to support more extname) and then import it in the main file;
- **CSS-compile**: You can write [less](http://lesscss.org/) or [sass](https://sass-lang.com/) according to your preferences, then bag-tool will help you compile very easily;
- **Babel-compile**: Feel free to write es6, bag-tool will help you compile es6 into es5 through babel;
- **Live-reload**: Don't waste time on `F5`, just enjoy the pleasure of the browser automatically refreshing after `ctrl+s`;
- If you have the function you want, just [contact me](mailto:jaminqian@outlook.com) or [open an issue](https://github.com/MiniCai/bag-tool/issues/new).

## Install

```shell
npm install -g bag-tool
```

## Usage

Run `bag-tool <command>` in your projoct. Bag-tool support these `<command>`:

- `-v` View bag-tool version.
- `help` Get docs.
- `init` Init your src-dir and config-file.
- `clean` Clear dest-dir.
- `build` Compile your src-dir to dest-dir.
- `start` Build once, open your browser and load, then watch your src-dir to live-reload.

## Config

The default configuration can refer to the [src/config.json](./src/config.json) file.

Of course, you can rewrite it by the `bag-tool-config.json` file in your project(When you run `bag-tool init`, bag-tool will create `bag-tool-config.json` file. Or you can create it manually). **Note**: Configuration must conform to the JSON specification.

```shell
cd your-path
vi bag-tool-config.json

# or

cd your-path
bag-tool init
```

### Config item

#### src

Type: `String`

Default: `"src/"`

Project src-dir.

#### dest

Type: `String`

Default: `"dist/"`

Project dest-dir.

#### template

Type: `String`

Default: `"template/"`

Layout-dir, its path relative to `src`. All layout files must be in the layout-dir and do not support references to files other than the layout-dir. The layout-dir will not be output to `dest`.

#### tmplExtname

Type: `Array`

Default: `["*.html", "*.tpl"]`

Supported layout file extnames.

#### cssEngine

Type: `Array`

Default: `["less"]`

The enabled css preprocessor, supports `less` and `sass`.

#### liveReload

Type: `Boolean`

Default: `true`

Whether to enable liveReload function.

#### startPath

Type: `String`

Default: `"index.html"`

The path that is loaded by default after the local service is turned on.

#### encoding

Type: `String`

Default: `"utf8"`

Character set encoding.

#### showDetailLog

Type: `Boolean`

Default: `true`

Whether to display detailed logs.

#### whiteList

Type: `Array`

Default: `[]`

File whitelist, the files in the whitelist will not be complied, directly copied to `dest`, the path relative to `src`.

#### ignore

Type: `Array`

Default: `["**/.DS_Store"]`

Ignored file or directory, the path relative to `src`. Support [node-glob](https://github.com/isaacs/node-glob).

## Layout

### Import

Use `<bag-include file="path/file.html"></bag-include>` to import layout file `path/file.html`, the `file` attr relative to the layout-dir. **Note**: The layout file must be in the layout-dir.

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

After compilation

```html
<!-- dist/index.html -->
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

Of course, you can also import other layout files in the layout file. **Note**: The path is still relative to the layout-dir.

### Module import

In the layout file, use `<%#partName%><%#/partName%>` to divide it into modules, and `part` is the id of each module. This id can be used to specify the module content.

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

Use `<bag-include file="path/file.html" part="partName"></bag-include>` to import the contents of the `partName` module of the layout file `path/file.html`.

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

After compilation

```html
<!-- dist/index.html -->
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

### Slot

Use `<%$slotName%><%$/slotName%>` in the layout file to set up a code injection port where you can set the default content and inject the default content when there is no code injection.

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

Use `<bag-slot name="slotName"></bag-slot>` to inject the code, `<bag-slot>` must be written in `<bag-include>`.

```html
<!-- src/index.html -->
<bag-include file="layout.html">
  <bag-slot name="title">bag-tool test</bag-slot>
  <bag-slot name="body">
    <p>hello world</p>
  </bag-slot>
</bag-include>
```

After compilation

```html
<!-- dist/index.html -->
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

- Develop a GUI version

## bugs

- 删除less、sass文件后没有删除dist里对应的css文件

[npm-url]: https://www.npmjs.com/package/bag-tool
[npm-image]: https://img.shields.io/npm/v/bag-tool.svg
[downloads-image]: https://img.shields.io/npm/dm/bag-tool.svg