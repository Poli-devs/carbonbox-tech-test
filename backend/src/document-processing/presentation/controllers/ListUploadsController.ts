import { BaseController } from '../../../shared/infrastructure/http/BaseController';
import { IHttpRequest } from '../../../shared/infrastructure/http/IHttpRequest';
import { IHttpResponse } from '../../../shared/infrastructure/http/IHttpResponse';
import { ListUploadsQueryHandler } from '../../application/queries/handlers/ListUploadsQueryHandler';

export interface ListUploadsQueryParams {
  page?: string;
  limit?: string;
  userId?: string;
}

export class ListUploadsController extends BaseController {
  constructor(private readonly queryHandler: ListUploadsQueryHandler) {
    super();
  }

  public async execute(
    req: IHttpRequest<unknown, unknown, ListUploadsQueryParams>
  ): Promise<IHttpResponse> {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const userId = req.query.userId;

    const result = await this.queryHandler.execute({ page, limit, userId });

    if (result.isLeft()) {
      return this.badRequest(result.value.message);
    }

    return this.ok(result.value);
  }
}
