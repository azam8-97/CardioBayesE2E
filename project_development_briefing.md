# CardioBayes-E2E — Complete Product Development Briefing
### Version 1.0 | Academic Research Product | 2025

---

> **Document Purpose:** This briefing is the single source of truth for the design, architecture, and development of the CardioBayes-E2E web product. Every decision — from pixel values to database schemas — is documented here. No assumption should be made that is not covered in this document.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design System](#2-design-system)
3. [Typography](#3-typography)
4. [Color System](#4-color-system)
5. [Animation & Motion System](#5-animation--motion-system)
6. [Component Library](#6-component-library)
7. [Repository Structure](#7-repository-structure)
8. [Technology Stack](#8-technology-stack)
9. [Database Schema](#9-database-schema)
10. [Authentication & Role System](#10-authentication--role-system)
11. [API Architecture](#11-api-architecture)
12. [HuggingFace Inference Service](#12-huggingface-inference-service)
13. [Page-by-Page Development Plan](#13-page-by-page-development-plan)
14. [Development Approach](#14-development-approach)
15. [Deployment Configuration](#15-deployment-configuration)
16. [Testing Strategy](#16-testing-strategy)
17. [Cold Start & Performance Strategy](#17-cold-start--performance-strategy)
18. [Research Data Collection Strategy](#18-research-data-collection-strategy)
19. [Timeline](#19-timeline)

---

## 1. Project Overview

### 1.1 Product Identity

| Field | Value |
|---|---|
| Product Name | CardioBayes-E2E |
| Tagline | *Uncertainty-Aware Cardiac Signal Intelligence* |
| Type | Functional AI Inference Tool + Research Data Collector |
| Domain | cardiobayese2e.vercel.app (or custom domain if acquired) |
| Target Users | Researchers, Cardiologists, Medical AI Practitioners, Academic Reviewers |
| Primary Purpose | ECG → EGM reconstruction with Bayesian uncertainty quantification |

### 1.2 Core Value Proposition

CardioBayes-E2E converts non-invasive 3-lead surface ECG signals into probabilistic intracardiac EGM predictions with calibrated uncertainty estimates. It is the first publicly accessible multi-architecture Bayesian benchmark tool for ECG-to-EGM reconstruction.

### 1.3 Medical Disclaimer (Legal)

Every page must display the following disclaimer, non-negotiably:

> *"CardioBayes-E2E is an academic research tool. Outputs are probabilistic predictions and must not be used as the sole basis for clinical decisions. Always consult a qualified cardiologist or electrophysiologist for medical diagnosis and treatment. Do not upload identifiable patient data."*

### 1.4 Supported Models

| Model | Label | Badge |
|---|---|---|
| BayesianBiLSTM | Best Overall | ⭐ Recommended |
| BayesianTransformer | Best Calibration | 🎯 Most Reliable Uncertainty |
| BayesianTCN | Most Efficient | ⚡ Fastest |
| BayesianWaveNet | Best Val Loss | 📉 Lowest Validation Loss |
| BayesianCNN | Best RMSE | 📊 Best Error Rate |
| BaselineCNN | Deterministic Baseline | 🔲 No Uncertainty |

### 1.5 Accepted Input Formats

| Format | Extension | Notes |
|---|---|---|
| Comma Separated Values | `.csv` | Template provided for download |
| MATLAB Data | `.mat` | MATLAB v5 compatible |
| European Data Format | `.edf` | Clinical EDF standard |

All inputs are resampled to 1000 Hz internally. Required leads: I, II, V1.

---

## 2. Design System

### 2.1 Design Philosophy

**Aesthetic Direction: Clinical Futurism**

The design should feel like a next-generation medical intelligence platform — precise, trustworthy, and technically impressive. It borrows from:
- The sterile precision of medical hardware interfaces
- The data-density of financial terminals
- The depth and atmosphere of modern SaaS dashboards

This is NOT a minimal white website. It is a dark-dominant, blue-accented, data-rich interface with deliberate motion and depth. Every screen should communicate that something intelligent and scientific is happening.

**Key Design Principles:**
- **Trust through precision** — every element is exactly placed, nothing feels accidental
- **Data as decoration** — waveforms, grids, and signal patterns are both functional and beautiful
- **Confident darkness** — dark backgrounds make signal visualizations pop and feel clinical
- **Blue as authority** — medical blue conveys competence and calm

### 2.2 Spacing System

Based on a **4px base unit**:

| Token | Value | Usage |
|---|---|---|
| space-1 | 4px | Micro gaps, icon padding |
| space-2 | 8px | Tight component spacing |
| space-3 | 12px | Small internal padding |
| space-4 | 16px | Standard padding |
| space-5 | 20px | Medium spacing |
| space-6 | 24px | Card padding |
| space-8 | 32px | Section internal spacing |
| space-10 | 40px | Large component gaps |
| space-12 | 48px | Section separation |
| space-16 | 64px | Major section breaks |
| space-20 | 80px | Hero spacing |
| space-24 | 96px | Page-level breathing room |

### 2.3 Border Radius System

| Token | Value | Usage |
|---|---|---|
| radius-sm | 4px | Badges, tags, small chips |
| radius-md | 8px | Buttons, inputs, small cards |
| radius-lg | 12px | Standard cards, panels |
| radius-xl | 16px | Large cards, modals |
| radius-2xl | 24px | Feature cards, hero elements |
| radius-full | 9999px | Pills, avatars, toggles |

### 2.4 Elevation & Shadow System

```css
--shadow-glow-blue: 0 0 20px rgba(59, 130, 246, 0.3);
--shadow-glow-blue-intense: 0 0 40px rgba(59, 130, 246, 0.5);
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
--shadow-card-hover: 0 8px 40px rgba(0, 0, 0, 0.6);
--shadow-modal: 0 24px 80px rgba(0, 0, 0, 0.8);
--shadow-inner: inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

### 2.5 Breakpoints

| Name | Min Width | Target Device |
|---|---|---|
| xs | 320px | Small mobile |
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Small desktop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large desktop |

---

## 3. Typography

### 3.1 Font Families

**Display Font: `Syne`** (Google Fonts)
- Used for: Hero headings, section titles, feature headlines
- Why: Geometric, technical, futuristic — communicates precision without coldness
- Weight variants: 400, 600, 700, 800

**Body Font: `DM Sans`** (Google Fonts)
- Used for: Body text, descriptions, labels, UI text
- Why: Highly legible, neutral, professional — excellent for data-heavy interfaces
- Weight variants: 300, 400, 500, 600

**Monospace Font: `JetBrains Mono`** (Google Fonts)
- Used for: Metric values, correlation scores, confidence numbers, code snippets
- Why: Medical/scientific numbers need monospace for alignment and precision feel
- Weight variants: 400, 500, 600

### 3.2 Type Scale

| Token | Size | Line Height | Letter Spacing | Font | Weight | Usage |
|---|---|---|---|---|---|---|
| text-hero | 72px | 1.05 | -0.03em | Syne | 800 | Hero headline |
| text-hero-md | 56px | 1.08 | -0.02em | Syne | 800 | Responsive hero |
| text-hero-sm | 40px | 1.1 | -0.01em | Syne | 700 | Mobile hero |
| text-h1 | 48px | 1.1 | -0.02em | Syne | 700 | Page titles |
| text-h2 | 36px | 1.15 | -0.01em | Syne | 700 | Section headings |
| text-h3 | 28px | 1.2 | -0.01em | Syne | 600 | Subsection headings |
| text-h4 | 22px | 1.3 | 0em | Syne | 600 | Card titles |
| text-h5 | 18px | 1.4 | 0em | DM Sans | 600 | Component labels |
| text-h6 | 16px | 1.4 | 0em | DM Sans | 600 | Minor headings |
| text-body-lg | 18px | 1.7 | 0em | DM Sans | 400 | Hero body text |
| text-body | 16px | 1.65 | 0em | DM Sans | 400 | Standard body |
| text-body-sm | 14px | 1.6 | 0em | DM Sans | 400 | Secondary text |
| text-caption | 12px | 1.5 | 0.02em | DM Sans | 400 | Captions, metadata |
| text-label | 11px | 1.4 | 0.08em | DM Sans | 500 | Form labels (uppercase) |
| text-metric | 40px | 1.0 | -0.02em | JetBrains Mono | 600 | Large stat numbers |
| text-metric-sm | 24px | 1.1 | -0.01em | JetBrains Mono | 500 | Small stat numbers |
| text-code | 14px | 1.6 | 0em | JetBrains Mono | 400 | Code, file names |

### 3.3 Font Loading (index.html)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 4. Color System

### 4.1 Full Color Palette (CSS Variables)

```css
:root {
  /* === BACKGROUNDS === */
  --bg-base:        #050810;  /* Deepest background — page root */
  --bg-surface:     #0A0F1E;  /* Card backgrounds, panels */
  --bg-elevated:    #0F1629;  /* Elevated cards, modals */
  --bg-overlay:     #141D35;  /* Hover states, dropdowns */
  --bg-subtle:      #1A2540;  /* Subtle highlights, table rows */

  /* === BLUE PRIMARIES (Brand + Action) === */
  --blue-950:       #0A0F2E;
  --blue-900:       #0D1545;
  --blue-800:       #1A2A6B;
  --blue-700:       #1E3A8A;  /* Dark action states */
  --blue-600:       #1D4ED8;  /* Standard action */
  --blue-500:       #3B82F6;  /* Primary brand blue */
  --blue-400:       #60A5FA;  /* Hover states, secondary actions */
  --blue-300:       #93C5FD;  /* Accent text, icons on dark */
  --blue-200:       #BFDBFE;  /* Light accent */
  --blue-100:       #DBEAFE;  /* Very subtle backgrounds */

  /* === CYAN ACCENTS (Signal / Medical Data) === */
  --cyan-500:       #06B6D4;  /* EGM waveform color */
  --cyan-400:       #22D3EE;  /* Active signal highlights */
  --cyan-300:       #67E8F9;  /* Uncertainty band borders */
  --cyan-200:       #A5F3FC;  /* Subtle signal tints */

  /* === SEMANTIC COLORS === */
  /* Success */
  --green-500:      #22C55E;
  --green-400:      #4ADE80;
  --green-100:      #DCFCE7;

  /* Warning */
  --amber-500:      #F59E0B;
  --amber-400:      #FCD34D;
  --amber-100:      #FEF3C7;

  /* Error */
  --red-500:        #EF4444;
  --red-400:        #F87171;
  --red-100:        #FEE2E2;

  /* Info */
  --indigo-500:     #6366F1;
  --indigo-400:     #818CF8;

  /* === CONFIDENCE LEVELS === */
  --confidence-high:    #22C55E;   /* Green */
  --confidence-medium:  #F59E0B;   /* Amber */
  --confidence-low:     #EF4444;   /* Red */

  /* === TEXT === */
  --text-primary:    #F0F4FF;   /* Main headings, important text */
  --text-secondary:  #94A3B8;   /* Body text, descriptions */
  --text-tertiary:   #475569;   /* Placeholders, disabled */
  --text-accent:     #60A5FA;   /* Blue accent text, links */
  --text-inverse:    #050810;   /* Text on light backgrounds */

  /* === BORDERS === */
  --border-subtle:   rgba(148, 163, 184, 0.08);  /* Barely visible */
  --border-default:  rgba(148, 163, 184, 0.15);  /* Standard cards */
  --border-strong:   rgba(148, 163, 184, 0.25);  /* Active, focused */
  --border-blue:     rgba(59, 130, 246, 0.4);    /* Blue highlight borders */
  --border-blue-glow: rgba(59, 130, 246, 0.6);   /* Glowing blue borders */

  /* === WAVEFORM COLORS === */
  --wave-ecg-lead1:  #60A5FA;   /* ECG Lead I — Blue */
  --wave-ecg-lead2:  #34D399;   /* ECG Lead II — Green */
  --wave-ecg-v1:     #A78BFA;   /* ECG V1 — Purple */
  --wave-egm-cs12:   #22D3EE;   /* CS12 — Cyan */
  --wave-egm-cs34:   #60A5FA;   /* CS34 — Blue */
  --wave-egm-cs56:   #34D399;   /* CS56 — Green (best channel) */
  --wave-egm-cs78:   #F59E0B;   /* CS78 — Amber */
  --wave-egm-cs90:   #A78BFA;   /* CS90 — Purple */
  --wave-uncertainty: rgba(59, 130, 246, 0.15); /* Uncertainty band fill */

  /* === GRADIENTS === */
  --gradient-hero: linear-gradient(135deg, #050810 0%, #0D1545 50%, #050810 100%);
  --gradient-card: linear-gradient(145deg, #0F1629 0%, #0A0F1E 100%);
  --gradient-blue: linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%);
  --gradient-signal: linear-gradient(90deg, #06B6D4 0%, #3B82F6 50%, #6366F1 100%);
  --gradient-glow: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
}
```

### 4.2 Color Usage Rules

| Element | Color Token |
|---|---|
| Page background | `--bg-base` |
| Navigation bar | `--bg-surface` with `--border-subtle` bottom border |
| Cards | `--bg-elevated` with `--border-default` |
| Primary button | `--gradient-blue` background, `--text-primary` text |
| Secondary button | transparent, `--border-blue` border, `--text-accent` text |
| Destructive button | `--red-500` background |
| Input fields | `--bg-surface` background, `--border-default` border |
| Input focus | `--border-blue-glow` border, `--shadow-glow-blue` shadow |
| Active nav item | `--blue-500` text, `--blue-900` background pill |
| Table header | `--bg-subtle` background |
| Table row hover | `--bg-overlay` |
| Badges — info | `--blue-900` background, `--blue-300` text |
| Badges — success | `--green-100/10` background, `--green-400` text |
| Badges — warning | `--amber-100/10` background, `--amber-400` text |
| Badges — error | `--red-100/10` background, `--red-400` text |
| Disclaimer bar | `--amber-500/10` background, `--amber-400` border-left |
| Scrollbar track | `--bg-surface` |
| Scrollbar thumb | `--blue-800` |
| ECG waveform | See `--wave-ecg-*` tokens |
| EGM waveform | See `--wave-egm-*` tokens |
| Uncertainty band | `--wave-uncertainty` fill |

---

## 5. Animation & Motion System

### 5.1 Duration Tokens

```css
--duration-instant:  50ms;
--duration-fast:     150ms;
--duration-normal:   250ms;
--duration-slow:     400ms;
--duration-slower:   600ms;
--duration-dramatic: 1000ms;
--duration-hero:     1400ms;
```

### 5.2 Easing Tokens

```css
--ease-standard:  cubic-bezier(0.4, 0, 0.2, 1);   /* Material standard */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);     /* Elements entering */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);     /* Elements leaving */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy, playful */
--ease-smooth:    cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth, refined */
```

### 5.3 Core Animations (Defined in globals.css)

```css
/* Fade up — primary entrance animation */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Fade in — simple entrance */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Scale in — for modals, dropdowns */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* Slide in right — for drawers, panels */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Pulse glow — for active states, loading indicators */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50%       { box-shadow: 0 0 40px rgba(59, 130, 246, 0.7); }
}

/* Signal scan — horizontal line moving across waveform */
@keyframes signalScan {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100vw); }
}

/* Waveform draw — SVG path animation */
@keyframes drawPath {
  from { stroke-dashoffset: 1000; }
  to   { stroke-dashoffset: 0; }
}

/* Number count up — for metric reveals */
@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Shimmer — for skeleton loading states */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}

/* Rotating spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Heartbeat pulse — for logo / status indicators */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.08); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.05); }
  70%       { transform: scale(1); }
}
```

### 5.4 Animation Usage Rules Per Element

| Element | Animation | Duration | Delay Rule |
|---|---|---|---|
| Page mount | `fadeIn` | 400ms | 0ms |
| Hero headline | `fadeUp` | 700ms | 100ms |
| Hero subtext | `fadeUp` | 700ms | 250ms |
| Hero CTA buttons | `fadeUp` | 700ms | 400ms |
| Section headings | `fadeUp` on scroll | 600ms | 0ms |
| Feature cards | `fadeUp` staggered | 500ms | 100ms per card |
| Stat numbers | `countUp` on scroll | 800ms | 150ms per stat |
| Modals open | `scaleIn` | 250ms | 0ms |
| Modals close | `fadeIn` reverse | 200ms | 0ms |
| Dropdowns | `scaleIn` | 150ms | 0ms |
| Toast notifications | `slideInRight` | 300ms | 0ms |
| ECG waveform draw | `drawPath` | 1400ms | 200ms |
| Inference progress steps | `fadeUp` | 300ms | Sequential |
| Card hover | transform translateY(-4px) | 250ms | 0ms |
| Button hover | brightness(1.1) + scale(1.02) | 150ms | 0ms |
| Logo | `heartbeat` | 1.5s | Infinite loop |
| Active status dot | `pulseGlow` | 2s | Infinite loop |
| Loading skeleton | `shimmer` | 1.5s | Infinite loop |

### 5.5 Framer Motion Usage (React)

Use `framer-motion` for:
- Page transitions (AnimatePresence)
- Scroll-triggered reveals (useInView + motion.div)
- Stagger children animations (variants + staggerChildren)
- Gesture-based interactions (drag, hover, tap)

```typescript
// Standard page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.25 } }
}

// Standard stagger container
const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } }
}

// Standard card item
const itemVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
}
```

### 5.6 Background Effects

**Hero Section:**
- Animated radial gradient mesh: 3 overlapping radial gradients with slow drift animation (20s loop)
- Subtle grid pattern overlay: 1px lines at 60px intervals, 4% opacity
- Floating particle system: 20-30 small dots (2-4px) drifting upward, blue tinted, very low opacity
- Horizontal scan line: 1px line sweeping top to bottom every 8 seconds, 8% opacity

**All Sections:**
- Subtle noise texture overlay (SVG feTurbulence): 3% opacity
- No pure black or pure white backgrounds anywhere

---

## 6. Component Library

### 6.1 Button Variants

```
Primary    → gradient-blue bg, white text, 44px height, 16px h-padding, radius-md
Secondary  → transparent, blue border, blue text, same sizing
Danger     → red-500 bg, white text
Ghost      → transparent, no border, secondary text
Icon       → 40x40px, radius-md, ghost style
Loading    → Primary style + spinning indicator + disabled state
```

**Hover states:** All buttons scale to 1.02, brighten 10%, transition 150ms
**Active states:** Scale to 0.98, darken 5%
**Disabled:** 50% opacity, cursor-not-allowed, no transform

### 6.2 Input Variants

```
Default    → surface bg, default border, body text, 44px height, 16px padding
Focus      → blue-glow border, glow shadow
Error      → red border, red helper text below
Success    → green border
Disabled   → 50% opacity, cursor-not-allowed
With icon  → 16px left padding + icon, 44px left offset for input text
```

### 6.3 Card Variants

```
Default    → elevated bg, default border, lg radius, card shadow
Interactive → + hover: translateY(-4px), stronger shadow, blue border tint
Highlighted → blue-glow border, gradient-glow background overlay
Metric     → elevated bg, monospace numbers, prominent label
```

### 6.4 Badge Variants

```
Info     → blue-900 bg, blue-300 text, sm radius, 6px v-padding, 10px h-padding
Success  → green tinted bg, green-400 text
Warning  → amber tinted bg, amber-400 text
Error    → red tinted bg, red-400 text
Model tag → gradient-blue, white text, with icon
```

### 6.5 Navigation Component

```
Height:         64px
Background:     bg-surface with blur (backdrop-filter: blur(20px))
Border bottom:  border-subtle
Position:       fixed top, full width, z-index 1000

Left:   Logo (heartbeat animation) + "CardioBayes" wordmark
Center: Nav links (hidden on mobile, hamburger menu)
Right:  Auth buttons OR user avatar + dropdown
```

Nav links: Landing, Demo, Models, Research, Documentation
Active: blue-500 text, blue-900 pill background, 8px v-padding, 16px h-padding, radius-full

### 6.6 Waveform Visualizer (D3.js Component)

This is the centerpiece component used on the inference results page.

```
Container:    Full width, 200px height per channel
Background:   bg-surface, subtle grid (10% opacity)
X-axis:       Time in milliseconds, JetBrains Mono font, 11px
Y-axis:       Amplitude (normalized), JetBrains Mono font, 11px
Grid lines:   1px, 8% opacity, both axes

Ground truth line:  2px, channel color, full opacity
Predicted mean:     2px dashed, channel color, 80% opacity
Uncertainty band:   Filled area between mean ± 2σ, 15% opacity
Scan crosshair:     Vertical line on hover, 1px, 40% opacity

Interactions:
  - Hover → show tooltip with time, amplitude, uncertainty value
  - Scroll → zoom in/out on time axis
  - Click+drag → pan across signal

Channels displayed: CS12, CS34, CS56, CS78, CS90 (stacked vertically)
ECG inputs shown:   Lead I, Lead II, V1 (above EGM channels)
```

### 6.7 Progress Stepper (Inference Steps)

```
Layout:     Vertical list of steps, left-aligned
States:     waiting → active (animated) → complete → error
Step circle: 32px, outline when waiting, filled gradient when active, checkmark when complete
Connector:  2px line between steps, fills blue as steps complete
Text:       Step title (16px DM Sans 500) + substep description (14px secondary)
Animation:  Each step fades in when activated
```

### 6.8 Confidence Score Widget

```
Shape:      Circular gauge, 120px diameter
Track:      4px stroke, subtle color
Fill:       Animated stroke-dashoffset, color by confidence level
Center:     Percentage value (JetBrains Mono 600 24px)
Below:      "High / Medium / Low" label with color badge
Animation:  Fills from 0% on mount, 1s ease-out
```

### 6.9 Toast Notification System

```
Position:   Bottom-right, 24px from edges
Width:      360px max
Stack:      Up to 3 visible, older ones compress
Duration:   5s auto-dismiss (error: manual dismiss)
Animation:  slideInRight on enter, fadeOut on exit

Variants:
  Success → green-500 left border, checkmark icon
  Error   → red-500 left border, X icon
  Warning → amber-500 left border, warning icon
  Info    → blue-500 left border, info icon
```

---

## 7. Repository Structure

```
cardiobayese2e/
├── frontend/                          # React + TypeScript + Vite
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── ecg-template.csv          # Downloadable input template
│   ├── src/
│   │   ├── assets/
│   │   │   ├── fonts/                # Local font fallbacks
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── ui/                   # Base design system components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   └── Dropdown.tsx
│   │   │   ├── layout/               # Page structure components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── PageWrapper.tsx
│   │   │   │   └── Sidebar.tsx       # Admin sidebar
│   │   │   ├── charts/               # D3.js visualization components
│   │   │   │   ├── WaveformViewer.tsx
│   │   │   │   ├── UncertaintyBand.tsx
│   │   │   │   ├── ConfidenceGauge.tsx
│   │   │   │   ├── ReliabilityDiagram.tsx
│   │   │   │   ├── RadarChart.tsx
│   │   │   │   └── MetricBarChart.tsx
│   │   │   ├── inference/            # Inference flow components
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── ModelSelector.tsx
│   │   │   │   ├── ProgressStepper.tsx
│   │   │   │   ├── ResultsPanel.tsx
│   │   │   │   ├── ChannelResults.tsx
│   │   │   │   ├── ExportButton.tsx
│   │   │   │   └── DisclaimerBanner.tsx
│   │   │   ├── auth/                 # Auth components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── admin/                # Admin components
│   │   │       ├── UserTable.tsx
│   │   │       ├── JobsTable.tsx
│   │   │       ├── ModelAnalyticsCard.tsx
│   │   │       ├── RoleManager.tsx
│   │   │       └── StatsOverview.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Inference.tsx
│   │   │   ├── Results.tsx
│   │   │   ├── Models.tsx
│   │   │   ├── Research.tsx
│   │   │   ├── Documentation.tsx
│   │   │   ├── Dashboard.tsx         # User's own history
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── AdminOverview.tsx
│   │   │   │   ├── AdminUsers.tsx
│   │   │   │   ├── AdminJobs.tsx
│   │   │   │   ├── AdminModels.tsx
│   │   │   │   └── AdminRoles.tsx
│   │   │   └── NotFound.tsx
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useInference.ts
│   │   │   ├── useJobPolling.ts
│   │   │   ├── useWaveform.ts
│   │   │   └── useToast.ts
│   │   ├── stores/                   # Zustand state stores
│   │   │   ├── authStore.ts
│   │   │   ├── inferenceStore.ts
│   │   │   └── uiStore.ts
│   │   ├── services/                 # API call layer
│   │   │   ├── api.ts                # Axios instance + interceptors
│   │   │   ├── authService.ts
│   │   │   ├── inferenceService.ts
│   │   │   ├── resultsService.ts
│   │   │   └── adminService.ts
│   │   ├── utils/
│   │   │   ├── waveformUtils.ts      # Signal processing helpers
│   │   │   ├── exportUtils.ts        # PDF/CSV generation
│   │   │   ├── formatters.ts         # Number, date formatters
│   │   │   └── validators.ts         # File format validators
│   │   ├── types/
│   │   │   ├── inference.types.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── admin.types.ts
│   │   │   └── waveform.types.ts
│   │   ├── constants/
│   │   │   ├── models.ts             # Model metadata, labels, badges
│   │   │   ├── channels.ts           # EGM channel configs
│   │   │   └── routes.ts             # Route path constants
│   │   ├── styles/
│   │   │   ├── globals.css           # CSS variables, keyframes, resets
│   │   │   └── tailwind.css          # Tailwind directives
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # FastAPI + Python
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── inference.py
│   │   │   │   │   ├── results.py
│   │   │   │   │   ├── jobs.py
│   │   │   │   │   └── admin.py
│   │   │   │   └── __init__.py
│   │   │   └── deps.py               # Shared dependencies, auth guards
│   │   ├── core/
│   │   │   ├── config.py             # Environment variables, settings
│   │   │   ├── security.py           # JWT, role verification
│   │   │   └── logging.py
│   │   ├── models/                   # Pydantic request/response schemas
│   │   │   ├── inference.py
│   │   │   ├── auth.py
│   │   │   ├── results.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── inference_service.py  # HuggingFace call handler
│   │   │   ├── preprocessing.py      # ECG validation + preprocessing
│   │   │   ├── storage_service.py    # Supabase storage operations
│   │   │   ├── db_service.py         # Supabase DB operations
│   │   │   └── export_service.py     # PDF/CSV generation
│   │   ├── utils/
│   │   │   ├── signal_utils.py       # Signal processing utilities
│   │   │   ├── file_parsers.py       # .csv, .mat, .edf parsers
│   │   │   └── compression.py        # gzip waveform compression
│   │   └── main.py                   # FastAPI app entry point
│   ├── tests/
│   │   ├── test_preprocessing.py
│   │   ├── test_inference.py
│   │   ├── test_auth.py
│   │   └── test_admin.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── inference_service/                 # HuggingFace Space
│   ├── models/
│   │   ├── baseline_cnn.pth
│   │   ├── bayesian_cnn.pth
│   │   ├── bayesian_bilstm.pth
│   │   ├── bayesian_tcn.pth
│   │   ├── bayesian_transformer.pth
│   │   └── bayesian_wavenet.pth
│   ├── architectures/
│   │   ├── baseline_cnn.py
│   │   ├── bayesian_cnn.py
│   │   ├── bayesian_bilstm.py
│   │   ├── bayesian_tcn.py
│   │   ├── bayesian_transformer.py
│   │   └── bayesian_wavenet.py
│   ├── inference/
│   │   ├── mc_dropout.py             # MC-Dropout N=20 inference
│   │   ├── uncertainty.py            # ECE, PICP, NLL computation
│   │   └── postprocessing.py         # Result formatting
│   ├── app.py                        # FastAPI app for HuggingFace Space
│   └── requirements.txt
│
└── docs/
    ├── api-reference.md
    ├── input-format-guide.md
    └── model-comparison.md
```

---

## 8. Technology Stack

### 8.1 Frontend

| Package | Version | Purpose |
|---|---|---|
| react | ^18.3 | UI library |
| react-dom | ^18.3 | DOM rendering |
| typescript | ^5.4 | Type safety |
| vite | ^5.2 | Build tool |
| react-router-dom | ^6.23 | Client-side routing |
| framer-motion | ^11.2 | Animations |
| tailwindcss | ^3.4 | Utility CSS |
| zustand | ^4.5 | State management |
| axios | ^1.7 | HTTP client |
| d3 | ^7.9 | Waveform visualization |
| @supabase/supabase-js | ^2.43 | Supabase auth client |
| react-hook-form | ^7.51 | Form management |
| zod | ^3.23 | Schema validation |
| jspdf | ^2.5 | PDF export |
| papaparse | ^5.4 | CSV parsing/export |
| react-dropzone | ^14.2 | File upload UI |
| recharts | ^2.12 | Admin dashboard charts |
| lucide-react | ^0.383 | Icon library |
| clsx | ^2.1 | Conditional classnames |

### 8.2 Backend

| Package | Purpose |
|---|---|
| fastapi | API framework |
| uvicorn | ASGI server |
| pydantic | Data validation |
| supabase | Supabase client |
| python-jose | JWT handling |
| httpx | Async HTTP client (HuggingFace calls) |
| wfdb | PhysioNet file reading |
| scipy | Signal processing, .mat reading |
| pyedflib | .edf file reading |
| numpy | Array operations |
| python-multipart | File upload handling |
| gzip | Waveform compression |
| reportlab | PDF generation |
| python-dotenv | Environment config |

### 8.3 Inference Service (HuggingFace)

| Package | Purpose |
|---|---|
| fastapi | Inference API |
| torch | PyTorch inference |
| numpy | Array operations |
| scipy | Signal utilities |

---

## 9. Database Schema

### 9.1 Supabase PostgreSQL Tables

```sql
-- ============================================
-- USERS & ROLES
-- ============================================

CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin', 'superadmin')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT TRUE
);

CREATE TABLE role_change_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_at      TIMESTAMPTZ DEFAULT NOW(),
  target_user_id  UUID REFERENCES user_profiles(id),
  changed_by_id   UUID REFERENCES user_profiles(id),
  old_role        TEXT,
  new_role        TEXT,
  reason          TEXT
);

-- ============================================
-- INFERENCE JOBS
-- ============================================

CREATE TABLE inference_jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,

  -- User tracking
  user_id               UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  session_id            TEXT,              -- anonymous session fallback
  user_agent            TEXT,
  country               TEXT,

  -- Input metadata
  input_file_format     TEXT NOT NULL,     -- 'csv', 'mat', 'edf'
  input_filename        TEXT,              -- original filename
  input_sampling_rate   INT,               -- detected Hz
  input_duration_ms     FLOAT,
  input_leads           TEXT[],            -- ['I','II','V1']
  input_segment_count   INT,
  was_resampled         BOOLEAN DEFAULT FALSE,
  preprocessing_notes   TEXT,              -- any anomalies detected

  -- Model configuration
  architecture          TEXT NOT NULL,
  mc_passes             INT DEFAULT 20,

  -- Job lifecycle
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','preprocessing',
                                         'inferring','complete','failed')),
  processing_time_ms    FLOAT,
  error_message         TEXT,
  error_code            TEXT,

  -- Research metadata
  is_marked_synthetic   BOOLEAN DEFAULT FALSE,
  user_feedback_rating  INT CHECK (user_feedback_rating BETWEEN 1 AND 5),
  user_feedback_text    TEXT
);

