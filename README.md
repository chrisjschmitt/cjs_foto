# Christopher Schmitt Photographs

Artist portfolio website built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for image storage. Deployed on [Vercel](https://vercel.com).

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── globals.css           # Tailwind config, custom theme
│   ├── admin/page.tsx        # Password-protected admin page
│   └── api/
│       ├── auth/route.ts     # Login (POST)
│       ├── portfolio/route.ts # CRUD for portfolio series
│       ├── upload/route.ts   # Create new series with images
│       ├── upload-image/     # Single image upload endpoint
│       └── recover/route.ts  # Manifest recovery tool
├── components/
│   ├── Header.tsx            # Sticky navigation
│   ├── Hero.tsx              # Landing hero section
│   ├── ArtistStatement.tsx   # Artist statement
│   ├── Portfolio.tsx         # Portfolio grid with category filters
│   ├── PortfolioCard.tsx     # Individual portfolio card
│   ├── Lightbox.tsx          # Fullscreen image viewer with swipe
│   └── Footer.tsx            # Contact, social links, CV
└── lib/
    ├── portfolio-data.ts     # Vercel Blob manifest & image helpers
    └── auth.ts               # Password verification
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token (auto-added when you connect a Blob store) |
| `ADMIN_PASSWORD` | Yes | Password for the `/admin` page |

### Setup

1. In your Vercel project, go to **Storage** > **Create** > **Blob** and connect it to your project.
2. Go to **Settings** > **Environment Variables** and add `ADMIN_PASSWORD` with your chosen password.
3. Redeploy.

For local development, create `.env.local`:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
ADMIN_PASSWORD=your-password
```

## Admin Page (`/admin`)

The password-protected admin page lets you manage your portfolio:

- **Create Series** — upload one or more images with a series title, category, year, and description. Each image has its own name, year, and optional description.
- **Add Images** — add more images to an existing series.
- **Edit** — update series or individual image metadata inline.
- **Reorder** — use arrow buttons to reorder images within a series. First image is the cover.
- **Delete** — remove individual images or entire series.

Images are uploaded one at a time to avoid request size limits. Upload progress is shown.

## Homepage

- **Hero** — title, tagline, and "View Work" button.
- **Artist Statement** — editable in `src/components/ArtistStatement.tsx`.
- **Portfolio** — displays all series from Vercel Blob with category filter buttons. Clicking a card opens a fullscreen lightbox with swipe navigation, thumbnails, and per-image metadata (name, year, description).
- **Footer** — contact email, Instagram, Behance, CV download.

## Customizing Content

| What to change | File |
|---|---|
| Site title & SEO description | `src/app/layout.tsx` |
| Hero heading, tagline | `src/components/Hero.tsx` |
| Artist statement | `src/components/ArtistStatement.tsx` |
| Contact email & social links | `src/components/Footer.tsx` |
| Navigation links | `src/components/Header.tsx` |

## CV

Place your CV as `public/cv.pdf`. It is linked in the footer and served at `/cv.pdf`.
