# bag-tool: A tool just for bag

这是一款针对某前端开发程序媛在写代码时遇到的痛点而设计的工具，功能简单，喜欢就拿去，不喜勿喷（**反正也不是为你而设计的**）。

## 功能

- **母版**：你可以把重复的代码（默认支持.html和.tpl，你可以在配置中修改，以便支持更多类型）写在母版文件中，然后在主文件里引用母版文件，支持全引用、部分引用以及代码注入；
- **less编译**：喜欢写less但又懒得自己搭less构建工具的你可以通过bag-tool来非常方便地编译less文件；
- 暂时没遇到其余前端痛点，如果你有想要的功能，可以[联系我](mailto:jaminqian@outlook.com)，有空我就加一下。

## 配置

默认配置可以参考[src/config.json](https://github.com/MiniCai/bagjs/blob/master/src/config.json)

当然，如果你对这份默认配置感到很不爽，你可以针对你的项目去单独写配置文件（大哥，答应我，千万不要修改我的[src/config.json](https://github.com/MiniCai/bagjs/blob/master/src/config.json)文件，ok？）

只要在你的项目里新增`bag-tool-config.json`文件然后编辑你的配置内容就可以了，或者执行`bag-tool init`自动创建`bag-tool-config.json`文件。

```shell
cd your-path
vi bag-tool-config.json

# or

cd your-path
bag-tool init
```

## 语法

### include

#### 引入指定模版文件全部内容

`<%@include(file)%>`，加载指定file的内容并替换到当前位置，注意此处file路径相对于模板目录，可参考以下例子。

```html
<!-- src -->
<!-- index.html -->
<%@include(head.html)%>
  Hello World!
<%@include(foot.html)%>


<!-- template/head.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bagjs test</title>
</head>
<body>


<!-- template/foot.html -->
</body>
</html>


<!-- dist -->
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bagjs test</title>
</head>
<body>
  Hello World!
</body>
</html>
```

#### 引入指定模版文件部分内容

支持`<%@include(file#part)%>`写法，只加载指定file的部分内容（part）并替换到当前位置，在模版文件中使用`<%#part%><%#/part%>`来包裹内容，可参考以下例子。

```html
<!-- src -->
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bagjs test</title>
</head>
<body>
  <%@include(content.html#title)%>

  <%@include(content.html#nav)%>
</body>
</html>


<!-- template/content.html -->
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


<!-- dist -->
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>bagjs test</title>
</head>
<body>
  <h1>This is a title.</h1>

  <ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
  </ul>
</body>
</html>
```
