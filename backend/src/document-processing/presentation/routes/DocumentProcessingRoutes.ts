import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { DocumentProcessingModule } from '../../infrastructure/dependency-injection/DocumentProcessingModule';
import { CreateUploadRequestBody } from '../controllers/CreateUploadController';
import { ListUploadsQueryParams } from '../controllers/ListUploadsController';

export async function documentProcessingRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> {
  const module = DocumentProcessingModule.getInstance();

  /**
   * POST /api/v1/uploads
   * Subir archivo CSV (Multipart Form)
   */
  fastify.post('/uploads', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No file uploaded. Please provide a CSV file.',
        });
      }

      const fileBuffer = await data.toBuffer();
      const fileName = data.filename;

      const httpReq = {
        body: {
          fileName,
          fileBuffer,
          userId: 'user-123',
        } as CreateUploadRequestBody,
        params: request.params,
        query: request.query,
        headers: request.headers as Record<string, string | string[] | undefined>,
      };

      const response = await module.createUploadController.execute(httpReq);
      return reply.status(response.statusCode).send(response.body);
    } catch (err) {
      request.log.error(err, 'Error in POST /api/v1/uploads');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: err instanceof Error ? err.message : 'Unknown error during file upload',
      });
    }
  });

  /**
   * GET /api/v1/uploads/:id
   * Obtener estado de procesamiento
   */
  fastify.get('/uploads/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const httpReq = {
      body: request.body,
      params: request.params,
      query: request.query,
      headers: request.headers as Record<string, string | string[] | undefined>,
    };

    const response = await module.getUploadByIdController.execute(httpReq);
    return reply.status(response.statusCode).send(response.body);
  });

  /**
   * GET /api/v1/uploads
   * Listar uploads (paginado) y resumen
   */
  fastify.get('/uploads', async (request: FastifyRequest<{ Querystring: ListUploadsQueryParams }>, reply: FastifyReply) => {
    const httpReq = {
      body: request.body,
      params: request.params,
      query: request.query,
      headers: request.headers as Record<string, string | string[] | undefined>,
    };

    const response = await module.listUploadsController.execute(httpReq);
    return reply.status(response.statusCode).send(response.body);
  });

  /**
   * GET /api/v1/uploads/:id/results
   * Obtener datos procesados de actividad
   */
  fastify.get('/uploads/:id/results', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const httpReq = {
      body: request.body,
      params: request.params,
      query: request.query,
      headers: request.headers as Record<string, string | string[] | undefined>,
    };

    const response = await module.getUploadResultsController.execute(httpReq);
    return reply.status(response.statusCode).send(response.body);
  });
}
