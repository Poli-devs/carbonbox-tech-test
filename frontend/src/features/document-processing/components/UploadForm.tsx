'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { useCreateUploadMutation } from '../api/uploadsApi';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

const SAMPLE_CSV_CONTENT = `category,amount,unit,date
Electricity,1420.50,kWh,2024-03-01
Natural Gas,310.20,m3,2024-03-02
Diesel,85.00,L,2024-03-03
Flight,2450.00,km,2024-03-04
Waste,120.75,kg,2024-03-05
Electricity,890.00,kWh,2024-03-06
Freight,520.00,t-km,2024-03-07
Water,45.50,m3,2024-03-08`;

export const UploadForm: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useCreateUploadMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage(null);
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Formato inválido. Solo se admiten archivos .csv con datos de actividad.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMessage('El archivo excede el límite máximo de 50MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'carbonbox_plantilla_actividad.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleFile = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' });
    const sampleFile = new File([blob], 'demo_actividad_carbono.csv', { type: 'text/csv' });
    setFile(sampleFile);
    setErrorMessage(null);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_CSV_CONTENT);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Por favor seleccione un archivo CSV antes de enviar.');
      return;
    }

    setErrorMessage(null);
    setUploadProgress(0);

    try {
      const created = await uploadMutation.mutateAsync({
        file,
        onProgress: (percent) => setUploadProgress(percent),
      });

      router.push(`/uploads/${created.id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado al subir el archivo.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/uploads"
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Volver al historial"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Pipeline de Ingesta Asíncrona
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400 font-mono">POST /uploads</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cargar Documento de Actividad
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar Plantilla CSV</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Upload Column (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm font-medium">{errorMessage}</div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-rose-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dropzone Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                    : file
                    ? 'border-emerald-500/50 bg-slate-800/40'
                    : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {(file.size / 1024).toFixed(1)} KB • text/csv • Listo para procesar
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Documento validado para la ingesta
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center border border-slate-700">
                      <UploadCloud className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        Arrastra y suelta tu archivo CSV aquí, o haz clic para explorar
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Archivos delimitados por comas (.csv), codificación UTF-8, hasta 50MB
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSampleFile();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Usar archivo de prueba preconfigurado
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress Indicator */}
              {uploadMutation.isPending && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Transfiriendo archivo al backend Fastify...
                    </span>
                    <span className="font-mono text-emerald-400">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Form Action Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Validación estricta Zod antes de persistir</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setErrorMessage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={!file || uploadMutation.isPending}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Descartar
                  </button>

                  <button
                    type="submit"
                    disabled={!file || uploadMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Enviando al Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar Ingesta Asíncrona</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Column: Specifications & Schema (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Data Contract Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Contrato de Datos (Esquema CSV)
              </h3>
              <button
                type="button"
                onClick={handleCopySample}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                title="Copiar datos al portapapeles"
              >
                {copiedSample ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar CSV</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400">category</span>
                  <span className="text-[10px] text-slate-400 font-mono">string • Requerido</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Categoría de emisión: Electricity, Natural Gas, Diesel, Flight, Waste, etc.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400">amount</span>
                  <span className="text-[10px] text-slate-400 font-mono">number &gt; 0 • Requerido</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cantidad o volumen de consumo. Admite decimales delimitados por punto.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400">unit</span>
                  <span className="text-[10px] text-slate-400 font-mono">string • Requerido</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Unidad de medida asociada: kWh, m3, L, km, kg, t-km.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400">date</span>
                  <span className="text-[10px] text-slate-400 font-mono">ISO 8601 (YYYY-MM-DD)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fecha del evento o registro contable de actividad.
                </p>
              </div>
            </div>

            {/* Code preview snippet */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
                Vista previa de archivo muestra:
              </span>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto leading-relaxed">
                {SAMPLE_CSV_CONTENT.split('\n').slice(0, 5).join('\n')}
                {'\n...'}
              </pre>
            </div>
          </div>

          {/* Architecture SLA Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Garantías del Motor Asíncrono
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-200">Respuesta HTTP inmediata:</strong> El servidor responde un ACK con estado <code>PENDING</code> en milisegundos sin bloquear el hilo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-200">Worker en segundo plano:</strong> El procesamiento, validación y persistencia se ejecutan desacoplados mediante colas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-200">Persistencia transaccional:</strong> Si el archivo es corrupto, se marca como <code>FAILED</code> con mensaje de auditoría específico.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
