# Login Design System

## 1. Purpose

This document defines the production-ready design system for the **CompliMate CMS Login Experience** based on the provided screen. The goal is to turn the current basic login page into a polished, enterprise-grade, accessible, scalable, and developer-friendly authentication experience.

The redesigned experience should communicate:

- Trust
- Security
- Operational clarity
- Professional enterprise quality
- Fast recognition for Admin, Supervisor, Agent, and Client users

---

## 2. Product Positioning

**Product name:** CompliMate CMS  
**Primary message:** Complaint intelligence, faster resolution, and audit-ready workflows.

The login page should feel:

- Clean and modern
- Professional, not playful
- Light enterprise SaaS aesthetic
- Minimal but not empty
- Confident, secure, and easy to use

---

## 3. Design Principles

### 3.1 Clarity first
Users should instantly understand:
- where to log in
- which role can access the system
- what action to take next

### 3.2 Reduce friction
Only essential inputs and actions should be visible. Avoid visual noise.

### 3.3 Trust through polish
Spacing, typography, states, and alignment must feel deliberate and consistent.

### 3.4 Accessibility by default
Color contrast, keyboard navigation, focus states, labels, and error messaging must meet production standards.

### 3.5 Scalable system
The login page must use reusable tokens and components so the same system can extend to signup, forgot password, OTP, and reset password flows.

---

## 4. Experience Goals

The redesigned page should improve:

- Visual hierarchy
- Readability
- Form completion speed
- Mobile responsiveness
- Accessibility compliance
- Brand consistency
- Enterprise confidence

---

## 5. Layout System

## 5.1 Desktop Layout

Use a **two-panel split layout** for large screens.

### Left panel
Purpose:
- authentication card
- role entry
- form actions

### Right panel
Purpose:
- product value proposition
- trust messaging
- optional illustration, pattern, or abstract brand graphic

### Recommended desktop ratio
- Left panel: **40%**
- Right panel: **60%**

### Alignment
- Left panel content vertically centered
- Login card aligned slightly left-of-center within the left panel
- Right panel content centered vertically, max-width controlled

---

## 5.2 Tablet Layout

- Shift to **single-column centered card**
- Remove excessive empty space
- Keep supporting brand message above or below the form
- Right-side marketing panel becomes a simplified content block

---

## 5.3 Mobile Layout

- Single column
- Full-width form card with comfortable margins
- Product heading reduced in prominence
- Tabs and buttons remain thumb-friendly
- Minimum touch target: **44px**

---

## 6. Grid and Spacing

### Base spacing unit
Use **8px** spacing scale.

### Spacing scale
- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 40px
- 48px
- 64px

### Layout spacing recommendations
- Page outer padding desktop: **32px to 48px**
- Card padding desktop: **32px**
- Card padding mobile: **24px**
- Field spacing: **16px**
- Section spacing: **24px**
- Heading to subtext: **8px**
- Form to CTA gap: **24px**

---

## 7. Color System

The current UI uses a light neutral background with a strong blue accent. For production, refine it into a structured semantic color system.

## 7.1 Core Brand Colors

### Primary
- **Primary / 600**: `#2563EB`
- **Primary / 700**: `#1D4ED8`
- **Primary / 500**: `#3B82F6`
- **Primary / 100**: `#DBEAFE`
- **Primary / 50**: `#EFF6FF`

Use primary blue for:
- primary buttons
- active tabs
- focus accents
- links
- selected states

### Neutral
- **Neutral / 900**: `#0F172A`
- **Neutral / 800**: `#1E293B`
- **Neutral / 700**: `#334155`
- **Neutral / 600**: `#475569`
- **Neutral / 500**: `#64748B`
- **Neutral / 400**: `#94A3B8`
- **Neutral / 300**: `#CBD5E1`
- **Neutral / 200**: `#E2E8F0`
- **Neutral / 100**: `#F1F5F9`
- **Neutral / 50**: `#F8FAFC`
- **White**: `#FFFFFF`

