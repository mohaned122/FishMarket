# Fish & scene asset inventory

Status of every image the build (`todo`) expects. Read this before blaming the CSS.

## Supplied by the owner — real photography

Cut out on a transparent background, all facing the same direction, single light
source. Sourced from `src/assets/temp/`.

| File          | Px       | Weight | Mapped to            |
| ------------- | -------- | ------ | -------------------- |
| `seabass.png` | 447x447  | 97 KB  | Sea Bass (loup)      |
| `salmon.png`  | 500x500  | 144 KB | Salmon               |
| `red-mullet.png` | 447x447 | 85 KB | Red Mullet (rouget)  |
| `sardines.png` | 500x500 | 84 KB  | Sardines             |
| `tuna.png`    | 385x519  | 156 KB | Tuna                 |

**The species mapping above is an inference from pixel tone, not from the owner's
description.** Re-map by editing `src/app/core/data/fish.ts` only — no component
references a filename directly.

## Deviations from the brief (deliberate)

- **PNG, not WebP/AVIF.** No image encoder is available in this environment. Files are
  84-156 KB against a 160 KB target, so they are close to budget, but they are PNG.
  Re-encode to WebP when a build pipeline is available.
- **`1.png` was mapped to Tuna.** It is the densest cut-out (29% coverage) and the only
  portrait-format asset. If it is actually a different species, change the `image`
  field for that record in `fish.ts`.

## Still missing — currently SVG placeholders

These render through the inline-SVG fallback in `FishImage`, deliberately styled to look
intentional (two-tone, line-drawn scales and fins) rather than a grey box.

| Expected file      | Used for                        | Current fallback                     |
| ------------------ | ------------------------------- | ------------------------------------ |
| `dorade.webp`      | Gilt-head Bream product         | `FishImage` inline SVG silhouette     |
| `salmon-fillet.webp` | Pick Your Cut section         | Inline SVG (brief S10 requires SVG)  |
| `med-sea.webp`     | Mediterranean layer 1 (0.15x)   | Flat colour plane + wave line-art    |
| `med-coast.webp`   | Mediterranean layer 2 (0.3x)    | Flat colour plane                    |
| `med-boat.webp`    | Mediterranean layer 3 (0.5x)    | Inline SVG boat silhouette           |
| `med-sun.webp`     | Mediterranean layer 4 (0.7x)    | Radial `circle` in peach             |
| `story-boat.webp`  | Story section plate             | Flat colour plate                    |
| `story-hands.webp` | Story section plate             | Flat colour plate                    |

## Requested from the owner

- Hero fish at 2400 px wide, transparent WebP, under 250 KB.
- Scenic Mediterranean plates at 2400 px, WebP/AVIF, under 300 KB each.
- Story photography (quay, boat, hands) — the current story copy is placeholder.