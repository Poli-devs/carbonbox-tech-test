'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useCreateUploadMutation } from '../api/uploadsApi';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Por favor selecciona un archivo CSV antes de enviar.');
      return;
    }

    setErrorMessage(null);
    setUploadProgress(0);

    try {
      const created = await uploadMutation.mutateAsync({
        file,
        onProgress: (percent) => setUploadProgress(percent),
      });

      // Redirección automática tras subida exitosa
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-emerald-400" />
            Cargar Archivo de Actividad CSV
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Sube un archivo CSV con las columnas obligatorias:{' '}
            <code className="text-emerald-300 font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">
              category, amount, unit, date
            </code>
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">{errorMessage}</div>
            <button
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
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/40 bg-slate-800/40'
                : 'border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/20'
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
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB • CSV Document
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Archivo seleccionado listo para enviar
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                  <UploadCloud className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">
                    Arrastra tu archivo aquí o haz clic para explorar
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Solo archivos delimitados por comas (.csv) hasta 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subiendo al servidor...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setErrorMessage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={!file || uploadMutation.isPending}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Limpiar
            </button>

            <button
              type="submit"
              disabled={!file || uploadMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {uploadMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Procesando envío...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Procesamiento</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
