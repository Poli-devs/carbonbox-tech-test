import { IHttpRequest } from './IHttpRequest';
import { IHttpResponse } from './IHttpResponse';

export abstract class BaseController {
  public abstract execute(req: IHttpRequest): Promise<IHttpResponse>;

  public ok<T>(dto?: T): IHttpResponse<T | { message: string }> {
    return {
      statusCode: 200,
      body: dto ?? { message: 'OK' },
    };
  }

  public created<T>(dto: T): IHttpResponse<T> {
    return {
      statusCode: 201,
      body: dto,
    };
  }

  public badRequest(message: string): IHttpResponse<{ message: string; error: string }> {
    return {
      statusCode: 400,
      body: { error: 'Bad Request', message },
    };
  }

  public notFound(message: string): IHttpResponse<{ message: string; error: string }> {
    return {
      statusCode: 404,
      body: { error: 'Not Found', message },
    };
  }

  public fail(error: Error | string): IHttpResponse<{ message: string; error: string }> {
    const message = error instanceof Error ? error.message : error;
    return {
      statusCode: 500,
      body: { error: 'Internal Server Error', message },
    };
  }
}
