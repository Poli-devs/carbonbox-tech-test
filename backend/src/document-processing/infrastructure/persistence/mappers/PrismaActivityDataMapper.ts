import { ActivityData as PrismaActivityModel } from '@prisma/client';
import { ActivityData } from '../../../domain/entities/ActivityData';

export class PrismaActivityDataMapper {
  public static toDomain(raw: PrismaActivityModel): ActivityData {
    const entityOrError = ActivityData.create({
      id: raw.id,
      uploadId: raw.uploadId,
      category: raw.category,
      amount: raw.amount,
      unit: raw.unit,
      date: raw.date,
      createdAt: raw.createdAt,
    });

    if (entityOrError.isLeft()) {
      throw new Error(`Corrupted DB record in ActivityData ${raw.id}: ${entityOrError.value.message}`);
    }

    return entityOrError.value;
  }

  public static toPersistence(domain: ActivityData): PrismaActivityModel {
    return {
      id: domain.id,
      uploadId: domain.uploadId,
      category: domain.category,
      amount: domain.amount,
      unit: domain.unit,
      date: domain.date,
      createdAt: domain.createdAt,
    };
  }
}
