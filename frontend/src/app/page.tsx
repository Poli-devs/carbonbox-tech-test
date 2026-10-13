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
  TrendingUp,
  RefreshCw,
  Server,
  Cpu,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useUploads(1, 6);

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
      {/* Enterprise Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PLATAFORMA ASÍNCRONA DE CARBONO</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[11px]">CLEAN ARCHITECTURE & CQRS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Panel de Control de Emisiones
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervisión del pipeline de ingesta, colas de procesamiento y persistencia relacional de actividad.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Sincronizar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Actualizar</span>
          </button>

          <Link
            href="/uploads/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Nueva Ingesta CSV</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Uploads */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Documentos</span>
            <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-white tracking-tight">
                {stats.total}
              </h3>
              <span className="text-xs text-slate-400">cargas</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Archivos CSV ingestados</span>
          </p>
        </div>

        {/* Completed Uploads */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Procesados con Éxito</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                {stats.completed}
              </h3>
              <span className="text-xs text-emerald-400/80">
                {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% tasa` : '0%'}
              </span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validados y guardados en BD</span>
          </p>
        </div>

        {/* In Progress Uploads */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>En Proceso / Cola</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-sky-400 tracking-tight">
                {stats.processing + stats.pending}
              </h3>
              <span className="text-xs text-slate-400">activos</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Consumo asíncrono activo</span>
          </p>
        </div>

        {/* Failed Uploads */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Rechazados / Error</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-rose-400 tracking-tight">
                {stats.failed}
              </h3>
              <span className="text-xs text-slate-400">documentos</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Formato corrupto o sin filas</span>
          </p>
        </div>
      </div>

      {/* Main Split Layout: Ingestion Activity (2/3) + Pipeline Health (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Ingestion Activity Data Grid */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Actividad de Ingesta Reciente</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Últimos archivos procesados por los workers asíncronos
              </p>
            </div>
            <Link
              href="/uploads"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>Ver todas las cargas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-800/50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentUploads.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">No se han registrado cargas recientes.</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Comienza subiendo tu primer archivo CSV de actividad.
              </p>
              <Link
                href="/uploads/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Subir CSV de prueba</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="pb-3 font-semibold">Archivo / ID</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold text-right">Filas Ingestadas</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                    <th className="pb-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {recentUploads.map((up) => {
                    const formattedDate = new Date(up.createdAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={up.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 font-medium text-white max-w-[200px]">
                          <div className="truncate font-semibold text-slate-100">{up.fileName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {up.id.substring(0, 13)}...
                          </div>
                        </td>

                        <td className="py-3.5">
                          <ProcessingStatusBadge status={up.status} size="sm" />
                        </td>

                        <td className="py-3.5 text-right font-mono text-slate-300">
                          {up.status === 'COMPLETED' ? (
                            <span className="text-emerald-400 font-semibold">
                              {up.processedRows ?? 0}
                              <span className="text-slate-500 font-normal"> / {up.totalRows ?? 0}</span>
                            </span>
                          ) : up.status === 'FAILED' ? (
                            <span className="text-rose-400">0 válidas</span>
                          ) : (
                            <span className="text-sky-400">Procesando...</span>
                          )}
                        </td>

                        <td className="py-3.5 text-slate-400 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        <td className="py-3.5 text-right">
                          <Link
                            href={`/uploads/${up.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md transition-colors"
                          >
                            <span>Detalle</span>
                            <ArrowUpRight className="w-3 h-3" />
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

        {/* Right Column: Architectural Pipeline & Service Health Status */}
        <div className="space-y-6">
          {/* Pipeline Component Status */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Arquitectura del Pipeline</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-semibold text-white block">Fastify HTTP API</span>
                    <span className="text-[11px] text-slate-500">Multipart &lt;50ms Response</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  READY
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-semibold text-white block">Cola de Mensajería</span>
                    <span className="text-[11px] text-slate-500">Backoff Exponencial + DLQ</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-semibold text-white block">Worker Desacoplado</span>
                    <span className="text-[11px] text-slate-500">Polling Multi-Proceso</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  LISTENING
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-semibold text-white block">PostgreSQL 15</span>
                    <span className="text-[11px] text-slate-500">Prisma ORM • Batch Create</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Quick Sample Files Card */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Archivos de Evaluación Técnica</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prueba el comportamiento del worker con los archivos incluidos en el repositorio:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-sans font-medium text-xs">sample-data.csv</span>
                <span className="text-[11px] text-emerald-400 font-mono">61 filas válidas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-sans font-medium text-xs">sample-data-with-errors.csv</span>
                <span className="text-[11px] text-amber-400 font-mono">Prueba DLQ & Errores</span>
              </div>
            </div>
            <Link
              href="/uploads/new"
              className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors mt-1"
            >
              <span>Subir Archivo de Prueba</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

