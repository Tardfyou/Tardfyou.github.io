import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const sourceRoot = path.resolve(repoRoot, "..", "_posts");
const postsRoot = path.join(repoRoot, "content", "posts");

const sourceMap = new Map([
  ["2023-07-11-启程", "启程.md"],
  ["2023-07-14-游泳感悟", "游泳感悟.md"],
  ["2023-10-23-第一次Linux-Kernel的patch提交", "第一次Linux-Kernel的patch提交.md"],
  ["2024-03-01-520晚上的攻防浪漫", "520晚上的攻防浪漫.md"],
  ["2024-03-01-一次博客移植", "一次博客移植.md"],
  ["2024-05-22-520晚上的攻防浪漫", "520晚上的攻防浪漫.md"],
  ["2024-06-01-AntiSword-Attack", "AntiSword-Attack.md"],
  ["2024-06-09-黑客道精神还是开源精神？", "黑客道精神还是开源精神？.md"],
  ["2024-07-23-运维模型语料库框架", "运维模型语料库框架.md"],
  ["2024-07-26-业务场景问答实例", "业务场景问答实例.md"],
  ["2024-07-26-配置场景训练集案例", "配置场景训练集案例.md"],
  ["2024-08-02-配置场景2-0", "配置场景2-0.md"],
  ["2024-09-13-Reverse学习指北", "Reverse学习指北.md"],
  ["2024-09-13-靶场渗透", "靶场渗透.md"],
  ["2024-12-11-云安全：CICD靶场实操", "云安全：CICD靶场实操.md"],
  ["2026-01-27-埋藏于工位之诗", "埋藏于工位之诗.md"],
]);

function splitDocument(raw, filePath) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing YAML front matter in ${filePath}`);
  }

  return {
    frontMatter: match[1].trimEnd(),
    body: match[2].replace(/\r\n/g, "\n").trim(),
  };
}

async function replaceBody(targetPath, sourceBody) {
  const targetRaw = await fs.readFile(targetPath, "utf8");
  const target = splitDocument(targetRaw, targetPath);
  const nextContent = ["---", target.frontMatter, "---", "", sourceBody, ""].join("\n");
  await fs.writeFile(targetPath, nextContent, "utf8");
}

async function main() {
  let replaced = 0;

  for (const [folderName, sourceFile] of sourceMap) {
    const sourcePath = path.join(sourceRoot, sourceFile);
    const sourceRaw = await fs.readFile(sourcePath, "utf8");
    const source = splitDocument(sourceRaw, sourcePath);

    for (const lang of ["zh-cn", "en"]) {
      const targetPath = path.join(postsRoot, folderName, `index.${lang}.md`);
      await replaceBody(targetPath, source.body);
      replaced += 1;
    }
  }

  console.log(`replaced ${replaced} post bodies from ${sourceRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
