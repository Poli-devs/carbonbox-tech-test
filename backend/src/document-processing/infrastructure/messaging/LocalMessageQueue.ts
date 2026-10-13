import fs from 'fs/promises';
import path from 'path';
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
  private readonly persistDir: string | null;

  constructor(persistDir?: string | null) {
    if (persistDir !== undefined) {
      this.persistDir = persistDir;
    } else if (process.env.NODE_ENV === 'test') {
      this.persistDir = null; // In-memory for tests
    } else {
      this.persistDir = path.resolve(process.cwd(), 'uploads', '.queue');
    }
  }

  public static getInstance(persistDir?: string | null): LocalMessageQueue {
    if (!LocalMessageQueue.instance) {
      LocalMessageQueue.instance = new LocalMessageQueue(persistDir);
    }
    return LocalMessageQueue.instance;
  }

  private getQueueDir(topicOrQueue: string, sub: 'pending' | 'processing' | 'dlq'): string {
    const sanitized = topicOrQueue.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.persistDir!, sanitized, sub);
  }

  private async ensureDirs(topicOrQueue: string): Promise<void> {
    if (!this.persistDir) return;
    try {
      await fs.mkdir(this.getQueueDir(topicOrQueue, 'pending'), { recursive: true });
      await fs.mkdir(this.getQueueDir(topicOrQueue, 'processing'), { recursive: true });
      await fs.mkdir(this.getQueueDir(topicOrQueue, 'dlq'), { recursive: true });
    } catch {
      // Ignore directory creation errors
    }
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

    if (this.persistDir) {
      try {
        await this.ensureDirs(topicOrQueue);
        const filePath = path.join(this.getQueueDir(topicOrQueue, 'pending'), `${message.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(message), 'utf-8');
      } catch {
        // Fall back to in-memory if disk write fails
      }
    }
  }

  public async poll<T>(topicOrQueue: string): Promise<T | null> {
    const msg = await this.pollMessageObject<T>(topicOrQueue);
    return msg ? msg.data : null;
  }

  public async pollMessageObject<T>(topicOrQueue: string): Promise<QueueMessage<T> | null> {
    const now = Date.now();

    // 1. Try file-backed persistent queue first if enabled
    if (this.persistDir) {
      try {
        await this.ensureDirs(topicOrQueue);
        const pendingDir = this.getQueueDir(topicOrQueue, 'pending');
        const processingDir = this.getQueueDir(topicOrQueue, 'processing');
        const files = await fs.readdir(pendingDir);

        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          const pendingPath = path.join(pendingDir, file);
          const processingPath = path.join(processingDir, file);

          try {
            const content = await fs.readFile(pendingPath, 'utf-8');
            const parsed = JSON.parse(content) as QueueMessage<T>;
            if (parsed.nextAttemptAt > now) {
              continue; // Not ready yet (exponential backoff)
            }

            // Atomic claim via rename
            await fs.rename(pendingPath, processingPath);

            parsed.attempts = (parsed.attempts || 0) + 1;
            parsed.timestamp = new Date(parsed.timestamp);

            // Also synchronize in-memory state
            const q = this.queues.get(topicOrQueue);
            if (q) {
              const memIdx = q.findIndex((m) => m.id === parsed.id);
              if (memIdx !== -1) q.splice(memIdx, 1);
            }

            return parsed;
          } catch {
            // Already claimed by another worker process, try next
            continue;
          }
        }
      } catch {
        // Fall back to in-memory on disk access error
      }
    }

    // 2. In-memory queue fallback
    const q = this.queues.get(topicOrQueue);
    if (!q || q.length === 0) return null;

    const readyIndex = q.findIndex((msg) => msg.nextAttemptAt <= now);
    if (readyIndex === -1) return null;

    const message = q.splice(readyIndex, 1)[0]!;
    message.attempts += 1;
    return message as QueueMessage<T>;
  }

  /**
   * Positive Acknowledgement (Job completed successfully)
   */
  public async ack(topicOrQueue: string, message: QueueMessage): Promise<void> {
    if (this.persistDir) {
      try {
        const processingPath = path.join(this.getQueueDir(topicOrQueue, 'processing'), `${message.id}.json`);
        await fs.unlink(processingPath);
      } catch {
        // Ignored
      }
    }
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

      if (this.persistDir) {
        try {
          const processingPath = path.join(this.getQueueDir(topicOrQueue, 'processing'), `${message.id}.json`);
          const dlqPath = path.join(this.getQueueDir(topicOrQueue, 'dlq'), `${message.id}.json`);
          await fs.writeFile(dlqPath, JSON.stringify(message, null, 2), 'utf-8');
          await fs.unlink(processingPath).catch(() => {});
        } catch {
          // Ignored
        }
      }
      return;
    }

    // Exponential Backoff: delay = 1000 * (2 ^ (attempts - 1))
    const backoffDelay = Math.min(30000, 1000 * Math.pow(2, message.attempts - 1));
    message.nextAttemptAt = Date.now() + backoffDelay;

    if (!this.queues.has(topicOrQueue)) {
      this.queues.set(topicOrQueue, []);
    }
    this.queues.get(topicOrQueue)!.push(message);

    if (this.persistDir) {
      try {
        const processingPath = path.join(this.getQueueDir(topicOrQueue, 'processing'), `${message.id}.json`);
        const pendingPath = path.join(this.getQueueDir(topicOrQueue, 'pending'), `${message.id}.json`);
        await fs.writeFile(pendingPath, JSON.stringify(message), 'utf-8');
        await fs.unlink(processingPath).catch(() => {});
      } catch {
        // Ignored
      }
    }
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
