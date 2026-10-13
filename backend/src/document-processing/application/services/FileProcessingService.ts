import { Either, left, right } from '../../../shared/domain/Either';
import { ActivityData } from '../../domain/entities/ActivityData';
import { IActivityDataRepository } from '../../domain/repositories/IActivityDataRepository';
import { IUploadRepository } from '../../domain/repositories/IUploadRepository';
import { IFileStorage } from '../../infrastructure/storage/IFileStorage';
import { CsvParserService } from './CsvParserService';

export interface ProcessFileResult {
  uploadId: string;
  totalRows: number;
  processedRows: number;
  failedRows: number;
}

export class FileProcessingService {
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly activityDataRepository: IActivityDataRepository,
    private readonly fileStorage: IFileStorage,
    private readonly csvParser: CsvParserService
  ) {}

  public async process(uploadId: string): Promise<Either<Error, ProcessFileResult>> {
    const upload = await this.uploadRepository.findById(uploadId);
    if (!upload) {
      return left(new Error(`Upload with ID "${uploadId}" not found.`));
    }

    try {
      upload.startProcessing();
      await this.uploadRepository.update(upload);

      const fileBuffer = await this.fileStorage.read(upload.fileUrl);
      const csvString = fileBuffer.toString('utf-8');

      const parseResult = this.csvParser.parse(csvString);
      if (parseResult.isLeft()) {
        const errorMsg = parseResult.value.message;
        upload.markAsFailed(errorMsg);
        await this.uploadRepository.update(upload);
        return left(new Error(`Failed to parse CSV: ${errorMsg}`));
      }

      const { totalRows, validRows, invalidRows } = parseResult.value;

      if (validRows.length === 0) {
        const errorMsg = `No valid activity rows found in CSV. ${invalidRows.length} invalid rows found.`;
        upload.markAsFailed(errorMsg);
        await this.uploadRepository.update(upload);
        return left(new Error(errorMsg));
      }

      // Convert valid rows to ActivityData domain entities
      const activityEntities: ActivityData[] = [];
      for (const row of validRows) {
        const entityResult = ActivityData.create({
          uploadId: upload.id,
          category: row.category,
          amount: row.amount,
          unit: row.unit,
          date: row.date,
        });

        if (entityResult.isRight()) {
          activityEntities.push(entityResult.value);
        }
      }

      // Batch persist activity entities
      await this.activityDataRepository.saveMany(activityEntities);

      // Mark upload aggregate as completed
      upload.markAsCompleted(totalRows, activityEntities.length, invalidRows.length);
      await this.uploadRepository.update(upload);

      return right({
        uploadId: upload.id,
        totalRows,
        processedRows: activityEntities.length,
        failedRows: invalidRows.length,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during file processing';
      upload.markAsFailed(errorMsg);
      await this.uploadRepository.update(upload);
      return left(new Error(`Processing failure: ${errorMsg}`));
    }
  }
}