### Background surfaces
- **App background**: `#F8FAFC`
- **Left panel background**: `#F8FAFC`
- **Right panel background**: `#F1F5F9`
- **Card background**: `#FFFFFF`

---

## 7.2 Semantic Colors

### Success
- `#16A34A`

### Warning
- `#D97706`

### Error
- `#DC2626`

### Info
- `#0284C7`

Use semantic colors only for messages and validation states.

---

## 7.3 Border Colors
- Default border: `#CBD5E1`
- Hover border: `#94A3B8`
- Focus border: `#2563EB`
- Error border: `#DC2626`

---

## 8. Typography System

Use a clean, modern sans-serif typeface.

### Recommended font
- **Inter**
- fallback: `system-ui, sans-serif`

## 8.1 Type scale

### Display / Hero
- 40px / 48px / SemiBold

### Heading 1
- 32px / 40px / SemiBold

### Heading 2
- 24px / 32px / SemiBold

### Heading 3
- 20px / 28px / SemiBold

### Body Large
- 16px / 24px / Regular

### Body
- 14px / 22px / Regular

### Label
- 14px / 20px / Medium

### Caption
- 12px / 18px / Regular

### Button text
- 14px / 20px / SemiBold

---

## 8.2 Typography usage on login page

### Card title
**CompliMate CMS**  
- 32px
- SemiBold
- Neutral 900

### Supporting text
**Admin, Supervisor, Agent, and Client login**  
- 14px or 16px
- Neutral 600

### Right panel hero text
**Complaint intelligence, resolution speed, and audit-ready controls.**  
- 36px to 40px desktop
- 24px to 28px tablet
- 20px to 24px mobile
- Neutral 900

### Secondary marketing line
- 16px
- Neutral 600

---

## 9. Elevation and Shadows

Current card shadow is acceptable but can be improved.

### Card shadow
`0 12px 32px rgba(15, 23, 42, 0.10)`

### Focus ring shadow
`0 0 0 4px rgba(37, 99, 235, 0.15)`

### Interactive hover shadow for card
`0 16px 40px rgba(15, 23, 42, 0.12)`

Use shadows sparingly. Enterprise UI should feel stable and controlled.

---

## 10. Border Radius System

Use a consistent radius scale.

- Small: `8px`
- Medium: `12px`
- Large: `16px`
- XL: `20px`

### Usage
- Input fields: `12px`
- Buttons: `12px`
- Tabs/segmented control: `12px`
- Main card: `20px`

---

## 11. Login Page Structure

Recommended login page structure:

1. Brand mark or product name
2. Login heading
3. Supporting role text
4. Role or mode selector
5. Email/username field
6. Password field
7. Utility actions
8. Primary CTA
9. Secondary support links
10. Optional footer note

---

## 12. Component System

## 12.1 Authentication Card

### Specs
- Width desktop: **440px to 480px**
- Width tablet/mobile: **100%**
- Background: white
- Radius: 20px
- Padding: 32px
- Shadow: subtle elevated shadow

### Content order
- Brand
- Heading + support text
- Mode selector
- Form
- Utility links
- Primary action
- Secondary action

---

## 12.2 Segmented Control / Tabs

Current Login / SignUp switch should be redesigned as a segmented control.

### States
- Default
- Hover
- Active
- Focus
- Disabled

### Style
- Container background: Neutral 100
- Active segment background: Primary 600
- Active text: White
- Inactive text: Neutral 700
- Radius: 12px
- Height: 44px

### Recommendation
Use labels:
- **Sign in**
- **Create account**

If signup is not available for all users, replace with:
- **Workforce login**
- **Client login**

That is more meaningful than generic tabs.

---

## 12.3 Input Fields

### Field structure
- Label
- Input container
- Optional icon
- Helper or error text

### Field height
- Desktop: `48px`
- Mobile: `48px to 52px`

