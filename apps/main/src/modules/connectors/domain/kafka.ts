import { Connector } from "./connector.abstract";
import { KafkaConfiguration, ConnectorType } from "@negeseuon/schemas";
import { Admin, BaseOptions, Consumer, Producer } from "@platformatic/kafka";

export class KafkaConnector extends Connector<KafkaConfiguration> {
  #type: ConnectorType;
  #consumer: Consumer | null = null;
  #producer: Producer | null = null;
  #admin: Admin | null = null;
  #isConnected: boolean = false;
  #config: KafkaConfiguration;

  constructor(
    id: number,
    name: string,
    description: string,
    config: KafkaConfiguration
  ) {
    super(id, name, description, config);
    this.#config = config;
    this.#type = "kafka";
  }

  private getBaseConfig(config: KafkaConfiguration): BaseOptions {
    return {
      ...config,
      clientId: `kafka-connector-${this.id}`,
      timeout: 30,
      retries: 1,
      strict: true,
    };
  }

  /**
   * Connect to the Kafka cluster
   */
  public async connect(): Promise<void> {
    const baseConfig = this.getBaseConfig(this.#config);
    // Initialize consumer client
    this.#consumer = new Consumer({
      ...baseConfig,
      groupId: `consumer-group-${this.id}`,
    });

    // Initialize producer client
    this.#producer = new Producer(baseConfig);

    // Initialize admin client (for managing topics, partitions, etc.)
    this.#admin = new Admin(baseConfig);

    this.#isConnected = true;
  }

  /**
   * Disconnect from the Kafka cluster
   */
  public async disconnect(): Promise<void> {
    const errors: Error[] = [];

    try {
      // Close consumer client
      if (this.#consumer) {
        await this.#consumer.close();
        this.#consumer = null;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }

    try {
      if (this.#producer) {
        await this.#producer.close();
        this.#producer = null;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }

    try {
      if (this.#admin) {
        await this.#admin.close();
        this.#admin = null;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }

    this.#isConnected = false;

    if (errors.length > 0) {
      throw new Error(
        `Errors during disconnect: ${errors.map((e) => e.message).join(", ")}`
      );
    }
  }

  /**
   * Whether the connector is connected
   */
  public isConnected(): boolean {
    return this.#isConnected;
  }

  /**
   * Test the connection
   */
  public async testConnection(config: KafkaConfiguration): Promise<boolean> {
    try {
      const client = new Admin(this.getBaseConfig(config));
      const topics = await client.listTopics();
      await client.close();
      return topics.length > 0;
    } catch (error) {
      throw new Error(`Failed to test connection: ${error}`);
    }
  }

  /**
   * Get the consumer instance
   */
  public getConsumer(): Consumer | null {
    return this.#consumer;
  }

  /**
   * Get the producer instance
   */
  public getProducer(): Producer | null {
    return this.#producer;
  }

  /**
   * Get the admin client instance
   */
  public getAdmin(): Admin | null {
    return this.#admin;
  }

  /**
   * Get the connector type
   */
  public getType(): string {
    return this.#type;
  }

  /**
   * List available topics (Kafka-specific operation)
   */
  public async listTopics(): Promise<string[]> {
    if (!this.#admin) {
      throw new Error("Connector is not connected");
    }
    return await this.#admin.listTopics();
  }
}
