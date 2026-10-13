'use client';

import React from 'react';
import Link from 'next/link';
import { UploadList } from '@/features/document-processing/components/UploadList';
import { PlusCircle, FileSpreadsheet } from 'lucide-react';

export default function UploadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            Historial de Cargas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza y administra todos los archivos CSV procesados de forma asíncrona.
          </p>
        </div>

        <Link
          href="/uploads/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md shadow-emerald-500/15 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Subir Archivo</span>
        </Link>
      </div>

      <UploadList />
    </div>
  );
}