### Input style
- Background: white
- Border: 1px solid Neutral 300
- Radius: 12px
- Text: Neutral 900
- Placeholder: Neutral 400

### States
#### Default
- Border Neutral 300

#### Hover
- Border Neutral 400

#### Focus
- Border Primary 600
- Focus ring visible

#### Error
- Border Error
- Error message below field

#### Disabled
- Background Neutral 100
- Text Neutral 400

### Labels
Avoid placeholder-only labels. Labels must stay visible above inputs.

---

## 12.4 Password Field

Include:
- show/hide password toggle
- clear accessibility label for the icon button
- Caps Lock detection if possible
- optional password helper for signup mode

### Icon button requirements
- minimum 40px hit target
- aligned vertically center
- keyboard accessible

---

## 12.5 Primary Button

### Label
Use **Sign in** instead of **Sign In** only if title case is not used elsewhere. Keep casing system consistent across the product.

### Style
- Height: 48px
- Radius: 12px
- Background: Primary 600
- Text: White
- Weight: SemiBold

### States
- Default
- Hover: Primary 700
- Active: slightly darker blue
- Focus: visible ring
- Disabled: muted blue or neutral disabled state
- Loading: spinner + disabled interaction

### Width
Full width inside the card

---

## 12.6 Text Link

Use for:
- Forgot password
- Need help?
- Contact support

### Link style
- Color: Primary 600
- Hover: underline
- Focus: visible outline

---

## 12.7 Inline Alert / Feedback

Support these messages:
- invalid credentials
- account locked
- password reset sent
- maintenance notification
- success after signup

### Alert style
- Background tinted by semantic color
- Left icon optional
- 12px radius
- 12px to 16px padding
- Clear concise copy

---

## 13. Content Design

## 13.1 Recommended login copy

### Card heading
**Welcome back**

### Product line
**Sign in to CompliMate CMS**

### Support text
**Access complaint workflows, case tracking, and audit-ready operations.**

This is stronger and more polished than only listing roles.

---

## 13.2 Role messaging

Instead of:
**Admin, Supervisor, and Agent login.**

Use:
**For Admin, Supervisor, Agent, and Client access**

or

**Choose your access mode and sign in securely**

---

## 13.3 Right panel content

### Hero heading
**Complaint intelligence with faster resolution and stronger control.**

### Supporting text
**A unified workspace for workforce users and self-service clients, designed for secure operations and audit readiness.**

### Optional trust bullets
- Secure role-based access
- Faster complaint handling
- Clear operational visibility

Do not overcrowd this area.

---

## 14. Visual Direction

## 14.1 Overall look
- Light, spacious enterprise SaaS feel
- Strong typography hierarchy
- Subtle blue accents
- Soft neutral surfaces
- High readability
- Minimal decoration

## 14.2 Imagery
Avoid generic stock photos.

Preferred options:
- abstract brand gradient mesh
- workflow diagram pattern
- subtle illustration related to case management
- soft grid or geometric motif

Any illustration must remain secondary to the form.

---

## 15. Accessibility Standards

The login page must meet practical WCAG-ready standards.

### Required
- All inputs must have visible labels
- Keyboard navigable end-to-end
- Visible focus states
- Error messages linked to fields
- Sufficient contrast ratio
- Screen-reader labels for icons and controls
- No information conveyed by color alone

### Keyboard order
1. Mode selector
2. Email/username
3. Password
4. Forgot password
5. Sign in button
6. Secondary links

---

## 16. Interaction Design

## 16.1 Form validation
Use:
- inline validation
- helpful, short messages
- validation on blur and submit
- preserve entered values when errors happen

### Example errors
- **Enter your email or username**
- **Enter your password**
- **The email, username, or password is incorrect**

Avoid vague messages like:
- invalid input
- error occurred

---

## 16.2 Loading state
When user clicks sign in:
- disable button
- show spinner
- button label changes to **Signing in...**

---

## 16.3 Success state
If authentication succeeds:
- smooth transition
- optional short loader or route change
- no abrupt flash

