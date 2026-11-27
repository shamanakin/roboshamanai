import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

const hashes = new Set();
const problems = [];

for (const file of walk(dist).filter((path) => path.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  if (/\son[a-z]+\s*=/i.test(html)) problems.push(`event handler in ${file}`);
  if (/javascript:/i.test(html)) problems.push(`javascript URL in ${file}`);
  if (/\sstyle\s*=/.test(html)) problems.push(`inline style attribute in ${file}`);
  if (/<iframe\b/i.test(html)) problems.push(`iframe in ${file}`);
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    const body = match[2];
    if (/\ssrc\s*=/.test(attrs)) continue;
    if (!/type\s*=\s*["']application\/ld\+json["']/.test(attrs)) {
      problems.push(`inline script is not JSON-LD in ${file}`);
      continue;
    }
    if (!body.trim()) continue;
    const hash = createHash("sha256").update(body, "utf8").digest("base64");
    hashes.add(`'sha256-${hash}'`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const headerPath = join(dist, "_headers");
let headers = readFileSync(headerPath, "utf8");
const extra = hashes.size ? ` ${[...hashes].join(" ")}` : "";
if (!headers.includes("script-src 'self'")) {
  console.error("CSP script-src placeholder missing");
  process.exit(1);
}
headers = headers.replace("script-src 'self'", `script-src 'self'${extra}`);
writeFileSync(headerPath, headers);
console.log(`CSP hashes: ${hashes.size}`);
