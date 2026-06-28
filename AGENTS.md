# Hare Krishna Practice Dashboard — Agent Instructions

## Project goal

We are building a React + Vite + TypeScript dashboard for tracking spiritual practice: japa, reading books, memorizing verses, calendar, friends, reminders and progress.

The visual style is soft, calm, devotional, pastel, clean and premium. The product should feel like a quiet personal space for spiritual practice, not like a corporate analytics dashboard.

## Design rules

- Keep the layout close to the approved dashboard direction.
- Main app container max-width: `1540px` and centered.
- Use a warm milk / ivory page background.
- Cards should be soft white or slightly warm, with subtle borders and soft shadows.
- Use lavender, green and golden accent colors.
- Avoid harsh contrast, neon colors, sharp borders, heavy shadows and random redesigns.
- Use rounded cards, soft gradients and delicate decorative lotus elements.
- Use Nunito as the base font for all UI typography.
- Follow the detailed design tokens in `docs/design-system.md`; the visual reference is saved at `docs/assets/design-system-reference.png`.
- Preserve existing visual rhythm unless the user explicitly asks to change it.

## Development rules

- Use React + Vite + TypeScript.
- Prefer `type` over `interface`.
- Use CSS Modules for component styles.
- Keep global colors/radius/shadow tokens in `src/shared/styles/tokens.css`.
- Do not use Tailwind at this stage.
- Do not add new dependencies unless there is a strong reason.
- Keep assets in `src/shared/assets/`.
- Every substantial component should live in its own folder with `.tsx` and `.module.css`.

## Component workflow

When the user asks to work on a component:

1. Identify the exact component.
2. Edit only that component's `.tsx` and `.module.css` files unless a shared token is required.
3. Preserve the rest of the dashboard.
4. Keep spacing, colors and typography consistent with the design system.
5. Explain briefly what changed.

## Important UX rule

The user wants precise, controlled iterations.
Do not redesign the whole screen when asked to change one card.
Do not randomly change colors, layout, icons, typography, shadows, radii or spacing outside the requested component.

## User preference

The user prefers TypeScript `type` aliases over `interface`.
