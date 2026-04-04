# Design System: Notion

## 1. Visual Theme & Atmosphere

Notion's website embodies the philosophy of the tool itself: a blank canvas that gets out of your way. The design system is built on warm neutrals rather than cold grays, creating a distinctly approachable minimalism that feels like quality paper rather than sterile glass. The page canvas is pure white (`#ffffff`) but the text isn't pure black -- it's a warm near-black (`rgba(0,0,0,0.95)`) that softens the reading experience imperceptibly. The warm gray scale (`#f6f5f4`, `#31302e`, `#615d59`, `#a39e98`) carries subtle yellow-brown undertones, giving the interface a tactile, almost analog warmth.

The custom NotionInter font (a modified Inter) is the backbone of the system. At display sizes (64px), it uses aggressive negative letter-spacing (-2.125px), creating headlines that feel compressed and precise. The weight range is broader than typical systems: 400 for body, 500 for UI elements, 600 for semi-bold labels, and 700 for display headings. OpenType features `"lnum"` (lining numerals) and `"locl"` (localized forms) are enabled on larger text, adding typographic sophistication that rewards close reading.

What makes Notion's visual language distinctive is its border philosophy. Rather than heavy borders or shadows, Notion uses ultra-thin `1px solid rgba(0,0,0,0.1)` borders -- borders that exist as whispers, barely perceptible division lines that create structure without weight. The shadow system is equally restrained: multi-layer stacks with cumulative opacity never exceeding 0.05, creating depth that's felt rather than seen.

**Key Characteristics:**
- NotionInter (modified Inter) with negative letter-spacing at display sizes (-2.125px at 64px)
- Warm neutral palette: grays carry yellow-brown undertones (`#f6f5f4` warm white, `#31302e` warm dark)
- Near-black text via `rgba(0,0,0,0.95)` -- not pure black, creating micro-warmth
- Ultra-thin borders: `1px solid rgba(0,0,0,0.1)` throughout -- whisper-weight division
- Multi-layer shadow stacks with sub-0.05 opacity for barely-there depth
- Notion Blue (`#0075de`) as the singular accent color for CTAs and interactive elements
- Pill badges (9999px radius) with tinted blue backgrounds for status indicators
- 8px base spacing unit with an organic, non-rigid scale

## 2. Color Palette & Roles

### Primary
- **Notion Black** (`rgba(0,0,0,0.95)` / `#000000f2`): Primary text, headings, body copy. The 95% opacity softens pure black without sacrificing readability.
- **Pure White** (`#ffffff`): Page background, card surfaces, button text on blue.
- **Notion Blue** (`#0075de`): Primary CTA, link color, interactive accent -- the only saturated color in the core UI chrome.

### Brand Secondary
- **Deep Navy** (`#213183`): Secondary brand color, used sparingly for emphasis and dark feature sections.
- **Active Blue** (`#005bab`): Button active/pressed state -- darker variant of Notion Blue.

### Warm Neutral Scale
- **Warm White** (`#f6f5f4`): Background surface tint, section alternation, subtle card fill. The yellow undertone is key.
- **Warm Dark** (`#31302e`): Dark surface background, dark section text. Warmer than standard grays.
- **Warm Gray 500** (`#615d59`): Secondary text, descriptions, muted labels.
- **Warm Gray 300** (`#a39e98`): Placeholder text, disabled states, caption text.

### Semantic Accent Colors
- **Teal** (`#2a9d99`): Success states, positive indicators.
- **Green** (`#1aae39`): Confirmation, completion badges.
- **Orange** (`#dd5b00`): Warning states, attention indicators.
- **Pink** (`#ff64c8`): Decorative accent, feature highlights.
- **Purple** (`#391c57`): Premium features, deep accents.
- **Brown** (`#523410`): Earthy accent, warm feature sections.

### Interactive
- **Link Blue** (`#0075de`): Primary link color with underline-on-hover.
- **Link Light Blue** (`#62aef0`): Lighter link variant for dark backgrounds.
- **Focus Blue** (`#097fe8`): Focus ring on interactive elements.
- **Badge Blue Bg** (`#f2f9ff`): Pill badge background, tinted blue surface.
- **Badge Blue Text** (`#097fe8`): Pill badge text, darker blue for readability.

