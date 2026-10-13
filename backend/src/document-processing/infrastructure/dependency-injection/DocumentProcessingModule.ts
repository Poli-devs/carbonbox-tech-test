import { PrismaClient } from '@prisma/client';
import { CreateUploadCommandHandler } from '../../application/commands/handlers/CreateUploadCommandHandler';
import { ProcessFileCommandHandler } from '../../application/commands/handlers/ProcessFileCommandHandler';
import { GetUploadByIdQueryHandler } from '../../application/queries/handlers/GetUploadByIdQueryHandler';
import { GetUploadResultsQueryHandler } from '../../application/queries/handlers/GetUploadResultsQueryHandler';
import { ListUploadsQueryHandler } from '../../application/queries/handlers/ListUploadsQueryHandler';
import { CsvParserService } from '../../application/services/CsvParserService';
import { FileProcessingService } from '../../application/services/FileProcessingService';
import { SqsMessageConsumer } from '../messaging/SqsMessageConsumer';
import { SqsMessagePublisher } from '../messaging/SqsMessagePublisher';
import { PrismaActivityDataRepository } from '../persistence/repositories/PrismaActivityDataRepository';
import { PrismaUploadRepository } from '../persistence/repositories/PrismaUploadRepository';
import { LocalFileStorage } from '../storage/LocalFileStorage';
import { CreateUploadController } from '../../presentation/controllers/CreateUploadController';
import { GetUploadByIdController } from '../../presentation/controllers/GetUploadByIdController';
import { GetUploadResultsController } from '../../presentation/controllers/GetUploadResultsController';
import { ListUploadsController } from '../../presentation/controllers/ListUploadsController';

export class DocumentProcessingModule {
  private static instance: DocumentProcessingModule;

  public readonly prisma: PrismaClient;
  public readonly uploadRepository: PrismaUploadRepository;
  public readonly activityDataRepository: PrismaActivityDataRepository;
  public readonly fileStorage: LocalFileStorage;
  public readonly messagePublisher: SqsMessagePublisher;
  public readonly messageConsumer: SqsMessageConsumer;
  public readonly csvParserService: CsvParserService;
  public readonly fileProcessingService: FileProcessingService;

  // Handlers
  public readonly createUploadCommandHandler: CreateUploadCommandHandler;
  public readonly processFileCommandHandler: ProcessFileCommandHandler;
  public readonly getUploadByIdQueryHandler: GetUploadByIdQueryHandler;
  public readonly listUploadsQueryHandler: ListUploadsQueryHandler;
  public readonly getUploadResultsQueryHandler: GetUploadResultsQueryHandler;

  // Controllers
  public readonly createUploadController: CreateUploadController;
  public readonly getUploadByIdController: GetUploadByIdController;
  public readonly listUploadsController: ListUploadsController;
  public readonly getUploadResultsController: GetUploadResultsController;

  private constructor() {
    this.prisma = new PrismaClient();
    this.uploadRepository = new PrismaUploadRepository(this.prisma);
    this.activityDataRepository = new PrismaActivityDataRepository(this.prisma);
    this.fileStorage = new LocalFileStorage();
    this.messagePublisher = new SqsMessagePublisher();
    this.messageConsumer = new SqsMessageConsumer();
    this.csvParserService = new CsvParserService();

    this.fileProcessingService = new FileProcessingService(
      this.uploadRepository,
      this.activityDataRepository,
      this.fileStorage,
      this.csvParserService
    );

    // Command Handlers
    this.createUploadCommandHandler = new CreateUploadCommandHandler(
      this.uploadRepository,
      this.fileStorage,
      this.messagePublisher
    );

    this.processFileCommandHandler = new ProcessFileCommandHandler(this.fileProcessingService);

    // Query Handlers
    this.getUploadByIdQueryHandler = new GetUploadByIdQueryHandler(this.uploadRepository);
    this.listUploadsQueryHandler = new ListUploadsQueryHandler(this.uploadRepository);
    this.getUploadResultsQueryHandler = new GetUploadResultsQueryHandler(
      this.uploadRepository,
      this.activityDataRepository
    );

    // Controllers
    this.createUploadController = new CreateUploadController(this.createUploadCommandHandler);
    this.getUploadByIdController = new GetUploadByIdController(this.getUploadByIdQueryHandler);
    this.listUploadsController = new ListUploadsController(this.listUploadsQueryHandler);
    this.getUploadResultsController = new GetUploadResultsController(
      this.getUploadResultsQueryHandler
    );
  }

  public static getInstance(): DocumentProcessingModule {
    if (!DocumentProcessingModule.instance) {
      DocumentProcessingModule.instance = new DocumentProcessingModule();
    }
    return DocumentProcessingModule.instance;
  }
}
