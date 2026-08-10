# Soma Cosmetic — Product Catalog Website

A fast, mobile-first static catalog site with a no-code admin panel.
No build step, no frameworks.

```
soma-cosmetic/
├── .pages.yml             ← admin panel definition (Pages CMS)
├── netlify.toml           ← Netlify config
├── ADMIN-GUIDE.md         ← ★ plain-language guide for editing the catalog
├── qr/                    ← QR code tool (open qr-generator.html in any browser)
└── site/                  ← the website (this is what gets deployed)
    ├── index.html         ← page structure
    ├── css/style.css      ← design (cream + bronze theme)
    ├── js/app.js          ← filtering/rendering logic
    ├── data/
    │   ├── settings.json  ← shop name, tagline, logo, contact info
    │   ├── products.json  ← the product list
    │   ├── categories/    ← one file per category (feeds admin dropdowns)
    │   └── brands/        ← one file per brand (feeds admin dropdowns)
    └── assets/uploads/    ← photos uploaded through the admin panel
```

**How it works:** all content lives in JSON files. The admin panel
(Pages CMS at app.pagescms.org) edits those files in GitHub; every save
triggers Netlify to republish the site (~1 minute). The website itself
stays 100% static — even if the admin panel is down, the site stays up.
Photos are resized on the fly by Netlify's image CDN so phone uploads
never slow the site down.

## One-time setup (three accounts, ~15 minutes)

You need free accounts on **GitHub** (stores the site), **Netlify**
(hosts the site), and **Pages CMS** (uses your GitHub login — no separate
account needed).

### 1. Put the project on GitHub

1. Create an account at https://github.com/signup
2. Go to https://github.com/new — name the repository `soma-cosmetic`,
   leave everything else default, click **Create repository**.
3. Push this folder to it (a local git repository with one commit is
   already prepared). In a terminal in this folder:

```bash
git remote add origin https://github.com/YOUR-USERNAME/soma-cosmetic.git
```

```bash
git push -u origin main
```

   A browser window opens to log you in the first time.

   *(No terminal? Alternative: on github.com, open the repo → "uploading
   an existing file" → drag all the files/folders from this project in —
   but the git way keeps history cleaner.)*

### 2. Deploy on Netlify

1. Create an account at https://app.netlify.com/signup — choose
   **Sign up with GitHub** (easiest).
2. **Add new site → Import an existing project → GitHub** → pick
   `soma-cosmetic`.
3. Netlify reads `netlify.toml` automatically (publish folder = `site`,
   no build command). Click **Deploy**.
4. Rename the site: **Site configuration → Change site name** →
   e.g. `soma-cosmetic` → your URL is `https://soma-cosmetic.netlify.app`.

Every change pushed to GitHub — including admin-panel edits — now
redeploys the site automatically.

### 3. Connect the admin panel

1. Go to https://app.pagescms.org → **Sign in with GitHub**.
2. Authorize it and select the `soma-cosmetic` repository.
3. That's it — the panel is already configured by `.pages.yml`.
   See **ADMIN-GUIDE.md** for how to edit everything.

## QR code for the business card

1. Deploy first, so you know your real URL.
2. Double-click `qr/qr-generator.html` (works offline).
3. Paste your live URL → **Generate QR** → download the PNG (1024 px,
   print-ready) or SVG (best for print shops).

The QR uses high error correction (level H); keep it at least
1.5 × 1.5 cm on the card.

## Local preview (optional, for developers)

The site loads data with `fetch`, so it needs a local web server rather
than double-clicking index.html. Any static server pointed at `site/`
works.
