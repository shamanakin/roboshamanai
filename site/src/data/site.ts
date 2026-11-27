export const site = {
  name: "RoboShaman",
  mark: "ROBOSHAMAN",
  url: "https://roboshamanai.com",
  line: "An open lab at the seam of mind and machine.",
  sub: "Things I build, research I run, and tools you can take. By Matthew Heake.",
  author: "Matthew Heake",
  credential:
    "Matthew Heake, LMFT: licensed therapist (CA) by training; builder by compulsion.",
  established: "2026",
  locale: "en",
} as const;

export const contact = {
  email: "matthew@roboshamanai.com",
  /** Flip to "closed" when commissions are shut. */
  status: "open" as "open" | "closed",
  line: "occasionally, for work at the mind–machine seam.",
} as const;

/** Build-time constants. Not a live query of decoder.roboshamanai.com. */
export const decoder = {
  name: "DECODER",
  url: "https://decoder.roboshamanai.com",
  essays: 114,
  principles: 45,
  countsAsOf: "2026-11-27",
} as const;

export const links = {
  github: "https://github.com/shamanakin",
  repo: "https://github.com/shamanakin/roboshamanai",
  x: "https://x.com/theroboshaman",
  codeLicense: "https://opensource.org/license/mit",
  writingLicense: "https://creativecommons.org/licenses/by/4.0/",
} as const;

export const states = ["live", "hosted", "source", "lab", "archived", "linked"] as const;
export const kinds = [
  "tools",
  "research-engines",
  "agents",
  "music-video",
  "games",
  "writing",
] as const;
export const tiers = ["exploratory", "provisional", "decoded"] as const;
export const authorships = ["human", "human-ai", "ai-decoded"] as const;
export const researchKinds = ["method", "theory", "finding", "note", "decode"] as const;
export const tracks = ["method", "consciousness", "minds-machines", "systems"] as const;

export type State = (typeof states)[number];
export type Kind = (typeof kinds)[number];
export type Tier = (typeof tiers)[number];
export type Authorship = (typeof authorships)[number];
export type Track = (typeof tracks)[number];

export const stateLabel: Record<State, string> = {
  live: "Live",
  hosted: "Hosted",
  source: "Source",
  lab: "Lab",
  archived: "Archived",
  linked: "Linked",
};

export const kindLabel: Record<Kind, string> = {
  tools: "Tools",
  "research-engines": "Research engines",
  agents: "Agents",
  "music-video": "Music & video",
  games: "Games",
  writing: "Writing",
};

export const tierLabel: Record<Tier, string> = {
  exploratory: "Exploratory",
  provisional: "Provisional",
  decoded: "Decoded",
};

export const authorshipLabel: Record<Authorship, string> = {
  human: "Human",
  "human-ai": "Human+AI",
  "ai-decoded": "AI-decoded",
};

export const trackLabel: Record<Track, string> = {
  method: "Method",
  consciousness: "Consciousness",
  "minds-machines": "Minds & Machines",
  systems: "Systems",
};

export const researchKindLabel = {
  method: "Method",
  theory: "Theory",
  finding: "Finding",
  note: "Note",
  decode: "Decode",
} as const;

export function absolute(path: string): string {
  return new URL(path, site.url).href;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function agentHref(humanPath: string): string {
  const hashAt = humanPath.indexOf("#");
  const hash = hashAt >= 0 ? humanPath.slice(hashAt) : "";
  const path = hashAt >= 0 ? humanPath.slice(0, hashAt) : humanPath;
  if (path === "/" || path === "") return `/agent/${hash}`;
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `/agent${withSlash}${hash}`;
}

export function humanHref(agentPath: string): string {
  const hashAt = agentPath.indexOf("#");
  const hash = hashAt >= 0 ? agentPath.slice(hashAt) : "";
  let path = hashAt >= 0 ? agentPath.slice(0, hashAt) : agentPath;
  path = path.replace(/^\/agent\/?/, "/");
  if (path === "") path = "/";
  if (path !== "/" && !path.endsWith("/")) path += "/";
  return `${path}${hash}`;
}
