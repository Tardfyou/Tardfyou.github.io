# Third-party notices

## Liquid glass refraction profile

`static/studio/lens.js` adapts the `compute1D` refraction calculation and
`convexCircle` surface profile from [DevSam7t3/liquid-glass](https://github.com/DevSam7t3/liquid-glass),
Copyright (c) 2026 DevSam7t3, under the MIT License.

- Pinned revision: `3092b5b57f2b8a4253e3bf15a2c7a39e75394d1b`
- Original file: [`src/math.ts`](https://github.com/DevSam7t3/liquid-glass/blob/3092b5b57f2b8a4253e3bf15a2c7a39e75394d1b/src/math.ts)
- Full license: [`static/studio/licenses/devsam-liquid-glass-MIT.txt`](static/studio/licenses/devsam-liquid-glass-MIT.txt)

The adaptation uses normalized dimensions and a shared 128-interval lookup table,
linear interpolation, an explicit zero at the inner boundary, and a subpixel
smooth transition at the outer boundary. It is integrated with this template's
existing rounded-rectangle map, size cache, optical intensity limits and
interaction layers. The upstream component system is not bundled.
