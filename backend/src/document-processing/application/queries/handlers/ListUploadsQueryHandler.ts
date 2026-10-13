import { IQueryHandler } from '../../../../shared/application/IQueryHandler';
import { Either, right } from '../../../../shared/domain/Either';
import { Upload } from '../../../domain/entities/Upload';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { UploadDto } from './GetUploadByIdQueryHandler';
import { ListUploadsQuery } from '../objects/ListUploadsQuery';

export interface ListUploadsResult {
  data: UploadDto[];
  total: number;
  page: number;
  limit: number;
  stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export class ListUploadsQueryHandler implements IQueryHandler<ListUploadsQuery, ListUploadsResult> {
  constructor(private readonly uploadRepository: IUploadRepository) {}

  public async execute(query: ListUploadsQuery): Promise<Either<Error, ListUploadsResult>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));

    const [paginated, stats] = await Promise.all([
      this.uploadRepository.findMany({ page, limit, userId: query.userId }),
      this.uploadRepository.countByStatus(query.userId),
    ]);

    const dtos: UploadDto[] = paginated.data.map((upload: Upload) => ({
      id: upload.id,
      fileName: upload.fileName.value,
      fileUrl: upload.fileUrl,
      status: upload.status.value,
      userId: upload.userId,
      totalRows: upload.totalRows,
      processedRows: upload.processedRows,
      failedRows: upload.failedRows,
      errorMessage: upload.errorMessage,
      createdAt: upload.createdAt,
      updatedAt: upload.updatedAt,
    }));

    return right({
      data: dtos,
      total: paginated.total,
      page,
      limit,
      stats,
    });
  }
}
