# 代码迁移与内容迁移教程

## 1. 当前仓库的迁移背景

这个仓库不是从原始 Hexo 源码直接转过来的，而是从旧博客的静态导出结果中反向整理成 Hugo 源码。

因此当前仓库里有一套专门的迁移脚本：

```text
scripts/migrate-posts.mjs
```

## 2. 这个脚本做了什么

脚本会：

1. 扫描旧 Hexo 导出目录中的文章页面
2. 提取标题、日期、修改时间、标签、分类、描述
3. 抽出文章主体 HTML
4. 生成 Hugo 的文章 bundle
5. 保留旧日期 URL 作为 `aliases`

输出目录为：

```text
content/posts/YYYY-MM-DD-title/index.md
```

## 3. 适用场景

这个脚本更适合下面这种输入：

- 已经生成好的 Hexo 静态页面
- 目录结构类似 `年/月/日/文章名/index.html`
- 页面里有相对稳定的 OG metadata 和文章主体容器

如果你以后换了别的主题或别的静态导出结构，这个脚本很可能需要改。

## 4. 再次迁移旧 Hexo 内容的建议流程

### 情况 A：你拿到了 Hexo 源码

优先做法：

1. 直接导出 Markdown 源文
2. 手工整理 front matter
3. 放入 `content/posts/`

这是最干净的方案。

### 情况 B：你只有静态页面

可以继续使用当前脚本思路：

1. 先备份仓库
2. 把旧静态页面放到临时目录
3. 调整 `scripts/migrate-posts.mjs` 的解析规则
4. 运行脚本
5. 手工抽查文章

运行示例：

```powershell
node .\scripts\migrate-posts.mjs
```

## 5. 迁移后必须手工检查的项目

无论脚本跑得多顺，都要检查：

1. 首页摘要是否正常
2. 代码块语言和换行是否正常
3. 图片路径是否正常
4. 分类与标签 slug 是否合理
5. 旧链接跳转是否正常

## 6. 旧链接保留方法

如果你未来再次调整 permalink，不要直接放弃旧链接。
推荐继续在 front matter 里维护：

```yaml
aliases:
  - "/旧路径/"
```

这样外部链接和搜索引擎入口不会立刻全部失效。

## 7. 从 Hugo 仓库迁到另一份 Hugo 仓库

如果以后只是换模板，不是换引擎，最小迁移集合是：

- `content/`
- `static/`
- `assets/css/_override.scss`
- `hugo.toml`
- `layouts/`

如果新主题与当前差异很大，先复制 `content/` 和 `static/`，再逐步移植配置和模板覆写，不要一次性全量覆盖。
