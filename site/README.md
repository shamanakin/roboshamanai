# RoboShaman Open Lab

Static site for [roboshamanai.com](https://roboshamanai.com). The legacy PHP site stays at the repository root until launch. This folder is the new site.

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| Root directory | `site` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | `22` |

`NODE_VERSION=22` matches `.node-version`. Do not deploy from this branch until the launch go-ahead. HSTS in `public/_headers` stays commented out until HTTPS on the real hostname is verified.

DECODER is linked, never framed. Do not point this project at `decoder.roboshamanai.com`.

## Commands

```bash
npm install
npm run dev
npm run build
```

`npm run build` writes `dist/`, fills Content-Security-Policy hashes for JSON-LD, and checks links, draft labels, and the home weight budget.

## Add an entry

Drop a Markdown or MDX file into a collection. `draft` defaults to true.

- `src/content/projects/` — state, kind, year, summary, and sections Why / How / What I learned
- `src/content/research/` — id, version, tier, authorship, track, and the five required sections (Claim, Evidence, What would prove this wrong, Open questions, Sources)
- `src/content/resources/` — title, summary, licence (`MIT` or `CC BY 4.0`)
- `src/content/now/` — a date and up to eight lines

Commission status and the DECODER counts live in `src/data/site.ts`. Counts are build-time constants, not a live read of DECODER.

## Fonts

Three self-hosted files, 119 KB together. Mona Sans keeps weight and width. Newsreader keeps weight, with optical size pinned to 16. JetBrains Mono is a static regular. Licences are in `public/fonts/`.
