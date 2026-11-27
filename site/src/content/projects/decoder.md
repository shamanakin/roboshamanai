---
title: DECODER
summary: An AI research engine that decodes how things actually work. Essays with confidence tiers, a principle graph, and a separate version for agents. It stays on its own subdomain.
state: live
kind: research-engines
year: ongoing
role: Matthew Heake
featured: false
draft: false
order: 0
licence: External site
meta: research engine
tryUrl: https://decoder.roboshamanai.com
tryLabel: Enter DECODER
elsewhereUrl: https://decoder.roboshamanai.com
relatedResearch:
  - method
changelog:
  - date: 2026-11-27
    note: Open Lab page created. Essay and principle counts are build-time constants (114 and 45), not a live read of DECODER.
---

## Why

DECODER is the flagship. It is a research engine: essays with confidence tiers, a connected principle graph, decoded news, and a version meant to be read by agents. The lab site points at it. It does not contain it.

## How

DECODER is built and hosted on decoder.roboshamanai.com. This page does not document its stack, and this site does not frame it. The counts shown in the portal, 114 essays and 45 principles, are fixed when this site is built. They are not fetched from DECODER at request time.

## What I learned

Two habits from DECODER are now part of the lab. A page can carry a confidence tier instead of pretending to be finished. And every human page can have a machine-readable twin. That is what /agent, /llms.txt, and /index.json are for.
