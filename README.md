# cjs_foto

Artist's website — a portfolio landing page built with [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com), deployed to [Vercel](https://vercel.com).

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

## Customizing Content

All content lives in plain JSX components under `src/components/`. Edit the file, save, and the dev server hot-reloads your changes.

| What to change | File |
|---|---|
| Site title & SEO description | `src/app/layout.tsx` — the `metadata` object |
| Hero heading, tagline, subtitle | `src/components/Hero.tsx` |
| Artist statement text | `src/components/ArtistStatement.tsx` |
| Portfolio artwork entries (titles, categories, descriptions, images) | `src/components/Portfolio.tsx` |
| Contact email & social links | `src/components/Footer.tsx` |
| Navigation link labels | `src/components/Header.tsx` |

## Adding Images

1. Place your image files in the `public/` directory (e.g. `public/photos/morning-stillness.jpg`). Any file in `public/` is served at the site root, so that file becomes `/photos/morning-stillness.jpg`.

2. Update the artwork entries in `src/components/Portfolio.tsx`. Add an `image` field to the `ArtworkItem` interface and each entry in the `artworks` array:

```ts
export interface ArtworkItem {
  id: number;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;    // path relative to public/
  href: string;
}
```

```ts
{
  id: 1,
  title: "Morning Stillness",
  category: "Landscape",
  year: "2025",
  description: "Dawn light filtering through coastal mist.",
  image: "/photos/morning-stillness.jpg",
  href: "#",
},
```

3. Update `src/components/PortfolioCard.tsx` to render the image instead of the placeholder gradient:

```tsx
<img
  src={artwork.image}
  alt={artwork.title}
  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
/>
```

## Uploading Photos via the Admin Page

The site includes an admin page at `/admin` where you can upload photos directly through the browser.

### Setup

1. In your Vercel project, go to **Storage** and create a new **Blob** store.
2. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project.
3. For local development, copy the token to a `.env.local` file:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### Usage

1. Navigate to `/admin` on your deployed site (or `http://localhost:3000/admin` locally).
2. Fill in the title, category, year, and description.
3. Select an image file and click **Upload Artwork**.
4. The image is stored in Vercel Blob and appears on the main portfolio page automatically.
5. You can delete uploaded artwork from the admin page.
