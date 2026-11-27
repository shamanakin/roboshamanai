import { absolute } from "../data/site";
import type { Paper } from "./content";
import { versionPath } from "./content";

function yearOf(iso: string): string {
  return iso.slice(0, 4);
}

function bibKey(paper: Paper): string {
  const slug = paper.id.replace(/[^a-z0-9]+/gi, "");
  return `heake${yearOf(paper.data.date)}${slug}`;
}

export function citeUrl(paper: Paper): string {
  return absolute(versionPath(paper.id, paper.data.version));
}

export function apaCitation(paper: Paper): string {
  const status = paper.data.draft ? "Unpublished draft" : "Lab notebook";
  return `Heake, M. (${yearOf(paper.data.date)}). ${paper.data.title} (Version ${paper.data.version}) [${status}]. RoboShaman. ${citeUrl(paper)}`;
}

export function bibtexCitation(paper: Paper): string {
  const note = [
    `Version ${paper.data.version}.`,
    paper.data.draft ? "Unpublished draft." : "Lab notebook.",
    `ID ${paper.data.idCode}.`,
  ].join(" ");
  return [
    `@misc{${bibKey(paper)},`,
    `  author = {Heake, Matthew},`,
    `  title = {${paper.data.title}},`,
    `  year = {${yearOf(paper.data.date)}},`,
    `  note = {${note}},`,
    `  howpublished = {RoboShaman},`,
    `  url = {${citeUrl(paper)}}`,
    `}`,
  ].join("\n");
}
