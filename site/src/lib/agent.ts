import { authorshipLabel, contact, decoder, kindLabel, site, stateLabel, tierLabel, trackLabel, absolute, agentHref } from "../data/site";
import { apaCitation, bibtexCitation } from "./cite";
import {
  getNow,
  getProjects,
  getResearch,
  getResources,
  projectPath,
  researchPath,
  resourcePath,
  versionPath,
  type NowEntry,
  type Paper,
  type Project,
  type Resource,
} from "./content";

export interface AgentDoc {
  /** Path under /agent/, without leading slash. Empty string is the index. */
  path: string;
  title: string;
  human: string;
  markdown: string;
}

function fence(body: string | undefined): string {
  return (body ?? "").trim();
}

function projectDoc(p: Project): AgentDoc {
  const d = p.data;
  return {
    path: `projects/${p.id}`,
    title: d.title,
    human: projectPath(p.id),
    markdown: [
      "---",
      `title: ${d.title}`,
      `state: ${d.state}`,
      `kind: ${d.kind}`,
      `draft: ${d.draft}`,
      `year: ${d.year}`,
      `licence: ${d.licence}`,
      `canonical: ${absolute(projectPath(p.id))}`,
      "---",
      "",
      `# ${d.title}`,
      "",
      d.draft ? "> Draft. Placeholder, not a finished project write-up." : "> Published project page.",
      "",
      d.summary,
      "",
      fence(p.body),
      "",
      d.tryUrl ? `Try: ${d.tryUrl}` : "",
      d.sourceUrl ? `Source: ${d.sourceUrl}` : "",
      d.elsewhereUrl ? `Elsewhere: ${d.elsewhereUrl}` : "",
    ]
      .filter((line) => line !== "")
      .join("\n"),
  };
}

function paperDoc(paper: Paper, version?: string): AgentDoc {
  const d = paper.data;
  const ver = version ?? d.version;
  const path = version ? `research/${paper.id}/v/${version}` : `research/${paper.id}`;
  const human = version ? versionPath(paper.id, version) : researchPath(paper.id);
  const change = d.changelog.find((c) => c.version === ver);
  const isCurrent = ver === d.version;
  const lines = [
    "---",
    `id: ${d.idCode}`,
    `title: ${d.title}`,
    `version: ${ver}`,
    `tier: ${d.tier}`,
    `authorship: ${d.authorship}`,
    `track: ${d.track}`,
    `draft: ${d.draft}`,
    `canonical: ${absolute(human)}`,
    "---",
    "",
    `# ${d.idCode} ${d.title}`,
    "",
    d.draft ? "> Draft. Not a published finding." : "> Lab notebook entry.",
    "",
    d.abstract,
    "",
  ];
  if (!isCurrent) {
    lines.push(
      `This URL is the permanent slot for v${ver}.`,
      change ? `What changed: ${change.note}` : "No change note was recorded.",
      "",
      "A full snapshot of this older text was not archived separately.",
      `Current version: ${absolute(researchPath(paper.id))}`,
    );
  } else {
    lines.push(fence(paper.body));
    if (d.aiLog) {
      lines.push("", "## AI method log", "", d.aiLog);
    }
    lines.push("", "## Cite", "", apaCitation(paper), "", "```bibtex", bibtexCitation(paper), "```");
  }
  return { path, title: `${d.idCode} ${d.title}`, human, markdown: lines.join("\n") };
}

function resourceDoc(r: Resource): AgentDoc {
  return {
    path: `resources/${r.id}`,
    title: r.data.title,
    human: resourcePath(r.id),
    markdown: [
      "---",
      `title: ${r.data.title}`,
      `licence: ${r.data.licence}`,
      `draft: ${r.data.draft}`,
      `canonical: ${absolute(resourcePath(r.id))}`,
      "---",
      "",
      `# ${r.data.title}`,
      "",
      r.data.draft ? "> Draft resource." : "> Resource.",
      "",
      r.data.summary,
      "",
      fence(r.body),
    ].join("\n"),
  };
}

