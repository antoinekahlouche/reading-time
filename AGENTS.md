# AGENTS.md

Reading Time is a bookshelf and PDF reader for kids on older iPads.

- Target iOS Safari 8+ and keep `package.json` targets aligned.
- Covers must render on old iPads; use old CSS fallbacks before modern enhancements.
- Avoid required modern CSS like `aspect-ratio`, CSS Grid-only layout, `min()`, `max()`, `clamp()`, `env()`, or `svh` unless there is a safe fallback.
- Avoid modern JavaScript unless Babel transpiles it or `public/polyfills.js` covers it.
- Keep controls big, obvious, touch-friendly, and usable without keyboard or mouse.
- Keep copy short and friendly for children.
- Source is `src/app.js`; run `bun run build` after changing it.
- Verify covers, reader navigation, saved position, and iPad-sized layouts when relevant.
