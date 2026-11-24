---
name: AeroPulse Atmospheric Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#a33900'
  on-tertiary: '#ffffff'
  tertiary-container: '#cc4900'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.02em
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an authoritative, high-precision atmospheric intelligence interface inspired by Cupertino industrial minimalism and high-density telemetry consoles. It translates complex atmospheric chemistry, sensor clusters, and predictive GenAI models into calm, immediate visual clarity.

The core visual signature balances clinical precision with natural equilibrium:
- **Atmospheric Layering:** Muted translucent planes, hairline borders, and luminous spectral indicators evoke clarity and pure air.
- **Instrumental Precision:** Strict spatial alignment, high data density, and monospaced tabular numerals convey scientific exactitude.
- **Dynamic Diagnostics:** Micro-badges and ambient glow indicators intuitively express dynamic hazard tiers without visual clutter or panic.

## Colors

The palette models atmospheric transparency against a neutral, crystalline foundation.

### Palette Architecture
- **Primary (Sky Intelligence):** `#0284C7` (Sky 600) drives primary interactive states, navigational focus, and AI synthetic insights. Accentuated with `#38BDF8` (Sky 400) for energetic glows and active data streams.
- **Secondary (Pure Biosphere):** `#059669` (Emerald 600) and `#10B981` (Emerald 500) denote optimal air quality indices (AQI 0–50), pristine filtration status, and sustainable baseline metrics.
- **Tertiary (Atmospheric Stress):** `#EA580C` (Orange 600) and `#F59E0B` (Amber 500) serve as progressive warnings for particulate thresholds (AQI 101–200).
- **Hazard State:** `#DC2626` (Ruby 600) and `#991B1B` (Crimson 800) represent acute atmospheric hazards, high VOC spikes, and respiratory containment alerts.
- **Surface Foundations:** Grounded on `#F8FAFC` (Slate 50) and `#F1F5F9` (Slate 100), complemented by `#FFFFFF` elevated translucent sheets and `#64748B` neutral interface copy.

### Functional Severity Color-Coding
AQI tiers must map strictly to functional tokens:
1. **Pristine / Good (0–50):** `#059669` / Background `#ECFDF5`
2. **Moderate (51–100):** `#0284C7` / Background `#F0F9FF`
3. **Unhealthy for Sensitive Groups (101–150):** `#F59E0B` / Background `#FFFBEB`
4. **Unhealthy (151–200):** `#EA580C` / Background `#FFF7ED`
5. **Very Unhealthy / Hazardous (201+):** `#DC2626` / Background `#FEF2F2`

## Typography

The typographic hierarchy balances natural human legibility with mechanical precision:
- **Inter** provides neutral, high-legibility interface copy and commanding executive headlines. Font features `cv02`, `cv03`, `cv04`, and `cv11` are enabled for structural elegance.
- **JetBrains Mono** governs dynamic numeric values, telemetry stream logs, coordinates, sensor readings (PM2.5, PM10, O₃, NO₂, CO), and AI confidence metrics.
- All dynamic counters and telemetry tables must enforce CSS `font-variant-numeric: tabular-nums` to eliminate jitter across real-time websocket refreshes.

## Layout & Spacing

The layout employs a responsive, fluid 12-column grid designed for dense information displays and spatial dashboards.

### Responsive Breakpoints
- **Desktop (1280px+):** 12-column layout with 24px (`1.5rem`) gutters and 32px (`2rem`) outer margins. Supports multi-pane telemetry sidecars and panoramic geospatial layers.
- **Tablet (768px - 1279px):** 8-column layout with 16px (`1rem`) gutters and 24px (`1.5rem`) margins. Diagnostic cards collapse into 4-column paired modules.
- **Mobile (320px - 767px):** 4-column fluid stack with 12px (`0.75rem`) gutters and 16px (`1rem`) margins. Key AQI readouts anchor to the top; auxiliary sensors transition to horizontal snap carousels.

### Spacing Paradigm
Interior component breathing room is strictly separated from exterior layout gutters:
- Micro card padding: `space-md` (16px).
- Complex composite telemetry panels: `space-lg` (24px).
- Stack gaps between unrelated diagnostic feeds: `space-xl` (40px).

## Elevation & Depth

Visual hierarchy uses frosted glassmorphic surfaces, hairline bounds, and deep ambient light diffusion rather than opaque drop shadows.