export async function agentDocs(): Promise<AgentDoc[]> {
  const [projects, research, resources, now] = await Promise.all([
    getProjects(),
    getResearch(),
    getResources(),
    getNow(),
  ]);

  const docs: AgentDoc[] = [
    {
      path: "",
      title: "RoboShaman agent index",
      human: "/",
      markdown: indexMarkdown(projects, research, resources, now),
    },
    {
      path: "projects",
      title: "Projects",
      human: "/projects/",
      markdown: [
        "# Projects",
        "",
        ...projects.map(
          (p) =>
            `- [${p.data.title}](${absolute(agentHref(projectPath(p.id)))}) state=${p.data.state} kind=${p.data.kind} draft=${p.data.draft}`,
        ),
      ].join("\n"),
    },
    {
      path: "research",
      title: "Research",
      human: "/research/",
      markdown: [
        "# Research",
        "",
        "Method: Convergent Decoding v1.0 (draft until reviewed).",
        "",
        ...research.map(
          (p) =>
            `- ${p.data.idCode} v${p.data.version} tier=${p.data.tier} authorship=${p.data.authorship} draft=${p.data.draft} [${p.data.title}](${absolute(agentHref(researchPath(p.id)))})`,
        ),
      ].join("\n"),
    },
    {
      path: "resources",
      title: "Resources",
      human: "/resources/",
      markdown: [
        "# Resources",
        "",
        ...resources.map(
          (r) =>
            `- [${r.data.title}](${absolute(agentHref(resourcePath(r.id)))}) licence=${r.data.licence} draft=${r.data.draft}`,
        ),
      ].join("\n"),
    },
    {
      path: "now",
      title: "Now",
      human: "/now/",
      markdown: ["# Now", "", ...now.flatMap((n) => [`## ${n.data.date} ${n.data.title}`, ...n.data.lines.map((l) => `- ${l}`), ""])].join(
        "\n",
      ),
    },
    {
      path: "about",
      title: "About",
      human: "/about/",
      markdown: aboutMarkdown(),
    },
    {
      path: "atlas",
      title: "Atlas",
      human: "/atlas/",
      markdown: [
        "# Atlas",
        "",
        "Phase 2. The graph view is not built.",
        "Projects, research, and DECODER principles are not connected here yet.",
        `Human page: ${absolute("/atlas/")}`,
      ].join("\n"),
    },
    {
      path: "p",
      title: "Hosted demos",
      human: "/p/",
      markdown: [
        "# Hosted demos",
        "",
        "None are published in this build.",
        "A hosted demo is static, same-origin, and has to live under the site content security policy.",
        "DECODER is not hosted here and is not framed.",
        `Human page: ${absolute("/p/")}`,
      ].join("\n"),
    },
  ];

  for (const p of projects) docs.push(projectDoc(p));
  for (const paper of research) {
    docs.push(paperDoc(paper));
    for (const change of paper.data.changelog) {
      docs.push(paperDoc(paper, change.version));
    }
  }
  for (const r of resources) docs.push(resourceDoc(r));
  return docs;
}

function indexMarkdown(
  projects: Project[],
  research: Paper[],
  resources: Resource[],
  now: NowEntry[],
): string {
  const latest = now[0];
  return [
    `# ${site.name}`,
    "",
    `> ${site.line}`,
    "",
    `author: ${site.author}`,
    `credential: ${site.credential}`,
    "licence: code MIT · writing CC BY 4.0",
    `feeds: ${absolute("/index.json")} · ${absolute("/research/feed.xml")} · ${absolute("/llms.txt")}`,
    "",
    "Draft pages are placeholders. They are not findings, testimonials, or metrics.",
    "",
    "## Flagship",
    "",
    `- DECODER: ${decoder.url} (external, not embedded; essays: ${decoder.essays}; principles: ${decoder.principles}; counts fixed ${decoder.countsAsOf})`,
    "",
    "## Projects",
    "",
    ...projects.map(
      (p) =>
        `- ${p.id} state=${p.data.state} kind=${p.data.kind} draft=${p.data.draft} "${p.data.title}"`,
    ),
    "",
    "## Research",
    "",
    ...research.map(
      (p) =>
        `- ${p.data.idCode} v${p.data.version} tier=${tierLabel[p.data.tier].toLowerCase()} authorship=${p.data.authorship} draft=${p.data.draft} track=${p.data.track} "${p.data.title}"`,
    ),
    "",
    "## Resources",
    "",
    ...resources.map((r) => `- ${r.id} licence=${r.data.licence} draft=${r.data.draft} "${r.data.title}"`),
    "",
    "## Now",
    "",
    ...(latest ? latest.data.lines.map((l) => `- ${l}`) : ["- No log yet."]),
    "",
    "## Contact",
    "",
    `commissions: ${contact.line}`,
    `status: ${contact.status}`,
    `email: ${contact.email}`,
    "",
    "## Labels",
    "",
    `states: ${Object.values(stateLabel).join(", ")}`,
    `kinds: ${Object.values(kindLabel).join(", ")}`,
    `tiers: ${Object.values(tierLabel).join(", ")}`,
    `authorship: ${Object.values(authorshipLabel).join(", ")}`,
    `tracks: ${Object.values(trackLabel).join(", ")}`,
  ].join("\n");
}

