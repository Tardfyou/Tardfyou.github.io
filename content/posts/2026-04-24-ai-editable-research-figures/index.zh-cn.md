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

> As of April 24, 2026, the strongest workflow is not "ask an image model for the final figure." It is "plan in structure, render with AI, and ship an editable artifact."

![](/images/ai-editable-research-figures/hero-workflow.svg)

## Short answer

If the target is a figure that looks polished **and** remains editable in PowerPoint, HTML, or Word, the best default is:

1. Use a multimodal reasoning model as a **prompt compiler**.
2. Feed it your sketch, paper excerpt, and reference figures.
3. Ask it for parallel outputs:
   - an image-model prompt,
   - a structured editable output such as `SVG`, `HTML/CSS`, `Mermaid`, `Typst`, or `draw.io`,
   - caption and label text.
4. Use an image model such as **OpenAI `gpt-image-2`** or **Google Gemini image generation**. In Google's product line, many users will meet this through the **Nano Banana / Nano Banana Pro** naming.
5. Finish the final deliverable in vector, code, or Office-native form.

That is the practical conclusion. Image models are now very good at **composition, taste, style transfer, and reference-conditioned rendering**. They are still less reliable at **dense labels, exact topology, and repeatable scientific layout**.

## The strongest stack in 2026

There are really two figure classes:

| Figure class | Best default | Why |
| --- | --- | --- |
| Architecture diagrams, pipelines, threat models, method overviews, dashboards | `SVG` / `HTML` / `Mermaid` / `Typst` first | These need trustworthy text and easy revision |
| Teaser art, stylized concepts, scene-like panels, background visuals | Image model first | These benefit from texture, depth, and visual atmosphere |

For most CS, security, AI, and software engineering papers, the strongest overall workflow is:

1. Gather source material: sketch, paper paragraph, and one or two reference figures.
2. Ask a reasoning model to extract entities, relations, labels, reading order, and field constraints.
3. Ask for both:
   - a polished image-model prompt,
   - an editable structural artifact.
4. Use the image model for the beauty pass, but keep the structured artifact as the editable truth.

This hybrid approach is stronger than pure image generation because current official docs still make the limits clear:

- OpenAI's image guide notes that `gpt-image-2` does **not** support transparent backgrounds and is weaker on some precise layout-sensitive compositions.
- Google's Gemini image-generation guide likewise notes that transparent background is not supported, and for accurate text it recommends generating the text first and then using it in the image workflow.

So the durable rule is simple:

- let the image model control the **look**,
- let the structured output control the **meaning**.

![](/images/ai-editable-research-figures/decision-matrix.svg)

## What should be structure-first

Good candidates for direct `SVG`, `HTML`, `Mermaid`, `draw.io`, or `Typst` generation:

- system pipelines,
- method overview figures,
- attack graphs and trust-boundary diagrams,
- training and inference workflows,
- software architecture figures,
- result-summary dashboards,
- algorithm overview posters.

Bad candidates for image-only delivery:

- figures with many small labels,
- exact network topologies,
- equations that must stay editable,
- pseudocode reviewers may inspect line by line,
- tables that will be revised after advisor feedback.

If the text matters, ship a structured artifact.

## Prompting pattern that actually works

The best prompt is not one long paragraph. It is a compact figure brief with explicit outputs.

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
  visual_tone: clean, premium, restrained
  palette: slate, deep blue, teal, soft orange
  typography: short labels only
layout:
  reading_order: left-to-right
  panels: 4
avoid:
  - fake code
  - tiny unreadable text
  - photorealism
  - clutter
editable_target:
  primary: svg
  secondary: html
```

A useful prompt-compiler instruction looks like this:

```text
You are preparing a publication-quality research figure.

Inputs:
- paper excerpt
- sketch
- reference figures
- target field: network security / AI systems / software engineering
- target medium: paper + slides + web

Tasks:
1. Extract semantic objects and relations.
2. Decide whether this figure should be image-first or structure-first.
3. Produce:
   a. one concise image-model prompt,
   b. one fully editable SVG,
   c. one HTML/CSS figure with the same structure,
   d. one short caption,
   e. one label inventory.

Global style constraints:
- white background
- premium academic aesthetic
- short real terminology
- consistent spacing and alignment
- no fake source code
- no dense paragraphs inside the figure
```

That single compiler prompt is usually enough. You do not need three different long prompts unless the figure is unusually complex.

## Word-ready equations, pseudocode, and tables

This is the part that most "AI figure" workflows underspecify. If your lab edits heavily in Word, the model must output **synchronized document assets**, not one screenshot.

![](/images/ai-editable-research-figures/document-assets.svg)

### 1. Equations for Word

Microsoft Word officially supports **linear equations** in both `UnicodeMath` and `LaTeX`. In practice, the clean workflow is:

1. Press `Alt +=` in Word.
2. Paste the `LaTeX` or `UnicodeMath` form.
3. Convert or display it in Professional format if needed.

So do not ask the model for "an equation image." Ask for this package:

- `word_latex`
- `word_unicodemath`
- `svg_equation`
- `variable_legend`

Prompt template:

```text
Generate a Word-usable equation package.

Return exactly:
1. Word LaTeX input
2. Word UnicodeMath input
3. SVG version for PowerPoint
4. Variable legend