-- ============================================
-- INFERENCE RESULTS (per channel)
-- ============================================

CREATE TABLE inference_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                UUID REFERENCES inference_jobs(id) ON DELETE CASCADE,
  channel               TEXT NOT NULL,    -- 'CS12','CS34','CS56','CS78','CS90'

  -- Reconstruction metrics
  pcc                   FLOAT,
  rmse                  FLOAT,
  mae                   FLOAT,
  r_squared             FLOAT,
  snr_db                FLOAT,
  spectral_coherence    FLOAT,

  -- Uncertainty metrics
  confidence_level      TEXT CHECK (confidence_level IN ('High','Medium','Low')),
  mean_uncertainty      FLOAT,
  ece                   FLOAT,
  picp_95               FLOAT,
  mpiw                  FLOAT,
  nll                   FLOAT,
  sharpness             FLOAT,

  -- Waveform blob location
  waveform_storage_path TEXT,             -- path in Supabase Storage

  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODEL ANALYTICS (snapshot, updated post-job)
-- ============================================

CREATE TABLE model_analytics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at           TIMESTAMPTZ DEFAULT NOW(),
  architecture          TEXT NOT NULL,
  total_jobs            INT DEFAULT 0,
  successful_jobs       INT DEFAULT 0,
  failed_jobs           INT DEFAULT 0,
  avg_pcc               FLOAT,
  avg_rmse              FLOAT,
  avg_uncertainty       FLOAT,
  avg_processing_ms     FLOAT,
  avg_user_rating       FLOAT,
  most_used_channel     TEXT
);

