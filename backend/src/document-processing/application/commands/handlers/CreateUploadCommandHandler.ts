import { ICommandHandler } from '../../../../shared/application/ICommandHandler';
import { Either, left, right } from '../../../../shared/domain/Either';
import { IMessagePublisher } from '../../../../shared/infrastructure/messaging/IMessagePublisher';
import { Upload } from '../../../domain/entities/Upload';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { FileName } from '../../../domain/value-objects/FileName';
import { UploadStatus } from '../../../domain/value-objects/UploadStatus';
import { IFileStorage } from '../../../infrastructure/storage/IFileStorage';
import { CreateUploadCommand } from '../objects/CreateUploadCommand';

export interface CreateUploadResult {
  id: string;
  status: string;
  fileName: string;
  createdAt: Date;
}

export class CreateUploadCommandHandler
  implements ICommandHandler<CreateUploadCommand, CreateUploadResult>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly fileStorage: IFileStorage,
    private readonly messagePublisher: IMessagePublisher
  ) {}

  public async execute(command: CreateUploadCommand): Promise<Either<Error, CreateUploadResult>> {
    // 1. Validate File Name
    const fileNameOrError = FileName.create(command.originalFileName);
    if (fileNameOrError.isLeft()) {
      return left(fileNameOrError.value);
    }
    const fileNameVo = fileNameOrError.value;

    // 2. Validate Buffer
    if (!command.fileBuffer || command.fileBuffer.length === 0) {
      return left(new Error('Uploaded file is empty.'));
    }

    try {
      // 3. Save file in storage (local or S3)
      const storageKey = `${Date.now()}-${fileNameVo.value}`;
      const fileUrl = await this.fileStorage.save(storageKey, command.fileBuffer);

      // 4. Create Aggregate Root in PENDING status
      const statusOrError = UploadStatus.create(UploadStatus.PENDING);
      if (statusOrError.isLeft()) {
        return left(statusOrError.value);
      }

      const uploadOrError = Upload.create({
        fileName: fileNameVo,
        fileUrl,
        status: statusOrError.value,
        userId: command.userId || 'user-123',
      });

      if (uploadOrError.isLeft()) {
        return left(uploadOrError.value);
      }

      const upload = uploadOrError.value;

      // 5. Save in database
      await this.uploadRepository.save(upload);

      // 6. Enqueue message for asynchronous processing
      await this.messagePublisher.publish('document-processing-queue', {
        uploadId: upload.id,
        fileUrl: upload.fileUrl,
        fileName: fileNameVo.value,
        userId: upload.userId,
      });

      return right({
        id: upload.id,
        status: upload.status.value,
        fileName: fileNameVo.value,
        createdAt: upload.createdAt,
      });
    } catch (error) {
      return left(
        error instanceof Error
          ? error
          : new Error('Unexpected error occurred during upload creation.')
      );
    }
  }
}
