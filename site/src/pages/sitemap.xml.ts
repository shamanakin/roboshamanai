import type { APIRoute } from "astro";
import { sitemapXml } from "../lib/agent";

export const GET: APIRoute = async () =>
  new Response(await sitemapXml(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