-- ============================================
-- SYSTEM EVENTS LOG
-- ============================================

CREATE TABLE system_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at   TIMESTAMPTZ DEFAULT NOW(),
  event_type    TEXT,      -- 'cold_start', 'model_load', 'error', etc.
  severity      TEXT CHECK (severity IN ('info','warning','error')),
  message       TEXT,
  metadata      JSONB
);
```

### 9.2 Supabase Storage Bucket Structure

```
Bucket: waveforms (private, authenticated access only)

waveforms/
  {job_id}/
    ecg_input.npy.gz          # Compressed 3-lead ECG input
    CS12_result.npy.gz        # mean + sigma arrays for CS12
    CS34_result.npy.gz
    CS56_result.npy.gz
    CS78_result.npy.gz
    CS90_result.npy.gz
    summary.json              # Lightweight job summary
```

Each `.npy.gz` structure:
```json
{
  "mean": [1000 floats],
  "sigma": [1000 floats],
  "timestamps_ms": [1000 floats]
}
```
Size per file: ~15-25KB compressed | Total per job: ~100-150KB

### 9.3 Row Level Security (RLS) Policies

```sql
-- Users can only read their own jobs
CREATE POLICY "users_own_jobs" ON inference_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only read their own results
CREATE POLICY "users_own_results" ON inference_results
  FOR SELECT USING (
    job_id IN (SELECT id FROM inference_jobs WHERE user_id = auth.uid())
  );