function aboutMarkdown(): string {
  return [
    `# About ${site.author}`,
    "",
    site.credential,
    "",
    "The credential line is for this page and for structured data. It is not the headline of the lab.",
    "",
    "## Contact",
    "",
    `Commissions and consults: ${contact.line}`,
    `Status: ${contact.status}`,
    contact.email,
    "",
    "There is no form, price, or booking funnel on this site.",
    "",
    "## Privacy",
    "",
    "No analytics, no cookies, no third-party scripts, no third-party fonts.",
    "Calm mode is a localStorage flag on your device.",
    "This site does not track you, so a Do Not Track signal changes nothing. There is no tracker to disable.",
    "",
    "## Colophon",
    "",
    "Astro static build intended for Cloudflare Pages.",
    "Type: Mona Sans, Newsreader, JetBrains Mono, self-hosted.",
    `Source: ${absolute("/")} and ${"https://github.com/shamanakin/roboshamanai"}`,
    "Code MIT. Writing CC BY 4.0 unless a page says otherwise.",
  ].join("\n");
}

export async function searchIndex() {
  const [projects, research, resources] = await Promise.all([getProjects(), getResearch(), getResources()]);
  return [
    ...projects.map((p) => ({
      title: p.data.title,
      summary: p.data.summary,
      group: "Projects",
      kicker: `${stateLabel[p.data.state]}${p.data.draft ? " · Draft" : ""}`,
      href: projectPath(p.id),
      agent: agentHref(projectPath(p.id)),
      draft: p.data.draft,
    })),
    ...research.map((p) => ({
      title: p.data.title,
      summary: p.data.abstract,
      group: "Research",
      kicker: `${p.data.idCode} · v${p.data.version}${p.data.draft ? " · Draft" : ""}`,
      href: researchPath(p.id),
      agent: agentHref(researchPath(p.id)),
      draft: p.data.draft,
    })),
    ...resources.map((r) => ({
      title: r.data.title,
      summary: r.data.summary,
      group: "Resources",
      kicker: `${r.data.licence}${r.data.draft ? " · Draft" : ""}`,
      href: resourcePath(r.id),
      agent: agentHref(resourcePath(r.id)),
      draft: r.data.draft,
    })),
    {
      title: "DECODER",
      summary: "External flagship. Essays, principles, and an agent view. Not embedded here.",
      group: "DECODER",
      kicker: "External",
      href: decoder.url,
      agent: decoder.url,
      draft: false,
    },
  ];
}

export async function indexJson() {
  const [projects, research, resources, now] = await Promise.all([
    getProjects(),
    getResearch(),
    getResources(),
    getNow(),
  ]);
  return {
    name: site.name,
    line: site.line,
    sub: site.sub,
    url: site.url,
    author: site.author,
    credential: site.credential,
    licence: { code: "MIT", writing: "CC BY 4.0" },
    contact: {
      email: contact.email,
      commissions: contact.line,
      status: contact.status,
    },
    decoder: {
      url: decoder.url,
      essays: decoder.essays,
      principles: decoder.principles,
      countsAsOf: decoder.countsAsOf,
      embedded: false,
    },
    projects: projects.map((p) => ({
      slug: p.id,
      title: p.data.title,
      summary: p.data.summary,
      state: p.data.state,
      kind: p.data.kind,
      year: p.data.year,
      draft: p.data.draft,
      licence: p.data.licence,
      url: absolute(projectPath(p.id)),
      agent: absolute(agentHref(projectPath(p.id))),
      tryUrl: p.data.tryUrl ?? null,
      sourceUrl: p.data.sourceUrl ?? null,
      elsewhereUrl: p.data.elsewhereUrl ?? null,
      body: fence(p.body),
    })),
    research: research.map((p) => ({
      slug: p.id,
      id: p.data.idCode,
      title: p.data.title,
      version: p.data.version,
      tier: p.data.tier,
      authorship: p.data.authorship,
      kind: p.data.kind,
      track: p.data.track,
      draft: p.data.draft,
      abstract: p.data.abstract,
      url: absolute(researchPath(p.id)),
      versionUrl: absolute(versionPath(p.id, p.data.version)),
      agent: absolute(agentHref(researchPath(p.id))),
      body: fence(p.body),
    })),
    resources: resources.map((r) => ({
      slug: r.id,
      title: r.data.title,
      summary: r.data.summary,
      licence: r.data.licence,
      draft: r.data.draft,
      url: absolute(resourcePath(r.id)),
      body: fence(r.body),
    })),
    now: now.map((n) => ({
      date: n.data.date,
      title: n.data.title,
      lines: n.data.lines,
    })),
    atlas: { status: "phase-2", url: absolute("/atlas/") },
  };
}

