# CompliMate UI Design System

This design system is aligned to the reference visuals in `docs/ui`:
- `Admin System Dashboard.png`
- `All Complaints Master List.png`
- `Complaint Workspace & Timeline.png`
- `Reports - Desktop.png`
- `Settings - Desktop.png`
- `Teams - Desktop.png`
- `Users - Desktop.png`
- `Access Control - Desktop.png`

It also defines the updated auth experience used by the Angular login page.

## 1. Design Direction

### 1.1 Product tone
- Enterprise-first
- Operational and trustworthy
- Dense information with low noise
- Fast scanning for status, ownership, and priority

### 1.2 Visual signature from UI samples
- Cool neutral surfaces with soft blue accents
- Structured cards with light borders and subtle shadows
- Pill-based status communication
- Balanced typography with strong section headings

## 2. Foundations

### 2.1 Spacing scale (8px base)

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

### 2.2 Radius scale

```text
radius.sm = 8px
radius.md = 12px
radius.lg = 16px
radius.xl = 20px
radius.pill = 999px
```

### 2.3 Elevation

```text
shadow.card = 0 8px 24px rgba(31, 42, 68, 0.06)
shadow.panel = 0 12px 32px rgba(31, 42, 68, 0.08)
shadow.focus = 0 0 0 4px rgba(61, 124, 255, 0.16)
```

## 3. Color System

Use semantic tokens and avoid hardcoded hex values in components.

```css
:root {
  --color-bg-page: #f3f5f9;
  --color-bg-surface: #ffffff;
  --color-bg-muted: #f8fafd;

  --color-border-soft: #e2e8f2;
  --color-border-default: #d3ddeb;
  --color-border-strong: #c4d1e4;

  --color-text-primary: #1f2a44;
  --color-text-secondary: #60708f;
  --color-text-muted: #7f8da6;

  --color-brand-500: #3d7cff;
  --color-brand-600: #2f6ef5;
  --color-brand-100: #eaf1ff;

  --color-success-500: #1fb56e;
  --color-success-100: #e8f8ef;
  --color-warning-500: #f1a73b;
  --color-warning-100: #fff4df;
  --color-danger-500: #e55757;
  --color-danger-100: #ffeded;
  --color-info-500: #4a8eea;
  --color-info-100: #eaf3ff;
}
```

## 4. Typography

- Primary family: `Inter, "Segoe UI", system-ui, sans-serif`
- Secondary labels may use the same family at smaller sizes and stronger weight

### 4.1 Type scale
- Page title: 32-40px / 700
- Section title: 20-24px / 600-700
- Card title: 16-18px / 600
- Body: 14-16px / 400-500
- Meta/table labels: 12-13px / 500-600

## 5. Layout Patterns

### 5.1 App shell
- Left sidebar fixed: 240-256px
- Top bar fixed within content region
- Main region scrollable

### 5.2 Page scaffold order
1. Page title + context breadcrumb
2. KPI strip
3. Filter/action row
4. Primary table/workspace panel

### 5.3 Responsive breakpoints
- Mobile: `0-767px`
- Tablet: `768-1023px`
- Desktop: `1024px+`
- Wide: `1440px+`

## 6. Core Components

### 6.1 Sidebar
- Group nav into business domains
- Active item: muted blue background + brand text
- Inactive items: low-contrast neutrals

### 6.2 Top bar
- Left: page context/search
- Right: notifications, user menu, quick action button

### 6.3 KPI cards
- Card shell: 12-16px radius, soft border
- Structure: label, value, micro-trend/helper line
- Optional icon tile in top-right

### 6.4 Tables
- Rounded container with clear row separators
- Status and priority shown as pills with text labels
- Row density tuned for rapid scanning
- Pagination right-aligned

### 6.5 Status pills
- `New`: info token
- `In Progress`: warning token
- `Resolved`: success token
- `Escalated/Critical`: danger token

### 6.6 Workspace timeline
- Left: customer and complaint context
- Center: threaded conversation and notes
- Right: status and ownership controls
- Note composer pinned to top of middle panel

## 7. Forms and Inputs

### 7.1 Input standard
- Height: 48px
- Radius: 12px
- Border: `--color-border-default`
- Focus: brand border + focus ring
- Labels always visible above field

### 7.2 Validation and feedback
- Inline field errors below input
- Top-of-form alert for auth/server errors
- No color-only indicators; include readable text

### 7.3 Buttons
- Primary: solid brand color
- Secondary/Ghost: white surface + neutral border
- Disabled: maintain legible text and clear disabled cursor

## 8. Login Experience (Aligned to New UI)

### 8.1 Structure
- Two-panel layout on desktop
  - Left: authentication card
  - Right: brand message and trust metrics
- Single-column card on tablet/mobile

### 8.2 Login card
- Width: up to 500px
- Surface: white, soft border, medium elevation
- Content order:
  1. Brand area
  2. Welcome heading
  3. Mode segmented control
  4. Form content by mode/step
  5. Utility links and support action

### 8.3 Mode selector
- Segmented control:
  - Workforce
  - Client Portal
- Active segment uses brand background and white text

### 8.4 Right panel content
- Hero statement focused on outcomes and control
- Supporting enterprise copy
- 3 compact trust/metric cards

## 9. Accessibility Baseline

- WCAG AA contrast minimum
- Full keyboard support for forms and toggles
- Visible focus states for all interactive elements
- Input labels and icon button `aria-label` required
- Error messages must be explicit and actionable

## 10. Implementation Rules

- Token-first styling in SCSS/CSS variables
- Build reusable primitives before page-level overrides:
  - `AppShell`
  - `PageHeader`
  - `KpiCard`
  - `FilterBar`
  - `DataTable`
  - `StatusPill`
  - `AuthCard`
- Prefer semantic class names over page-specific utility drift

## 11. Quality Checklist

- Does each page keep the same header -> KPI -> filter -> content rhythm?
- Are status colors semantic and consistent across pages?
- Are table states readable without relying on color alone?
- Is mobile behavior preserving function (not hiding critical fields)?
- Is login interaction polished (loading, error, success, focus)?