-- Admins and superadmins can read everything
CREATE POLICY "admin_full_read" ON inference_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Only superadmin can change roles
CREATE POLICY "superadmin_role_management" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );
```

---

## 10. Authentication & Role System

### 10.1 Role Definitions

| Role | Permissions |
|---|---|
| **user** | Run inference, view own jobs/results, download own results |
| **admin** | All user permissions + view all jobs, all results, all analytics, all users |
| **superadmin** | All admin permissions + manage user roles, create admins, view role change logs, access system events |

### 10.2 Auth Flow

```
Registration:
1. User submits email + password + full name
2. Supabase Auth creates auth.users record
3. FastAPI trigger creates user_profiles row with role='user'
4. Email verification sent
5. On verify → user redirected to dashboard

Login:
1. Supabase Auth validates credentials
2. Returns JWT access token + refresh token
3. Token stored in memory (NOT localStorage — security)
4. Axios interceptor attaches token to all requests
5. On 401 → refresh token flow → if fails → logout

Role Protection:
- Frontend: ProtectedRoute component checks role from authStore
- Backend: Dependency injection (get_current_user, require_admin, require_superadmin)
- Both checks always run — never trust frontend alone
```

### 10.3 Superadmin Setup

On first deployment, run the seed script:
```sql
-- After registering the superadmin account normally,
-- manually set role via Supabase dashboard SQL editor:
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'your-email@domain.com';
```

### 10.4 JWT Configuration

```
Access token expiry:  15 minutes
Refresh token expiry: 7 days
Storage method:       In-memory (authStore), refresh token in httpOnly cookie
```

---

## 11. API Architecture

### 11.1 Base Configuration

```
Base URL (Production):   https://cardiobayese2e-api.onrender.com/api/v1
Base URL (Development):  http://localhost:8000/api/v1

