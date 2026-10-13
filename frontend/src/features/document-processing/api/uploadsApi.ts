import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import {
  ListUploadsResponse,
  Upload,
  UploadResultsResponse,
} from '../types/upload.types';

export const uploadKeys = {
  all: ['uploads'] as const,
  lists: () => [...uploadKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...uploadKeys.lists(), { page, limit }] as const,
  details: () => [...uploadKeys.all, 'detail'] as const,
  detail: (id: string) => [...uploadKeys.details(), id] as const,
  results: (id: string) => [...uploadKeys.detail(id), 'results'] as const,
};

/**
 * Hook para listar uploads paginados con TanStack Query
 */
export function useUploads(page = 1, limit = 10) {
  return useQuery({
    queryKey: uploadKeys.list(page, limit),
    queryFn: async () => {
      const { data } = await apiClient.get<ListUploadsResponse>('/uploads', {
        params: { page, limit },
      });
      return data;
    },
  });
}

/**
 * Hook para obtener el detalle de un upload con polling automático cada 3s mientras está en procesamiento
 */
export function useUpload(id: string) {
  return useQuery({
    queryKey: uploadKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Upload>(`/uploads/${id}`);
      return data;
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Realizar polling cada 3000ms si el estado es PENDING o PROCESSING
      if (status === 'PENDING' || status === 'PROCESSING') {
        return 3000;
      }
      return false;
    },
  });
}

/**
 * Hook para obtener los resultados procesados de actividad
 */
export function useUploadResults(id: string, enabled = true) {
  return useQuery({
    queryKey: uploadKeys.results(id),
    queryFn: async () => {
      const { data } = await apiClient.get<UploadResultsResponse>(`/uploads/${id}/results`);
      return data;
    },
    enabled: Boolean(id) && enabled,
  });
}

/**
 * Mutación para subir archivos CSV mediante FormData
 */
export function useCreateUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (percent: number) => void;
    }) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await apiClient.post<Upload>('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(percent);
          }
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
    },
  });
}
