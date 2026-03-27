# Tardfyou.github.io

A small digital salon for essays, notes, experiments, and quiet obsessions.

This repository contains the Hugo source for the site, currently composed with `Hugo + LoveIt`, then tailored in-repo rather than treated as an untouched theme install.

## The Maison

Two structural changes have already been completed:

1. The old Hexo-style static export has been cleared out of the repository root.
2. Existing posts have been moved into Hugo's content structure, so publishing and maintenance now happen from one coherent source.

## Floor Plan

```text
.
|-- .github/              GitHub Pages workflow
|-- assets/               Project-level style overrides
|-- content/              Posts and pages
|-- docs/                 Maintenance and migration notes
|-- layouts/              Project-level template overrides
|-- scripts/              Migration and rebuild utilities
|-- static/               Static assets
|-- themes/LoveIt/        Vendored theme source
|-- hugo.toml
`-- README.md
```

## The Atelier

Local preview:

```powershell
hugo server
```

Preview including drafts:

```powershell
hugo server --buildDrafts
```

Production build:

```powershell
hugo --minify --cleanDestinationDir
```

## Service

Deployment is handled through GitHub Actions. The workflow lives at `.github/workflows/hugo.yml`.

For GitHub Pages, use:

- `Build and deployment`
- `Source: GitHub Actions`

The old branch-root publishing approach should stay retired.

## House Documents

- Environment setup: `docs/ENVIRONMENT_SETUP.md`
- Maintenance and upgrades: `docs/MAINTENANCE_AND_UPGRADE.md`
- Content migration and rebuild notes: `docs/CONTENT_MIGRATION.md`

## If The Theme Is Touched

During a LoveIt upgrade, preserve the project-owned layers first:

- `hugo.toml`
- `assets/css/_override.scss`
- `assets/css/_custom.scss`
- `layouts/`
- `content/`
- `scripts/`
- `.github/workflows/hugo.yml`

## One Final Note

`themes/LoveIt/` is vendored into the repository. It is not managed as a git submodule.