Content-Type:  application/json (except file upload: multipart/form-data)
Auth header:   Authorization: Bearer {jwt_token}
```

### 11.2 Complete Endpoint Reference

**Authentication**
```
POST   /auth/register          Register new user
POST   /auth/login             Login, returns tokens
POST   /auth/logout            Invalidate session
POST   /auth/refresh           Refresh access token
GET    /auth/me                Get current user profile
PATCH  /auth/profile           Update name/preferences
```

**Inference**
```
POST   /inference/upload       Upload ECG file, validate format
                               Body: multipart/form-data
                               Fields: file (ECG), architecture (string)
                               Returns: { job_id, status, preprocessing_info }

GET    /inference/status/{id}  Poll job status
                               Returns: { status, progress_step, message }

GET    /inference/result/{id}  Fetch completed result
                               Returns: Full result with waveform URLs

POST   /inference/feedback/{id} Submit user feedback rating
                               Body: { rating: 1-5, comment: string }
```

**Results**
```
GET    /results/history        User's inference history (paginated)
GET    /results/{id}           Get specific result
GET    /results/{id}/download  Download as PDF or CSV
       Query: ?format=pdf|csv
DELETE /results/{id}           Delete own result
```

**Admin**
```
GET    /admin/overview         Dashboard stats summary
GET    /admin/users            All users (paginated, filterable)
GET    /admin/users/{id}       Single user detail + their jobs
PATCH  /admin/users/{id}/role  Change user role (superadmin only)
GET    /admin/jobs             All inference jobs (paginated, filterable)
GET    /admin/jobs/{id}        Single job detail
GET    /admin/models           Model performance analytics
GET    /admin/models/{name}    Specific model analytics
GET    /admin/events           System events log
GET    /admin/export           Export all data as CSV (superadmin only)
GET    /admin/role-log         Role change history (superadmin only)
```

**Health**
```
GET    /health                 Service health check (used by UptimeRobot)
GET    /health/inference       HuggingFace service health check
```

### 11.3 Inference Job Response Schema

```typescript
interface InferenceResult {
  job_id: string;
  status: 'complete' | 'failed';
  architecture: string;
  processing_time_ms: number;
  input_metadata: {
    format: string;
    duration_ms: number;
    sampling_rate: number;
    leads: string[];
    was_resampled: boolean;
  };
  channels: {
    [channel: string]: {  // CS12, CS34, CS56, CS78, CS90
      metrics: {
        pcc: number;
        rmse: number;
        mae: number;
        r_squared: number;
        snr_db: number;
        spectral_coherence: number;
      };
      uncertainty: {
        confidence_level: 'High' | 'Medium' | 'Low';
        mean_uncertainty: number;
        ece: number;
        picp_95: number;
        nll: number;
      };
      waveform_url: string;  // Signed Supabase Storage URL
    };
  };
  overall_confidence: 'High' | 'Medium' | 'Low';
}
```

### 11.4 Error Response Schema

```typescript
interface APIError {
  error_code: string;      // e.g. 'INVALID_FORMAT', 'MODEL_TIMEOUT'
  message: string;         // Human readable
  detail?: string;         // Technical detail (dev mode only)
  timestamp: string;
}
```

Common error codes:
```
INVALID_FORMAT     → File format not accepted
INVALID_LEADS      → Missing required ECG leads
RESAMPLE_FAILED    → Cannot resample to 1000Hz
MODEL_TIMEOUT      → HuggingFace inference timeout (>90s)
STORAGE_FAILED     → Cannot write to Supabase Storage
UNAUTHORIZED       → Missing or invalid token
FORBIDDEN          → Insufficient role
RATE_LIMITED       → Too many requests (max 10/hour per user)
```

---

## 12. HuggingFace Inference Service

### 12.1 Architecture

The HuggingFace Space runs a separate FastAPI application that receives preprocessed ECG tensors and returns raw inference results. It is NOT publicly accessible — only the Render backend can call it via a shared secret header.

```
Endpoint: POST /infer
Headers:  X-Service-Key: {shared_secret}
Body:     { ecg_tensor: [[3 x 1000 floats]], architecture: string }
Returns:  { channels: { CS12: { mean: [], sigma: [] }, ... } }
```

### 12.2 Model Loading Strategy

All 6 models are loaded into RAM at Space startup:

```python
MODELS = {
    'BaselineCNN':          load_model('models/baseline_cnn.pth'),
    'BayesianCNN':          load_model('models/bayesian_cnn.pth'),
    'BayesianBiLSTM':       load_model('models/bayesian_bilstm.pth'),
    'BayesianTCN':          load_model('models/bayesian_tcn.pth'),
    'BayesianTransformer':  load_model('models/bayesian_transformer.pth'),
    'BayesianWaveNet':      load_model('models/bayesian_wavenet.pth'),
}
# All models set to eval() mode at startup
# Total RAM: ~400-500MB — within HuggingFace free 16GB
```

### 12.3 MC-Dropout Inference (N=20)

```python
def mc_dropout_inference(model, ecg_tensor, n_passes=20):
    model.train()  # Enable dropout
    predictions = []
    for _ in range(n_passes):
        with torch.no_grad():
            pred = model(ecg_tensor)
            predictions.append(pred.numpy())
    
    predictions = np.stack(predictions)  # [20, 5, 1000]
    mean = predictions.mean(axis=0)      # [5, 1000]
    sigma = predictions.std(axis=0)      # [5, 1000]
    return mean, sigma
