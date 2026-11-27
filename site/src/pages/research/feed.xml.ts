import type { APIRoute } from "astro";
import { feedXml } from "../../lib/agent";

export const GET: APIRoute = async () =>
  new Response(await feedXml(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