### Shadows & Depth
- **Card Shadow** (`rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px`): Multi-layer card elevation.
- **Deep Shadow** (`rgba(0,0,0,0.01) 0px 1px 3px, rgba(0,0,0,0.02) 0px 3px 7px, rgba(0,0,0,0.02) 0px 7px 15px, rgba(0,0,0,0.04) 0px 14px 28px, rgba(0,0,0,0.05) 0px 23px 52px`): Five-layer deep elevation for modals and featured content.
- **Whisper Border** (`1px solid rgba(0,0,0,0.1)`): Standard division border -- cards, dividers, sections.

## 3. Typography Rules

### Font Family
- **Primary**: `Inter`, with fallbacks: `-apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, Segoe UI Emoji, Segoe UI Symbol`

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display Hero | 64px | 700 | 1.00 | -2.125px | Billboard headlines |
| Display Secondary | 54px | 700 | 1.04 | -1.875px | Feature headlines |
| Section Heading | 48px | 700 | 1.00 | -1.5px | Section titles |
| Sub-heading Large | 40px | 700 | 1.50 | normal | Card headings |
| Sub-heading | 26px | 700 | 1.23 | -0.625px | Content headers |
| Card Title | 22px | 700 | 1.27 | -0.25px | Feature cards |
| Body Large | 20px | 600 | 1.40 | -0.125px | Descriptions |
| Body | 16px | 400 | 1.50 | normal | Standard text |
| Body Medium | 16px | 500 | 1.50 | normal | Navigation, UI text |
| Body Semibold | 16px | 600 | 1.50 | normal | Strong labels |
| Nav / Button | 15px | 600 | 1.33 | normal | Button text |
| Caption | 14px | 500 | 1.43 | normal | Metadata |
| Badge | 12px | 600 | 1.33 | 0.125px | Pills, tags |
| Micro Label | 12px | 400 | 1.33 | 0.125px | Timestamps |

## 4. Component Stylings

### Buttons

**Primary Blue**
- Background: `#0075de`
- Text: `#ffffff`
- Padding: 8px 16px
- Radius: 4px
- Hover: background darkens to `#005bab`
- Active: scale(0.9) transform

**Secondary**
- Background: `rgba(0,0,0,0.05)`
- Text: `#000000`
- Padding: 8px 16px
- Radius: 4px

**Pill Badge**
- Background: `#f2f9ff`
- Text: `#097fe8`
- Padding: 4px 8px
- Radius: 9999px
- Font: 12px weight 600

### Cards & Containers
- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.1)`
- Radius: 12px (standard), 16px (featured)
- Shadow: multi-layer card shadow

### Inputs & Forms
- Background: `#ffffff`
- Border: `1px solid #dddddd`
- Padding: 6px
- Radius: 4px
- Focus: blue outline ring
- Placeholder: `#a39e98`

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Border Radius Scale
- Micro (4px): Buttons, inputs
- Standard (8px): Small cards
- Comfortable (12px): Standard cards
- Large (16px): Hero cards
- Full Pill (9999px): Badges, pills

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow | Page background |
| Whisper | `1px solid rgba(0,0,0,0.1)` | Card outlines, dividers |
| Soft Card | 4-layer shadow (max 0.04) | Content cards |
| Deep Card | 5-layer shadow (max 0.05) | Modals, featured panels |

## 7. Key Design Principles

1. Always use warm neutrals -- grays have yellow-brown undertones, never blue-gray
2. Letter-spacing scales with font size: negative at large, normal at body
3. Four weights: 400 (read), 500 (interact), 600 (emphasize), 700 (announce)
4. Borders are whispers: `1px solid rgba(0,0,0,0.1)` -- never heavier
5. Shadows use 4-5 layers with individual opacity never exceeding 0.05
6. Warm white (`#f6f5f4`) for alternating sections and subtle backgrounds
7. Pill badges (9999px) for status/tags, 4px radius for buttons and inputs
8. Notion Blue (`#0075de`) is the only saturated color -- use sparingly
