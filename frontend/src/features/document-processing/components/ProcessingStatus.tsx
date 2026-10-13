import React from 'react';
import { UploadStatusType } from '../types/upload.types';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface ProcessingStatusBadgeProps {
  status: UploadStatusType;
  size?: 'sm' | 'md';
}

export const ProcessingStatusBadge: React.FC<ProcessingStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const configs: Record<
    UploadStatusType,
    { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
  > = {
    PENDING: {
      label: 'Pendiente',
      icon: Clock,
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    PROCESSING: {
      label: 'Procesando',
      icon: Loader2,
      classes: 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse',
    },
    COMPLETED: {
      label: 'Completado',
      icon: CheckCircle2,
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    FAILED: {
      label: 'Fallido',
      icon: XCircle,
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
  };

  const current = configs[status] || configs.PENDING;
  const Icon = current.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.classes} ${sizeClasses}`}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
      <span>{current.label}</span>
    </span>
  );
};
