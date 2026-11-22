import './globals.css';

export const metadata = {
  title: 'Magic Higgsfield Studio — Free AI Image & Video Studio',
  description: 'Free AI images with Pollinations Flux — no key needed. Premium Kie.ai models optional with your own key. Free open-source studio, renamed from Open Higgsfield AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Pre-compiled Tailwind CSS — Vercel's build was serving the raw
            @tailwind directives unprocessed, so the compiled utilities are
            shipped as a static file. Regenerate with: npm install &&
            npm run build:studio && npm run build, then copy
            .next/static/css/*.css to public/tailwind-compiled.css */}
        <link rel="stylesheet" href="/tailwind-compiled.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
