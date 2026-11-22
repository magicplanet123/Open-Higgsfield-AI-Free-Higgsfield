import './globals.css';

export const metadata = {
  title: 'Magic Higgsfield Studio — Free AI Image & Video Studio',
  description: 'Free AI images with Pollinations Flux — no key needed. Premium Kie.ai models optional with your own key. Free open-source studio, renamed from Open Higgsfield AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
