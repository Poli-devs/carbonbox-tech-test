import { Metadata } from 'next';
import { UploadDetail } from '@/features/document-processing/components/UploadDetail';

export const metadata: Metadata = {
  title: 'Detalle de Procesamiento - CarbonBox',
  description: 'Detalle y resultados del procesamiento de archivo CSV de emisiones.',
};

interface UploadDetailPageProps {
  params: {
    id: string;
  };
}

export default function UploadDetailPage({ params }: UploadDetailPageProps) {
  return (
    <div className="py-2">
      <UploadDetail id={params.id} />
    </div>
  );
}
