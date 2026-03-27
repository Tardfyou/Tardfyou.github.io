# 日常维护与升级教程

## 1. 日常写作流程

推荐每篇文章使用一个独立的 leaf bundle：

```text
content/posts/YYYY-MM-DD-slug/index.md
```

示例：

```text
content/posts/2026-03-27-my-new-post/index.md
```

如果你想用 Hugo 命令创建：

```powershell
hugo new posts/2026-03-27-my-new-post/index.md
```

## 2. 文章 front matter 建议

最常用字段：

```yaml
---
title: "文章标题"
date: 2026-03-27T12:00:00+08:00
lastmod: 2026-03-27T12:00:00+08:00
draft: false
author: "Tardfyou"
description: "首页摘要和 SEO 描述"
tags:
  - "tag-a"
categories:
  - "category-a"
lightgallery: true
---
```

## 3. 图片放置建议

有两种方式：

1. 放在 `static/images/` 或 `static/img/`
2. 放在文章自己的 bundle 目录里

新文章更推荐第二种，因为迁移、备份和复用更清晰。

## 4. 发布前检查

每次发布前至少做这几步：

```powershell
hugo --minify --cleanDestinationDir
```

重点检查：

1. 首页摘要是否正常
2. `/posts/` 归档页是否正常
3. 新文章图片是否 404
4. 分类和标签链接是否正常

## 5. 修改站点配置

主要入口是：

- `hugo.toml`
- `assets/css/_override.scss`
- `layouts/`

原则：

- 站点信息、菜单、社交链接改 `hugo.toml`
- 字体和视觉微调改 `assets/css/_override.scss`
- 模板结构和渲染逻辑改 `layouts/`

## 6. 升级 LoveIt 主题

当前主题是 vendored 到仓库里的 `themes/LoveIt/`。
这意味着升级时不要直接覆盖整个仓库，而是按下面流程来。

### 升级步骤

1. 先新建一个备份分支

```powershell
git checkout -b chore/theme-upgrade
```

2. 在仓库外单独下载一份新的 LoveIt

3. 对比新旧主题目录：

- `themes/LoveIt/`

4. 合并上游变更时，优先保留项目自己的文件：

- `hugo.toml`
- `assets/css/_override.scss`
- `layouts/`
- `content/`
- `scripts/`
- `.github/workflows/hugo.yml`

5. 升级后重新构建：

```powershell
hugo --minify --cleanDestinationDir
```

6. 检查这些页面：

- `/`
- `/posts/`
- 一篇长文
- `/categories/`
- `/tags/`

## 7. 升级时的特殊注意

这个仓库为了兼容当前 Hugo 版本，额外保留了项目级布局覆写。
升级主题时，尤其不要随手删这些目录：

- `layouts/_default/`
- `layouts/posts/`
- `layouts/tags/`

它们不是冗余文件，是当前站点正常输出文章页、栏目页和标签页的兼容层。

## 8. 评论系统维护

当前评论系统使用的是 `utterances`。

配置入口在：

- `hugo.toml`

对应字段：

- `[params.page.comment]`
- `[params.page.comment.utterances]`

如果后续你要换成 `giscus`，需要额外提供：

- repoId
- category
- categoryId

而 `utterances` 只需要：

- GitHub 仓库名
- 给仓库安装 utterances App
