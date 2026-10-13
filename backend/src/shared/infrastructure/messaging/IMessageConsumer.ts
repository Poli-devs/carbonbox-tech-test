export interface IMessageConsumer {
  consume<T>(topicOrQueue: string, handler: (message: T) => Promise<void>): Promise<void>;
  poll<T>(topicOrQueue: string): Promise<T | null>;
}
