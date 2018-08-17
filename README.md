# bagjs

A project just for bag

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