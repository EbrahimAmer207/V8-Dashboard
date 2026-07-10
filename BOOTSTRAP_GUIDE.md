# Quick Start Bootstrap Custom Configuration

This guide explains the custom Bootstrap 5 configuration for the modern SaaS look.

## Installation

Bootstrap 5 is imported in `styles/globals.scss`:

```scss
@import 'bootstrap/scss/...';
@import './custom.scss';
```

## Custom Variables

Edit `styles/variables.scss` to customize:

```scss
// Color Palette
$primary: #4f46e5;        // Indigo
$secondary: #6b7280;      // Gray
$success: #10b981;        // Green
$danger: #ef4444;         // Red
$warning: #f59e0b;        // Amber
$info: #3b82f6;          // Blue

// Typography
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
$font-size-base: 0.95rem;
$line-height-base: 1.6;

// Spacing
$spacer: 1rem;

// Borders & Shadows
$border-radius: 0.5rem;
$box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
$box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

## Component Customizations

### Buttons

```typescript
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="success">Success Button</Button>
```

Features:
- Smooth hover effects
- Gradient backgrounds
- Rounded corners
- Box shadow on hover

### Cards

```typescript
<Card className="border-0 shadow-sm">
  <Card.Header className="bg-light border-bottom">
    <h5>Card Title</h5>
  </Card.Header>
  <Card.Body>
    Content here
  </Card.Body>
</Card>
```

Features:
- Minimal borders
- Subtle shadows
- Light backgrounds
- Smooth hover animations

### Tables

```typescript
<Table hover>
  <thead>
    <tr>
      <th>Column</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</Table>
```

Features:
- Clean header styling
- Hover effects
- Proper spacing
- Modern appearance

### Forms

```typescript
<div className="mb-3">
  <label htmlFor="input" className="form-label">Label</label>
  <input type="text" className="form-control" id="input" />
</div>
```

Features:
- Focus indicators
- Color transitions
- Accessible labels
- Consistent spacing

### Badges

```typescript
<Badge className="bg-primary">Primary</Badge>
<Badge className="bg-success">Success</Badge>
<Badge className="bg-danger">Danger</Badge>
```

Features:
- Rounded edges
- Consistent sizing
- Color variations
- Professional appearance

### Alerts

```typescript
<Alert variant="info" dismissible>
  Information message
</Alert>
<Alert variant="success" dismissible>
  Success message
</Alert>
```

Features:
- Color-coded messaging
- Dismissible option
- Clear hierarchy
- Accessibility compliant

## Dark Mode Support

Dark mode styles are in `custom.scss`:

```scss
[data-bs-theme='dark'] {
  .card {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .form-control {
    background-color: #374151;
    color: #d1d5db;
  }
  
  // ... more dark mode styles
}
```

To enable dark mode:
```typescript
// In your component
document.documentElement.setAttribute('data-bs-theme', 'dark');
```

## Color System

### Primary Colors
- **Primary**: #4f46e5 (Actions, highlights)
- **Secondary**: #6b7280 (Secondary elements)

### Semantic Colors
- **Success**: #10b981 (Positive actions)
- **Danger**: #ef4444 (Destructive actions)
- **Warning**: #f59e0b (Cautions)
- **Info**: #3b82f6 (Information)

### Neutral Colors
- **Light**: #f9fafb (Backgrounds)
- **Dark**: #111827 (Text)
- **Border**: #e5e7eb (Dividers)

## Spacing Scale

```
$spacer: 1rem (16px base)

Multiples:
- 0.25rem = 4px
- 0.5rem = 8px
- 1rem = 16px
- 1.5rem = 24px
- 2rem = 32px
- 3rem = 48px
```

## Shadow Effects

```scss
// Light shadow
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

// Medium shadow
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

// Large shadow
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

## Border Radius Scale

```
- sm: 0.25rem (4px)
- md: 0.5rem (8px) - Default
- lg: 0.75rem (12px)
- xl: 1rem (16px)
- full: 9999px (Rounded)
```

## Typography

### Font Stack
```
-apple-system,      // San Francisco (macOS/iOS)
BlinkMacSystemFont, // Fallback for macOS
'Segoe UI',        // Windows
Roboto,            // Android
'Helvetica Neue',  // Fallback
Arial,             // Fallback
sans-serif         // Fallback
```

### Font Sizes
- `small`: 0.875rem
- `base`: 0.95rem
- `h5`: 1.25rem
- `h4`: 1.5rem
- `h3`: 1.875rem
- `h2`: 2.25rem
- `h1`: 3rem

## Transitions & Animations

```scss
$transition-base: all 0.3s ease-in-out;

// Fade in animation
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

// Slide up animation
.slide-in-up {
  animation: slideInUp 0.3s ease-in-out;
}
```

## Responsive Classes

Bootstrap provides responsive utilities:

```html
<!-- Hidden on small screens -->
<div class="d-none d-md-block">Only on medium screens and up</div>

<!-- Column layout -->
<div class="row">
  <div class="col-12 col-md-6 col-lg-4">
    Responsive columns
  </div>
</div>

<!-- Flexbox utilities -->
<div class="d-flex align-items-center justify-content-between">
  Flex layout
</div>
```

## Utility Classes

```html
<!-- Padding -->
<div class="p-4">All sides</div>
<div class="px-4">Left and right</div>
<div class="py-2">Top and bottom</div>

<!-- Margin -->
<div class="m-4">All sides</div>
<div class="mx-auto">Horizontal center</div>
<div class="mb-0">Remove bottom margin</div>

<!-- Text -->
<p class="text-primary">Colored text</p>
<p class="text-muted">Muted text</p>
<p class="fw-bold">Bold text</p>
<p class="text-center">Centered text</p>

<!-- Shadows -->
<div class="shadow-sm">Light shadow</div>
<div class="shadow-lg">Large shadow</div>
```

## Custom Components

### Sidebar Navigation
```typescript
<nav className="nav flex-column gap-2">
  <a href="#" className="nav-link active">Active Item</a>
  <a href="#" className="nav-link">Inactive Item</a>
</nav>
```

### Stats Cards
```typescript
<Card className="border-0 shadow-sm">
  <Card.Body>
    <p className="text-muted small">Label</p>
    <h2 className="h4 fw-bold">1,234</h2>
    <small className="text-success">+5.2%</small>
  </Card.Body>
</Card>
```

### Data Table
```typescript
<Table hover className="mb-0">
  <thead className="bg-light">
    <tr><th>Column</th></tr>
  </thead>
  <tbody>
    <tr><td>Data</td></tr>
  </tbody>
</Table>
```

## Best Practices

✅ **DO:**
- Use Bootstrap utility classes for quick styling
- Leverage CSS variables for consistency
- Apply custom variables for branding
- Use semantic color meanings
- Maintain accessibility standards

❌ **DON'T:**
- Inline styles (use classes instead)
- Override Bootstrap variables globally
- Mix spacing scales
- Ignore color contrast ratios
- Hardcode colors in components

## Performance

The custom configuration:
- Uses SCSS for efficient compilation
- Leverages Bootstrap's built-in utilities
- Minimizes custom CSS
- Optimizes bundle size
- Enables tree-shaking of unused styles

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers (iOS, Android)

---

**This modern Bootstrap configuration provides a premium SaaS dashboard appearance!**
