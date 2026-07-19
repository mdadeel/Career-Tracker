# CareerTrack — Complete UX & Product Audit

> **Date:** 2026-07-19
> **Scope:** Full-stack React + Express job application tracker
> **Goal:** Transform from CRUD prototype → production SaaS portfolio project

---

## Deliverable 1 — Complete UX Audit

### Current State Summary

CareerTrack is a functional but generic CRUD application. It has the right bones — auth, optimistic updates, keyboard shortcuts, dark mode, responsive layout — but lacks the refinement, information density, and personality of a real product.

### Page-by-Page Audit

---

#### Landing Page (`/`)
**Current:** Standard marketing hero + 3 feature cards + footer

| Issue | Severity | Why |
|-------|----------|-----|
| Generic hero layout (centered text + 2 buttons) | Medium | Doesn't stand out; every SaaS looks like this |
| No product demo or visual preview | High | Users can't see what they're signing up for |
| Feature cards are uniform and flat | Medium | No hierarchy; all three features get equal weight |
| No testimonials, metrics, or social proof | Medium | Missing trust-building elements |
| CTA is "Get Started Free" but no pricing hint | Low | Users don't know if it's actually free |
| No demo video or screenshots | Medium | Hard to convey value proposition visually |

**Score:** 4/10

---

#### Login Page (`/login`)
**Current:** Split layout — form left, gradient brand panel right

| Issue | Severity | Why |
|-------|----------|-----|
| Left/right split works well | ✅ Fine | |
| No password reset option | High | Users locked out have no recourse |
| Demo login is good but visually noisy | Low | Mixed button styles compete for attention |
| Right panel is purely decorative | Medium | Could show product preview or active metrics |
| No "remember me" or session persistence info | Low | Users might wonder if they stay logged in |
| Error messages are basic strings | Low | Could be more helpful ("Check your email format") |

**Score:** 6/10

---

#### Register Page (`/register`)
**Current:** Same layout as login

| Issue | Severity | Why |
|-------|----------|-----|
| Password field has no strength indicator (only minLength) | Medium | Users create weak passwords |
| No terms of service / privacy policy links | Medium | Legal gap for a real product |
| No email confirmation step | Medium | Real product would verify emails |
| No "why create an account" value prop | Low | Unclear what they get after registering |
| Name field accepts anything | Low | No validation beyond minLength |
| Same decorative right panel as login | Medium | Missed opportunity to show onboarding preview |

**Score:** 5/10

---

#### Dashboard (`/dashboard`)
**Current:** Greeting + 4 metric cards + pipeline + this week + upcoming interviews + recent apps + insights

| Issue | Severity | Why |
|-------|----------|-----|
| Too many widgets; no clear priority | High | Should answer "What should I do today?" immediately |
| Metric cards are all the same size/weight | Medium | No visual differentiation of importance |
| "This Week" section is underutilized | Medium | Only shows submitted apps count |
| Pipeline bars don't show percentage values | Low | Users have to mentally calculate |
| Insights section is buried at the bottom | Medium | Most valuable data is least visible |
| Empty state is just text — "Let's start tracking" | Medium | Could guide with a setup checklist |
| "Good morning/afternoon/evening" feels generic | Low | Small personalization but no surprise/delight |
| No quick actions (add app, search) | Medium | Every action requires navigation |
| No weekly goal or progress visualization | Medium | Missing motivation mechanism |
| Source breakdown is just bars; no actionable insight | Low | Shows data but doesn't help |
| Average time to interview is useful but buried | Low | Should be more prominent |
| No notification of stale/inactive applications | High | Users forget about apps, no reminder system |
| Interview widget downplays urgency | Medium | Should show days-until prominently |
| Recent apps row doesn't show next action | Medium | Just shows title + company + status |
| Dashboard skeleton is functional but minimal | Low | Works but lacks polish |

**Score:** 5/10

---

#### Applications Page (`/applications`)
**Current:** Search bar + filters + sort + list rows

| Issue | Severity | Why |
|-------|----------|-----|
| List rows are information-poor | High | Just badge + title + company + date + actions |
| No company logos/avatars | Medium | Visual identity missing for each entry |
| No salary, location, or employment type fields | High | Core job data missing from the model |
| Detail slide-over is cramped | Medium | Has all data but feels crowded |
| Detail slide-over has no tabs/sections | Medium | Everything in one scrollable column |
| No batch/selection/multi-select mode | Medium | Can't archive/delete multiple at once |
| No context menu (right-click) on rows | Low | Power users expect this |
| Edit form modal duplicates the full form page | Medium | Two code paths for the same operation |
| Filter bar uses raw `<select>` elements instead of styled dropdowns | Low | Works but could be more polished |
| Pagination is functional but basic | Low | No page size selector, no "jump to page" |
| Delete has no undo (though it has confirmation) | Medium | Destructive action with no recovery |
| No "save as template" or "duplicate" quick action | Low | Common for similar job applications |
| Row hover actions are hidden until hover | Medium | Mobile users can't access them |
| No column visibility customization | Low | Power feature, not critical |
| Empty state has tips — good | ✅ Fine | |
| Draft auto-save in modal is clever | ✅ Good | |
| Keyboard shortcuts (n, /, escape) are great | ✅ Good | |

