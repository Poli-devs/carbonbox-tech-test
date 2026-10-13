import { Metadata } from 'next';
import { UploadForm } from '@/features/document-processing/components/UploadForm';

export const metadata: Metadata = {
  title: 'Subir Archivo CSV - CarbonBox',
  description: 'Carga un nuevo archivo CSV con datos de actividad de carbono.',
};

export default function NewUploadPage() {
  return (
    <div className="py-6">
      <UploadForm />
    </div>
  );
}
