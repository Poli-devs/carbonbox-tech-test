import { BaseController } from '../../../shared/infrastructure/http/BaseController';
import { IHttpRequest } from '../../../shared/infrastructure/http/IHttpRequest';
import { IHttpResponse } from '../../../shared/infrastructure/http/IHttpResponse';
import { CreateUploadCommandHandler } from '../../application/commands/handlers/CreateUploadCommandHandler';

export interface CreateUploadRequestBody {
  fileName: string;
  fileBuffer: Buffer;
  userId?: string;
}

export class CreateUploadController extends BaseController {
  constructor(private readonly commandHandler: CreateUploadCommandHandler) {
    super();
  }

  public async execute(
    req: IHttpRequest<CreateUploadRequestBody>
  ): Promise<IHttpResponse> {
    const { fileName, fileBuffer, userId } = req.body;

    if (!fileName || !fileBuffer) {
      return this.badRequest('Both fileName and fileBuffer are required.');
    }

    const result = await this.commandHandler.execute({
      originalFileName: fileName,
      fileBuffer,
      userId: userId || 'user-123',
    });

    if (result.isLeft()) {
      return this.badRequest(result.value.message);
    }

    return this.created(result.value);
  }
}