---

## 16.4 Empty and maintenance state
Support an optional page banner for:
- scheduled maintenance
- system downtime
- security notices

---

## 17. Responsive Behavior

## 17.1 Breakpoints
- Mobile: `0 - 767px`
- Tablet: `768 - 1023px`
- Desktop: `1024px+`
- Large desktop: `1440px+`

## 17.2 Desktop behavior
- Two-column split
- Card max-width controlled
- Hero text remains readable, not over-stretched

## 17.3 Tablet behavior
- Collapse panels
- Keep strong spacing
- Center card

## 17.4 Mobile behavior
- Single column
- Remove excessive decorative space
- Keep interactions simple
- Utility links stacked cleanly if needed

---

## 18. Production-Ready Redesign Recommendations

## 18.1 Major issues in current UI
- Too much empty space on the right
- Weak visual hierarchy in the form
- Generic tab labels
- Missing strong trust/security cues
- Card feels slightly isolated
- Supporting text is too light in importance
- No visible system feedback patterns shown
- The overall experience looks like a draft rather than a finished enterprise product

## 18.2 Redesign improvements
- Strengthen brand and welcome messaging
- Refine the left/right panel balance
- Add meaningful hero content on the right
- Turn tabs into role-based or mode-based segmented control
- Improve input styling and spacing
- Standardize radius, shadows, and alignment
- Use stronger headings and support copy
- Add accessible focus and validation states
- Create reusable auth components for future screens

---

## 19. Suggested Final UI Composition

## Left side
- CompliMate logo or wordmark
- Welcome back
- Sign in to CompliMate CMS
- Access mode segmented control
- Email/Username
- Password with toggle
- Forgot password link
- Sign in button
- Need help? Contact support

## Right side
- Enterprise hero headline
- Supporting paragraph
- Optional abstract branded visual
- Optional trust bullets or badge row

---

## 20. Token Summary

## Color tokens
- `color.primary.600 = #2563EB`
- `color.primary.700 = #1D4ED8`
- `color.neutral.900 = #0F172A`
- `color.neutral.600 = #475569`
- `color.neutral.300 = #CBD5E1`
- `color.surface.default = #FFFFFF`
- `color.background.app = #F8FAFC`
- `color.error.default = #DC2626`

## Radius tokens
- `radius.sm = 8px`
- `radius.md = 12px`
- `radius.lg = 16px`
- `radius.xl = 20px`

## Shadow tokens
- `shadow.card = 0 12px 32px rgba(15, 23, 42, 0.10)`
- `shadow.focus = 0 0 0 4px rgba(37, 99, 235, 0.15)`

## Spacing tokens
- `space.1 = 4px`
- `space.2 = 8px`
- `space.3 = 12px`
- `space.4 = 16px`
- `space.6 = 24px`
- `space.8 = 32px`
- `space.10 = 40px`
- `space.12 = 48px`

---

## 21. Sample High-Level UI Copy

### Left panel
**Welcome back**  
Sign in to CompliMate CMS to manage complaints, workflows, and case visibility.

### Right panel
**Complaint intelligence with faster resolution and audit-ready control.**  
A secure and unified experience for operations teams and self-service clients.

---

## 22. Engineering Notes

- Build all auth screens from shared tokens and components
- Keep buttons, fields, and segmented controls reusable
- Support dark mode later through token-driven theming
- Use semantic HTML form elements
- Add analytics events for login attempts, forgot password clicks, and validation failures
- Ensure the page loads fast and avoids layout shift

---

## 23. Final Recommendation

The redesigned login experience should look like a polished B2B SaaS authentication product, not just a functional form. The production-ready version must combine:

- a stronger visual hierarchy
- clear messaging
- reusable design tokens
- accessible interaction patterns
- enterprise-grade trust and stability

This design system should be the foundation for:
- Login
- Signup
- Forgot Password
- Reset Password
- OTP Verification
- Invite Acceptance
