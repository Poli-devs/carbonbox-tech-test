export interface IHttpRequest<TBody = unknown, TParams = unknown, TQuery = unknown> {
  body: TBody;
  params: TParams;
  query: TQuery;
  headers: Record<string, string | string[] | undefined>;
}
