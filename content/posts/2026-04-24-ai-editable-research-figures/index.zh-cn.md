---
title: "How to Make High-End, Editable Research Figures with AI"
date: 2026-04-24T00:00:00+08:00
lastmod: 2026-04-24T00:00:00+08:00
draft: false
author: "Tardfyou"
description: "A practical 2026 workflow for generating polished research figures with AI while keeping the outputs editable in SVG, HTML, PowerPoint, and Word."
summary: "The strongest current workflow for academic figures is hybrid: use a multimodal LLM as a prompt compiler, use image models for style and visual polish, and finish the deliverable as SVG, HTML, Mermaid, Typst, or Office-native assets."
slug: "ai-editable-research-figures"
aliases:
  - "/2026/04/24/ai-editable-research-figures/"
tags:
  - "ai"
  - "research"
  - "figures"
  - "svg"
  - "academic-writing"
categories:
  - "notes"
images:
  - "/images/ai-editable-research-figures/hero-workflow.svg"
lightgallery: true
---
# How to Make High-End, Editable Research Figures with AI

> As of April 24, 2026, the best workflow for research figures is not "ask an image model for the final figure and hope." The durable workflow is "plan in structure, render with AI, and ship in an editable format."

![](/images/ai-editable-research-figures/hero-workflow.svg)

## Short answer

If the goal is a figure that looks polished **and** can still be edited in PowerPoint, HTML, or SVG, the strongest workflow today is:

1. Use a frontier multimodal reasoning model as a **prompt compiler**.
2. Feed it paper screenshots, your sketch, sample figures, and field-specific constraints.
3. Ask it to emit **three outputs in parallel**:
   - an image-model prompt,
   - an editable structural spec (`SVG`, `HTML/CSS`, `Mermaid`, `Typst`, or `draw.io`),
   - a caption and label set.
4. Use an image model such as **OpenAI `gpt-image-2`** or **Google Gemini image generation**. In Google's product line, many users will encounter this through the **Nano Banana / Nano Banana Pro** naming.
5. Rebuild the final deliverable as vector or code, then do the last 10% of manual cleanup in PowerPoint, Figma, draw.io, or raw SVG.

That is the core conclusion. Image models are now very good at **taste, composition, style transfer, and reference-conditioned rendering**. They are still less reliable at **strictly editable academic diagrams** with dense labels, exact topology, and reproducible layout.

## The best stack in 2026

### 1. A prompt compiler, not just a prompt

Your initial idea is correct, but it should be upgraded.

Do not manually write one big free-form prompt for the image model. Instead, use a reasoning model to convert your source material into a **structured figure brief**:

```yaml
field: network security
figure_type: method overview
audience: top-tier conference reviewers
deliverables:
  - image_prompt
  - svg
  - html
  - caption
style:
  background: white
  visual_tone: clean, premium, restrained, publication-ready
  palette: slate, deep blue, teal, soft orange
  typography: short labels, no paragraph text
  line_style: thin but confident, rounded corners
layout:
  reading_order: left-to-right
  panels: 4
  avoid: fake code, tiny text, photorealism, clutter
domain_constraints:
  - correct attack/defense arrows
  - label trust boundaries
  - use actual pipeline semantics
editable_target:
  primary: svg
  secondary: html
```

This is the biggest practical shift. Once the planning model emits a strict brief, you can branch into multiple outputs without reinventing the figure each time.

### 2. Split the workflow into two tracks

There are really two different figure classes:

| Figure class | Best default | Why |
| --- | --- | --- |
| System architecture, pipelines, ablation summaries, threat models, method overviews | `SVG` / `HTML` / `Mermaid` / `Typst` first | These need editability, alignment, and trustworthy text |
| Concept art, teaser figures, biological-style illustrations, scene-like panels, background visuals | Image model first | These benefit from texture, lighting, material cues, and reference blending |

The mistake is to treat both classes as if they were the same.

### 3. Use image models for polish, not for the final semantic authority

OpenAI's current image guide explicitly notes that `gpt-image-2` does **not** support transparent backgrounds and still struggles with some **precise, layout-sensitive compositions**. Google's Gemini image-generation guide likewise notes that transparent background is not supported, and for accurate text inside images it recommends generating the text first and then using it in the image workflow.

That is exactly why the strongest academic workflow is hybrid:

- Let the image model decide the **look**.
- Let the structured output decide the **meaning**.

## The practical recommendation

### Best overall workflow

For computer science, cybersecurity, AI, and software engineering papers, the best default is:

1. Collect source material.
   - a rough hand sketch,
   - one or two reference figures,
   - one paragraph from the paper,
   - a target venue style if you have one.
2. Ask a multimodal reasoning model to extract:
   - entities,
   - relations,
   - reading order,
   - caption,
   - field-specific visual constraints.
3. Ask the same model to output:
   - one premium image prompt for `gpt-image-2` or Gemini,
   - one exact `SVG`,
   - one exact `HTML/CSS` version,
   - optional `Mermaid` or `draw.io` text if the figure is mostly a diagram.
4. Generate the beauty pass with the image model.
5. Reconstruct or refine the final asset in vector.
6. Import SVG into PowerPoint and, when needed, convert it to shapes for last-mile editing.

This gives you both:

- the "high-end" visual feeling,
- and the "I can still fix this 30 minutes before submission" safety margin.

![](/images/ai-editable-research-figures/decision-matrix.svg)

## What to generate directly, and what not to

### Good candidates for direct SVG or HTML generation

- system pipelines,
- method overview figures,
- training/inference workflows,
- security attack graphs,
- trust-boundary diagrams,
- software architecture figures,
- benchmark comparison panels,
- result-summary dashboards,
- algorithm overview posters.

### Bad candidates for direct image-only generation

- any figure with lots of tiny labels,
- exact network topologies,
- tables that must survive copy-editing,
- pseudocode that reviewers may inspect line by line,
- equations that must remain mathematically editable,
- figures that will be revised repeatedly after advisor feedback.

If the text matters, ship a structured artifact.

## A field-aware prompt pattern that works

The best prompts are not poetic. They are operational.

### Prompt compiler template

```text
You are preparing a publication-quality research figure.

Inputs:
- paper excerpt
- sketch
- reference figures
- target field: network security / AI systems / software engineering
- target medium: paper + slides + web

Tasks:
1. Extract the core semantic objects and their relations.
2. Decide whether this figure should be image-first or structure-first.
3. Produce:
   a. one concise image-model prompt,
   b. one fully editable SVG,
   c. one HTML/CSS figure with the same structure,
   d. one 1-2 sentence caption,
   e. one label inventory.

Global style constraints:
- white background
- premium, modern, restrained academic aesthetic
- no photorealistic humans
- no fake source code
- no dense paragraphs inside the figure
- consistent spacing and alignment
- short labels with real terminology
- suitable for CS / security / AI / software engineering papers
```

### Image-model prompt template

```text
Create a publication-ready research figure on a white background.
Style: premium academic infographic, clean vector-like geometry, soft depth, restrained palette, subtle shadows, precise alignment.
Field: network security.
Content: four-stage attack-defense pipeline with threat boundary, telemetry collection, detection model, response orchestration.
Composition: left-to-right, generous whitespace, clean labels, no clutter.
Typography: short legible labels only.
Avoid: watermark, fake code, tiny unreadable text, photorealism, stock-illustration look, 3D gimmicks.
Deliver a single centered figure with clear panel separation and reviewer-friendly clarity.
```

### SVG-generation prompt template

```text
Generate a single self-contained SVG figure.
Requirements:
- white background
- all text editable
- no embedded raster images
- use grouped layers and readable ids
- preserve consistent stroke width
- layout optimized for PowerPoint import
- 1600x900 viewBox
- use short labels only
- include title area, four panels, arrows, and caption slot
```

## Style presets by field

The same model behaves much better when the field style is explicit.

### Computer security

- white background,
- deep blue, charcoal, muted red accents,
- trust boundaries as dashed containers,
- explicit attacker, defender, asset, log, and control-plane roles,
- emphasize flow and boundary crossings,
- avoid playful icons.

### AI systems / ML infra

- cool neutrals with one accent color,
- data, model, serving, feedback, and evaluation shown as distinct stages,
- use tensor/dataflow semantics, not generic business blocks,
- keep model variants and training stages clearly separated.

### Software engineering / architecture

- slate, teal, sand accents,
- service blocks with interface labels,
- clear dev/test/prod or build/deploy/run separation,
- fewer arrows, cleaner hierarchy, stronger grouping.

## The strongest editable outputs

### 1. SVG is still the best universal target

SVG is the most practical final format when you need one asset to survive:

- the paper,
- the slides,
- the blog,
- and last-minute edits.

Microsoft 365 officially supports editing SVG graphics, including converting them into shapes for deeper modification. That makes SVG the safest "final delivery" format for this use case.

You can also open the editable assets created for this post directly:

- [Workflow SVG](/images/ai-editable-research-figures/hero-workflow.svg)
- [Decision matrix SVG](/images/ai-editable-research-figures/decision-matrix.svg)
- [Document-assets SVG](/images/ai-editable-research-figures/document-assets.svg)
- [Editable HTML demo](/images/ai-editable-research-figures/editable-figure-template.html)

### 2. HTML/CSS is underrated

For web publication, tutorials, course notes, and rapid iteration, HTML/CSS is often better than forcing everything through an image model.

Why:

- labels stay selectable,
- colors and spacing are easy to adjust,
- you can animate or progressively reveal the figure,
- the same structure can be exported to screenshot, PDF, or SVG later.

For blog-first or slide-first workflows, HTML is often the fastest editable intermediate.

### 3. Mermaid and draw.io are excellent for structured diagrams

If the figure is mostly topology and flow, Mermaid and draw.io are strong options:

- Mermaid is plain text, versionable, and easy to regenerate.
- draw.io supports diagram generation from text descriptions and also supports mathematical typesetting in labels.

So for method pipelines and architecture figures, a very strong workflow is:

`LLM -> Mermaid / draw.io text -> draw.io or SVG -> PowerPoint`

### 4. Typst is strong for equations, tables, and figure-adjacent assets

Typst can export directly to SVG, PNG, PDF, and HTML. That makes it especially useful for:

- equations you want as vector graphics,
- algorithm blocks,
- styled tables,
- theorem or notation panels,
- multi-panel figure supplements.

If your lab already uses LaTeX-like workflows but wants faster editing, Typst is one of the best current bridges between AI-assisted authoring and clean final assets.

![](/images/ai-editable-research-figures/document-assets.svg)

## Equations, pseudocode, and tables for Word

This is where many AI figure workflows break. The solution is to ask for **multiple synchronized representations**.

### Equations

Ask the model for all of the following:

- LaTeX,
- a Word-friendly linear equation form,
- an SVG export version,
- a plain-language variable legend.

That way:

- Word users can paste the linear or LaTeX form into the equation editor,
- slide users can drop the SVG into PowerPoint,
- blog users can render KaTeX or MathJax.

### Pseudocode

Ask for:

- `algorithm2e` or `algorithmicx` LaTeX,
- a monospace plain-text fallback,
- a two-column Word table version,
- an SVG panel version for slides.

This avoids the common failure mode where the model writes decent pseudocode but the output is trapped inside an unusable bitmap.

### Tables

Ask for three parallel outputs:

- `CSV` for the data source,
- Markdown or HTML for the editable table,
- SVG only for the presentation snapshot.

The table should never exist only as an image if you expect revisions.

## My current strongest recommendation

If I had to recommend one workflow to a lab today, it would be this:

### For polished research diagrams

`multimodal LLM -> SVG / HTML / Mermaid / draw.io -> manual polish in SVG or PowerPoint`

This is the best default for architecture figures, method overviews, security diagrams, and paper-ready panels.

### For teaser art or style exploration

`multimodal LLM -> image prompt -> gpt-image-2 or Gemini / Nano Banana -> rebuild final deliverable in SVG`

This is the best default for figures where visual atmosphere matters more than exact editability.

### For equations, algorithms, and tables

`multimodal LLM -> LaTeX / Typst / HTML / CSV -> Word / PowerPoint / SVG export`

This is the cleanest bridge between AI generation and document editing.

## The most important rule

The final artifact should match the kind of editing you expect later:

- if you expect semantic edits, generate structure;
- if you expect stylistic edits, generate image references;
- if you expect submission-night chaos, keep an SVG and a text source.

That is the difference between "AI made a nice picture" and "AI accelerated a real research workflow."

## Source notes and official docs

The recommendations above were grounded in the current official documentation and product docs available on April 24, 2026:

- [OpenAI Image Generation guide](https://platform.openai.com/docs/guides/images/image-generation)
- [OpenAI Images API reference](https://platform.openai.com/docs/api-reference/images/generate)
- [Google Gemini image generation guide](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google: Nano Banana Pro overview](https://blog.google/technology/ai/nano-banana-pro/)
- [Microsoft 365: Edit SVG images](https://support.microsoft.com/en-us/office/edit-svg-images-in-microsoft-365-69f29d39-194a-4072-8c35-dbe5e7ea528c)
- [Typst documentation](https://typst.app/docs/)
- [draw.io features](https://www.drawio.com/features.html)
- [draw.io: mathematical typesetting in labels](https://www.drawio.com/doc/faq/math-typesetting)
- [Mermaid documentation](https://mermaid.js.org/)
