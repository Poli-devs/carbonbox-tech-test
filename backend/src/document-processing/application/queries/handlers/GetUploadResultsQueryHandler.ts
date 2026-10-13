import { IQueryHandler } from '../../../../shared/application/IQueryHandler';
import { Either, left, right } from '../../../../shared/domain/Either';
import { ActivityData } from '../../../domain/entities/ActivityData';
import { IActivityDataRepository } from '../../../domain/repositories/IActivityDataRepository';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { GetUploadResultsQuery } from '../objects/GetUploadResultsQuery';

export interface ActivityDataDto {
  id: string;
  category: string;
  amount: number;
  unit: string;
  date: string;
  createdAt: Date;
}

export interface GetUploadResultsResult {
  uploadId: string;
  data: ActivityDataDto[];
}

export class GetUploadResultsQueryHandler
  implements IQueryHandler<GetUploadResultsQuery, GetUploadResultsResult>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly activityDataRepository: IActivityDataRepository
  ) {}

  public async execute(query: GetUploadResultsQuery): Promise<Either<Error, GetUploadResultsResult>> {
    if (!query.uploadId || query.uploadId.trim().length === 0) {
      return left(new Error('Upload ID is required.'));
    }

    const upload = await this.uploadRepository.findById(query.uploadId);
    if (!upload) {
      return left(new Error(`Upload with ID "${query.uploadId}" not found.`));
    }

    const items = await this.activityDataRepository.findByUploadId(query.uploadId);

    const dtos: ActivityDataDto[] = items.map((item: ActivityData) => ({
      id: item.id,
      category: item.category,
      amount: item.amount,
      unit: item.unit,
      date: item.date.toISOString().split('T')[0] ?? '',
      createdAt: item.createdAt,
    }));

    return right({
      uploadId: query.uploadId,
      data: dtos,
    });
  }
}