### Surface Tiers
- **Tier 0 (Canvas Base):** Solid `#F8FAFC`. The foundational canvas on which all atmospheric instrumentation sits.
- **Tier 1 (Resting Translucent Cards):** Background `rgba(255, 255, 255, 0.72)` paired with `backdrop-filter: blur(20px)` and an ultra-fine border of `1px solid rgba(226, 232, 240, 0.8)`. Soft diffuse shadow: `0 8px 32px -4px rgba(15, 23, 42, 0.04)`.
- **Tier 2 (Elevated Flyouts & Active Cards):** Background `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(32px)`. Subtle multi-layered elevation: `0 12px 24px -6px rgba(15, 23, 42, 0.06), 0 4px 8px -2px rgba(15, 23, 42, 0.02)`. Border intensifies to `1px solid rgba(2, 132, 199, 0.25)` during active engagement.
- **Tier 3 (Modals, Overlays & GenAI Command Prompt):** Background `rgba(255, 255, 255, 0.94)` with `backdrop-filter: blur(40px)`, cast over an ambient backdrop dimming of `rgba(15, 23, 42, 0.15)`.

### Ambient Spectral Glows
Severity alerts introduce a localized, non-obtrusive radial back-glow behind metrics:
- Good Air Quality: `radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)`
- Elevated Threat: `radial-gradient(circle, rgba(220, 38, 38, 0.14) 0%, transparent 70%)`

## Shapes

The interface balances organic softness with computational discipline using continuous curvature geometry (`squircle` aesthetics):
- **Cards & Data Modules:** `rounded-2xl` (16px / `1rem`) for smooth containment.
- **Controls & Form Elements:** Standard elements use `rounded-lg` (8px / `0.5rem`).
- **Telemetry Badges & Chips:** Fully pill-shaped (`9999px`) to maintain contrast with square telemetry readouts.
- **Micro-indicators:** Perfect circles (`rounded-full`) for live blinking status beacons and sensor integrity dots.

## Components

### 1. Primary & Secondary Buttons
- **Primary (Action/Export):** Height 40px, `rounded-lg`, background `#0284C7`, text `#FFFFFF`, font `Inter` 14px weight 500. Subtle inset highlight `inset 0 1px 0 rgba(255, 255, 255, 0.2)`. Hover: `#0369A1`.
- **Secondary / Glass Surface:** Background `rgba(255, 255, 255, 0.7)`, border `1px solid rgba(203, 213, 225, 0.8)`, text `#0F172A`. Hover: `rgba(241, 245, 249, 0.9)`.
- **GenAI Prompt Action:** Gradient blend from `#0284C7` to `#059669`, with animated shimmering border on inference computation.

### 2. Telemetry Cards & AQI Panels
- **Structure:** `rounded-2xl`, background `rgba(255, 255, 255, 0.75)`, backdrop blur 20px, border `1px solid rgba(226, 232, 240, 0.8)`. Padding `space-lg`.
- **Header Slot:** Metric label (`label-mono`, `#64748B`), paired with an upper-right micro-pill containing real-time variance (`+2.4%` in `JetBrains Mono`).
- **Body Slot:** Massive tabular value (`telemetry-lg`) anchored alongside unit superscript (e.g., `µg/m³`).

### 3. Micro-Badges & Severity Chips
- Height 24px, pill-shaped (`rounded-full`), horizontal padding 8px.
- **Good (AQI 0–50):** Background `#ECFDF5`, text `#059669`, border `1px solid rgba(5, 150, 105, 0.2)`. Leading 6px circular pulse dot.
- **Severe Hazard (AQI 200+):** Background `#FEF2F2`, text `#DC2626`, border `1px solid rgba(220, 38, 38, 0.25)`.

### 4. Input Fields & Search Bars
- Translucent input background `rgba(255, 255, 255, 0.8)`, height 44px, `rounded-lg`, border `1px solid rgba(203, 213, 225, 0.8)`. Text `Inter` 14px `#0F172A`.
- Focus State: Border color `#0284C7`, ring `3px rgba(2, 132, 199, 0.15)`.

### 5. Checkboxes, Radios, & Toggles
- **Toggles (Sensor Filters):** Width 44px, height 24px, track background `#E2E8F0`, thumb 20px pure white. Active state track `#0284C7`. Smooth spring transition (200ms cubic-bezier).
- **Checkboxes:** 18px × 18px, `rounded-md`, border `1.5px solid #CBD5E1`. Checked state: background `#0284C7` with white crisp checkmark icon.

### 6. GenAI Atmospheric Assistant Floating Bar
- Docked or floating bottom-center input interface: `rounded-2xl`, height 56px, background `rgba(255, 255, 255, 0.85)` with 30px backdrop blur, soft diffuse shadow `0 20px 40px -10px rgba(15, 23, 42, 0.08)`.
- Left-aligned model readiness indicator dot (`#10B981`), middle natural language query input, right-aligned micro-action key pill (`⌘K` in `JetBrains Mono`).