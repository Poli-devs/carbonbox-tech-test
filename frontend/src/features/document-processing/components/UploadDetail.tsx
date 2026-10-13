'use client';

import React from 'react';
import Link from 'next/link';
import { useUpload, useUploadResults } from '../api/uploadsApi';
import { ProcessingStatusBadge } from './ProcessingStatus';
import { ResultsTable } from './ResultsTable';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import {
  ArrowLeft,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

interface UploadDetailProps {
  id: string;
}

export const UploadDetail: React.FC<UploadDetailProps> = ({ id }) => {
  const { data: upload, isLoading, isError, error } = useUpload(id);

  const isCompleted = upload?.status === 'COMPLETED';
  const isProcessing = upload?.status === 'PROCESSING' || upload?.status === 'PENDING';
  const isFailed = upload?.status === 'FAILED';

  const {
    data: resultsData,
    isLoading: isResultsLoading,
  } = useUploadResults(id, isCompleted);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" label="Consultando estado de procesamiento..." />
      </div>
    );
  }

  if (isError || !upload) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Documento no encontrado</h3>
        <p className="text-xs text-rose-300 mt-1 mb-6">
          {error instanceof Error ? error.message : 'No se pudo obtener el estado del archivo solicitado.'}
        </p>
        <Link
          href="/uploads"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(upload.createdAt).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Back link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/uploads"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Volver al historial"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {upload.fileName}
              </h1>
              <ProcessingStatusBadge status={upload.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Subido el {formattedDate}</span>
              <span>•</span>
              <span className="font-mono text-slate-500">ID: {upload.id}</span>
            </p>
          </div>
        </div>

        {isCompleted && resultsData && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>{resultsData.data.length} filas analizadas con éxito</span>
          </div>
        )}
      </div>

      {/* Progress Card when PROCESSING / PENDING */}
      {isProcessing && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/30 border border-sky-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 animate-spin">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Procesamiento asíncrono en ejecución...
                </h4>
                <p className="text-xs text-sky-300/80 mt-0.5">
                  El worker está validando y parseando cada fila del CSV. Actualización automática cada 3 segundos.
                </p>
              </div>
            </div>
            <LoadingSpinner size="sm" />
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 to-teal-400 animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      )}

      {/* Error Alert when FAILED */}
      {isFailed && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 shadow-xl text-rose-300 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-rose-200">
              Error durante el procesamiento del archivo
            </h4>
            <p className="text-sm text-rose-300 mt-1 font-mono">
              {upload.errorMessage || 'El archivo contenía filas con formato o valores no válidos.'}
            </p>
            <div className="mt-4">
              <Link
                href="/uploads/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
              >
                Subir nuevo archivo corregido
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Total Filas</span>
          </div>
          <span className="text-xl font-bold text-white font-mono">
            {upload.totalRows ?? '—'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Filas Válidas</span>
          </div>
          <span className="text-xl font-bold text-emerald-400 font-mono">
            {upload.processedRows ?? '—'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-rose-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Filas Rechazadas</span>
          </div>
          <span className="text-xl font-bold text-rose-400 font-mono">
            {upload.failedRows ?? 0}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Tasa de Éxito</span>
          </div>
          <span className="text-xl font-bold text-teal-400 font-mono">
            {upload.totalRows && upload.processedRows
              ? `${Math.round((upload.processedRows / upload.totalRows) * 100)}%`
              : isCompleted
              ? '100%'
              : '—'}
          </span>
        </div>
      </div>

      {/* Processed Results Data Table */}
      {isCompleted && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Datos de Actividad Registrados
            </h3>
          </div>

          {isResultsLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="md" label="Cargando registros procesados..." />
            </div>
          ) : resultsData && resultsData.data.length > 0 ? (
            <ResultsTable data={resultsData.data} />
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No hay datos registrados disponibles para este archivo.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
