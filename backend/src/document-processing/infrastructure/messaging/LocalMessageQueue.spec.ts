import { describe, it, expect } from 'vitest';
import { LocalMessageQueue } from './LocalMessageQueue';

describe('LocalMessageQueue with DLQ and Exponential Backoff', () => {
  it('should publish and poll messages FIFO', async () => {
    const queue = new LocalMessageQueue();
    const queueName = 'test-queue-1';

    await queue.publish(queueName, { task: 'job-1' });
    await queue.publish(queueName, { task: 'job-2' });

    const msg1 = await queue.poll<{ task: string }>(queueName);
    const msg2 = await queue.poll<{ task: string }>(queueName);

    expect(msg1?.task).toBe('job-1');
    expect(msg2?.task).toBe('job-2');
  });

  it('should route message to Dead Letter Queue (DLQ) after exceeding maxAttempts', async () => {
    const queue = new LocalMessageQueue();
    const queueName = 'test-queue-dlq';

    await queue.publish(queueName, { task: 'failing-job' }, 2);

    // Attempt 1
    const msgObj1 = await queue.pollMessageObject<{ task: string }>(queueName);
    expect(msgObj1).not.toBeNull();
    await queue.nack(queueName, msgObj1!, new Error('Failure 1'));

    // Attempt 2
    // Force nextAttemptAt to be now for test
    msgObj1!.nextAttemptAt = Date.now();
    const msgObj2 = await queue.pollMessageObject<{ task: string }>(queueName);
    expect(msgObj2).not.toBeNull();
    await queue.nack(queueName, msgObj2!, new Error('Failure 2'));

    // Should now be in DLQ
    const dlqMessages = queue.getDlqMessages(queueName);
    expect(dlqMessages.length).toBe(1);
    expect(dlqMessages[0]?.lastError).toBe('Failure 2');
  });
});
