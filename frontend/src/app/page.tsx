'use client';

import React from 'react';
import Link from 'next/link';
import { useUploads, uploadKeys } from '@/features/document-processing/api/uploadsApi';
import { ProcessingStatusBadge } from '@/features/document-processing/components/ProcessingStatus';
import { useQueryClient } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  RefreshCw,
  Inbox,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useUploads(1, 10);

  const stats = data?.stats || {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  const recentUploads = data?.data || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: uploadKeys.all });
    refetch();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>SISTEMA DE PROCESAMIENTO DE DOCUMENTOS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Panel de Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitoreo y consulta de archivos CSV de actividad procesados por el motor asíncrono.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Actualizar</span>
          </button>

          <Link
            href="/uploads/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir Archivo CSV</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (connected to real backend stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Documentos</span>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-white tracking-tight">
                {stats.total}
              </h3>
              <span className="text-xs text-slate-400">cargas registradas</span>
            </div>
          )}
        </div>

        {/* Completed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Procesados con Éxito</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                {stats.completed}
              </h3>
              <span className="text-xs text-slate-400">completados</span>
            </div>
          )}
        </div>

        {/* Processing / In Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>En Proceso / Cola</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-sky-400 tracking-tight">
                {stats.processing + stats.pending}
              </h3>
              <span className="text-xs text-slate-400">en segundo plano</span>
            </div>
          )}
        </div>

        {/* Failed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Con Errores / Rechazados</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-rose-400 tracking-tight">
                {stats.failed}
              </h3>
              <span className="text-xs text-slate-400">documentos fallidos</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Table: Real Ingestion Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Actividad Reciente</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Últimos documentos ingresados y su estado de ejecución
            </p>
          </div>
          <Link
            href="/uploads"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
          >
            <span>Ver historial completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-800 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : recentUploads.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No hay documentos registrados</p>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Cargue un archivo CSV para iniciar el pipeline de procesamiento asíncrono.
            </p>
            <Link
              href="/uploads/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Subir Archivo CSV</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Archivo</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold text-right">Filas Procesadas</th>
                  <th className="pb-3 font-semibold">Fecha de Registro</th>
                  <th className="pb-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentUploads.map((up) => {
                  const formattedDate = new Date(up.createdAt).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={up.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-medium text-white max-w-[240px]">
                        <div className="truncate font-semibold text-slate-100">{up.fileName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {up.id}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <ProcessingStatusBadge status={up.status} size="sm" />
                      </td>

                      <td className="py-3.5 text-right font-mono text-slate-300">
                        {up.status === 'COMPLETED' ? (
                          <span className="text-emerald-400 font-semibold">
                            {up.processedRows ?? 0}
                            {up.totalRows ? ` / ${up.totalRows}` : ''}
                          </span>
                        ) : up.status === 'FAILED' ? (
                          <span className="text-rose-400">Rechazado</span>
                        ) : (
                          <span className="text-sky-400">En cola</span>
                        )}
                      </td>

                      <td className="py-3.5 text-slate-400 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="py-3.5 text-right">
                        <Link
                          href={`/uploads/${up.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md transition-colors"
                        >
                          <span>Ver Detalle</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
