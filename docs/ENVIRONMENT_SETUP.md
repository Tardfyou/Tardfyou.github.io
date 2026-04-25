# 环境搭建与发布流程

这个仓库是 Hugo 博客，主题为 `LoveIt`，部署到 GitHub Pages。日常只需要维护源码，`public/` 构建产物不会提交。

## 1. 必要工具

- Git
- Hugo Extended
- Node.js LTS

当前已验证版本：

```powershell
hugo version
node --version
npm --version
```

本机安装命令：

```powershell
winget install --id Hugo.Hugo.Extended --exact --source winget
winget install --id OpenJS.NodeJS.LTS --exact --source winget
```

安装后如果当前终端找不到 `hugo` 或 `node`，关闭终端重新打开即可。仓库内脚本也会自动补充常见安装路径。

## 2. 本地开发环境

启动本地预览：

```powershell
.\scripts\dev.cmd
```

浏览器访问：

```text
http://localhost:1313/
```

包含草稿一起预览：

```powershell
.\scripts\dev.cmd -Drafts
```

指定端口：

```powershell
.\scripts\dev.cmd -Port 1314
```

## 3. 本地构建检查

发布前建议先跑完整构建：

```powershell
.\scripts\build.cmd
```

这个脚本会执行：

1. `hugo --minify --cleanDestinationDir`
2. `npx -y pagefind@1.5.2 --site public --output-subdir _pagefind`

如果只想检查 Hugo 构建，不生成搜索索引：

```powershell
.\scripts\build.cmd -SkipPagefind
```

## 4. 推送发布环境

一键构建、提交并推送：

```powershell
.\scripts\publish.cmd -Message "Update blog"
```

脚本会先跑本地构建，构建成功后执行：

```powershell
git add --all
git commit -m "Update blog"
git push origin HEAD
```

推送到 `master` 或 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。

## 5. GitHub Pages 设置

在 GitHub 仓库页面确认：

- `Settings -> Pages`
- `Build and deployment`
- `Source: GitHub Actions`

工作流文件位于：

```text
.github/workflows/hugo.yml
```

## 6. 常见问题

### PowerShell 无法运行 npx.ps1

日常使用 `.cmd` 入口即可，它会用 `ExecutionPolicy Bypass` 运行仓库内脚本；同时脚本会优先调用 `npx.cmd`，通常不需要修改系统执行策略。

### Hugo 报 SCSS 相关错误

通常是安装了普通版 Hugo。请卸载后安装 Hugo Extended。

### 本地能打开，线上没有更新

优先检查：

1. GitHub Actions 是否运行成功
2. GitHub Pages Source 是否为 `GitHub Actions`
3. 推送分支是否为 `master` 或 `main`
