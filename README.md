# RoboShaman AI

**Part guide, part builder. Therapist-led AI consulting.**

I'm a psychotherapist who also builds software — for helping-professionals and neurodivergent solo operators whose blocker is psychological / executive-function as much as technical.

🌐 **Live Site:** [roboshamanai.com](https://roboshamanai.com)  
🐦 **Twitter/X:** [@theroboshaman](https://x.com/theroboshaman)  
🔗 **All Links:** [linktr.ee/roboshaman](https://linktr.ee/roboshaman)

---

## What is RSAi?

RoboShaman AI is therapist-led consulting for solo operators who stall before the finish. Three ways in — MAP routes you to the right one:

| Motion | Description | Pricing |
|--------|-------------|---------|
| **MAP** | Strategy audit — the router that tells us whether you need coaching or a build | $297 flat fee |
| **LEARN** | Coaching & vibe coding — done-with-you on your real projects | $150/hour |
| **BUILD** | Done-for-you websites, apps, brand systems, and automation | Custom-quoted |

---

## Built in Public

This repository contains the full source code for [roboshamanai.com](https://roboshamanai.com). Designed, coded, and deployed using AI-assisted development — practicing what we preach.

### Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** PHP (contact form only)
- **Fonts:** DM Serif Display (headings) + Source Sans 3 (body) via Google Fonts
- **Design:** Warm editorial palette — burnt amber accent (`#c2410c`), warm off-white ground (`#FAF9F7`). Anti-slop: no Inter, no purple gradients, no three-box cliché.
- **Hosting:** Static files + PHP on DreamHost

No frameworks. No build tools. Just clean, performant code.

---

## Project Structure

```
roboshamanai/
├── index.html          # Main landing page (Shaman-forward)
├── portfolio.html      # Proof portfolio + case studies
├── styles.css          # Global styles + design system
├── main.js             # Mobile nav, motion-gated animations
├── contact.php         # Form handler
├── thank-you.html      # Post-submission page
├── privacy.html        # Privacy policy
├── error.html          # Error page
├── robots.txt
├── sitemap.xml
└── assets/
    ├── matthew-headshot.webp
    ├── matthew-headshot-hero.webp
    ├── logo_general_rsai.png
    ├── logo_betowl.png
    └── screenshot_emdrapp.png
```

---

## Features

### Landing Page (`index.html`)
- **Hero** — therapist-who-builds message, 3 niche personas, honest proof chip
- **The Real Block** — Clarity / Execution / Capacity blocks
- **The Moat** — therapist-guide differentiator (promoted above offers)
- **Work With Me** — MAP → LEARN → BUILD (MAP leads)
- **Proof** — Maris client case study featured; BrightEyedTherapist + DECODER secondary
- **About** — founder photo, first-person copy
- **Contact** — warm form with honeypot spam protection

### Portfolio Page (`portfolio.html`)
- **Capabilities** — geometric icons (no emoji)
- **Shipped projects** — Maris Dreaming (featured), BrightEyedTherapist, EMDR Suite, DECODER, this site

### Technical Features
- Mobile-responsive with hamburger navigation
- Scroll-triggered fade-ins gated behind `prefers-reduced-motion`
- `<noscript>` fallback — content visible without JavaScript
- SEO meta tags (Open Graph, Twitter Cards, structured data)
- Accessible (skip link, focus rings, ARIA labels, semantic HTML)

---

## Local Development

```bash
git clone https://github.com/shamanakin/roboshamanai.git
cd roboshamanai
python3 -m http.server 8080
# → http://localhost:8080/index.html

# Contact form testing requires PHP:
php -S localhost:8000
```

---

## Deploy (DreamHost)

GitHub push is version control only — live deploy is a separate rsync/SCP push:

```bash
rsync -avz --exclude '.git' --exclude '.DS_Store' --exclude 'README.md' --exclude 'plan.suggestions.md' \
  ./ shamanakin@roboshamanai.com:~/roboshamanai.com/
```

See `../Deployment Instructions/DEPLOY-SSH.md` for credentials and paths.

---

## Related Projects

- **[BrightEyedTherapist](https://brighteyedtherapist.com)** — Subscription-based clinical tools for therapists
- **[DECODER](https://decoder.roboshamanai.com)** — AI reality-analysis with confidence tiers
- **[GitHub](https://github.com/shamanakin)** — Open-source therapy tools and experiments

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Part guide, part builder.</strong><br>
  <a href="https://roboshamanai.com">roboshamanai.com</a>
</p>
