import { IQueryHandler } from '../../../../shared/application/IQueryHandler';
import { Either, left, right } from '../../../../shared/domain/Either';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { GetUploadByIdQuery } from '../objects/GetUploadByIdQuery';

export interface UploadDto {
  id: string;
  fileName: string;
  fileUrl: string;
  status: string;
  userId: string;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GetUploadByIdQueryHandler implements IQueryHandler<GetUploadByIdQuery, UploadDto> {
  constructor(private readonly uploadRepository: IUploadRepository) {}

  public async execute(query: GetUploadByIdQuery): Promise<Either<Error, UploadDto>> {
    if (!query.id || query.id.trim().length === 0) {
      return left(new Error('Upload ID is required.'));
    }

    const upload = await this.uploadRepository.findById(query.id);
    if (!upload) {
      return left(new Error(`Upload with ID "${query.id}" not found.`));
    }

    return right({
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
    });
  }
}
