# 环境设置教程

## 1. 依赖要求

最小依赖：

- Git
- Hugo Extended

可选依赖：

- Node.js
  仅当你后续要自己写复杂前端工具、批处理脚本或做额外资源处理时才需要。

当前仓库本身不再依赖 Hexo，也不需要 npm 才能构建。

## 2. 安装建议

推荐安装一个全局可用的 `hugo` 命令，并确认是 Extended 版本。

验证命令：

```powershell
hugo version
```

输出里应包含 `extended`。

## 3. 克隆仓库

```powershell
git clone <你的仓库地址>
cd Tardfyou.github.io
```

## 4. 本地预览

```powershell
hugo server
```

默认访问：

```text
http://localhost:1313/
```

如果你要连草稿一起看：

```powershell
hugo server --buildDrafts
```

## 5. 正式构建

```powershell
hugo --minify --cleanDestinationDir
```

构建产物会输出到 `public/`，但这个目录不需要提交。

## 6. GitHub Pages 部署

仓库已经带好了 GitHub Actions 工作流。

首次使用时确认两件事：

1. 仓库根目录包含 `.github/workflows/hugo.yml`
2. GitHub Pages 的 Source 选择 `GitHub Actions`

之后正常 `git push` 即可自动发布。

## 7. 常见问题

### Hugo 不是 Extended 版本

现象：

- 构建时报 SCSS 相关错误
- 样式资源无法生成

处理：

- 卸载普通 Hugo
- 改装 Hugo Extended

### 本地能开，线上没更新

优先检查：

1. Actions 是否运行成功
2. Pages Source 是否仍然指向旧的 branch deployment

### 中文内容显示正常，但 PowerShell 终端看起来乱码

这通常是终端编码显示问题，不一定是文件编码问题。
只要 Hugo 构建正常、页面中文正常，就不一定需要改文件。

### 评论框不显示

当前站点使用 `utterances` 作为评论系统。

如果页面里没有评论框，优先检查：

1. 仓库是否已经安装 `utterances` GitHub App
2. 当前页面是否允许加载第三方脚本
3. 本地预览时是否被浏览器插件拦截
