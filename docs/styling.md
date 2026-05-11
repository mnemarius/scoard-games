# Styling

## Stack

Tailwind CSS v3 with a semantic, token-driven palette. Colour scales are declared as RGB-triplet CSS custom properties in `src/index.css` and exposed to Tailwind via `tailwind.config.js` using `rgb(var(--…) / <alpha-value>)`. No CSS modules; all styling is done with Tailwind utility classes. Avoid creating new CSS files unless absolutely necessary.

## Palette

Four anchor colours drive the theme. Each anchor seeds a 50–900 scale (see `src/index.css`):

| Role | Anchor | Hex | Tailwind token |
|------|--------|-----|----------------|
| Primary | Tan | `#6a463a` | `primary-500` |
| Accent | Tangerine | `#df9841` | `accent-500` |
| Success | Celadon | `#9ab19a` | `success-400` |
| Surface (light) | Cream | `#fff8dd` | `bg-surface` |

Other semantic scales (`warning`, `danger`, `neutral`) are tuned to harmonise with the warm anchors. Surface and content tokens follow light/dark mode through the `.dark` class.

### Usage guidance

- **Primary** (`primary-600`/`700`): main CTAs, active nav, focus rings.
- **Accent** (`accent-500`): highlights, badges, secondary emphasis.
- **Success** (`success-400`/`600`): winners, positive states, leaderboard accents.
- **Surface**: layered system — `bg-surface` is the dark tan page; `bg-surface-raised` is cream cards/modals; `bg-surface-sunken` is a deeper tan well; `bg-surface-input` is sand-cream so form fields recess inside cream cards.
- **Content**: two-context typography. `text-content` is dark (lands on cream surfaces — cards, modals, inputs). `text-content-inverse` is cream (lands directly on the dark tan page — `PageHeader`, back-links, footer). `text-content-muted` / `text-content-subtle` are dampened variants of dark for use inside cards. Use `/75`, `/60` opacity on `content-inverse` for muted on-page text.
- **Neutral**: borders, dividers, disabled states. Tuned cream-tinted so `border-neutral-200` stays visible on cream cards.
- **Danger** (`danger-600`): destructive actions only.

### When to use which text color

| Context | Token |
|---------|-------|
| Page-level title / subtitle | `text-content-inverse` |
| Back links, footer notes | `text-content-inverse/75` (or `/60`) |
| Inside a Card / Modal | `text-content`, `text-content-muted`, `text-content-subtle` |
| Inverse on dark tan badge | `text-content-inverse` |

## Shared Components

### Button (`src/components/Button.tsx`)

Buttons combine a **tone** (color role) with a **variant** (visual weight). Both default to a sensible setting so most call sites can be bare `<Button>...</Button>`.

| Prop | Default | Options |
|------|---------|---------|
| `tone` | `accent` | `primary` (tan), `accent` (tangerine), `success` (celadon), `warning`, `danger`, `neutral` |
| `variant` | `solid` | `solid`, `outline`, `ghost` |
| `size` | `md` | `sm`, `md` |

Why `accent` is the default: the page background is dark tan, which is the same hue as `tone="primary"`. A solid primary button would blend into the page. Tangerine (`accent`) is the high-contrast CTA color and pops on both the dark page and cream cards.

Typical pairings:

| Use | Markup |
|-----|--------|
| Main CTA on a page header | `<Button>+ New campaign</Button>` (default solid tangerine) |
| Form submit | `<Button type="submit">Save</Button>` |
| Cancel / secondary | `<Button variant="outline" tone="neutral">Cancel</Button>` |
| Delete / destructive | `<Button variant="ghost" tone="danger">Delete</Button>` |
| Subdued action inside a card | `<Button variant="ghost" tone="neutral">Edit</Button>` |

### Card (`src/components/Card.tsx`)

```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

Border + rounded-lg + shadow-sm wrapper. `CardHeader` has a bottom border separator.

### Modal (`src/components/Modal.tsx`)

- Overlay with backdrop blur
- ESC key closes
- Sizes: `md` (max-w-md) | `lg` (max-w-2xl)
- Footer slot for action buttons
- Locks body scroll while open

### Form Inputs (`src/components/TextField.tsx`)

- `TextField` — labeled `<input>` with optional hint and error message
- `TextArea` — 3-row `<textarea>`
- `Select` — styled `<select>` wrapper

All share the same `inputClass` styling for consistent focus rings and borders.

### Other Primitives

- `PageHeader` — title + optional subtitle + right-aligned action slot
- `EmptyState` — dashed border, icon slot, title, description, action
- `StatTile` — uppercase label + large value + optional hint (used on Dashboard)

## Conventions

- Responsive grids: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Consistent gap scale: `gap-2`, `gap-4`, `gap-6`
- Rounded corners: `rounded-lg` for cards, `rounded-xl` for modals
- Shadows: `shadow-sm` for cards, `shadow-md`/`shadow-xl` for overlaid elements
- Transitions: `transition-colors`, `transition-opacity` on interactive elements
- Disabled state: `opacity-50 cursor-not-allowed`
- Focus rings: `focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`
- Player avatars: circle with first letter of name, background color from player's chosen color