**Score:** 5/10

---

#### Application Form (`/applications/new`, `/applications/:id/edit`)
**Current:** Two-column layout for new, single-column for edit... wait, both use the same form component

| Issue | Severity | Why |
|-------|----------|-----|
| No inline validation on blur | Medium | Error only appears on submit |
| No character limits beyond JD/notes showCharCount | Low | Users can enter unlimited text |
| No "add another" for repetitive fields | Low | Only one resume link slot |
| Interview date/time only shows when status=Interview | ✅ Good | Progressive disclosure works here |
| Wide layout doesn't persist between sessions | Low | Minor |
| No autocomplete/autofill for common company names | Low | Nice-to-have |
| Form state isn't persisted across page refreshes for edit mode | Medium | Unsaved edits are lost on refresh (draft only works for new) |
| No rich text for job descriptions/notes | Low | Plain text is adequate |

**Score:** 6/10

---

#### Settings (`/settings`)
**Current:** Profile + Appearance + Change Password in 2-column layout

| Issue | Severity | Why |
|-------|----------|-----|
| No ability to edit name or email | Medium | Profile is read-only |
| No account deletion option | Medium | GDPR/privacy requirement |
| No notification preferences | Medium | Future notification system needs this |
| No export data option | Low | Users should be able to export their apps |
| No API keys or integrations section | Low | Future-proofing |
| Password strength indicator is good | ✅ Fine | |
| Copy user ID is a nice touch | ✅ Fine | |

**Score:** 7/10

---

#### Analytics (`/analytics`) — Placeholder
**Current:** Not implemented, likely empty/placeholder

| Issue | Severity | Why |
|-------|----------|-----|
| Placeholder page | High | User expects data, gets nothing |
| No charts, no trends, no insights | High | Promised in nav but undelivered |

**Score:** 1/10 (if placeholder)

---

#### Calendar (`/calendar`) — Placeholder
**Current:** Not implemented

| Issue | Severity | Why |
|-------|----------|-----|
| Placeholder page | High | Promised in nav but undelivered |
| No interview calendar view | Medium | Critical for planning |

**Score:** 1/10 (if placeholder)

---

#### Saved Jobs (`/saved-jobs`) — Placeholder
**Current:** Not implemented

| Issue | Severity | Why |
|-------|----------|-----|
| Placeholder page | High | Promised in nav but undelivered |

**Score:** 1/10 (if placeholder)

---

### Cross-Cutting Issues

| Issue | Severity | Why |
|-------|----------|-----|
| No global search (Ctrl+K) | High | Users navigate instead of searching |
| No notification system | High | No reminders for interviews, follow-ups |
| No onboarding flow for new users | Medium | Users are thrown into empty dashboard |
| No bulk import/export | Medium | Can't migrate data in/out |
| No application statistics on list page | Low | "Total: X" is minimal |
| No status change transition/animation | Low | Status changes feel abrupt |
| No offline support | Low | App breaks without connection |
| No error recovery beyond retry button | Low | Simple retry is adequate for now |
| No analytics/tracking for product decisions | Low | Not needed for portfolio piece |
| No loading states for individual actions (edit, delete) beyond disabled button | Low | Acceptable |
| Dark mode doesn't persist toggle state in some edge cases | Low | Works in normal flow |
| No page title updates on route change | Low | Browser tab always shows "CareerTrack" |

---

## Deliverable 2 — Information Architecture

### Current IA

```
/ (public)
├── /login
├── /register
└── (protected, sidebar layout)
    ├── /dashboard
    ├── /applications
    │   ├── /new
    │   └── /:id/edit
    ├── /analytics (placeholder)
    ├── /calendar (placeholder)
    ├── /settings
    └── /saved-jobs (placeholder)
```

### Problems with Current IA

1. **No hierarchy** — All nav items are equal weight
2. **No grouping** — Dashboard, Applications, Analytics, Calendar are flat
3. **Analytics and Calendar are misleading** — They exist in nav but don't work
4. **Saved Jobs is orphaned** — Hidden in user menu dropdown, no primary nav presence
5. **No pipeline view** — Kanban board is missing entirely
6. **No search entry point** — Users must navigate to find things

### Recommended IA

