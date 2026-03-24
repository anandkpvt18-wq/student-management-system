---
description: How to set up and manage the Next.js frontend for Vercel deployment
---

# Frontend Setup — Next.js on Vercel

## Prerequisites
- Node.js 18+
- npm
- Vercel account ([vercel.com](https://vercel.com))

## Steps

### 1. Initialize Next.js Project
```bash
cd frontend
npx -y create-next-app@latest ./ --js --no-tailwind --no-eslint --src-dir --app --no-turbopack --import-alias "@/*"
```

### 2. Project Structure (HTML/CSS Focused)
```
frontend/
├── README.md
├── package.json
├── next.config.js
├── public/              # Static assets
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.js    # Root layout (minimal JS)
│   │   ├── page.js      # Home page
│   │   ├── globals.css  # Global styles
│   │   └── page.module.css
│   └── components/      # Reusable components
│       └── ...
└── ...
```

### 3. Styling Approach
- Use **vanilla CSS** (`.css` files and CSS Modules)
- No Tailwind — keep styling in dedicated CSS files
- Use CSS variables for theming
- Use semantic HTML elements (`<header>`, `<main>`, `<nav>`, `<section>`, etc.)

### 4. Run Locally
```bash
npm run dev
```
Opens at `http://localhost:3000`

### 5. Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set root directory to `frontend`
4. Add environment variables (API URL, etc.)
5. Deploy

## Design Principles
- **HTML/CSS first** — Use JavaScript only where necessary
- **Semantic HTML** — Proper heading hierarchy, landmarks, ARIA labels
- **Responsive** — Mobile-first CSS with media queries
- **Accessible** — Color contrast, keyboard navigation, screen reader support
- **Premium aesthetics** — Modern typography, gradients, micro-animations
