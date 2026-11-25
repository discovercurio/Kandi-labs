# Kandi-Labs.com

The Kandi-Labs brand site. It's plain HTML, CSS and JavaScript with no build step, no frameworks and no paid services. Shopify still handles products, carts, checkout, shipping and customer accounts. This site introduces the brand and sends people to the store.

```
kandi-labs-site/
├── index.html            All 11 sections
├── styles.css            Design tokens (CSS variables) and every component
├── script.js             Menu, scroll effects, color demo, link and media wiring
├── config.js             ← The one file to edit: Shopify links, socials, photos, 3D models
├── 404.html              Self-contained "page not found" page
├── favicon.ico, site.webmanifest, robots.txt, sitemap.xml
├── assets/
│   ├── fonts/            Fredoka + Outfit (self-hosted, variable)
│   ├── favicon/          SVG, PNG and app icons
│   ├── img/logo/         Optimized logos (WebP + PNG); originals in /source
│   ├── img/mascot/       orbit.svg, a vector trace of the sprout mascot
│   ├── img/og/           og-image.png (social share preview, 1200×630)
│   ├── img/products/     Drop product photos here
│   └── models/           Drop .glb 3D models here
└── licenses/             Font and icon licenses
```

## Preview locally

Opening `index.html` directly mostly works, but some browsers block fonts over `file://`. A tiny local server is more reliable:

```bash
cd kandi-labs-site
python3 -m http.server 8000
# then open http://localhost:8000
```

## Edit links, socials and photos: `config.js`

Every Shopify link on the page gets its address from `config.js`. Change it there and every button that uses it updates.

| Setting | Used by |
|---|---|
| `shopUrl` | The storefront domain. Change to `https://shop.kandi-labs.com` (or similar) once you connect a custom domain in Shopify. |
| `links.shop` | Shop Now, Explore the Shop, Enter the Shop |
| `links.collections.*` | The five What We Make cards and the footer category links |
| `links.series.*` | Explore Paper Theater / Explore Headlinerz |
| `links.browse.*` | Shop by Artist / Festival / Series |
| `links.customizable` | Shop Customizable Pieces |
| `links.contact` | Footer Contact link |
| `social` | Footer social links. Empty means hidden. |
| `email` | Optional footer email. Empty means hidden. |
| `media` | Product photos or `.glb` models for each card (see below) |

Paths that start with `/` are added to `shopUrl`. Full `https://` URLs are used exactly as written.

> **Before launch:** the store is password-protected right now, so every shop link lands on the "Opening soon" page. The collection handles (`/collections/kandi`, `/collections/paper-theater`, …) are placeholders. Once the collections are published, check each URL in Shopify admin (Products → Collections → the collection → "View") and update `config.js` to match. The three `browse` links use the Kandi theme's `?view=browse` page, which only works once that theme is the published theme.

## Add product photos or 3D models

1. Put the image in `assets/img/products/` (WebP or JPG, about 1200px wide). Category cards crop to 4:3 and series panels to 16:10.
2. In `config.js`, fill in the matching `media` entry:
   ```js
   kandi: { image: "assets/img/products/kandi.webp", alt: "Three kandi bracelets in purple and white", glb: "" },
   ```
3. For an interactive 3D preview, add a `.glb` to `assets/models/` and set `glb`. The image becomes the loading poster. Google's free `<model-viewer>` script loads only when a model is set; nothing extra downloads otherwise.

Blank entries keep the designed placeholders.

## Add a category

1. In `index.html`, find `<ul class="category-grid">`, copy one `<li class="category-card">…</li>`, and change the title, description, `--card-accent` color, the icon (`#i-…`), `data-media="newkey"` and `data-shop-link="collections.newkey"`.
2. In `config.js`, add `newkey` under `links.collections` and `media`.

The grid reflows on its own for any number of cards. Icons live in the hidden SVG sprite at the top of `<body>`. Any [Lucide](https://lucide.dev) icon can be pasted in as a new `<symbol id="i-name" viewBox="0 0 24 24">…</symbol>`.

## Brand settings

Colors, fonts, radii and spacing are CSS variables at the top of `styles.css` (`--c-purple`, `--c-lavender`, `--font-display`, …). Change them once and the whole site follows.

## Deploy

### Option A: Vercel (recommended)
1. Push this folder to a GitHub repo (the folder contents should be the repo root).
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Other**. Leave the build command empty and the output directory as the root.
3. Deploy. Every push to `main` redeploys automatically.

Or from a terminal: `npx vercel` (preview) then `npx vercel --prod`.

### Option B: GitHub Pages
1. Push this folder to a GitHub repo (contents at the repo root).
2. Repo **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at `https://<username>.github.io/<repo>/` within a minute or two. The included `.nojekyll` file stops GitHub from processing the files.

### Option C: Any static host
Netlify (drag the folder onto app.netlify.com/drop), Cloudflare Pages, or plain web hosting: upload the folder contents as-is. There's nothing to build.

### Connect kandi-labs.com
- **Vercel:** Project → Settings → Domains → add `kandi-labs.com` and `www.kandi-labs.com`, then create the DNS records Vercel shows at your registrar (typically an `A` record for `@` and a `CNAME` for `www`).
- **GitHub Pages:** Settings → Pages → Custom domain → `kandi-labs.com`, then add the `A`/`CNAME` records GitHub lists and tick **Enforce HTTPS**.

If `kandi-labs.com` is currently connected to Shopify, move the store to a subdomain such as `shop.kandi-labs.com` first (Shopify admin → Settings → Domains), then set `shopUrl` in `config.js` to match.

If the final domain is anything other than `https://kandi-labs.com/`, search `index.html`, `robots.txt` and `sitemap.xml` for `kandi-labs.com` and update the canonical, Open Graph and sitemap URLs.

## Accessibility and motion
- Semantic sections and landmarks, a skip link, visible focus rings, and keyboard access for the menu (Escape closes it), toggles and the color demo (radio groups with a live status message).
- Everything animated (orbiting beads, floating shapes, scroll reveals) stops when the visitor's system asks for reduced motion.
- Text colors meet WCAG AA contrast on their backgrounds. Purple is used for large text, icons and button fills; small text on dark surfaces uses lavender or white.
- Without JavaScript, the page still reads in full, the menu shows as a simple list, and links go to the storefront home.

## Notes on content
- The mascot is called **Orbit**, matching the "Meet Orbit" section already in the Shopify theme.
- The "Play with Orbit" demo is labeled as an illustration, not a product configurator. Real options live on each Shopify product.
- Headlinerz copy and the footer include the independent / not-affiliated disclaimer. Don't add artist or festival names to this page; link to the Shopify browse pages instead.
- No reviews, sales numbers or testimonials are included. Add real ones only.

## Credits
- Fonts: [Fredoka](https://github.com/hafontia/Fredoka-One) and [Outfit](https://github.com/Outfitio/Outfit-Fonts), SIL Open Font License 1.1
- Icons: [Lucide](https://lucide.dev), ISC License (Kandi bead and necklace icons drawn in the same style)
- Licenses are in `/licenses`.