```
/ (public)
├── /login
├── /register
└── (protected, sidebar layout)
    ├── 📊 /dashboard  (command center)
    ├── 📋 /applications  (list + detail)
    │   ├── /pipeline  (kanban view)
    │   ├── /new
    │   └── /:id
    ├── 📈 /analytics  (charts + insights)
    ├── 📅 /calendar  (interview + deadline calendar)
    ├── ⭐ /saved-jobs  (bookmarked listings)
    └── ⚙️ /settings
```

---

## Deliverable 3 — User Journey

### Current Journey: Signup → Offer Acceptance

1. **Land on landing page** → reads about features
2. **Click "Get Started Free"** → register form
3. **Fill in name, email, password** → submit
4. **Redirect to dashboard** → empty state: "Let's start tracking"
5. **Navigate to Applications** → empty state: "No applications yet"
6. **Click "Add Application"** → form modal
7. **Fill out company, title, URL, source, date, status** → submit
8. **Back to list** → sees their first application
9. **Click row** → slide-over detail panel
10. **Update status as they progress** → edit modal
11. **Return to dashboard** → sees metrics update
12. **Repeat** for each application

### Problems with Current Journey

- **No guided setup** — First login shows empty state, not "here's what to do next"
- **No template** — First application has no prefilled guidance
- **No import** — Can't bring existing applications from other tools
- **No pipeline visualization** — Only sees list, not stages
- **No interview prep tools** — Once interview is scheduled, next steps are unclear
- **No offer comparison** — Multiple offers have no comparison view
- **No data export** — When they get a job, no way to archive/export

---

## Deliverable 4 — Component Inventory

### Shared UI Components (in `client/src/components/ui/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `Button` | ✅ Complete | forwardRef, variants (primary/secondary/ghost/danger), sizes, loading state, icon support |
| `Input` | ✅ Complete | forwardRef, label, error, helperText, icon, ARIA attributes |
| `Textarea` | ✅ Complete | forwardRef, label, error, char count, maxLength |
| `Select` | ✅ Complete | forwardRef, label, error, options, placeholder |
| `Badge` | ✅ Complete | Variants, dot indicator, statusVariantMap exported |
| `Card` | ✅ Complete | header, footer, hover effects, onClick → button |
| `Dialog` | ✅ Complete | Focus trap, Escape key, scroll lock, backdrop, animations |
| `DropdownMenu` | ✅ Complete | Click-outside-to-close, align left/right, menu role |
| `Toolbar` | ✅ Complete | With ToolbarSection, ToolbarSpacer |
| `Sidebar` | ✅ Complete | Collapsible, mobile drawer, user dropdown, keyboard shortcuts |
| `Toast` | ✅ Complete | success/error/info variants, auto-dismiss, container |
| `Skeleton` | ✅ Complete | text/circular/rectangular variants, SkeletonCard, SkeletonTable |
| `EmptyState` | ✅ Complete | icon, title, description, action, secondaryAction, tips |
| `PageHeader` | ❌ Missing | Referenced in index.ts but file doesn't exist |

### Page Components

| Page | Status | Notes |
|------|--------|-------|
| `LandingPage` | ✅ Complete | Marketing landing with hero + features |
| `LoginPage` | ✅ Complete | With demo login, rate limiter |
| `RegisterPage` | ✅ Complete | Standard registration |
| `DashboardPage` | ✅ Complete | Metrics, pipeline, recent activity, insights |
| `ApplicationsPage` | ✅ Complete | List, filter, sort, paginate, detail slide-over, form modal |
| `ApplicationFormPage` | ✅ Complete | Full-page form with draft-saving |
| `SettingsPage` | ✅ Complete | Profile, appearance, change password |
| `AnalyticsPage` | ⚠️ Placeholder | Not yet implemented |
| `CalendarPage` | ⚠️ Placeholder | Not yet implemented |
| `SavedJobsPage` | ⚠️ Placeholder | Not yet implemented |
| `NotFoundPage` | ✅ Complete | 404 page |

### Feature Components

| Component | Status | Notes |
|-----------|--------|-------|
| `ApplicationFormFields` | ✅ Complete | Shared form fields, wideLayout mode for full page vs modal |
| `ProtectedRoute` | ✅ Complete | Auth guard with loading spinner |
| `ErrorBoundary` | ✅ Complete | Class component, retry + reload, focus management |

### Hooks

| Hook | Status | Notes |
|------|--------|-------|
| `useApplications` | ✅ Complete | Fetch, optimistic CRUD, debounced search, pagination, filter |
| `useDashboard` | ✅ Complete | Fetch dashboard stats with cache |
| `useTheme` | ✅ Complete | Persist, system preference listener, class toggle |
| `useKeyboardShortcuts` | ✅ Complete | Single key + multi-key sequences, modifier keys, ignoreWhenEditing |
| `useDemoRateLimiter` | ✅ Complete | 3 attempts/30s window, cooldown timer |

### Services

