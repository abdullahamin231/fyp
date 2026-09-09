---
name: Technical Sophistication
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#4fdbc8'
  on-secondary: '#003731'
  secondary-container: '#04b4a2'
  on-secondary-container: '#003f38'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-page: 24px
  stack-compact: 8px
  stack-comfortable: 16px
---

## Brand & Style

This design system targets high-performance engineering teams requiring a unified interface for complex workflows. The brand personality is **authoritative, precise, and hyper-functional**, bridging the gap between the structured utility of a code editor and the high-level oversight of project management.

The design style is **Corporate Modern with a Developer Edge**. It prioritizes information density over white space, using a systematic layout to manage high-velocity data. The aesthetic is "dark-first," projecting a focused environment that reduces eye strain during long sessions of deep work. Visual hierarchy is established through tonal layering and crisp, stroke-based iconography rather than decorative elements.

## Colors

The palette is optimized for a technical, dark-mode environment. 
- **Primary (Indigo):** Used for primary actions, focus states, and brand presence.
- **Vibrant Teal:** Reserved for success states, active deployments, and resolved threads.
- **Orange:** Dedicated to alerts, merge conflicts, and high-priority blocking issues.
- **Neutral (Slate):** A scale of grays used to establish hierarchy in text and define UI boundaries without creating high-contrast visual noise.

Surface colors utilize the background-surface token (#1E293B) to create a clear distinction between the application shell and interactive content areas.

## Typography

Typography is used to maintain high legibility within dense data grids and dashboards. 
- **Inter** is the primary typeface for all UI labels, navigation, and body content. Its neutral, systematic nature ensures clarity at small sizes.
- **JetBrains Mono** is utilized for "Technical Meta-data"—this includes commit hashes, branch names, code snippets, and system IDs. This font-pairing reinforces the developer-centric nature of the product.

For mobile layouts, `headline-lg` should be reduced to 24px/32px to ensure title strings do not wrap excessively.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on maximizing horizontal real estate. 
- **Grid:** 12-column system for main content areas, but most views utilize a 2 or 3-pane master-detail pattern.
- **Density:** Spacing is tight (8px/12px) between related data points to keep information "above the fold." 
- **Sidebars:** Fixed-width navigation (64px collapsed, 240px expanded) on the left, with an optional utility/context panel on the right.
- **Responsiveness:** On tablet, the right utility panel converts to a bottom sheet or hidden drawer. On mobile, the multi-pane view collapses into a sequential stack with a persistent bottom navigation bar.

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Ambient Shadows** to create a sense of workspace hierarchy. 
- **Level 0 (Base):** #0F172A - The lowest layer (the application background).
- **Level 1 (Surface):** #1E293B - Cards, sidebar containers, and navigation bars.
- **Level 2 (Raised):** #1E293B with a 1px border (#334155) and a soft, deep shadow (0px 8px 24px rgba(0,0,0,0.4)). Used for modals, dropdowns, and active tooltips.

Depth is primarily signaled by borders. All surfaces at the same elevation are separated by a 1px Slate (#334155) border to maintain a crisp, structured look without relying on heavy shadows.

## Shapes

The shape language is disciplined and geometric. A standard **8px radius** is applied to almost all UI containers (cards, inputs, buttons) to balance the "technical" feel with modern software aesthetics.
- **Small elements:** Tags and small buttons use a 4px-6px radius.
- **Standard elements:** Cards and modals use the 8px base (rounded-lg in this system).
- **Circular elements:** Only used for user avatars and status indicators.

## Components

- **Buttons:** Primary buttons are solid Indigo. Secondary buttons use a ghost style (Slate border, transparent fill) to keep the UI light. Success/Danger actions use Teal/Orange text with subtle tinted backgrounds.
- **Cards:** Info-rich, with a 1px Slate border. Header sections within cards should use a 12px padding, while body content uses 16px.
- **Inputs:** Dark backgrounds (#0F172A) with a Slate border that shifts to Indigo on focus. Mono fonts are used for placeholder text in search fields to signal "Command Palette" functionality.
- **Chips/Status:** Small, high-contrast labels with `label-caps` typography. They should include 12px stroke-based icons for tool-specific branding (e.g., GitHub, Figma).
- **Interactive Graphs:** Use Teal for positive trends and Indigo for volume. Grids should be minimal, using the #334155 border color for axis lines.
- **Lists:** High-density rows with 8px vertical padding. Every row should have a hover state that lightens the background slightly to #2D3748.