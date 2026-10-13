import type { Metadata } from 'next';
import { Layout } from '@/shared/components/Layout';
import { Providers } from '@/shared/components/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CarbonBox - Sistema de Procesamiento Asíncrono de Documentos',
  description:
    'Plataforma integral de ingesta, validación y análisis de datos de emisiones y actividad en formato CSV con arquitectura DDD y CQRS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