| Service | Status | Notes |
|---------|--------|-------|
| `api.ts` | ✅ Complete | Base request with retry, cache read-through |
| `authService` | ✅ Complete | register, login, me, changePassword |
| `applicationService` | ✅ Complete | CRUD + getAll with params |
| `dashboardService` | ✅ Complete | getStats |
| `cache.ts` | ✅ Complete | In-memory cache with TTL, invalidation on mutations |

### Contexts

| Context | Status | Notes |
|---------|--------|-------|
| `AuthContext` | ✅ Complete | User state, token management, login/register/logout |
| `ToastContext` | ✅ Complete | Toast queue with auto-dismiss |

---

## Deliverable 5 — Design System Audit

### Current Design Tokens (from tailwind.config.js)

**Colors:**
- `brand` — Indigo scale (50-950)
- `surface` — White, `#f8fafc`, `#f1f5f9`
- `ink` — `#0f172a`, `#475569`, `#94a3b8`, `#cbd5e1`
- `dark` — `#0a0f1a`, `#111827`, `#1e293b`

**Typography:**
- Font: Inter (sans), JetBrains Mono (mono)
- Custom font sizes: `display`, `heading`, `body`, `caption`, `label`, `stat`, `stat-lg`

**Border Radius:**
- sm: 0.375rem, DEFAULT: 0.5rem, md: 0.625rem, lg: 0.75rem, xl: 1rem, 2xl: 1.25rem

**Shadows:**
- `card`, `card-hover`, `elevated`, `dialog`

**Animations:**
- `fade-in`, `fade-in-up`, `slide-in-right`, `scale-in`, `slide-up`

### Inconsistencies Found

| Issue | Location | Severity |
|-------|----------|----------|
| Some components use hardcoded `border-slate-200` instead of theme tokens | Various | Low |
| Input component doesn't have dark mode variants | `Input.tsx` | High |
| Select component doesn't have dark mode variants | `Select.tsx` | High |
| Textarea doesn't have dark mode variants | `Textarea.tsx` | High |
| EmptyState doesn't have dark mode variants | `EmptyState.tsx` | Medium |
| Skeleton uses `bg-slate-200` without dark variant | `Skeleton.tsx` | Medium |
| Card component has no dark mode styles | `Card.tsx` | Medium |
| Toolbar uses hardcoded `border-slate-200 bg-white` | `Toolbar.tsx` | Medium |
| DropdownMenu uses hardcoded `border-slate-200 bg-white` | `DropdownMenu.tsx` | Medium |
| Dialog uses `bg-white` without dark variant for content | `Dialog.tsx` | High |
| Input label uses `text-ink-secondary` without dark variant | `Input.tsx` | Low |
| No consistent `focus-visible` ring style across all interactive elements | Various | Low |
| Some `text-ink` usages missing `dark:text-white/80` counterparts | Various pages | Medium |
| Toast component is the ONLY one with proper dark mode inside the UI kit | `Toast.tsx` | ✅ Good |

**This is a critical finding:** Most UI components in `client/src/components/ui/` lack dark mode support. Dark mode only works because (1) the Sidebar uses a custom dark background (`#0b1120`), (2) page components like `DashboardPage.tsx` and `ApplicationsPage.tsx` manually add dark: classes, and (3) the Tailwind darkMode class is set. But the reusable UI kit components do NOT have dark mode variants built in.

---

## Deliverable 6 — Color System

### Current State

```
brand:    indigo (#6366f1)
success:  emerald
warning:  amber
danger:   rose
info:     blue
neutral:  purple (used for Interview)
```

### Problems