```

### 12.4 BaselineCNN Special Handling

BaselineCNN has no dropout — it runs a single forward pass with N=1 and returns sigma=None. The frontend handles this by hiding uncertainty bands and showing a "No Uncertainty Available" indicator.

---

## 13. Page-by-Page Development Plan

Each page follows this strict cycle:
> **Build Full Frontend Page → Build Corresponding Backend → Integrate → Test → Sign Off → Next Page**

No page moves to integration until its frontend is cosmetically complete. No page moves to "next" until its backend integration is tested.

---

### Page 1: Landing Page

**Route:** `/`
**Auth Required:** No

#### Frontend Components

**1.1 Navbar**
- Fixed top, 64px, blur backdrop
- Logo left: animated ECG SVG icon (heartbeat loop) + "CardioBayes" in Syne 700
- "E2E" superscript in blue-400
- Center links: Home, Demo, Models, Research, Docs
- Right: "Sign In" ghost button + "Get Started" primary button
- Mobile: hamburger → full-screen slide-in menu overlay

**1.2 Hero Section**
- Full viewport height (100vh)
- Background: animated gradient mesh (3 radial gradients drifting over 20s)
- Horizontal grid overlay: 60px grid, 1px lines, 4% opacity
- Subtle floating particles: 25 dots, blue-tinted, drift upward

- Left column (60% width):
  - Tag pill: "Academic Research Tool" — badge-info style, fadeUp 100ms
  - Headline: "Reconstruct Cardiac Signals with Bayesian Certainty" — Syne 800 72px, fadeUp 250ms
  - Subtext: "ECG-to-EGM mapping with calibrated uncertainty quantification across six neural architectures." — DM Sans 400 18px secondary color, fadeUp 400ms
  - CTA row: "Try the Demo →" primary button + "View Research" secondary button, fadeUp 550ms
  - Disclaimer micro-text: 12px, tertiary color, warning icon

- Right column (40% width):
  - Live animated waveform preview — D3.js ECG signal scrolling right-to-left
  - Floating metric cards overlaid: "PCC: 0.801", "ECE: 0.472", "Confidence: High"
  - These cards animate in with stagger, pulse softly

**1.3 Stats Bar**
- Full-width band, bg-elevated, border top and bottom
- 4 stats displayed horizontally:
  - "6 Neural Architectures"
  - "5 EGM Channels"
  - "0.801 Best PCC"
  - "8 Patients Trained"
- Numbers animate countUp on scroll into view
- JetBrains Mono 600 40px for numbers, DM Sans 400 14px for labels

**1.4 How It Works Section**
- 3-step horizontal flow with connecting arrows
- Step 1: Upload ECG (upload icon, blue)
- Step 2: Select Model (neural network icon, cyan)
- Step 3: View Results with Uncertainty (chart icon, purple)
- Cards: interactive variant, hover lift
- Animated numbered badge per step

**1.5 Model Showcase Section**
- "Choose Your Architecture" heading
- 6 cards in responsive grid (3x2 desktop, 2x3 tablet, 1x6 mobile)
- Each card: model name, badge (⭐ Recommended etc.), 2-line description, 3 key metrics
- Best model (BiLSTM) card is highlighted — blue glow border, gradient overlay
- "Explore All Models →" link at bottom

**1.6 Features Section**
- Dark angled divider from model section
- 3 feature columns with icons:
  - "Probabilistic Predictions" — not just a number, a distribution
  - "Clinically Interpretable" — uncertainty peaks at cardiac activation complexes
  - "Multi-Architecture Benchmark" — compare across 6 approaches
- Each column has a decorative D3 mini-chart as illustration

**1.7 Research Section**
- "Built on Peer-Reviewed Research" heading
- Paper abstract excerpt (paraphrased)
- IAFDB attribution
- "Read the Paper" and "View Methodology" buttons

**1.8 CTA Section**
- Dark section, centered
- "Ready to analyze cardiac signals?"
- Large primary button: "Start Your First Inference →"
- Below: "Free to use. No credit card. Academic tool."

**1.9 Footer**
- 4 columns: Brand, Product, Research, Legal
- Social/GitHub links
- "© 2025 CardioBayes-E2E Research Project"
- Disclaimer repeated in small text

#### Backend (Landing Page)
- No backend calls needed for landing page rendering
- Health check endpoint used by status indicator in footer: `GET /health`

#### Integration Test
- [ ] All animations fire in correct sequence
- [ ] Waveform preview renders and scrolls
- [ ] All navigation links route correctly
- [ ] CTA buttons navigate to correct pages
- [ ] Health status dot shows green/red correctly
- [ ] Disclaimer text visible without scrolling

---

### Page 2: Auth Page (Login + Register)

**Route:** `/auth` (with `?mode=login` or `?mode=register` query param)
**Auth Required:** No (redirect to dashboard if already logged in)

#### Frontend Components

**2.1 Layout**
- Split screen: Left 45% (branding), Right 55% (form)
- Left panel: gradient-blue background, logo, tagline, decorative ECG waveform art
- Right panel: bg-surface, centered form card

**2.2 Register Form**
Fields (react-hook-form + zod validation):
- Full Name: text input, required, 2-100 chars
- Email: email input, required, valid email format
- Password: password input, required, min 8 chars, 1 uppercase, 1 number
- Confirm Password: must match password
- Terms checkbox: "I understand this is a research tool and outputs are not for clinical use"

Validation: Real-time, inline error messages below each field in red-400

Submit button: Full width, loading state with spinner during API call

Success state: Fade to success card — "Check your email to verify your account"

**2.3 Login Form**
Fields:
- Email
- Password
- "Forgot password?" link (right-aligned, email reset via Supabase)

Submit: Full width primary button

Error states:
- Wrong credentials: red toast notification
- Unverified email: amber warning card with "Resend verification" button

**2.4 Toggle**
- Subtle tab switcher at top of form: "Sign In" | "Create Account"
- Animated underline slider between tabs
- AnimatePresence for form transition

#### Backend
```
POST /auth/register    → Creates Supabase user + user_profiles row
POST /auth/login       → Returns JWT + user profile with role
POST /auth/logout      → Invalidates session
GET  /auth/me          → Returns current user info (used on app load)
```

#### Integration Tests
- [ ] Registration creates user_profiles row with role='user'
- [ ] Login returns valid JWT
- [ ] Invalid credentials show correct error
- [ ] Protected routes redirect unauthenticated users to /auth
- [ ] After login, redirect to /inference
- [ ] Role stored in authStore, accessible everywhere

---

### Page 3: Inference Page (Core Feature)

**Route:** `/inference`
**Auth Required:** Yes (user, admin, superadmin)

This is the most important page. Every interaction must feel precise and clinical.

#### Frontend Components

**3.1 Page Header**
- "New Inference" — Syne 700 36px
- Breadcrumb: Dashboard → New Inference
- Disclaimer banner: amber left-border card, icon + text

**3.2 Step 1 — File Upload**
Card with:
- react-dropzone zone: dashed border (becomes solid blue on drag-over), 200px height
- Accepted formats displayed: .csv .mat .edf with file type icons
- "Download template" links for each format
- On file selection: filename chip appears, file size, green checkmark
- Validation feedback: wrong format → red error with specific message

**3.3 Step 2 — Model Selection**
- "Select Architecture" heading
- 6 model cards in 2x3 grid:
  - Model name (Syne 600 18px)
  - Badge (⭐ Recommended / 🎯 Best Calibration etc.)
  - 3 key metrics in JetBrains Mono
  - Short one-line description
  - Expected wait time: "~5-8 sec"
  - Selected state: blue glow border, scale(1.02)
- Default: BayesianBiLSTM pre-selected

**3.4 Step 3 — Run Inference**
- "Run Inference" primary button — disabled until file + model selected
- Shows: selected file name + selected model name summary
- Below button: "Estimated time: X seconds" based on selected model

**3.5 Processing State (replaces steps 1-3 on submit)**

Vertical progress stepper:
```
⟳ Validating ECG format...          (500ms)
⟳ Parsing signal leads I, II, V1... (1s)
⟳ Resampling to 1000 Hz...          (if needed)
⟳ Normalizing segments...           (1s)
⟳ Connecting to inference engine... (cold start warning if needed)
⟳ Running 20 Bayesian passes...     (animated, main wait)
⟳ Computing uncertainty bands...    (1s)
⟳ Storing results...                (1s)
✓ Complete — Rendering results...
```

Each step: icon (spinner → checkmark on complete), title, timestamp
"Running 20 Bayesian passes" step shows a live progress bar that fills over estimated time

**3.6 Error State**
- Red card with error icon
- Error title + human-readable message
- Technical code in code font for debugging
- "Try Again" button + "Contact Support" link

#### Backend
```
POST /inference/upload
  - Validate file format (.csv/.mat/.edf only)
  - Parse and validate 3 leads present
  - Resample to 1000Hz if needed
  - Segment into 1-second windows
  - Create inference_jobs row with status='pending'
  - Call HuggingFace inference service (async, timeout 90s)
  - Store results in Supabase
  - Update job status to 'complete'
  - Return job_id

GET /inference/status/{id}
  - Returns current status + progress step message
  - Frontend polls every 2 seconds
