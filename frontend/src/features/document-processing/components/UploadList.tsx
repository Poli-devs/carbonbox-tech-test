'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUploads } from '../api/uploadsApi';
import { ProcessingStatusBadge } from './ProcessingStatus';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { FileText, ArrowRight, ChevronLeft, ChevronRight, Inbox, PlusCircle } from 'lucide-react';

export const UploadList: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, error } = useUploads(page, limit);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando historial de cargas..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center">
        <p className="font-semibold">Error al cargar la lista de documentos</p>
        <p className="text-xs text-rose-400 mt-1">
          {error instanceof Error ? error.message : 'Error de comunicación con el servidor'}
        </p>
      </div>
    );
  }

  const uploads = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  if (uploads.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Inbox className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white">No hay cargas registradas en la plataforma</h3>
        <p className="text-sm text-slate-400 mt-1 mb-6 max-w-md mx-auto">
          Comience subiendo un archivo CSV de actividad para iniciar el pipeline de procesamiento asíncrono y persistencia relacional.
        </p>
        <Link
          href="/uploads/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Subir Primer Archivo CSV</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Archivo</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Fecha de Subida</th>
                <th className="px-6 py-4 font-semibold text-right">Filas Procesadas</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {uploads.map((upload) => {
                const formattedDate = new Date(upload.createdAt).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={upload.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700/80 group-hover:border-emerald-500/40 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-[220px] sm:max-w-xs">
                        <span className="block truncate font-semibold text-slate-100">
                          {upload.fileName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ID: {upload.id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <ProcessingStatusBadge status={upload.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-xs">
                      {upload.status === 'COMPLETED' ? (
                        <span className="text-emerald-400 font-medium">
                          {upload.processedRows ?? 0}
                          {upload.totalRows ? ` / ${upload.totalRows}` : ''}
                        </span>
                      ) : upload.status === 'FAILED' ? (
                        <span className="text-rose-400">Error</span>
                      ) : (
                        <span className="text-slate-500">Pendiente</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/uploads/${upload.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all hover:scale-105"
                      >
                        <span>Ver Detalle</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Mostrando <span className="text-white font-medium">{(page - 1) * limit + 1}</span> a{' '}
            <span className="text-white font-medium">{Math.min(page * limit, total)}</span> de{' '}
            <span className="text-white font-medium">{total}</span> registros
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-300">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