1. **Light mode feels flat** — Too much white, not enough surface differentiation
2. **Dark mode is inconsistent** — Some components use `bg-dark-surface` (#111827), others use `bg-white` still
3. **Status colors clash** — Interview = purple, Applied = blue, both are cool-toned and hard to distinguish
4. **No semantic color tokens in components** — Most use Tailwind utility classes directly
5. **Sidebar dark mode is hardcoded** — Uses `bg-[#0b1120]` instead of a theme variable

### Recommended Semantic Color System

```css
/* Core */
--color-bg:           #f8fafc  /  #0a0f1a
--color-surface:      #ffffff  /  #111827
--color-surface-alt:  #f1f5f9  /  #1e293b
--color-elevated:     #ffffff  /  #0f172a

/* Text */
--color-text:         #0f172a  /  #f1f5f9
--color-text-secondary: #475569 / #94a3b8
--color-text-tertiary:  #94a3b8 / #64748b

/* Brand */
--color-brand:        #6366f1  /  #818cf8
--color-brand-hover:  #4f46e5  /  #6366f1

/* Semantic */
--color-success:      #10b981  /  #34d399
--color-warning:      #f59e0b  /  #fbbf24
--color-danger:       #ef4444  /  #f87171
--color-info:         #3b82f6  /  #60a5fa

/* Borders */
--color-border:       #e2e8f0  /  #1e293b
--color-border-hover: #cbd5e1  /  #334155
```

---

## Deliverable 7 — Typography System

### Current State

```
display:  1.75rem / 2.25rem  weight:700  tracking:-0.025em
heading:  1.125rem / 1.5rem  weight:600
body:     0.875rem / 1.5rem
caption:  0.75rem / 1rem
label:    0.6875rem / 1rem  tracking:0.06em  weight:600
stat:     2.5rem / 1        weight:700  tracking:-0.03em
stat-lg:  3.25rem / 1       weight:700  tracking:-0.03em
```

### Problems

1. **No heading hierarchy** — Only one heading size (1.125rem). No h1, h2, h3 distinction
2. **Body text is 14px** — Standard but could be larger for readability
3. **Label is 11px with tracking** — Good for labels but inconsistently used
4. **No font weight scale** — Only 500, 600, 700 are used (no 400 body weight documented)
5. **No line-height tokens** — Only inline values
6. **Inconsistent heading usage** — Dashboard uses `text-base font-semibold` (16px), Applications uses same — no visual distinction between page types

### Recommended Typography Scale

```css
--fs-display:  2rem / 2.5rem   w700 -0.03em    /* Hero titles */
--fs-h1:       1.5rem / 2rem   w600 -0.02em    /* Page titles */
--fs-h2:       1.125rem / 1.5rem w600            /* Section headers */
--fs-h3:       1rem / 1.5rem   w600              /* Card titles */
--fs-body:     0.875rem / 1.5rem w400            /* Body text */
--fs-small:    0.8125rem / 1.25rem w400          /* Small text */
--fs-caption:  0.75rem / 1rem   w400             /* Captions */
--fs-label:    0.6875rem / 1rem   w600 0.06em    /* Labels */
--fs-stat:     2.5rem / 1     w700 -0.03em      /* Dashboard stats */
```

---

## Deliverable 8 — Spacing System

### Current State

The app uses Tailwind's default spacing scale inconsistently:
- Cards: `p-4` (16px) or `p-5` (20px)
- Section padding: `py-4 lg:py-5` or `py-5 lg:py-6`
- Grid gaps: `gap-3` (12px) or `gap-4` (16px)
- Form field spacing: `space-y-4` (16px)
- Between widgets: `space-y-4` or `space-y-5` or `space-y-6`

### Problems

1. **Inconsistent** — Some pages use 4-unit spacing, others use 5-unit
2. **No semantic tokens** — Spacing doesn't communicate hierarchy
3. **Too much whitespace on large screens** — Cards float independently
4. **Too little padding on mobile** — `px-3` (12px) is tight on small phones

### Recommended Spacing System

```css
--space-xs:   0.25rem   /* 4px */
--space-sm:   0.5rem    /* 8px */
--space-md:   0.75rem   /* 12px */
--space-lg:   1rem      /* 16px */
--space-xl:   1.5rem    /* 24px */
--space-2xl:  2rem      /* 32px */

/* Semantic */
--space-card-padding:   1rem (16px)  /* All cards */
--space-page-padding:   1.5rem (24px) on desktop, 1rem (16px) on mobile
--space-section-gap:    1.5rem (24px)
--space-widget-gap:     1rem (16px)
--space-form-gap:       1rem (16px)
```

---

## Deliverable 9 — Interaction Model

### Current Interactions

| Interaction | Status | Notes |
|-------------|--------|-------|
| Button hover/active states | ✅ Good | All buttons have hover, active, focus states |
| Card hover effects | ✅ Good | Used on metric cards and list rows |
| Input focus rings | ✅ Good | Brand-colored ring with offset |
| Modal open/close | ✅ Good | Backdrop blur, scale-in animation |
| Toast notifications | ✅ Good | Slide-up animation, auto-dismiss |
| Page loading skeletons | ✅ Good | Dashboard, applications list |
| Optimistic updates | ✅ Good | Instant UI updates on CRUD |
| Keyboard shortcuts | ✅ Good | Single-key (n, /, esc) and multi-key (g+d, g+a) |
| Dark mode toggle | ✅ Good | With system preference detection |
| Collapsible sidebar | ✅ Good | With expand/collapse animation |
| Mobile drawer | ✅ Good | With backdrop overlay |
| Dropdown menus | ✅ Good | With click-outside-to-close |
| Focus trap in dialog | ✅ Good | Tab cycles within dialog |
| Pagination | ✅ Good | With ellipsis for large ranges |
| Draft auto-save | ✅ Good | Debounced localStorage persistence |
| Demo login rate limiter | ✅ Good | With countdown timer |

### Missing Interactions

| Interaction | Priority | Why |
|-------------|----------|-----|
| Drag and drop (pipeline) | Medium | Natural for kanban workflow |
| Command palette (Ctrl+K) | High | Power users need quick access |
| Right-click context menus | Low | Desktop power feature |
| Swipe to delete/archive on mobile | Low | Mobile convenience |
| Pull-to-refresh | Low | Mobile pattern |
| Inline edit (click-to-edit) | Medium | Faster than opening modals |
| Bulk select/action | Medium | Selecting multiple apps |
| Status change animations | Low | Visual feedback for transitions |
| Page transitions | Low | SPA feels instant already |
| Scroll-to-top on navigation | Low | Missing but noticeable |
| URL copy/share for application | Low | Collaboration feature |

---

## Deliverable 10 — Accessibility Report

### WCAG 2.2 Compliance Assessment

| Criteria | Status | Notes |
|----------|--------|-------|
| **1.1.1 Non-text Content** | ⚠️ Partial | Icons have no aria-label in many cases; Sidebar nav icons are decorative (correctly hidden), but action icons (edit, delete, view) lack labels |
| **1.3.1 Info and Relationships** | ⚠️ Partial | Forms use `<label>` correctly, but Dashboard metric cards are `<button>` elements without clear role semantics |
| **1.4.1 Use of Color** | ❌ Fails | Status badges rely solely on color (emerald=offer, rose=rejected); Badge component includes a dot which helps |
| **1.4.3 Contrast (Minimum)** | ⚠️ Partial | Light mode: `text-ink-tertiary` (#94a3b8) on white fails contrast (3.0:1, needs 4.5:1). Dark mode: some `text-white/40` on dark background may fail |
| **1.4.12 Text Spacing** | ✅ Pass | No fixed-height containers that would break |
| **2.1.1 Keyboard** | ⚠️ Partial | Most interactions are keyboard-accessible, but the detail slide-over panel doesn't trap focus; user can Tab outside |
| **2.4.1 Bypass Blocks** | ❌ Fails | Skip-to-content link was recently removed; no other skip mechanism exists |
| **2.4.3 Focus Order** | ⚠️ Partial | Dialog focus trap works, but application list rows use `<button>` for expansion which is fine; slide-over lacks focus management |
| **2.4.7 Focus Visible** | ✅ Pass | Global `focus-visible` ring defined in CSS |
| **2.5.3 Label in Name** | ⚠️ Partial | Icons alone (edit, delete) without text labels fail this |
| **3.2.1 On Focus** | ✅ Pass | No unexpected context changes on focus |
| **3.3.1 Error Identification** | ✅ Pass | Form errors shown with `role="alert"` |
| **3.3.2 Labels or Instructions** | ✅ Pass | All form fields have labels |
| **4.1.2 Name, Role, Value** | ⚠️ Partial | Badge component uses `<span>` without role; interactive cards need `role="button"` |

### Critical A11y Issues

1. **Color contrast** — `text-ink-tertiary` (#94a3b8) on white (#ffffff) = 3.0:1 ratio (fails AA 4.5:1)
2. **Skip-to-content removed** — No way for keyboard users to bypass nav
3. **Action icons lack labels** — Edit, delete, view buttons have no `aria-label`
4. **Slide-over lacks focus trap** — Can Tab outside the panel
5. **Status relies on color** — Badge dot helps but isn't sufficient alone

---

## Deliverable 11 — Performance Report

### Current Performance Profile

| Metric | Status | Notes |
|--------|--------|-------|
| **Route-level code splitting** | ✅ Good | `React.lazy` for all 11 routes |
| **Bundle size** | ⚠️ Unknown | Needs audit with `vite build --report` |
| **Image optimization** | N/A | No images used |
| **CSS size** | ⚠️ Moderate | Tailwind generates ~10-20KB gzipped |
| **JavaScript** | ⚠️ Moderate | React + React Router + app code |
| **API caching** | ✅ Good | In-memory cache with 30s TTL |
| **Debounced search** | ✅ Good | 350ms debounce on search input |
| **Optimistic updates** | ✅ Good | Instant UI, rollback on failure |
| **Skeleton loading** | ✅ Good | Dashboard, applications list |
| **Memoization** | ⚠️ Partial | `useCallback` used in hooks, `useMemo` used in password strength, but not applied broadly in page components |
| **Re-render optimization** | ⚠️ Partial | `useKeyboardShortcuts` uses ref to avoid re-registration, but page components may re-render unnecessarily |
| **Font loading** | ⚠️ Unknown | Inter from Google Fonts (likely external request) |
| **Vite build output** | ⚠️ Unknown | Should check chunk sizes |

### Performance Issues

1. **No bundle analysis** — Unknown chunk sizes
2. **Font loading** — Inter from Google Fonts adds external request; should self-host
3. **No image optimization** — No images now, but should plan for company logos
4. **No virtualization** — List could have hundreds of applications eventually
5. **No service worker** — No offline support
6. **No prefetching** — Dashboard page doesn't prefetch applications list
7. **No React.memo on list items** — Each application row re-renders on parent state change

---

## Deliverable 12 — Prioritized Roadmap

### Critical (Must fix for launch)

| # | Item | Area | Effort | Impact |
|---|------|------|--------|--------|
| 1 | Analytics page: real charts + trends | Feature | 3-4 days | High |
| 2 | Pipeline/Kanban view | Feature | 3-4 days | High |
| 3 | Calendar view for interviews/deadlines | Feature | 2-3 days | High |
| 4 | Global search (Ctrl+K command palette) | Feature | 1-2 days | High |
| 5 | Notification system (interview reminders, follow-ups) | Feature | 2-3 days | High |
| 6 | Password reset flow | Feature | 1 day | High |
| 7 | Model: add salary, location, employment type, company logo URL | Data | 1 day | High |
| 8 | Fix color contrast (ink-tertiary) | Accessibility | 0.5 day | High |

### High Priority

| # | Item | Area | Effort | Impact |
|---|------|------|--------|--------|
| 9 | Saved Jobs page implementation | Feature | 1 day | High |
| 10 | Add aria-labels to all icon-only buttons | Accessibility | 0.5 day | High |
| 11 | Slide-over focus trap | Accessibility | 0.5 day | High |
| 12 | Onboarding flow for new users (guided first steps) | UX | 2 days | Medium |
| 13 | Bulk import/export (CSV) | Feature | 1-2 days | Medium |
| 14 | Application duplication | Feature | 0.5 day | Medium |
| 15 | Detail slide-over tabs (overview, timeline, JD, notes) | UX | 1 day | Medium |
| 16 | Dark mode for all UI kit components | Design | 0.5 day | Medium |

### Medium Priority

| # | Item | Area | Effort | Impact |
|---|------|------|--------|--------|
| 17 | Inline edit for status on list rows | UX | 1 day | Medium |
| 18 | Company logos/avatars in list | UX | 1 day | Medium |
| 19 | Dashboard goal tracking (weekly targets) | Feature | 2 days | Medium |
| 20 | Page transition animations | UX | 1 day | Low |
| 21 | Self-host Inter font | Performance | 0.5 day | Medium |
| 22 | Application timeline/activity log per app | Feature | 1-2 days | Medium |
| 23 | Bulk select + actions | Feature | 1 day | Medium |
| 24 | Status change confirmation (or undo) | UX | 0.5 day | Low |

### Low Priority

| # | Item | Area | Effort | Impact |
|---|------|------|--------|--------|
| 25 | PDF resume upload/storage | Feature | 2 days | Medium |
| 26 | Email sync integration | Feature | 3-4 days | Low |
| 27 | AI-powered JD summarization | Feature | 2-3 days | Low |
| 28 | Team collaboration | Feature | Large | Low |
| 29 | API for third-party integrations | Feature | 2-3 days | Low |
| 30 | Service worker + offline support | Performance | 1-2 days | Low |
| 31 | List virtualization | Performance | 1 day | Low |
| 32 | Dark mode subtle animations | UX | 0.5 day | Low |

---

## Deliverable 13 — Implementation Plan

### Phase Strategy

Each phase is independently shippable. The ordering prioritizes (1) filling critical feature gaps, (2) improving UX maturity, (3) polishing to production quality.

---

### Phase 1: Core Data Model Expansion (1 day)

**What:** Add missing fields to the Application model
- Salary range, location, employment type, remote status
- Company logo URL
- Migration script

**Why:** These fields are fundamental to making each application row information-rich. Everything downstream (list, filters, analytics, calendar) benefits.

**Files:** `server/prisma/schema.prisma`, `server/src/controllers/application-controller.ts`, `client/src/types/index.ts`, `client/src/constants/applications.ts`, `client/src/components/ApplicationFormFields.tsx`

---

### Phase 2: Analytics Page (3-4 days)

**What:** Replace placeholder with real analytics
- Application trend chart (applications over time)
- Pipeline conversion funnel (Saved → Applied → Interview → Offer)
- Response/interview/offer rate cards (already have data)
- Source breakdown (already have data)
- Timeline of activity
- Rejection reasons word cloud (from notes)
- Weekly/monthly application counts

**Why:** Analytics is the second-most-visited page in a job search tracker. It's currently a placeholder.

**Files:** `client/src/pages/AnalyticsPage.tsx`, `client/src/services/analyticsService.ts`, `server/src/routes/analytics-routes.ts`, `server/src/controllers/analytics-controller.ts`

**Library:** Use Recharts (already compatible with React) for charts

---

### Phase 3: Pipeline / Kanban View (3-4 days)

**What:** New page at `/applications/pipeline`
- 6 columns (Saved, Applied, Assessment, Interview, Rejected, Offer)
- Drag and drop between columns
- Stage counts at column header
- Quick-status-change via dnd
- Smooth animations
- Collapsible columns

**Why:** Pipeline view is the natural way to visualize job search progress. List view is for detailed inspection.

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable` for accessible drag and drop

**Files:** `client/src/pages/PipelinePage.tsx`, `App.tsx` (add route), `Sidebar.tsx` (add nav item)

---

### Phase 4: Calendar View (2-3 days)

**What:** Replace placeholder with interview/event calendar
- Month view with interview badges
- Agenda/list view for upcoming events
- Click to see interview details
- Color-coded by status
- Quick-add interview from calendar

**Why:** Calendar is a primary planning tool for job seekers.

**Library:** Build custom using CSS grid, or use a lightweight calendar library

**Files:** `client/src/pages/CalendarPage.tsx`

---

### Phase 5: Command Palette + Global Search (1-2 days)

**What:** Ctrl+K command palette
- Search across applications, companies
- Quick actions: Add Application, Go to Dashboard, Go to Settings
- Navigate by typing
- Keyboard shortcut (Ctrl+K / Cmd+K)
- Fuzzy search

**Why:** Power users navigate via keyboard. Command palette is the fastest way to find anything.

**Files:** `client/src/components/CommandPalette.tsx`, `client/src/hooks/useCommandPalette.ts`, `App.tsx` (integrate)

---

### Phase 6: Notification System (2-3 days)

**What:** In-app notification center
- Interview reminders (upcoming, today, tomorrow)
- Follow-up overdue detection
- Application inactivity warnings (no update in 14+ days)
- Deadline alerts
- Notification bell in sidebar header
- Notification dropdown

**Why:** Job seekers forget to follow up. A notification system increases engagement and usefulness.

**Files:** `client/src/context/NotificationContext.tsx`, `client/src/components/NotificationBell.tsx`, `server/src/routes/notification-routes.ts`

---

### Phase 7: Accessibility & Polish (1-2 days)

**What:** Fix all a11y issues + UI polish
- Fix color contrast (ink-tertiary from #94a3b8 to #64748b or darker)
- Add aria-labels to all icon-only buttons
- Slide-over focus trap
- Dark mode for all UI kit components
- Consistent spacing system
- Page title updates on navigation
- Scroll-to-top on route change

**Why:** Accessibility is a requirement for production. Dark mode consistency is a polish issue.

---

### Phase 8: Onboarding & Empty States (1-2 days)

**What:** Guide new users from signup to first value
- Setup checklist on first login
- Step-by-step: "Add your first application"
- "Import from LinkedIn" or "Add manually" choice
- Helpful tooltip on first visit to each page
- Enhanced empty states with illustrations

**Why:** First-run experience determines retention. Current empty state is passive.

---

### Phase 9: Saved Jobs Page (1 day)

**What:** Replace placeholder
- List of saved/bookmarked jobs
- Status: Want to Apply, Applied, Archived
- Quick-add from saved → application
- Tags, notes per saved job

**Why:** Already in nav and sidebar. Should work.

---

### Phase 10: Bulk Actions & Export (1-2 days)

**What:** Power features
- Multi-select applications (checkboxes + shift-click range)
- Bulk status change
- Bulk archive/delete
- CSV export of all applications
- PDF summary report

**Why:** These are expected in any data management tool.

---

### Phase 11: Design System Hardening (1 day)

**What:** Component library completeness
- Add dark mode variants to all UI kit components
- Build theme tokens into CSS custom properties
- Create visual regression documentation
- Snapshot tests for components

**Why:** A consistent design system prevents visual drift as the app grows.

---

### Phase 12: Performance Optimization (1 day)

**What:** Make everything fast
- Bundle analysis + optimization
- Self-host Inter font
- React.memo on list items
- Virtualized list (react-window) for 100+ items
- Prefetch dashboard → applications data
- Service worker for offline cache

---

## Summary: Current Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **Architecture** | 7/10 | Clean separation, optimistic updates, caching — but data model incomplete |
| **Code Quality** | 8/10 | Well-structured hooks, services, components. TypeScript strictness is good |
| **UX Maturity** | 5/10 | Functional but not delightful. Missing key flows (analytics, pipeline, calendar) |
| **Design Maturity** | 4/10 | Generic UI, inconsistent dark mode, flat color system |
| **Accessibility** | 5/10 | Focus rings good, but contrast fails, no skip link, missing labels |
| **Performance** | 7/10 | Code splitting, caching, debouncing all good. Missing prefetching and virtualization |
| **Documentation** | 6/10 | .ai files good, docs/ exists but gaps |
| **Engineering Practices** | 7/10 | Types, hooks, patterns all clean. Tests exist |

**Overall: 6/10 — Functional prototype, needs product thinking**

---

*End of audit. Ready for implementation.*
