# Design System Specification: High-End Editorial Strategy

## 1. Overview & Creative North Star
**Creative North Star: The Lucid Intelligence**

This design system moves beyond the utility of a "tool" to become a "digital concierge." Inspired by the high-density clarity of Linear and the effortless whitespace of Superhuman, the system focuses on **Lucid Intelligence**. It utilizes a sophisticated, layered approach to data, treating every apartment listing and AI insight as a premium editorial feature rather than a database entry.

To break the "template" look, we reject the rigid grid in favor of **intentional asymmetry**. Hero sections should feature overlapping elements—such as a property image bleeding into a floating AI-summary card—to create a sense of physical depth. By utilizing high-contrast typography scales and breathing room, we elevate the experience from a standard search engine to a curated real estate gallery.

---

## 2. Colors: Tonal Architecture
The palette is rooted in a deep, tech-centric foundation, using Mint and Sky Blue to signal innovation, while Soft Rose provides a humanistic, premium touch.

### Core Palette
- **Primary (Mint Green):** `#3ECFA0` — Used for high-intent actions and "Success" states.
- **Secondary (Sky Blue):** `#5BA8FF` — Used for informational cues and secondary navigation.
- **Tertiary (Soft Rose):** `#FF7EB3` — Reserved for "Member-Only" features or high-value accents.
- **Neutral Foundation:** Background (`#F8FBFF`), Surface-Low (`#F0F3FF`), Surface-High (`#DEE8FF`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Visual boundaries must be defined strictly through:
1. **Background Color Shifts:** Placing a `surface-container-low` section against a `surface` background.
2. **Tonal Transitions:** Using subtle shifts in hue to denote where the header ends and the body begins.
3. **Negative Space:** Relying on the `spacing-8` (2.75rem) or `spacing-12` (4rem) tokens to create cognitive separation.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets. 
- **Base Layer:** `surface` (`#F9F9FF`)
- **Secondary Section:** `surface-container-low` (`#F0F3FF`)
- **Interactive Cards:** `surface-container-lowest` (`#FFFFFF`) to create a "pop" effect.
- **Glassmorphism:** For floating AI-modals or navigation bars, use `surface` at 80% opacity with a `20px` backdrop-blur. This allows the Mint and Rose "glowing blobs" to bleed through, creating a high-tech "frosted glass" aesthetic.

---

## 3. Typography: Editorial Authority
We use **Inter** for its mathematical precision and readability. The scale is intentionally dramatic to provide a clear hierarchy.

| Level | Size | Weight | Role |
| :--- | :--- | :--- | :--- |
| **Display-LG** | 3.5rem (56px) | Bold | Hero Headlines (e.g., Search Queries) |
| **Headline-LG** | 2.5rem (40px) | Bold | Section Introductions |
| **Title-MD** | 1.125rem (18px) | SemiBold | Card Titles / Property Names |
| **Body-LG** | 1rem (16px) | Regular | Standard Listing Details |
| **Label-MD** | 0.75rem (12px) | Medium | Metadata / Overlines / Tags |

**Editorial Note:** Always pair a `Display-LG` headline with a `Body-LG` sub-headline. The significant jump in scale creates a "premium magazine" feel that signals authority.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a crutch for poor spacing. In this system, we prioritize **Tonal Layering**.

- **The Layering Principle:** To lift a card, do not reach for a shadow first. Instead, place a `surface-container-lowest` (pure white) card on a `surface-low` background. The slight shift in brightness provides a cleaner, more modern "lift."
- **Ambient Shadows:** When a floating state is required (e.g., a hovered property card), use a diffused shadow: `0px 24px 48px rgba(15, 27, 45, 0.07)`. The shadow color is a tinted version of our `on-surface` color, mimicking natural light.
- **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline-variant` at 20% opacity. **Never use 100% opaque borders.**
- **Signature Textures:** For primary CTAs, use a subtle vertical gradient from `primary` (`#3ECFA0`) to `primary-container` (`#006C4F`) to give the button a tactile, "pressable" soul.

---

## 5. Components: Precision Primitives

### Buttons
- **Primary:** 48px height, 12px radius. Solid Mint (`#3ECFA0`) with White text.
- **Secondary:** 48px height, 12px radius. Ghost style (no fill) with a Ghost Border (20% Opacity Sky Blue).
- **Interactive State:** On hover, primary buttons should shift 2px upward with a subtle ambient shadow.

### Cards & Lists
- **The Divider Ban:** Do not use horizontal rules (`<hr>`). Use `spacing-4` (1.4rem) to separate list items.
- **Radius:** Property cards must use `xl` (1.5rem / 24px) corners to feel friendly and modern.
- **AI Insight Chips:** Use `secondary-fixed` (`#D3E4FF`) background with `on-secondary-container` (`#003B6A`) text for high-tech legibility.

### Input Fields
- Avoid "box" inputs. Use a `surface-container-low` background with a `12px` radius and no border. On focus, transition the background to `surface-container-lowest` and add a 1px Mint `primary` ghost-border.

### Signature Component: The AI Search Blob
Use the Mint, Blue, and Rose "glowing blobs" (75% transparency) as background elements behind the search bar. As the user types, these shapes should subtly shift positions (20-30px) to simulate the AI "thinking."

---

## 6. Do’s and Don'ts

### Do
- **Do** use asymmetrical layouts (e.g., a 60/40 split for property details vs. map).
- **Do** utilize `surface-bright` for highlights to draw the eye to "Featured" listings.
- **Do** use `Body-SM` for legal or secondary info, but keep it at `muted-text` (`#64748B`) to maintain hierarchy.
- **Do** embrace whitespace. If a section feels crowded, double the padding using the `spacing-16` token.

### Don't
- **Don't** use pure black `#000000` for text; it creates visual vibration. Use `on-background` (`#101C2E`).
- **Don't** use 1px solid borders to define the layout; let the colors and shadows do the work.
- **Don't** use text gradients. We rely on high-quality typography and solid brand colors for impact.
- **Don't** use sharp corners. Everything in this ecosystem is rounded (`16px-24px`) to feel approachable and sophisticated.