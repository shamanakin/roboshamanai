import type { APIRoute } from "astro";
import { indexJson } from "../lib/agent";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await indexJson(), null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
