import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Visor PDF Seguro',
  description: 'Visor de documentos PDF con acceso restringido.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
