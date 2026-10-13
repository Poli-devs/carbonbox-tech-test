export interface IMessagePublisher {
  publish<T>(topicOrQueue: string, message: T): Promise<void>;
}