Constraints:
- The LaTeX must be directly pasteable into Microsoft Word after pressing Alt+=
- The UnicodeMath must also be directly pasteable into Word
- Do not use unsupported macros or custom packages
- Prefer Word-friendly constructs such as \frac, \sqrt, \sum, matrices, subscripts, and superscripts
- Keep the expression on one logical line
```

This is much safer than generating a bitmap, and it gives you one representation for Word, one for slides, and one for explanation.

### 2. Pseudocode for Word

Pseudocode is where many AI outputs become annoying. The model often writes acceptable algorithm text but traps it in a non-editable image or in LaTeX only.

The reliable approach is to ask for four parallel outputs:

- `plain_text_pseudocode`
- `word_table_tsv`
- `latex_algorithm2e`
- `svg_panel`

The most useful of these is `word_table_tsv`, because Word can convert delimited text into a table. That makes revision much easier than editing a screenshot.

Prompt template:

```text
Generate publication-ready pseudocode in four synchronized formats:
1. Plain-text pseudocode
2. Word-ready TSV table
3. LaTeX algorithm2e version
4. SVG panel version

Constraints:
- The Word-ready version must use TAB as the column separator
- Each row must map cleanly into a Word table
- Use short lines and stable indentation
- Keep step numbers explicit
- Avoid exotic symbols that render poorly in Word
```

A practical Word layout is a two-column table:

- `Line`
- `Action`

Example:

```text
Line	Action
1	Initialize memory M and score S
2	For each sample x in batch B
3	Compute embedding h = f_theta(x)
4	Update score S using h
5	Return top-k results
```

Paste that into Word, then use **Convert Text to Table**. This is far more editable than a code screenshot.

### 3. Data tables for Word

Tables should almost never exist only as images. If you expect revisions, ask for three editable forms and one presentation form:

- `csv`
- `tsv`
- `markdown_table` or `html_table`
- `svg_snapshot`

Prompt template:

```text
Generate a paper-ready result table in multiple editable formats.

Return:
1. CSV
2. TSV for direct paste into Word
3. Markdown table
4. A compact caption
5. Notes on units, rounding, and abbreviations

Constraints:
- Do not return the table as an image only
- Keep numeric precision consistent
- Use explicit column names
- Mark best values in a note or dedicated field, not only by visual styling
- Ensure the TSV version can be converted in Word using Convert Text to Table
```

This structure separates:

- the **data source**,
- the **Word-editable form**,
- the **paper snapshot**.

That separation is what keeps last-minute revisions manageable.

### One rule for all Word-facing assets

For equations, pseudocode, and tables, never ask AI for only a visual result. Ask for:

- one semantic source form,
- one Word-ready editable form,
- one slide-ready or web-ready visual form.

That is the difference between a nice demo and a usable academic workflow.

## The strongest editable targets

For most labs, the most practical final targets are:

- `SVG` for PowerPoint and general reuse,
- `HTML/CSS` for blogs, notes, and fast iteration,
- `Mermaid` or `draw.io` for structured diagrams,
- `Typst` for equations, algorithms, and table-adjacent assets,
- Word-native `LaTeX` / `UnicodeMath` / `TSV` for document editing.

SVG is still the safest universal final format because Microsoft 365 officially supports editing SVG graphics and converting them into shapes for deeper modification.

You can also open the editable assets created for this post directly:

- [Workflow SVG](/images/ai-editable-research-figures/hero-workflow.svg)
- [Decision matrix SVG](/images/ai-editable-research-figures/decision-matrix.svg)
- [Document-assets SVG](/images/ai-editable-research-figures/document-assets.svg)
- [Editable HTML demo](/images/ai-editable-research-figures/editable-figure-template.html)

## Bottom line

If I had to recommend one workflow to a lab today, it would be:

- for research diagrams: `multimodal LLM -> SVG / HTML / Mermaid / draw.io -> manual polish`
- for teaser visuals: `multimodal LLM -> image prompt -> gpt-image-2 or Gemini / Nano Banana -> rebuild final deliverable in SVG`
- for Word-facing assets: `multimodal LLM -> LaTeX / UnicodeMath / TSV / CSV / SVG`

The final artifact should match the editing you expect later:

- if you expect semantic edits, generate structure;
- if you expect stylistic edits, generate image references;
- if you expect submission-night chaos, keep both an editable text source and an editable SVG.

That is the difference between "AI made a nice picture" and "AI accelerated a real research workflow."

## Source notes and official docs

The recommendations above were grounded in the current official documentation and product docs available on April 24, 2026:

- [OpenAI Image Generation guide](https://platform.openai.com/docs/guides/images/image-generation)
- [OpenAI Images API reference](https://platform.openai.com/docs/api-reference/images/generate)
- [Google Gemini image generation guide](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google: Nano Banana Pro overview](https://blog.google/technology/ai/nano-banana-pro/)
- [Microsoft Word: Linear format equations using UnicodeMath and LaTeX](https://support.microsoft.com/en-us/office/linear-format-equations-using-unicodemath-and-latex-in-word-2e00618d-b1fd-49d8-8cb4-8d17f25754f8)
- [Microsoft Word: Convert text to a table or a table to text](https://support.microsoft.com/en-us/office/convert-text-to-a-table-or-a-table-to-text-b5ce45db-52d5-4fe3-8e9c-e04b62f189e1)
- [Microsoft 365: Edit SVG images](https://support.microsoft.com/en-us/office/edit-svg-images-in-microsoft-365-69f29d39-194a-4072-8c35-dbe5e7ea528c)
- [Typst documentation](https://typst.app/docs/)
- [draw.io features](https://www.drawio.com/features.html)
- [draw.io: mathematical typesetting in labels](https://www.drawio.com/doc/faq/math-typesetting)
- [Mermaid documentation](https://mermaid.js.org/)
