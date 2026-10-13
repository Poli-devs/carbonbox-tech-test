import { ICommandHandler } from '../../../../shared/application/ICommandHandler';
import { Either } from '../../../../shared/domain/Either';
import { FileProcessingService, ProcessFileResult } from '../../services/FileProcessingService';
import { ProcessFileCommand } from '../objects/ProcessFileCommand';

export class ProcessFileCommandHandler
  implements ICommandHandler<ProcessFileCommand, ProcessFileResult>
{
  constructor(private readonly fileProcessingService: FileProcessingService) {}

  public async execute(command: ProcessFileCommand): Promise<Either<Error, ProcessFileResult>> {
    return this.fileProcessingService.process(command.uploadId);
  }
}
