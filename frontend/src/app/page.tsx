'use client';

import React from 'react';
import Link from 'next/link';
import { useUploads } from '@/features/document-processing/api/uploadsApi';
import { ProcessingStatusBadge } from '@/features/document-processing/components/ProcessingStatus';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useUploads(1, 5);

  const stats = data?.stats || {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  const recentUploads = data?.data || [];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Motor Asíncrono Operacional
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Procesamiento Inteligente de Datos de Carbono
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            Ingesta, validación y persistencia de métricas de actividad mediante mensajería en colas desacopladas, Clean Architecture y CQRS.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Link
              href="/uploads/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cargar Nuevo CSV</span>
            </Link>
            <Link
              href="/uploads"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ver Todas las Cargas</span>
            </Link>
          </div>
        </div>

        {/* Decorative Grid / Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Uploads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Cargas
            </p>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
              {isLoading ? '...' : stats.total}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Documentos registrados
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Completed Uploads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Completados
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
              {isLoading ? '...' : stats.completed}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-emerald-400" />
              Procesados con éxito
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress Uploads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-sky-400 uppercase tracking-wider">
              En Proceso
            </p>
            <h3 className="text-3xl font-extrabold text-sky-400 mt-1 font-mono">
              {isLoading ? '...' : stats.processing + stats.pending}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              En cola o worker
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Failed Uploads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-400 uppercase tracking-wider">
              Fallidos
            </p>
            <h3 className="text-3xl font-extrabold text-rose-400 mt-1 font-mono">
              {isLoading ? '...' : stats.failed}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              Validación o datos erróneos
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Actividad Reciente</h2>
            <p className="text-xs text-slate-400">
              Últimos archivos ingestados en la plataforma
            </p>
          </div>
          <Link
            href="/uploads"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Ver historial completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" label="Cargando actividad reciente..." />
          </div>
        ) : recentUploads.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            No se han registrado cargas recientes. Sube tu primer archivo CSV.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Archivo</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold">Fecha</th>
                  <th className="pb-3 font-semibold text-right">Filas</th>
                  <th className="pb-3 font-semibold text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentUploads.map((up) => (
                  <tr key={up.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-medium text-white truncate max-w-[200px]">
                      {up.fileName}
                    </td>
                    <td className="py-3">
                      <ProcessingStatusBadge status={up.status} size="sm" />
                    </td>
                    <td className="py-3 text-xs text-slate-400">
                      {new Date(up.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-slate-300">
                      {up.processedRows ?? up.totalRows ?? '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/uploads/${up.id}`}
                        className="text-xs text-emerald-400 hover:underline font-medium"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
