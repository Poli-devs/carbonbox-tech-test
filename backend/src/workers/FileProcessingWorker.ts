import pino from 'pino';
import config from '../config';
import { DocumentProcessingModule } from '../document-processing/infrastructure/dependency-injection/DocumentProcessingModule';
import { LocalMessageQueue } from '../document-processing/infrastructure/messaging/LocalMessageQueue';

const logger = pino({
  name: 'file-processing-worker',
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

export class FileProcessingWorker {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private readonly module: DocumentProcessingModule;
  private readonly queue: LocalMessageQueue;

  constructor() {
    this.module = DocumentProcessingModule.getInstance();
    this.queue = LocalMessageQueue.getInstance();
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    logger.info('🚀 FileProcessingWorker started. Listening for incoming upload jobs...');

    const pollInterval = config.get('queuePollIntervalMs') || 2000;

    const pollLoop = async () => {
      if (!this.isRunning) return;

      try {
        await this.processNextJob();
      } catch (err) {
        logger.error(err, 'Unexpected error during job processing loop');
      } finally {
        if (this.isRunning) {
          this.timer = setTimeout(pollLoop, pollInterval);
        }
      }
    };

    this.timer = setTimeout(pollLoop, 500);
  }

  public async processNextJob(): Promise<void> {
    const message = await this.queue.pollMessageObject<{
      uploadId: string;
      fileUrl: string;
      fileName: string;
    }>('document-processing-queue');

    if (!message) {
      return;
    }

    const { uploadId, fileName } = message.data;
    logger.info({ uploadId, fileName, attempt: message.attempts }, '📥 Dequeued upload job for processing');

    try {
      const result = await this.module.processFileCommandHandler.execute({ uploadId });

      if (result.isLeft()) {
        const errorMsg = result.value.message;
        logger.warn({ uploadId, error: errorMsg }, '⚠️ File processing encountered business errors');
        await this.queue.nack('document-processing-queue', message, errorMsg);
      } else {
        logger.info(
          {
            uploadId,
            totalRows: result.value.totalRows,
            processedRows: result.value.processedRows,
            failedRows: result.value.failedRows,
          },
          '✅ Upload processed successfully'
        );
      }
    } catch (error) {
      logger.error({ uploadId, err: error }, '❌ Unhandled error while processing upload job');
      await this.queue.nack(
        'document-processing-queue',
        message,
        error instanceof Error ? error.message : 'Unknown exception'
      );
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    logger.info('🛑 FileProcessingWorker stopped.');
  }
}

// Auto-run if executed directly as script: `tsx src/workers/FileProcessingWorker.ts`
if (require.main === module) {
  const worker = new FileProcessingWorker();
  worker.start().catch((err) => {
    logger.fatal(err, 'Fatal error starting FileProcessingWorker');
    process.exit(1);
  });

  const shutdown = () => {
    logger.info('Gracefully shutting down worker...');
    worker.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
