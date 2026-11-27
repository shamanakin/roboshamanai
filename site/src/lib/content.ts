import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;
export type Paper = CollectionEntry<"research">;
export type Resource = CollectionEntry<"resources">;
export type NowEntry = CollectionEntry<"now">;

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection("projects");
  return all.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export async function getFeatured(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured);
}

export async function getResearch(): Promise<Paper[]> {
  const all = await getCollection("research");
  return all.sort((a, b) => a.data.order - b.data.order || a.data.idCode.localeCompare(b.data.idCode));
}

export async function getResources(): Promise<Resource[]> {
  const all = await getCollection("resources");
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export async function getNow(): Promise<NowEntry[]> {
  const all = await getCollection("now");
  return all.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}

export async function getRelatedResearch(slugs: string[]): Promise<Paper[]> {
  const found: Paper[] = [];
  for (const slug of slugs) {
    const entry = await getEntry("research", slug);
    if (entry) found.push(entry);
  }
  return found;
}

export function projectPath(slug: string): string {
  return `/projects/${slug}/`;
}

export function researchPath(slug: string): string {
  return `/research/${slug}/`;
}

export function versionPath(slug: string, version: string): string {
  return `/research/${slug}/v/${version}/`;
}

export function resourcePath(slug: string): string {
  return `/resources/${slug}/`;
}
