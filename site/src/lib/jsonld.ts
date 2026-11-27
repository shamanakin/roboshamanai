import { absolute, contact, links, site } from "../data/site";

const personId = `${site.url}/#matthew`;

export function personNode() {
  return {
    "@type": "Person",
    "@id": personId,
    name: site.author,
    description: site.credential,
    url: absolute("/about/"),
    email: `mailto:${contact.email}`,
    sameAs: [links.github, links.x],
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    description: site.line,
    inLanguage: site.locale,
    publisher: { "@id": personId },
  };
}

export function graph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteNode(), personNode(), ...nodes],
  };
}
