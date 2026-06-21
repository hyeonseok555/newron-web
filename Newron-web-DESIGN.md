---
name: Newlon Intelligence
colors:
  surface: '#f7fafd'
  surface-dim: '#d7dadd'
  surface-bright: '#f7fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f7'
  surface-container: '#ebeef1'
  surface-container-high: '#e5e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1e'
  on-surface-variant: '#434651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f4'
  outline: '#747783'
  outline-variant: '#c4c6d3'
  surface-tint: '#405c9e'
  primary: '#002869'
  on-primary: '#ffffff'
  primary-container: '#103e8f'
  on-primary-container: '#8eadff'
  inverse-primary: '#b1c5ff'
  secondary: '#0c61a1'
  on-secondary: '#ffffff'
  secondary-container: '#78b7fd'
  on-secondary-container: '#00487a'
  tertiary: '#1f3200'
  on-tertiary: '#ffffff'
  tertiary-container: '#304a00'
  on-tertiary-container: '#89bf29'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001947'
  on-primary-fixed-variant: '#274485'
  secondary-fixed: '#d1e4ff'
  secondary-fixed-dim: '#9ecaff'
  on-secondary-fixed: '#001d36'
  on-secondary-fixed-variant: '#00497d'
  tertiary-fixed: '#baf55b'
  tertiary-fixed-dim: '#9fd840'
  on-tertiary-fixed: '#121f00'
  on-tertiary-fixed-variant: '#344e00'
  background: '#f7fafd'
  on-background: '#181c1e'
  surface-variant: '#e0e3e6'
typography:
  headline-lg:
    fontFamily: Work Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  body-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Work Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  caption-tiny:
    fontFamily: Work Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 16px
  container-margin: 20px
  card-padding: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
Newlon is a professional news and information platform designed to deliver high-density content with an authoritative yet accessible tone. The design style is **Corporate / Modern**, leaning heavily on a systematic approach to hierarchy. It uses a refined "Fidelity" color strategy, where deep navy blues anchor the experience in trust, while vibrant lime-green accents provide a sense of technological intelligence and growth. 

The aesthetic is characterized by clean lines, generous vertical rhythm, and a mix of soft-surfaced containers that distinguish between content types. It prioritizes legibility and clear categorization to help users navigate complex information streams efficiently.

## Colors
The palette is built on a "Fidelity" logic. The **Primary** color is a deep, authoritative navy (#002869), used for headers, active states, and brand-critical elements. The **Secondary** palette provides lighter blue variations for interactive secondary actions. 

**Tertiary** accents use a lime-green (#86bc25), primarily for semantic indicators and highlights that require a modern, energetic feel. The **Neutral** palette is cool-toned (#f7fafd), moving away from pure greys to a soft blue-grey background that reduces eye strain and reinforces the professional theme. High-contrast text is reserved for titles, while secondary information uses a muted "on-surface-variant" to maintain clear information architecture.

## Typography
We utilize **Work Sans** across all roles to maintain a neutral, professional, and highly legible appearance. 

- **Headlines:** Use heavy weights (600-700) and negative letter-spacing for large titles to create a strong editorial "voice."
- **Body:** Body text is optimized for reading speed with a 1.4x-1.5x line height. Bold weights are used within body-lg roles for news feed titles to ensure they stand out against metadata.
- **Labels:** Use uppercase or semi-bold weights for metadata (e.g., source names, time stamps) to differentiate from narrative text.
- **Visual Hierarchy:** Hierarchy is achieved through weight contrast (Bold vs. Regular) rather than just size changes.

## Layout & Spacing
The system follows a **Fluid Grid** logic optimized for mobile-first consumption. 
- **Margins:** A consistent 20px horizontal margin wraps the main content area.
- **Vertical Rhythm:** A three-tiered stack system (8px, 16px, 24px) governs vertical spacing between elements. 
- **Horizontal Flow:** Categories and chips use a "no-scrollbar" horizontal overflow pattern, allowing users to swipe through options without cluttering the screen.
- **Breakpoints:** On wider screens, the central content column should max out at 640px, centering itself within the viewport to maintain line-length legibility.

## Elevation & Depth
Depth is created through a combination of **Tonal Layering** and **Soft Ambient Shadows**.

- **Surface Levels:** The base background is `#f7fafd`. Content cards and the navigation bar use the "lowest" surface (`#ffffff`) to pop against the background.
- **Shadows:** We use multi-layered shadows to indicate importance. 
  - *Small:* Used for list items to provide a subtle lift.
  - *Medium/Large:* Used for hero cards and the floating action button (FAB) to imply high interactivity and priority.
- **Interactive States:** Buttons and cards use a subtle "scale-down" transform (95-98%) on active states to provide tactile physical feedback rather than just color changes.

## Shapes
The shape language is consistently **Rounded**, conveying a modern and friendly tech aesthetic. 
- **Standard Radius:** 0.5rem (8px) for buttons and internal elements.
- **Large Radius:** 0.75rem (12px) to 1rem (16px) for cards and main containers to soften the overall UI.
- **Pills:** Full rounding (9999px) is reserved for chips, category filters, and small icon buttons, making them feel like distinct, touchable "objects."
- **Visual Continuity:** Image containers inside cards must match the parent card's roundedness or use a slightly smaller radius to maintain nested visual harmony.

## Components
- **Buttons:** Primary buttons are pill-shaped with full color fills. Secondary buttons use a background of `surface-container-lowest` with a 1px `outline-variant` border.
- **Chips/Filters:** Horizontal scrolling groups of pill-shaped elements. Active states use primary fills; inactive states use outlined backgrounds.
- **News Cards:** Use a horizontal layout for lists (Image on right, 1:1 ratio) and a vertical "Hero" layout for featured content (Image as background with a primary-to-transparent gradient overlay).
- **Navigation Bar:** A fixed bottom container with `surface-container-lowest` and a subtle top border. Active items are highlighted with a `primary-container` rounded-square background.
- **FAB (Floating Action Button):** A circular, high-elevation button (#002869) containing a "sparkle" or "AI" icon, positioned at the bottom right for primary tool access.
- **Inputs:** Search bars and text inputs should mirror the pill shape of buttons for consistency, using the `surface-container-low` background.