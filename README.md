# Tardfyou.github.io

这是博客的 Hugo 源码仓库，当前技术栈为 `Hugo + LoveIt`。

仓库已经完成两件事：

1. 旧 Hexo 静态导出目录已清理，不再混放在根目录。
2. 旧博客文章已经迁入 Hugo 内容目录，可直接继续维护和发布。

## 目录结构

```text
.
├─ .github/              GitHub Pages 工作流
├─ assets/               项目级样式覆写
├─ content/              文章内容
├─ layouts/              项目级模板覆写
├─ scripts/              迁移脚本
├─ static/               静态资源
├─ themes/LoveIt/        vendored 主题
├─ .gitignore
├─ hugo.toml
└─ README.md
```

## 常用命令

本地预览：

```powershell
hugo server
```

带草稿预览：

```powershell
hugo server --buildDrafts
```

正式构建：

```powershell
hugo --minify --cleanDestinationDir
```

## 发布方式

仓库使用 GitHub Actions 发布，工作流文件在 `.github/workflows/hugo.yml`。

GitHub Pages 设置里应选择：

- `Build and deployment`
- `Source: GitHub Actions`

不要再使用“从分支根目录直接发布”的旧方式。

## 维护文档

- 环境设置见 `docs/ENVIRONMENT_SETUP.md`
- 日常维护与升级见 `docs/MAINTENANCE_AND_UPGRADE.md`
- 迁移与再导入见 `docs/CONTENT_MIGRATION.md`

## 当前定制点

后续升级主题时，优先保留这些项目级文件：

- `hugo.toml`
- `assets/css/_override.scss`
- `layouts/`
- `content/`
- `scripts/`
- `.github/workflows/hugo.yml`

## 备注

`themes/LoveIt/` 是 vendored 主题目录，不依赖 git submodule。
