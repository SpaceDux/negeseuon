/**
 * Interface for broker-specific operations
 * Each connector type can implement this interface to provide type-specific operations
 */
export interface BrokerOperations {
  /**
   * List available topics/queues/exchanges (broker-specific)
   * @returns Array of topic/queue/exchange names
   */
  listTopics?(): Promise<string[]>;

  /**
   * Publish a message to a topic/queue/exchange
   * @param topic The topic/queue/exchange name
   * @param message The message to publish
   */
  publish?(topic: string, message: unknown): Promise<void>;

  /**
   * Subscribe to a topic/queue/exchange
   * @param topic The topic/queue/exchange name
   * @param callback The callback to handle messages
   */
  subscribe?(
    topic: string,
    callback: (message: unknown) => void
  ): Promise<void>;

  /**
   * Test the connection with a given configuration
   * Some connectors may implement this to test without fully connecting
   * @param config The configuration to test
   * @returns True if the connection test is successful
   */
  testConnection?(config: unknown): Promise<boolean>;

  // Add more broker-specific operations as needed
  // Each connector can implement only the operations it supports
}
