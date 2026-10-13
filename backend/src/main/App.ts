import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import Fastify, { FastifyInstance } from 'fastify';
import config from '../config';
import { documentProcessingRoutes } from '../document-processing/presentation/routes/DocumentProcessingRoutes';
import { FileProcessingWorker } from '../workers/FileProcessingWorker';

export class App {
  private readonly app: FastifyInstance;
  private worker: FileProcessingWorker | null = null;

  constructor() {
    this.app = Fastify({
      logger: {
        level: config.get('env') === 'production' ? 'info' : 'debug',
        transport:
          config.get('env') !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
    });
  }

  public async setup(): Promise<FastifyInstance> {
    // 1. CORS plugin
    await this.app.register(fastifyCors, {
      origin: true, // Allow frontend dev server
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // 2. Multipart plugin for file uploads
    await this.app.register(fastifyMultipart, {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 1,
      },
    });

    // 3. Health check route
    this.app.get('/health', async () => {
      return {
        status: 'ok',
        service: 'carbonbox-backend',
        environment: config.get('env'),
        timestamp: new Date().toISOString(),
      };
    });

    // 4. Register Bounded Context presentation routes
    await this.app.register(documentProcessingRoutes, { prefix: '/api/v1' });

    return this.app;
  }

  public async start(port?: number, host?: string, startIntegratedWorker = true): Promise<void> {
    await this.setup();

    const serverPort = port ?? config.get('port');
    const serverHost = host ?? config.get('host');

    await this.app.listen({ port: serverPort, host: serverHost });
    this.app.log.info(`⚡ Server running at http://${serverHost}:${serverPort}`);

    // If enabled, run integrated worker for convenient local dev
    if (startIntegratedWorker) {
      this.worker = new FileProcessingWorker();
      await this.worker.start();
    }
  }

  public async close(): Promise<void> {
    if (this.worker) {
      this.worker.stop();
    }
    await this.app.close();
  }

  public getFastify(): FastifyInstance {
    return this.app;
  }
}
