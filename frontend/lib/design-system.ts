/**
 * Design System Configuration
 * Premium SaaS aesthetic inspired by Stripe, Linear, Vercel
 * Dark mode optimized for mental health (calming colors)
 */

// Color Palette - Mental Health Friendly
export const colors = {
  // Neutral Scale
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Primary: Calming Blue (for primary actions, trust, safety)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },

  // Success: Calming Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  // Warning: Soft Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Danger: Soft Rose (urgent but not harsh)
  danger: {
    50: '#fff5f7',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Accent: Purple (for secondary actions, insights)
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Info: Cyan (for information, insights)
  info: {
    50: '#ecf9ff',
    100: '#cff9ff',
    200: '#a5f2ff',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
};

// Typography Scale
export const typography = {
  // Display sizes
  display: {
    lg: {
      fontSize: '3.5rem', // 56px
      lineHeight: '1.1',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    md: {
      fontSize: '2.25rem', // 36px
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.015em',
    },
    sm: {
      fontSize: '1.875rem', // 30px
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.01em',
    },
  },

  // Heading sizes
  h1: {
    fontSize: '1.875rem', // 30px
    lineHeight: '1.3',
    fontWeight: '700',
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '1.5rem', // 24px
    lineHeight: '1.4',
    fontWeight: '700',
    letterSpacing: '-0.005em',
  },
  h3: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.4',
    fontWeight: '600',
  },
  h4: {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.4',
    fontWeight: '600',
  },

  // Body text
  body: {
    lg: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      fontWeight: '400',
    },
    base: {
      fontSize: '0.9375rem', // 15px
      lineHeight: '1.6',
      fontWeight: '400',
    },
    sm: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: '400',
    },
    xs: {
      fontSize: '0.8125rem', // 13px
      lineHeight: '1.5',
      fontWeight: '400',
    },
  },

  // Code/Mono
  mono: {
    base: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontFamily: 'JetBrains Mono, monospace',
    },
  },
};

// Spacing Scale (8px base unit)
export const spacing = {
  0: '0',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

// Shadows - Soft, premium feel
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  
  // Glass effect (for cards, panels)
  glass: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.2)',
  glassDark: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.3)',
};

// Border Radius
export const radius = {
  none: '0',
  sm: '0.375rem', // 6px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.25rem', // 20px
  full: '9999px',
};

// Transitions & Animations
export const transitions = {
  fast: 'all 150ms ease-in-out',
  base: 'all 200ms ease-in-out',
  slow: 'all 300ms ease-in-out',
  verySlow: 'all 500ms ease-in-out',
};

// Component-specific tokens

// Button styles
export const buttonTokens = {
  primary: {
    bg: colors.primary[600],
    bgHover: colors.primary[700],
    text: '#ffffff',
    border: 'transparent',
  },
  secondary: {
    bg: colors.slate[700],
    bgHover: colors.slate[800],
    text: colors.slate[100],
    border: colors.slate[600],
  },
  ghost: {
    bg: 'transparent',
    bgHover: colors.slate[700],
    text: colors.slate[300],
    border: 'transparent',
  },
};

// Card styles
export const cardTokens = {
  bg: colors.slate[800],
  border: colors.slate[700],
  shadow: shadows.base,
};

// Input styles
export const inputTokens = {
  bg: colors.slate[900],
  border: colors.slate[700],
  borderFocus: colors.primary[500],
  text: colors.slate[100],
  placeholder: colors.slate[500],
};
