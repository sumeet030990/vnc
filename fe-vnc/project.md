## UI/Theme Guidelines

- **Style**: Clean, minimal design with elevated 3D-style cards (soft shadows, subtle depth, rounded corners) and smooth micro-animations on hover/load (use MUI's `Fade`, `Grow`, or `framer-motion` for transitions).
- **Mode**: Light theme only — no dark mode toggle needed.
- **Primary color**: Indigo (`#3F51B5` or MUI's `indigo[600]`) as primary, with a soft teal (`#26A69A`) as secondary accent for highlights/CTAs.
- **Layout**: Top bar only (no sidebar) — use MUI `AppBar` with navigation tabs/menu items inline; content area is full-width below the bar.
- **Cards**: Use `Card` with `elevation={3}` or custom `boxShadow`, `borderRadius: 12px`, hover effect scaling slightly (`transform: scale(1.02)`) with transition.
- **Typography**: Rely on MUI's default Roboto with clear hierarchy (h5/h6 for card titles, body2 for meta info).
- Always refer to this section when generating dashboard components, cards, or theme config (`createTheme`).
