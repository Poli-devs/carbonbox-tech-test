import { BaseController } from '../../../shared/infrastructure/http/BaseController';
import { IHttpRequest } from '../../../shared/infrastructure/http/IHttpRequest';
import { IHttpResponse } from '../../../shared/infrastructure/http/IHttpResponse';
import { GetUploadResultsQueryHandler } from '../../application/queries/handlers/GetUploadResultsQueryHandler';

export class GetUploadResultsController extends BaseController {
  constructor(private readonly queryHandler: GetUploadResultsQueryHandler) {
    super();
  }

  public async execute(
    req: IHttpRequest<unknown, { id: string }>
  ): Promise<IHttpResponse> {
    const { id } = req.params;

    const result = await this.queryHandler.execute({ uploadId: id });

    if (result.isLeft()) {
      return this.notFound(result.value.message);
    }

    return this.ok(result.value);
  }
}
