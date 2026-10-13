import { Upload } from '../entities/Upload';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IUploadRepository {
  save(upload: Upload): Promise<void>;
  update(upload: Upload): Promise<void>;
  findById(id: string): Promise<Upload | null>;
  findMany(params: { page: number; limit: number; userId?: string }): Promise<PaginatedResult<Upload>>;
  countByStatus(userId?: string): Promise<{ total: number; pending: number; processing: number; completed: number; failed: number }>;
}
