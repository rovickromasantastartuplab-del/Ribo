# 🎨 CRM UI Design System

This document defines the visual language, typography, and color rules for the CRM to ensure a premium, consistent, and state-of-the-art interface.

---

## 💎 Core Philosophy
- **Clean & Focused**: Minimalist layout that highlights data and actions.
- **Functional Aesthetics**: Beauty serves the user's workflow, not the other way around.
- **Micro-interactions**: Subtle animations to provide feedback and context.

---

## 🎨 Color Palette (OKLCH)
We use the **OKLCH** color space for better perceptual uniformity and more vibrant colors.

### 1. Brand Colors
| Role | Color | Token | Description |
| :--- | :--- | :--- | :--- |
| **Primary** | `oklch(0.55 0.18 245)` | `--primary` | Active actions (Indigo-Blue) |
| **Primary Foreground**| `oklch(0.98 0 0)` | `--primary-foreground` | Text on primary backgrounds |

### 2. Surface Colors
| Role | Light Mode | Dark Mode | Token |
| :--- | :--- | :--- | :--- |
| **Background** | `oklch(0.99 0 0)` | `oklch(0.15 0 0)` | Base page background |
| **Card** | `oklch(1 0 0)` | `oklch(0.18 0 0)` | Elevated surfaces (white/deep black) |
| **Muted** | `oklch(0.96 0 0)` | `oklch(0.22 0 0)` | Secondary backgrounds/borders |
| **Border** | `oklch(0.92 0 0)` | `oklch(0.25 0 0)` | Subtle separators |

### 3. Semantic Colors
| Role | Success | Warning | Destructive |
| :--- | :--- | :--- | :--- |
| **Base** | Emerald `oklch(0.65 0.2 150)` | Amber `oklch(0.75 0.15 70)` | Rose `oklch(0.6 0.22 25)` |

---

## Typography
We prioritize readability and modern aesthetics.

- **Primary Font Family**: `Inter`, `Instrument Sans`, or `Geist`. (San-serif)
- **Monospace Font**: `Geist Mono` or `JetBrains Mono`. (For data/IDs)

### Heading Rules
- **H1**: Bold, tracking-tight, `2.25rem`.
- **H2**: Semi-bold, `1.5rem`.
- **H3**: Medium, `1.125rem`.

---

## 🧩 Component Rules

### Elevation & Radius
- **Radius**: `0.75rem` (12px) for a modern, approachable look.
- **Shadows**: Use "Next.js" style soft shadows for depth.
- **Borders**: Always use `1px` solid `--border` for cards and inputs.

### Layout & Spacing
- **Sidebar**: Fixed width (`260px`), deep background with high-contrast text.
- **Main Content**: Max width on large screens to avoid "unlimited width" fatigue.
- **Tables**: Dense layouts with alternating row colors and interactive hovers.

---

## ✨ Micro-Animations (Framer Motion)
- **Transitions**: Smooth `spring` animations for page transitions.
- **Hover**: Subtle scaling (`scale(1.02)`) or background shifts for buttons.
- **Loading**: Skeleton loaders that pulse gently (`oklch(0.96 0 0)`).
