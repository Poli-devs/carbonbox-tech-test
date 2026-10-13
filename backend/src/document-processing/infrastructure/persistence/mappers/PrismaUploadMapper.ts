import { Upload as PrismaUploadModel } from '@prisma/client';
import { Upload } from '../../../domain/entities/Upload';
import { FileName } from '../../../domain/value-objects/FileName';
import { UploadStatus } from '../../../domain/value-objects/UploadStatus';

export class PrismaUploadMapper {
  public static toDomain(raw: PrismaUploadModel): Upload {
    const fileNameVoOrError = FileName.create(raw.fileName);
    if (fileNameVoOrError.isLeft()) {
      throw new Error(`Corrupted DB record: invalid fileName "${raw.fileName}" in upload ${raw.id}`);
    }

    const statusVoOrError = UploadStatus.create(raw.status);
    if (statusVoOrError.isLeft()) {
      throw new Error(`Corrupted DB record: invalid status "${raw.status}" in upload ${raw.id}`);
    }

    const uploadOrError = Upload.create({
      id: raw.id,
      fileName: fileNameVoOrError.value,
      fileUrl: raw.fileUrl,
      status: statusVoOrError.value,
      userId: raw.userId,
      totalRows: raw.totalRows,
      processedRows: raw.processedRows,
      failedRows: raw.failedRows,
      errorMessage: raw.errorMessage,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });

    if (uploadOrError.isLeft()) {
      throw new Error(`Failed to map upload from DB: ${uploadOrError.value.message}`);
    }

    return uploadOrError.value;
  }

  public static toPersistence(domain: Upload): Omit<PrismaUploadModel, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      id: domain.id,
      fileName: domain.fileName.value,
      fileUrl: domain.fileUrl,
      status: domain.status.value,
      userId: domain.userId,
      totalRows: domain.totalRows,
      processedRows: domain.processedRows,
      failedRows: domain.failedRows,
      errorMessage: domain.errorMessage,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
