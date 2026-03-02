# AGENTS.md

## Cursor Cloud specific instructions

This repository (`cjs_foto`) is an artist portfolio website built with **Next.js 15**, **TypeScript**, **Tailwind CSS v4**, and deployed to **Vercel**.

- **Dev server:** `npm run dev` (port 3000)
- **Lint / Build / Start:** see `package.json` scripts or `README.md`
- Tailwind v4 uses the `@import "tailwindcss"` directive and `@theme` block in `src/app/globals.css` — there is no `tailwind.config.ts` file.
- Artwork entries live in `src/components/Portfolio.tsx` as a data array; replace placeholder gradients with real images when available.
- The project uses the Next.js App Router (`src/app/`).
