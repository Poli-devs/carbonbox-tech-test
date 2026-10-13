export type UploadStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Upload {
  id: string;
  fileName: string;
  fileUrl: string;
  status: UploadStatusType;
  userId: string;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityData {
  id: string;
  category: string;
  amount: number;
  unit: string;
  date: string;
  createdAt: string;
}

export interface UploadStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface ListUploadsResponse {
  data: Upload[];
  total: number;
  page: number;
  limit: number;
  stats: UploadStats;
}

export interface UploadResultsResponse {
  uploadId: string;
  data: ActivityData[];
}
