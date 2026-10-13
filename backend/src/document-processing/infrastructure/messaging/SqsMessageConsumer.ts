import { IMessageConsumer } from '../../../shared/infrastructure/messaging/IMessageConsumer';
import { LocalMessageQueue } from './LocalMessageQueue';

export interface SqsConsumerConfig {
  queueUrl?: string;
  region?: string;
}

export class SqsMessageConsumer implements IMessageConsumer {
  private readonly localQueue: LocalMessageQueue;
  protected readonly config?: SqsConsumerConfig;

  constructor(config?: SqsConsumerConfig) {
    this.config = config;
    this.localQueue = LocalMessageQueue.getInstance();
  }

  public getConfiguration(): SqsConsumerConfig | undefined {
    return this.config;
  }

  public async poll<T>(topicOrQueue: string): Promise<T | null> {
    return this.localQueue.poll<T>(topicOrQueue);
  }

  public async consume<T>(
    topicOrQueue: string,
    handler: (message: T) => Promise<void>
  ): Promise<void> {
    await this.localQueue.consume<T>(topicOrQueue, handler);
  }
}
