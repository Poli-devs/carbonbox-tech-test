import { IMessagePublisher } from '../../../shared/infrastructure/messaging/IMessagePublisher';
import { LocalMessageQueue } from './LocalMessageQueue';

export interface SqsPublisherConfig {
  queueUrl?: string;
  region?: string;
}

export class SqsMessagePublisher implements IMessagePublisher {
  private readonly localQueue: LocalMessageQueue;
  protected readonly config?: SqsPublisherConfig;

  constructor(config?: SqsPublisherConfig) {
    this.config = config;
    this.localQueue = LocalMessageQueue.getInstance();
  }

  public getConfiguration(): SqsPublisherConfig | undefined {
    return this.config;
  }

  public async publish<T>(topicOrQueue: string, message: T): Promise<void> {
    await this.localQueue.publish(topicOrQueue, message);
  }
}
