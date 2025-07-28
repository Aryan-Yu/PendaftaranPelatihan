import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pelatihan Registration',
  description: 'Website Pendaftaran Pelatihan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}