import { IMessageConsumer } from '../../../shared/infrastructure/messaging/IMessageConsumer';
import { IMessagePublisher } from '../../../shared/infrastructure/messaging/IMessagePublisher';

export interface QueueMessage<T = unknown> {
  id: string;
  data: T;
  timestamp: Date;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: number;
  lastError?: string;
}

export class LocalMessageQueue implements IMessagePublisher, IMessageConsumer {
  private static instance: LocalMessageQueue;
  private queues: Map<string, QueueMessage[]> = new Map();
  private deadLetterQueues: Map<string, QueueMessage[]> = new Map();

  constructor() {}

  public static getInstance(): LocalMessageQueue {
    if (!LocalMessageQueue.instance) {
      LocalMessageQueue.instance = new LocalMessageQueue();
    }
    return LocalMessageQueue.instance;
  }

  public async publish<T>(topicOrQueue: string, data: T, maxAttempts = 3): Promise<void> {
    if (!this.queues.has(topicOrQueue)) {
      this.queues.set(topicOrQueue, []);
    }

    const message: QueueMessage<T> = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      data,
      timestamp: new Date(),
      attempts: 0,
      maxAttempts,
      nextAttemptAt: Date.now(),
    };

    const q = this.queues.get(topicOrQueue)!;
    q.push(message as QueueMessage);
  }

  public async poll<T>(topicOrQueue: string): Promise<T | null> {
    const q = this.queues.get(topicOrQueue);
    if (!q || q.length === 0) return null;

    const now = Date.now();
    const readyIndex = q.findIndex((msg) => msg.nextAttemptAt <= now);
    if (readyIndex === -1) return null;

    const message = q.splice(readyIndex, 1)[0]!;
    message.attempts += 1;
    return message.data as T;
  }

  public async pollMessageObject<T>(topicOrQueue: string): Promise<QueueMessage<T> | null> {
    const q = this.queues.get(topicOrQueue);
    if (!q || q.length === 0) return null;

    const now = Date.now();
    const readyIndex = q.findIndex((msg) => msg.nextAttemptAt <= now);
    if (readyIndex === -1) return null;

    const message = q.splice(readyIndex, 1)[0]!;
    message.attempts += 1;
    return message as QueueMessage<T>;
  }

  /**
   * Negative Acknowledgement with Exponential Backoff and DLQ routing
   */
  public async nack(topicOrQueue: string, message: QueueMessage, error: Error | string): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    message.lastError = errorMessage;

    if (message.attempts >= message.maxAttempts) {
      // Exceeded max attempts: Route to Dead Letter Queue (DLQ)
      if (!this.deadLetterQueues.has(topicOrQueue)) {
        this.deadLetterQueues.set(topicOrQueue, []);
      }
      this.deadLetterQueues.get(topicOrQueue)!.push(message);
      return;
    }

    // Exponential Backoff: delay = 1000 * (2 ^ (attempts - 1))
    const backoffDelay = Math.min(30000, 1000 * Math.pow(2, message.attempts - 1));
    message.nextAttemptAt = Date.now() + backoffDelay;

    if (!this.queues.has(topicOrQueue)) {
      this.queues.set(topicOrQueue, []);
    }
    this.queues.get(topicOrQueue)!.push(message);
  }

  public async consume<T>(
    topicOrQueue: string,
    handler: (message: T) => Promise<void>
  ): Promise<void> {
    const message = await this.poll<T>(topicOrQueue);
    if (message) {
      await handler(message);
    }
  }

  public getDlqMessages(topicOrQueue: string): QueueMessage[] {
    return this.deadLetterQueues.get(topicOrQueue) || [];
  }

  public getQueueLength(topicOrQueue: string): number {
    return this.queues.get(topicOrQueue)?.length || 0;
  }
}
