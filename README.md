# bag-tool: A tool just for bag

这是一款针对某前端开发程序媛在写代码时遇到的痛点而设计的工具，功能简单，喜欢就拿去，不喜勿喷（**反正也不是为你而设计的**）。

## 功能

- **母版**：你可以把重复的代码（默认支持.html和.tpl，你可以在配置中修改，以便支持更多类型）写在母版文件中，然后在主文件里引用母版文件，支持全引用、部分引用以及代码注入；
- **less编译**：喜欢写less但又懒得自己搭less构建工具的你可以通过bag-tool来非常方便地编译less文件；
- 暂时没遇到其余前端痛点，如果你有想要的功能，可以[联系我](mailto:jaminqian@outlook.com)或提[Issues](https://github.com/MiniCai/bagjs/issues/new)，有空我就加一下。

## 配置

默认配置可以参考[src/config.json](https://github.com/MiniCai/bagjs/blob/master/src/config.json)

当然，如果你对这份默认配置感到很不爽，你可以针对你的项目去单独写配置文件（大哥，答应我，千万不要修改我的[src/config.json](https://github.com/MiniCai/bagjs/blob/master/src/config.json)文件，ok？）

只要在你的项目里新增`bag-tool-config.json`文件然后编辑你的配置内容就可以了，或者执行`bag-tool init`自动创建`bag-tool-config.json`文件。注意必须符合JSON规范。

```shell
cd your-path
vi bag-tool-config.json

# or

cd your-path
bag-tool init
```

### 配置项

#### src

项目源码路径，可写多个路径，支持[node-glob语法](https://github.com/isaacs/node-glob)，默认`["src/"]`。

#### dest

项目输出路径，只可写一个路径，默认`"dest/"`。

#### template

母版目录，所有母版文件都必须放在此处，不支持引用母版目录以外的文件，路径相对src，默认`"template/"`。

#### tmplExtname

支持的母版文件后缀，默认`["*.html", "*.tpl"]`。

#### styleExtname

支持的css预处理器后缀，其实目前也就只支持less，写成配置是有望日后去拓展它（至于最后拓不拓展要看我心情），默认`["*.less"]`。

#### startPath

本地服务开启后默认加载的路径，默认`"index.html"`。

#### encoding

字符集编码，默认`"utf8"`。

## 母版

### 如何编写母版文件