```

#### Integration Tests
- [ ] .csv file uploads and validates correctly
- [ ] .mat file uploads and validates correctly
- [ ] .edf file uploads and validates correctly
- [ ] Wrong format shows correct error message
- [ ] Missing leads shows specific error (which lead is missing)
- [ ] Model selection passes correct architecture to API
- [ ] Progress stepper updates in real time via polling
- [ ] Cold start handled gracefully with user-friendly message
- [ ] Completed job redirects to /results/{job_id}

---

### Page 4: Results Page

**Route:** `/results/:jobId`
**Auth Required:** Yes (own results only, admin can view any)

#### Frontend Components

**4.1 Page Header**
- "Inference Results" heading
- Job metadata bar: Architecture badge, Timestamp, Processing time, Overall confidence badge
- Two action buttons: "Download PDF" + "Download CSV" (right-aligned)

**4.2 Overall Summary Card**
- Large confidence gauge (120px circular, animated fill)
- Overall confidence label: High/Medium/Low with color
- Summary metrics row: Best PCC (JetBrains Mono), Mean ECE, Mean Uncertainty
- Disclaimer repeated here, prominent

**4.3 ECG Input Viewer**
- Collapsible card: "Input ECG Signal"
- Shows 3-lead ECG waveforms (Lead I, II, V1) stacked vertically
- D3.js rendering, scrollable time axis
- Color coded: blue, green, purple per lead

**4.4 Channel Results (5 panels, one per EGM channel)**

For each channel (CS12, CS34, CS56, CS78, CS90):

Panel header:
- Channel name (Syne 600 18px)
- Confidence badge (High/Medium/Low)
- PCC value (JetBrains Mono 600 24px)
- "Best Channel" badge on CS56

Waveform viewer (D3.js):
- Ground truth EGM (solid line, channel color)
- Predicted mean (dashed line, same color 80% opacity)
- Uncertainty band (±2σ shaded area, 15% opacity)
- X-axis: time in ms
- Y-axis: normalized amplitude
- Hover crosshair with tooltip

Metrics grid below waveform:
```
PCC      RMSE     MAE      R²
SNR(dB)  Sp.Coh   ECE      PICP@95
NLL      Sharp    Mean σ   Confidence
```
All values in JetBrains Mono

**4.5 Uncertainty Analysis Section**
- "Uncertainty Profile" heading
- Reliability diagram (σ vs actual error scatter plot) — D3.js
- Text explanation: when uncertainty is high, what it means clinically

**4.6 Model Information Card**
- Which architecture was used, why it was designed, its strengths/limitations
- Link to Models page for full comparison

#### Backend
```
GET /inference/result/{id}
  - Fetch job + results from DB
  - Generate signed URLs for waveform blobs in Supabase Storage
  - Return complete InferenceResult object

GET /results/{id}/download?format=pdf
  - Generate PDF report with all metrics + waveform images
  - Return as file download

GET /results/{id}/download?format=csv
  - Generate CSV with all per-channel metrics
  - Return as file download
```

#### Integration Tests
- [ ] Waveform data loads and renders for all 5 channels
- [ ] Uncertainty bands visible and correctly scaled
- [ ] Ground truth vs prediction visually distinguishable
- [ ] All metrics display with correct values
- [ ] PDF download generates complete report
- [ ] CSV download includes all metrics
- [ ] Users cannot access other users' results (403 test)

---

### Page 5: User Dashboard

**Route:** `/dashboard`
**Auth Required:** Yes

#### Frontend Components

**5.1 Header**
- "My Inferences" heading
- "New Inference →" primary button top right

**5.2 Stats Summary Row**
- 4 cards: Total Inferences, Last 7 Days, Most Used Model, Average PCC
- JetBrains Mono numbers, animated countUp on load

**5.3 Inference History Table**
Columns:
- Date/Time
- Architecture used (badge)
- Best Channel PCC
- Overall Confidence (badge)
- Status (badge)
- Actions: View Results, Download, Delete

Features:
- Pagination (10 per page)
- Sort by date, PCC, architecture
- Filter by status, architecture

**5.4 Empty State**
- Illustrated empty state card
- "No inferences yet"
- "Run Your First Analysis →" primary CTA

#### Backend
```
GET /results/history?page=1&limit=10&sort=created_at&order=desc
  - Returns paginated inference history for current user
```

#### Integration Tests
- [ ] History loads current user's jobs only
- [ ] Pagination works correctly
- [ ] Sort and filter function correctly
- [ ] Delete removes record and storage blob
- [ ] "View Results" navigates to correct results page

---

### Page 6: Models Page

**Route:** `/models`
**Auth Required:** No

#### Frontend Components

**6.1 Hero**
- "Six Architectures. One Benchmark." headline
- Subtext explaining the multi-architecture approach

**6.2 Interactive Comparison Radar Chart**
- Full-width D3.js radar chart (reproduced from paper Fig.2)
- 6 architecture overlays with toggle checkboxes
- Axes: PCC, RMSE, ECE, PICP@95, NLL, Sharpness
- Color coded per architecture
- Hover: highlight single architecture

**6.3 Model Cards (6 detailed cards)**

For each model, full detail card:
- Model name + badge
- Architecture diagram (simplified SVG illustration)
- Parameter count
- Training summary (val loss, epochs, RMSE)
- Strengths (green bullets)
- Limitations (amber bullets)
- Best use case
- Performance metrics table (from paper Table II)

**6.4 Architecture Comparison Table**
- Full responsive table from paper Table II
- Sortable columns
- Best value per metric highlighted in green

**6.5 "Try This Model" Button Per Card**
- Navigates to /inference with that model pre-selected

#### Backend
```
GET /admin/models
  - Returns live model analytics from model_analytics table
  - Shows real usage stats alongside paper metrics
```

#### Integration Tests
- [ ] Radar chart renders all 6 architectures
- [ ] Toggle checkboxes show/hide architectures
- [ ] Live usage stats load from backend
- [ ] "Try This Model" pre-selects correct model on inference page

---

### Page 7: Research Page

**Route:** `/research`
**Auth Required:** No

#### Frontend Components

- Paper abstract and overview
- Methodology section with module diagram
- Dataset information (IAFDB, PhysioNet attribution)
- Key findings section with visual metric cards
- Limitations section — honest, well-formatted
- Future work section
- Citation block (copyable BibTeX format)
- Links to PhysioNet dataset

#### Backend
- Static page, no backend calls

---

### Page 8: Documentation Page

**Route:** `/docs`
**Auth Required:** No

#### Frontend Components

**Sidebar navigation + content area layout**

Sections:
1. Getting Started
2. Accepted File Formats (with download template links)
3. How to Prepare Your ECG Data
4. Understanding the Results
5. Interpreting Uncertainty Scores
6. Model Comparison Guide
7. API Reference (endpoint list with request/response examples)
8. FAQ

#### Backend
- Static page, no backend calls except template file downloads

---

### Page 9: Admin Dashboard

**Route:** `/admin`
**Auth Required:** admin or superadmin role

#### Frontend Components

**9.1 Admin Sidebar**
- Fixed left sidebar, 240px wide
- Links: Overview, Users, Inference Jobs, Model Analytics, System Events, Role Management (superadmin only)
- Collapsed to icons on smaller screens

**9.2 Overview Page (`/admin`)**

Row 1 — KPI Cards:
- Total Users, Total Inferences, Inferences Today, Failed Jobs

Row 2 — Charts:
- Inferences over time (line chart, last 30 days)
- Jobs by architecture (bar chart)
- Jobs by status (donut chart)

Row 3 — Recent Activity:
- Last 10 inference jobs table
- Last 5 failed jobs with error codes

**9.3 Users Page (`/admin/users`)**

Full searchable, filterable user table:
- ID, Email, Name, Role badge, Joined date, Last login, Total jobs, Status
- Click row → User detail drawer (all their jobs, stats)
- Superadmin: "Change Role" dropdown per row

**9.4 Inference Jobs Page (`/admin/jobs`)**

Full jobs table with all fields:
- Job ID, User, Architecture, Status, Processing time, PCC, Confidence, Date
- Filter by: status, architecture, date range, user
- Click → Full job detail with all metrics
- Export filtered view as CSV

**9.5 Model Analytics Page (`/admin/models`)**

Per-model stats cards:
- Total jobs, Success rate, Avg PCC, Avg processing time, Avg user rating
- Historical chart: PCC trend over time per model
- Channel performance breakdown per model
- Side-by-side comparison table

**9.6 System Events Page (`/admin/events`)**

Event log table:
- Timestamp, Type, Severity badge, Message
- Filter by severity, type, date range
- Auto-refreshes every 60 seconds

**9.7 Role Management Page (`/admin/roles`) — Superadmin Only**

Two sections:
1. All Users with current roles — searchable, "Change Role" per user
2. Role Change Log — full audit trail table (who changed what, when, why)

Change role: Modal with confirmation, optional reason field, logs to role_change_log

#### Backend
```
GET /admin/overview
GET /admin/users?page=1&limit=20&search=&role=
GET /admin/users/{id}
PATCH /admin/users/{id}/role  (superadmin only)
GET /admin/jobs?page=1&limit=20&status=&architecture=&from=&to=
GET /admin/jobs/{id}
GET /admin/models
GET /admin/models/{name}
GET /admin/events?severity=&type=&from=&to=
GET /admin/role-log
GET /admin/export?entity=jobs|users (superadmin only)
```

#### Integration Tests
- [ ] Regular users cannot access /admin (redirect to /dashboard)
- [ ] Admins can access all admin pages except /admin/roles
- [ ] Superadmin can access all pages including role management
- [ ] Role change logs to role_change_log table with correct fields
- [ ] All charts load with real data
- [ ] Export generates correct CSV with all fields
- [ ] Search and filters work on all tables

---

### Page 10: 404 Not Found Page

**Route:** `*`

- Animated ECG flatline that then spikes (creative 404 illustration)
- "Signal Lost" headline
- "The page you're looking for doesn't exist"
- "Return to Home" button

---

## 14. Development Approach

### 14.1 Strict Page Completion Protocol

```
For each page in order (1 → 10):

