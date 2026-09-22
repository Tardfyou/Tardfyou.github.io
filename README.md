# Vincent · Blog & Academic

A Hugo blog and academic profile with a pure-white reading canvas, transparent optical glass, and restrained liquid motion.

- [Blog](https://tardfyou.github.io/)
- [Academic profile](https://tardfyou.github.io/academic/)

## Run locally

Install Hugo Extended 0.160.1 and Node.js 22 or newer, then run:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The GitHub Pages workflow builds Hugo and a Pagefind search index automatically.

## Customize

- `hugo.toml`: navigation, site identity, comments and `params.studio` settings.
- `data/academic.json`: profile, research, experience, education and honors.
- `data/music.toml`: music shelf configuration; existing media stays under `static/music/`.
- `content/`: bilingual posts and pages.
- `static/studio/`: shared typography, motion and optical-glass implementation.

`params.studio.mode` supports `hybrid`, `blog` and `academic`. Set `params.studio.motion` to `off` to disable motion. Reduced-motion, reduced-transparency and contrast preferences are supported. Full backdrop refraction and interactive liquid rims are enhanced in Chromium; other browsers retain the clear CSS material.

Glass windows, existing tiles, chips and floating controls can opt in with `data-lens="window"`, `tile`, `chip` or `control`. Decorative SVG layers stay out of document flow and do not change link hit targets. Displacement maps are cached until the layout changes; interactive animation stops when it settles.

For reuse, replace the personal articles, profile, photos and music with your own content. Preserve the LoveIt theme license and the OFL files distributed with the fonts. Personal writing remains under the license shown on the site.
