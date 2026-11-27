import type { APIRoute } from "astro";
import { agentDocs } from "../lib/agent";

export const GET: APIRoute = async () => {
  const doc = (await agentDocs()).find((item) => item.path === "");
  return new Response(doc?.markdown ?? "", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
