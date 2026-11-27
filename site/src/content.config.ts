import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { authorships, kinds, researchKinds, states, tiers, tracks } from "./data/site";

const asString = z.preprocess((value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") return String(value);
  return value;
}, z.string());

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    state: z.enum(states),
    kind: z.enum(kinds),
    year: z.string(),
    role: z.string().default("Matthew Heake"),
    stack: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    order: z.number().default(100),
    licence: z.string().default("Unspecified"),
    meta: z.string().optional(),
    tryUrl: z.string().url().optional(),
    tryLabel: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    elsewhereUrl: z.string().url().optional(),
    relatedResearch: z.array(z.string()).default([]),
    held: z.boolean().default(false),
    confirm: z.boolean().default(false),
    changelog: z
      .array(z.object({ date: asString, note: z.string() }))
      .default([]),
    media: z
      .array(z.object({ src: z.string(), alt: z.string() }))
      .default([]),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/research" }),
  schema: z.object({
    idCode: z.string(),
    title: z.string(),
    version: asString,
    tier: z.enum(tiers),
    authorship: z.enum(authorships),
    kind: z.enum(researchKinds),
    track: z.enum(tracks),
    draft: z.boolean().default(true),
    date: asString,
    updated: asString,
    abstract: z.string(),
    domains: z.array(z.string()).default([]),
    aiLog: z.string().optional(),
    notClinicalAdvice: z.boolean().default(true),
    banner: z.string().optional(),
    order: z.number().default(100),
    changelog: z
      .array(z.object({ version: asString, note: z.string() }))
      .min(1),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/resources" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    licence: z.enum(["MIT", "CC BY 4.0"]),
    kind: z.enum(["prompts", "templates", "guide"]),
    state: z.enum(["hosted", "source"]),
    draft: z.boolean().default(true),
    order: z.number().default(100),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/now" }),
  schema: z.object({
    title: z.string(),
    date: asString,
    lines: z.array(z.string()).min(1).max(8),
  }),
});

export const collections = { projects, research, resources, now };
