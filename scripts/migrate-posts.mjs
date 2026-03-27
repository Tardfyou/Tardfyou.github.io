import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(repoRoot, "content", "posts");

const RESERVED_FS_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;

function decodeHtml(value = "") {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function encodeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function yamlQuote(value = "") {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function toListItems(values = [], indent = "  ") {
  if (!values.length) return "";
  return values.map((value) => `${indent}- ${yamlQuote(value)}`).join("\n");
}

function extractOne(html, pattern, fallback = "") {
  const match = html.match(pattern);
  return match ? decodeHtml(match[1].trim()) : fallback;
}

function extractAll(html, pattern) {
  return [...html.matchAll(pattern)]
    .map((match) => decodeHtml(match[1].trim()))
    .filter(Boolean);
}

function sanitizeSlug(input) {
  return input
    .replace(RESERVED_FS_CHARS, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeFolder(input) {
  return input
    .replace(RESERVED_FS_CHARS, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .trim();
}

function extractCode(codeHtml) {
  return decodeHtml(
    codeHtml
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<\/span>/g, "")
      .replace(/<span[^>]*>/g, "")
      .replace(/<[^>]+>/g, "")
  ).trimEnd();
}

function cleanContent(html) {
  let content = html;

  content = content.replace(/<a href="#[^"]*" class="headerlink"[^>]*><\/a>/g, "");

  content = content.replace(
    /<figure class="highlight\s*([^"]*)">[\s\S]*?<td class="code"><pre>([\s\S]*?)<\/pre><\/td>[\s\S]*?<\/figure>/g,
    (_, language = "", codeHtml = "") => {
      const normalizedLanguage = language.trim().split(/\s+/)[0] || "text";
      const code = extractCode(codeHtml);
      return `\n<pre><code class="language-${normalizedLanguage}">${encodeHtml(code)}</code></pre>\n`;
    }
  );

  content = content.replace(/<img([^>]*?)data-original="([^"]+)"([^>]*)>/g, (match, before, original, after) => {
    const altMatch = match.match(/\salt="([^"]*)"/i);
    const titleMatch = match.match(/\stitle="([^"]*)"/i);
    const alt = altMatch ? ` alt="${decodeHtml(altMatch[1])}"` : "";
    const title = titleMatch ? ` title="${decodeHtml(titleMatch[1])}"` : "";
    return `<img src="${decodeHtml(original)}"${alt}${title} />`;
  });

  content = content.replace(/<img([^>]*?)src="([^"]+)"([^>]*)>/g, (match, before, src) => {
    if (/data-original=/i.test(match)) return match;
    return match.replace(/\s(onerror|class)="[^"]*"/gi, "").replace(/\sdata-[^=]+="[^"]*"/gi, "");
  });

  content = content.replace(/<p>\s*<\/p>/g, "");

  if (!content.includes("<!--more-->")) {
    content = content.replace(/<\/p>/, "</p>\n\n<!--more-->");
  }

  return content.trim();
}

async function findPostFiles() {
  const entries = await fs.readdir(repoRoot, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !/^\d{4}$/.test(entry.name)) continue;
    const yearDir = path.join(repoRoot, entry.name);
    const months = await fs.readdir(yearDir, { withFileTypes: true });

    for (const month of months) {
      if (!month.isDirectory() || !/^\d{2}$/.test(month.name)) continue;
      const monthDir = path.join(yearDir, month.name);
      const days = await fs.readdir(monthDir, { withFileTypes: true });

      for (const day of days) {
        if (!day.isDirectory() || !/^\d{2}$/.test(day.name)) continue;
        const dayDir = path.join(monthDir, day.name);
        const posts = await fs.readdir(dayDir, { withFileTypes: true });

        for (const post of posts) {
          if (!post.isDirectory()) continue;
          const htmlPath = path.join(dayDir, post.name, "index.html");
          try {
            await fs.access(htmlPath);
            files.push(htmlPath);
          } catch {
            // ignore
          }
        }
      }
    }
  }

  return files.sort();
}

async function main() {
  const postFiles = await findPostFiles();
  const usedSlugs = new Map();

  for (const file of postFiles) {
    const html = await fs.readFile(file, "utf8");
    const title = extractOne(html, /<meta property="og:title" content="([^"]+)">/i);
    const description = extractOne(
      html,
      /<meta property="og:description" content="([^"]*)">/i,
      extractOne(html, /<meta name="description" content="([^"]*)">/i)
    );
    const date = extractOne(html, /<meta property="article:published_time" content="([^"]+)">/i);
    const lastmod = extractOne(html, /<meta property="article:modified_time" content="([^"]+)">/i, date);
    const tags = [...new Set(extractAll(html, /<meta property="article:tag" content="([^"]+)">/gi))];
    const categories = [...new Set(extractAll(html, /<a class="post-meta-categories" href="[^"]+">([^<]+)<\/a>/gi))];
    const images = [...new Set(extractAll(html, /<meta property="og:image" content="([^"]+)">/gi))];
    const article = html.match(
      /<article class="post-content" id="article-container">([\s\S]*?)<\/article><div class="post-copyright">/i
    );

    if (!article || !title || !date) {
      console.warn(`skip: ${file}`);
      continue;
    }

    const relativeAlias = `/${path.relative(repoRoot, path.dirname(file)).split(path.sep).join("/")}/`;
    const originalSegment = decodeURIComponent(path.basename(path.dirname(file)));
    const baseSlug = sanitizeSlug(originalSegment || title || path.basename(path.dirname(file)));
    const seenCount = usedSlugs.get(baseSlug) || 0;
    usedSlugs.set(baseSlug, seenCount + 1);
    const slug = seenCount === 0 ? baseSlug : `${baseSlug}-${date.slice(0, 10)}`;

    const folderName = sanitizeFolder(`${date.slice(0, 10)}-${originalSegment || title}`);
    const targetDir = path.join(contentRoot, folderName);
    const targetFile = path.join(targetDir, "index.md");

    const frontMatter = [
      "---",
      `title: ${yamlQuote(title)}`,
      `date: ${date}`,
      `lastmod: ${lastmod}`,
      "draft: false",
      `author: ${yamlQuote("Tardfyou")}`,
      `description: ${yamlQuote(description)}`,
      `summary: ${yamlQuote(description)}`,
      `slug: ${yamlQuote(slug)}`,
      "aliases:",
      `  - ${yamlQuote(relativeAlias)}`,
      tags.length ? "tags:\n" + toListItems(tags) : "tags: []",
      categories.length ? "categories:\n" + toListItems(categories) : "categories: []",
      images.length ? "images:\n" + toListItems(images) : "images: []",
      "lightgallery: true",
      "---",
      "",
      cleanContent(article[1]),
      "",
    ].join("\n");

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetFile, frontMatter, "utf8");
  }

  console.log(`migrated ${postFiles.length} posts`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
