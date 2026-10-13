import { PrismaClient } from '@prisma/client';
import { Upload } from '../../../domain/entities/Upload';
import { IUploadRepository, PaginatedResult } from '../../../domain/repositories/IUploadRepository';
import { PrismaUploadMapper } from '../mappers/PrismaUploadMapper';

export class PrismaUploadRepository implements IUploadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(upload: Upload): Promise<void> {
    const raw = PrismaUploadMapper.toPersistence(upload);
    await this.prisma.upload.create({
      data: {
        id: raw.id,
        fileName: raw.fileName,
        fileUrl: raw.fileUrl,
        status: raw.status,
        userId: raw.userId,
        totalRows: raw.totalRows,
        processedRows: raw.processedRows,
        failedRows: raw.failedRows,
        errorMessage: raw.errorMessage,
        createdAt: raw.createdAt ?? new Date(),
        updatedAt: raw.updatedAt ?? new Date(),
      },
    });
  }

  public async update(upload: Upload): Promise<void> {
    const raw = PrismaUploadMapper.toPersistence(upload);
    await this.prisma.upload.update({
      where: { id: upload.id },
      data: {
        fileName: raw.fileName,
        fileUrl: raw.fileUrl,
        status: raw.status,
        totalRows: raw.totalRows,
        processedRows: raw.processedRows,
        failedRows: raw.failedRows,
        errorMessage: raw.errorMessage,
        updatedAt: raw.updatedAt ?? new Date(),
      },
    });
  }

  public async findById(id: string): Promise<Upload | null> {
    const raw = await this.prisma.upload.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return PrismaUploadMapper.toDomain(raw);
  }

  public async findMany(params: {
    page: number;
    limit: number;
    userId?: string;
  }): Promise<PaginatedResult<Upload>> {
    const skip = (params.page - 1) * params.limit;
    const where = params.userId ? { userId: params.userId } : {};

    const [items, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.upload.count({ where }),
    ]);

    return {
      data: items.map(PrismaUploadMapper.toDomain),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  public async countByStatus(userId?: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const where = userId ? { userId } : {};

    const [total, pending, processing, completed, failed] = await Promise.all([
      this.prisma.upload.count({ where }),
      this.prisma.upload.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.upload.count({ where: { ...where, status: 'PROCESSING' } }),
      this.prisma.upload.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.upload.count({ where: { ...where, status: 'FAILED' } }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
    };
  }
}
