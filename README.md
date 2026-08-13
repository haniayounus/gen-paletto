# Gen Paletto 🎨
 
Gen Paletto is a free, browser-based toolkit for designers and developers to generate, extract, check, and manage color palettes and gradients — no sign-up, no backend, everything runs client-side and saves locally in your browser.
 
## Live Tools
 
| Tool | File | Description |
|---|---|---|
| **Home** | `index.html` | Landing page with an overview of all tools. |
| **Generate Palette** | `palettegenerator.html` | Pick a base color and generate **Monochromatic, Analogous, Complementary, Split Complementary, Triadic, and Tetradic** palettes. |
| **Random Palette** | `randompalettegenerator.html` | Instantly generate random, monochromatic-shade, and complementary-matching palettes. |
| **Gradient Generator** | `gradientgenerator.html` | Blend 2–3 colors into linear or radial CSS gradients with adjustable angle/direction, then copy the CSS. |
| **Extract Palette from Image** | `imagepicker.html` | Upload any image and extract its 5 most dominant colors. |
| **Contrast Checker** | `contrastchecker.html` | Check foreground/background contrast ratio against WCAG AA/AAA standards for normal and large text. |
| **Saved Palettes** | `savedpalettes.html` | View, rename, export, and delete palettes you've saved (stored in `localStorage`). |
 
## Features
 
- 🎨 Six color-theory based palette generation modes
- 🎲 One-click random palette generation (random / shades / matching)
- 🌈 Linear & radial gradient builder with live CSS preview
- 🖼️ Dominant color extraction from uploaded images
- ♿ WCAG AA/AAA contrast checking with live preview
- 💾 Save palettes locally and manage them (rename, delete, export)
- 📤 Export palettes as **CSS custom properties** or **JSON**
- 📋 One-click copy for any color value (HEX / RGB / HSL)
- 📱 Responsive navigation with mobile menu
- ✨ Animated aurora/gradient background UI
## Tech Stack
 
- **HTML5 / CSS3** — no frameworks
- **Vanilla JavaScript (ES6+)** — no build step, no dependencies
- **Inline SVG** for iconography
- **`localStorage`** for persisting saved palettes — all data stays on the user's device
## Project Structure
 
```
├── index.html                   # Home page
├── palettegenerator.html        # Palette generator (by color theory)
├── randompalettegenerator.html  # Random palette generator
├── gradientgenerator.html       # Gradient generator
├── imagepicker.html             # Image color extractor
├── contrastchecker.html         # WCAG contrast checker
├── savedpalettes.html           # Saved palettes manager
├── css/
│   └── style.css                # Global styles
└── js/
    ├── palette.js                # Palette generator logic (color theory)
    ├── random.js                 # Random palette generator logic
    ├── gradient.js                # Gradient generator logic
    ├── imagepicker.js             # Image color extraction logic
    ├── contrastchecker.js         # Contrast ratio / WCAG logic
    ├── savedpalettes.js           # Saved palettes CRUD + export
    └── ui.js                      # Shared UI helpers (mobile nav, toasts)
```
 
## How Saved Palettes Work
 
Palettes are saved to the browser's `localStorage` under the key `genPaletto_savedPalettes`, so:
- No account or server needed
- Data persists between visits on the same browser/device
- Data is **not** synced across devices or browsers
- Clearing browser storage will remove saved palettes
## Export Formats
 
Every tool that supports saving/exporting a palette can output:
 
**CSS**
```css
:root {
  --color-1: #6366F1;
  --color-2: #8B5CF6;
  --color-3: #EC4899;
}
```
 
**JSON**
```json
{
  "name": "Complementary",
  "colors": ["#6366F1", "#8B5CF6", "#EC4899"]
}
```
 
## Accessibility
 
The Contrast Checker calculates contrast ratio using the WCAG relative luminance formula and reports pass/fail against:
- **AA**: 4.5:1 (normal text), 3:1 (large text)
- **AAA**: 7:1 (normal text), 4.5:1 (large text)
## Credits
 
Designed & developed by **Hania**.
 
## License
 
© 2026 Gen Paletto. All rights reserved. *(Update this section with your preferred license — e.g. MIT — if you plan to open source it.)*