1. FRONTEND PHASE
   ├── Build all components for the page
   ├── Use mock data / hardcoded values for all API calls
   ├── Achieve full cosmetic completion
   ├── Test all animations and responsive behavior
   └── Sign off: "Frontend complete"

2. BACKEND PHASE
   ├── Build all required API endpoints
   ├── Implement business logic
   ├── Write unit tests for each endpoint
   └── Sign off: "Backend complete"

3. INTEGRATION PHASE
   ├── Replace all mock data with real API calls
   ├── Implement loading states
   ├── Implement error states
   ├── Test happy path end-to-end
   ├── Test all error paths
   └── Sign off: "Integration complete"

4. MOVE TO NEXT PAGE
```

**Rule:** Under no circumstances should Page N+1 frontend begin until Page N integration is signed off.

### 14.2 Git Branch Strategy

```
main          → Production-ready code only
develop       → Integration branch
feat/page-X   → Individual page development
fix/issue-X   → Bug fixes
```

### 14.3 Environment Files

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# backend/.env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key  # NOT anon key
HUGGINGFACE_INFERENCE_URL=your_space_url
HUGGINGFACE_SERVICE_KEY=shared_secret
JWT_SECRET=your_jwt_secret
ENVIRONMENT=development
```

---

## 15. Deployment Configuration

### 15.1 Vercel (Frontend)

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "VITE_API_BASE_URL": "@api_base_url",
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

Build command: `npm run build`
Output directory: `dist`
Install command: `npm install`

### 15.2 Render (Backend)

```yaml
# render.yaml
services:
  - type: web
    name: cardiobayese2e-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
    healthCheckPath: /api/v1/health
```

Free tier: 512MB RAM, spins down after 15 min
UptimeRobot: Pings `/api/v1/health` every 14 minutes

### 15.3 HuggingFace Spaces

```python
# app.py — Entry point
# Space type: FastAPI (not Gradio)
# Hardware: CPU basic (free)
# Persistent storage: disabled (models loaded from repo)
```

All `.pth` model files committed to the Space repo (Git LFS if >100MB total).
UptimeRobot also pings HuggingFace health endpoint every 14 minutes.

### 15.4 Supabase

- Project region: Choose closest to your users
- Enable Row Level Security on ALL tables immediately
- Storage bucket: `waveforms` — private, no public access
- Enable email auth in Supabase dashboard
- Configure SMTP for verification emails

### 15.5 UptimeRobot Configuration

```
Monitor 1: Render Backend
  URL: https://cardiobayese2e-api.onrender.com/api/v1/health
  Interval: 14 minutes

Monitor 2: HuggingFace Space
  URL: https://{space-name}.hf.space/health
  Interval: 14 minutes

Monitor 3: Frontend
  URL: https://cardiobayese2e.vercel.app
  Interval: 14 minutes
```

---

## 16. Testing Strategy

### 16.1 Frontend Testing

**Unit Tests (Vitest):**
- All utility functions (formatters, validators, waveformUtils)
- All Zustand store actions

**Component Tests (React Testing Library):**
- File upload validation
- Form validation logic
- Role-based component visibility

**E2E Tests (Playwright):**
- Full inference flow: upload → select model → run → view results
- Auth flow: register → verify → login → logout
- Admin flow: access control, role change

### 16.2 Backend Testing (pytest)

**Unit tests:**
- File parsers for .csv, .mat, .edf
- Signal preprocessing (resample, normalize, segment)
- Auth guards (role verification)
- Result storage and compression

**Integration tests:**
- Full inference pipeline with mock HuggingFace response
- Database write/read round trip
- Export generation (PDF, CSV)

### 16.3 Critical Test Cases

```
TC-001: .csv with correct leads → successful inference
TC-002: .csv with missing V1 lead → error: "Lead V1 not found"
TC-003: .mat file upload → successful parse
TC-004: .edf file upload → successful parse
TC-005: .pdf file upload → rejected: "Format not supported"
TC-006: User accesses another user's result → 403 Forbidden
TC-007: User accesses /admin → 403 Forbidden
TC-008: Admin accesses /admin/roles → 403 Forbidden
TC-009: Superadmin changes user role → role_change_log entry created
TC-010: HuggingFace timeout (>90s) → graceful error, job marked failed
TC-011: Supabase storage write fails → job marked failed, error logged
TC-012: BaselineCNN result → no uncertainty bands rendered, indicator shown
```

---

## 17. Cold Start & Performance Strategy

### 17.1 Cold Start Warning UI

When backend polling detects cold start delay (>10s on first response):

```
Show inline message below progress stepper:
"🔄 Warming up inference engine... This may take 30-60 seconds on first use."
Amber colored, with animated spinner
Automatically hides when inference begins
```

### 17.2 UptimeRobot Keep-Warm

Both Render and HuggingFace pinged every 14 minutes to prevent cold starts for active sessions.

### 17.3 Performance Targets

| Metric | Target |
|---|---|
| Landing page load | <2s |
| Auth page load | <1s |
| Inference (BiLSTM) | <15s total |
| Inference (CNN) | <35s total |
| Results page load | <2s |
| Admin dashboard | <3s |
| PDF export | <5s |
| Waveform render | <500ms |

---

## 18. Research Data Collection Strategy

### 18.1 What You Are Collecting

Every inference job captures:
- Input signal characteristics (format, duration, sampling rate, leads)
- Which model users prefer
- Reconstruction quality per channel per model
- Uncertainty calibration per run
- User feedback ratings
- Processing time per architecture
- Error patterns and failure modes

### 18.2 Research Value

This data enables:
- Real-world model performance validation beyond the 8-patient training set
- Understanding which architectures users find most useful
- Identifying input signal patterns where models fail
- Building a larger labeled dataset for future model versions
- Publication of real-world performance statistics

### 18.3 Privacy Commitment (must be shown to users)

On registration and on the inference page:
> *"By using CardioBayes-E2E, you agree that your uploaded signal metadata, model outputs, and interaction data may be used for academic research. Do not upload identifiable patient data. Raw ECG files are processed in memory and are not permanently stored."*

---

## 19. Timeline

| Week | Phase | Deliverable |
|---|---|---|
| 1 | Setup | Repo structure, Supabase schema, env config, HuggingFace Space with all 6 models loaded |
| 2 | Page 1 + 2 | Landing page + Auth page (frontend → backend → integration → test) |
| 3 | Page 3 | Inference page — full upload, preprocessing, model call, polling |
| 4 | Page 4 + 5 | Results page + User Dashboard |
| 5 | Page 6 + 7 | Models page + Research page |
| 6 | Page 8 | Documentation page |
| 7 | Page 9 | Admin Dashboard (all sub-pages) |
| 8 | Page 10 + QA | 404 page + full end-to-end QA pass |
| 9 | Deployment | Production deployment on all platforms + UptimeRobot setup |
| 10 | Polish | Performance optimization, final UI polish, accessibility pass |

---

## Appendix A: Confidence Level Thresholds

| Level | Condition | Color | Clinical Implication |
|---|---|---|---|
| High | Mean σ < 0.15 AND ECE < 0.5 | Green (#22C55E) | Prediction is reliable, model is confident |
| Medium | Mean σ < 0.30 OR ECE < 0.65 | Amber (#F59E0B) | Review with clinical context |
| Low | Mean σ ≥ 0.30 OR ECE ≥ 0.65 | Red (#EF4444) | Further invasive investigation recommended |

## Appendix B: Input File Templates

### CSV Template Format
```
timestamp_ms,lead_I,lead_II,lead_V1
0,0.123,-0.045,0.234
1,0.125,-0.043,0.231
...
```
- 1000 rows minimum (1 second at 1000Hz)
- Column names must match exactly
- Values in millivolts (mV)

### EDF Format Requirements
- Standard EDF+ format
- Must contain channels labeled "I", "II", "V1"
- Any sampling rate (will be resampled to 1000Hz)

### MAT Format Requirements
- MATLAB v5 (.mat)
- Variable names: `ecg_I`, `ecg_II`, `ecg_V1`
- Each variable: 1D array of samples
- Include `fs` variable for sampling rate

---

*End of Document — CardioBayes-E2E Product Development Briefing v1.0*
*Prepared for: Muhammad Fahad, Muhammad Azam, Muhammad Abdullah*
*Supervised by: Ma'am Mahzaib Younas*
*NUCES Chiniot, Pakistan — 2025*
