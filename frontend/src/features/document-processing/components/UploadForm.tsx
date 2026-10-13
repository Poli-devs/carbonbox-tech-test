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
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useCreateUploadMutation } from '../api/uploadsApi';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const UploadForm: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage('Formato no admitido. El archivo debe ser un documento CSV válido (.csv).');
      return;
    }

    if (selectedFile.size === 0) {
      setErrorMessage('El archivo seleccionado está vacío.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('El archivo excede el límite máximo permitido de 50MB.');
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

  const handleClear = () => {
    setFile(null);
    setErrorMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Por favor seleccione un archivo CSV antes de iniciar el envío.');
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
          : 'Ocurrió un error inesperado al comunicar con el servidor.';
      setErrorMessage(msg);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
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
                Ingesta de Documentos
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">POST /uploads</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cargar Archivo CSV de Emisiones
            </h1>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Area & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dropzone & Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm font-medium">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-rose-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : file
                    ? 'border-emerald-500/40 bg-slate-800/40'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {formatFileSize(file.size)} • Archivo CSV listo para enviar
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Archivo seleccionado correctamente</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                      <UploadCloud className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        Arrastra y suelta tu archivo CSV aquí, o haz clic para seleccionarlo
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Formatos aceptados: .csv (hasta 50 MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {uploadMutation.isPending && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Enviando archivo al servidor...
                    </span>
                    <span className="font-mono text-emerald-400">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Validación de esquema y tipos al procesar</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={!file || uploadMutation.isPending}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Limpiar
                  </button>

                  <button
                    type="submit"
                    disabled={!file || uploadMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Subir y Procesar</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Schema Specifications & Processing Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Estructura Requerida del CSV</span>
            </h3>

            <p className="text-xs text-slate-400">
              El archivo CSV debe contener una fila de encabezados con las siguientes columnas obligatorias:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">category</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Texto que identifica el tipo de actividad (ej. Electricity, Fuel, Travel).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">amount</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Valor numérico mayor a cero (soporta decimales con punto).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">unit</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Unidad de medida asociada al consumo (ej. kWh, L, kg, km).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold">date</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Fecha del registro en formato ISO (YYYY-MM-DD).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Procesamiento Asíncrono</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Al enviar el archivo, el servidor responde de inmediato con un identificador de seguimiento y delega la lectura, validación y persistencia a un worker en segundo plano, permitiendo consultar el progreso sin bloquear la interfaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
