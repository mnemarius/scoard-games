# Styling

## Stack

Tailwind CSS v3 with a custom `brand` palette. No CSS modules; all styling is done with Tailwind utility classes. Avoid creating new CSS files unless absolutely necessary.

## Brand Palette (Purple)

Defined in `tailwind.config.js`:

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#f5f3ff` | hover backgrounds, subtle fills |
| `brand-100` | `#ede9fe` | active backgrounds |
| `brand-200` | `#ddd6fe` | borders, rings |
| `brand-400` | `#a78bfa` | light accents |
| `brand-500` | `#8b5cf6` | primary color |
| `brand-600` | `#7c3aed` | primary buttons, active nav links |
| `brand-700` | `#6d28d9` | hover state on primary |

Use `slate` for neutral text and backgrounds. Use `red` variants for destructive actions.

## Shared Components

### Button (`src/components/Button.tsx`)

| Variant | When to use |
|---------|-------------|
| `primary` | Main CTA (brand-600 bg, white text) |
| `secondary` | Secondary actions (white bg, slate border) |
| `ghost` | Tertiary / icon-only actions |
| `danger` | Destructive actions (red-600 bg) |

Sizes: `sm` | `md` (default).

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