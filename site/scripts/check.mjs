import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const content = join(root, "src", "content");
const errors = [];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

function fail(message) {
  errors.push(message);
}

const required = [
  "index.html",
  "projects/index.html",
  "projects/decoder/index.html",
  "research/index.html",
  "research/method/index.html",
  "research/method/v/1.0/index.html",
  "resources/index.html",
  "now/index.html",
  "about/index.html",
  "atlas/index.html",
  "p/index.html",
  "agent/index.html",
  "agent/projects/decoder/index.html",
  "llms.txt",
  "index.json",
  "search-index.json",
  "sitemap.xml",
  "research/feed.xml",
  "_headers",
  "_redirects",
  "robots.txt",
  ".well-known/security.txt",
  "fonts/mona-sans.woff2",
  "fonts/newsreader.woff2",
  "fonts/jetbrains-mono.woff2",
];

for (const rel of required) {
  if (!existsSync(join(dist, rel))) fail(`missing ${rel}`);
}

const headers = existsSync(join(dist, "_headers")) ? readFileSync(join(dist, "_headers"), "utf8") : "";
for (const needle of [
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "Permissions-Policy:",
  "# Strict-Transport-Security:",
]) {
  if (!headers.includes(needle)) fail(`headers missing ${needle}`);
}
if (/^\s*Strict-Transport-Security:/m.test(headers)) fail("HSTS must stay commented out");

const htmlFiles = walk(dist).filter((path) => path.endsWith(".html"));
const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (/fonts\.googleapis|googletagmanager|google-analytics|facebook\.com|linktr\.ee/i.test(html)) {
    fail(`third-party host in ${file}`);
  }
  if (/maris|paypal|venmo|\$297|\$150/i.test(html)) fail(`retired copy in ${file}`);
  if (/<iframe\b/i.test(html)) fail(`iframe in ${file}`);
  for (const found of html.match(email) || []) {
    if (found.toLowerCase() !== "matthew@roboshamanai.com") fail(`unexpected email ${found} in ${file}`);
  }
  const local = html.match(/(?:href|src)="(\/[^"]*)"/g) || [];
  for (const raw of local) {
    const url = raw.replace(/^(?:href|src)="/, "").replace(/"$/, "").split("#")[0];
    if (!url || url.startsWith("//")) continue;
    const rel = url.split("?")[0].replace(/^\/+/, "");
    const candidates = [join(dist, rel)];
    if (rel.endsWith("/")) candidates.push(join(dist, rel, "index.html"));
    else candidates.push(join(dist, `${rel}.html`), join(dist, rel, "index.html"));
    if (!candidates.some((path) => existsSync(path))) fail(`broken link /${rel} in ${file}`);
  }
}

for (const file of htmlFiles) {
  const rel = file.slice(dist.length).replace(/\\/g, "/");
  const page = rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel;
  const html = readFileSync(file, "utf8");
  if (!html.includes('data-mode="agent"')) continue;
  const toggle = html.match(/<a class="pill is-on" href="([^"]+)" title="Switch to the human view">/);
  if (!toggle) fail(`agent page ${page} has no human toggle`);
  else if (toggle[1] === page || toggle[1].startsWith("/agent")) fail(`agent toggle on ${page} points at ${toggle[1]}`);
}

const decoderPage = readFileSync(join(dist, "projects/decoder/index.html"), "utf8");
if (decoderPage.includes(">DRAFT<") || decoderPage.includes(">Draft<")) fail("DECODER page is marked draft");
if (!decoderPage.includes("https://decoder.roboshamanai.com")) fail("DECODER link missing");
const fleet = readFileSync(join(dist, "projects/the-fleet/index.html"), "utf8");
if (!fleet.includes("DRAFT")) fail("fleet draft label missing");

function headings(file) {
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim());
}
for (const file of walk(join(content, "research")).filter((path) => path.endsWith(".md"))) {
  const found = headings(file);
  for (const need of ["Claim", "Evidence", "What would prove this wrong", "Open questions", "Sources"]) {
    if (!found.includes(need)) fail(`${file} missing ## ${need}`);
  }
}
for (const file of walk(join(content, "projects")).filter((path) => path.endsWith(".md"))) {
  const found = headings(file);
  for (const need of ["Why", "How", "What I learned"]) {
    if (!found.includes(need)) fail(`${file} missing ## ${need}`);
  }
}

const secretRe = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,
  /sk_live_[0-9a-zA-Z]{10,}/,
  /xox[baprs]-[0-9a-zA-Z-]{10,}/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
];
for (const file of walk(dist)) {
  if (file.endsWith(".woff2") || file.endsWith(".webp") || file.endsWith(".png") || file.endsWith(".ico")) continue;
  const text = readFileSync(file, "utf8");
  for (const re of secretRe) if (re.test(text)) fail(`secret-like pattern in ${file}`);
}

function size(path) {
  const buf = readFileSync(path);
  const gz = gzipSync(buf).length;
  const br = brotliCompressSync(buf, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 5 },
  }).length;
  return { raw: buf.length, gz, br };
}

const home = readFileSync(join(dist, "index.html"), "utf8");
const assets = [];
for (const tag of home.match(/<(?:script|link)\b[^>]*>/g) || []) {
  if (/rel=["']alternate["']/.test(tag)) continue;
  const src = tag.match(/(?:href|src)="(\/[^"]+)"/);
  if (src) assets.push(src[1].split("#")[0]);
}
let gzTotal = size(join(dist, "index.html")).gz;
let brTotal = size(join(dist, "index.html")).br;
let jsGz = 0;
const lines = [`home html gz ${gzTotal}`];
for (const asset of [...new Set(assets)]) {
  const file = join(dist, asset.replace(/^\//, ""));
  if (!existsSync(file) || statSync(file).isDirectory()) continue;
  const measured = size(file);
  const transferred = asset.endsWith(".woff2") ? measured.raw : measured.gz;
  gzTotal += transferred;
  brTotal += asset.endsWith(".woff2") ? measured.raw : measured.br;
  if (asset.endsWith(".js")) jsGz += measured.gz;
  lines.push(`${asset} raw ${measured.raw} gz ${measured.gz}`);
}
lines.push(`home transferred gzip-approx ${gzTotal}`);
lines.push(`home transferred brotli-approx ${brTotal}`);
lines.push(`home js gzip ${jsGz}`);
console.log(lines.join("\n"));
if (brTotal > 450 * 1024) fail(`home transfer ${brTotal} exceeds 450KB`);
if (jsGz > 60 * 1024) fail(`js gzip ${jsGz} exceeds 60KB`);

const fontBytes = ["mona-sans.woff2", "newsreader.woff2", "jetbrains-mono.woff2"]
  .map((name) => statSync(join(dist, "fonts", name)).size)
  .reduce((a, b) => a + b, 0);
console.log(`fonts ${fontBytes}`);
if (fontBytes > 130 * 1024) fail(`fonts ${fontBytes} over budget`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("check ok");
