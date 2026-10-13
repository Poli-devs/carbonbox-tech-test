import { PrismaClient } from '@prisma/client';
import { ActivityData } from '../../../domain/entities/ActivityData';
import { IActivityDataRepository } from '../../../domain/repositories/IActivityDataRepository';
import { PrismaActivityDataMapper } from '../mappers/PrismaActivityDataMapper';

export class PrismaActivityDataRepository implements IActivityDataRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async saveMany(items: ActivityData[]): Promise<void> {
    if (items.length === 0) return;

    const rawRecords = items.map(PrismaActivityDataMapper.toPersistence);

    // Batch insert using createMany
    await this.prisma.activityData.createMany({
      data: rawRecords,
      skipDuplicates: true,
    });
  }

  public async findByUploadId(uploadId: string): Promise<ActivityData[]> {
    const rawList = await this.prisma.activityData.findMany({
      where: { uploadId },
      orderBy: { date: 'asc' },
    });

    return rawList.map(PrismaActivityDataMapper.toDomain);
  }
}
