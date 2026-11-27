import type { APIRoute } from "astro";
import { agentDocs } from "../../lib/agent";

export async function getStaticPaths() {
  const docs = await agentDocs();
  return docs
    .filter((doc) => doc.path !== "")
    .map((doc) => ({ params: { path: doc.path }, props: { markdown: doc.markdown } }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