export async function llmsText(): Promise<string> {
  const [projects, research, resources] = await Promise.all([getProjects(), getResearch(), getResources()]);
  return [
    `# ${site.name}`,
    "",
    `> ${site.line} ${site.sub}`,
    "",
    "This file is a map for agents. Draft entries are placeholders, not findings. DECODER is a separate site and is not embedded here.",
    "",
    "## Start",
    "",
    `- [Home](${absolute("/")}): Human view`,
    `- [Agent index](${absolute("/agent/")}): Markdown mirror`,
    `- [JSON index](${absolute("/index.json")}): Machine-readable catalog`,
    `- [Now](${absolute("/now/")}): Short dated log`,
    `- [About](${absolute("/about/")}): Credential, contact, colophon, privacy`,
    "",
    "## Flagship",
    "",
    `- [DECODER](${decoder.url}): External research engine. ${decoder.essays} essays, ${decoder.principles} principles. Counts fixed at build on ${decoder.countsAsOf}. Not framed.`,
    "",
    "## Projects",
    "",
    ...projects.map(
      (p) =>
        `- [${p.data.title}](${absolute(projectPath(p.id))}): ${p.data.summary} State: ${p.data.state}. Draft: ${p.data.draft}.`,
    ),
    "",
    "## Research",
    "",
    ...research.map(
      (p) =>
        `- [${p.data.idCode} ${p.data.title}](${absolute(researchPath(p.id))}): v${p.data.version}, ${p.data.tier}, ${p.data.authorship}, draft ${p.data.draft}. ${p.data.abstract}`,
    ),
    "",
    "## Resources",
    "",
    ...resources.map(
      (r) =>
        `- [${r.data.title}](${absolute(resourcePath(r.id))}): ${r.data.summary} Licence: ${r.data.licence}. Draft: ${r.data.draft}.`,
    ),
    "",
    "## Contact",
    "",
    `Commissions: ${contact.line} Status: ${contact.status}. ${contact.email}`,
    "",
    "## Licence",
    "",
    "Code: MIT. Writing: CC BY 4.0 unless a page says otherwise.",
    "",
  ].join("\n");
}

export async function feedXml(): Promise<string> {
  const research = await getResearch();
  const items = research
    .map((p) => {
      const url = absolute(researchPath(p.id));
      return `  <item>
    <title>${escapeXml(p.data.idCode + " " + p.data.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${new Date(p.data.updated + "T00:00:00Z").toUTCString()}</pubDate>
    <description>${escapeXml(p.data.abstract)}</description>
  </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(site.name)} research</title>
  <link>${absolute("/research/")}</link>
  <description>${escapeXml(site.line)}</description>
${items}
</channel>
</rss>
`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sitemapXml(): Promise<string> {
  const docs = await agentDocs();
  const urls = new Set<string>(["/", "/projects/", "/research/", "/resources/", "/now/", "/about/", "/atlas/", "/p/"]);
  for (const doc of docs) {
    if (doc.human.startsWith("/")) urls.add(doc.human.split("#")[0]);
    urls.add(doc.path === "" ? "/agent/" : `/agent/${doc.path}/`);
  }
  const research = await getResearch();
  for (const paper of research) {
    for (const change of paper.data.changelog) urls.add(versionPath(paper.id, change.version));
  }
  urls.add("/llms.txt");
  urls.add("/index.json");
  urls.add("/research/feed.xml");
  const body = [...urls]
    .sort()
    .map((path) => `  <url><loc>${absolute(path)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}
