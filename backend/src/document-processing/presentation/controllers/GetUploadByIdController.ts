import { BaseController } from '../../../shared/infrastructure/http/BaseController';
import { IHttpRequest } from '../../../shared/infrastructure/http/IHttpRequest';
import { IHttpResponse } from '../../../shared/infrastructure/http/IHttpResponse';
import { GetUploadByIdQueryHandler } from '../../application/queries/handlers/GetUploadByIdQueryHandler';

export class GetUploadByIdController extends BaseController {
  constructor(private readonly queryHandler: GetUploadByIdQueryHandler) {
    super();
  }

  public async execute(
    req: IHttpRequest<unknown, { id: string }>
  ): Promise<IHttpResponse> {
    const { id } = req.params;

    const result = await this.queryHandler.execute({ id });

    if (result.isLeft()) {
      return this.notFound(result.value.message);
    }

    return this.ok(result.value);
  }
}
