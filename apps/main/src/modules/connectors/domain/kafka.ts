import { Connector } from "./connector.abstract";
import { KafkaConfiguration, ConnectorType } from "@negeseuon/schemas";
import { safeAsync } from "@negeseuon/utils";
import {
  Admin,
  BaseOptions,
  Consumer,
  Message,
  MessagesStreamModeValue,
  MessagesStreamModes,
  Producer,
  TopicWithPartitionAndOffset,
  noopDeserializer,
} from "@platformatic/kafka";

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
      groupId: `consumer-group-${this.id}-${Date.now()}`,
    });

    // Initialize producer client
    this.#producer = new Producer(baseConfig);

    // Initialize admin client (for managing topics, partitions, etc.)
    this.#admin = new Admin(baseConfig);

    const [_topics, error] = await safeAsync(() => this.#admin!.listTopics());
    if (error) {
      console.error(error);
      throw error;
    }

    this.#isConnected = true;
    return;
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

    const [topics, error] = await safeAsync(() => this.#admin!.listTopics());
    if (error) {
      console.error(error);
      throw error;
    }

    return topics ?? [];
  }

  /**
   * Get metadata for a specific topic
   */
  public async getTopicMetadataByTopic(topic: string): Promise<any> {
    if (!this.#admin) {
      throw new Error("Connector is not connected");
    }

    const [metadata, error] = await safeAsync(() =>
      this.#admin!.metadata({ topics: [topic] })
    );

    if (error) {
      console.error(error);
      throw error;
    }

    if (!metadata) {
      return null;
    }

    // Transform the metadata to match the KafkaTopicMetadata schema
    const brokers = new Map<number, { host: string; port: number }>();
    const now = Date.now();

    // Extract broker information
    // metadata.brokers is a Map<number, Broker>
    if (metadata.brokers) {
      if (metadata.brokers instanceof Map) {
        for (const [brokerId, broker] of metadata.brokers.entries()) {
          brokers.set(brokerId, {
            host: broker.host,
            port: broker.port,
          });
        }
      } else if (Array.isArray(metadata.brokers)) {
        // Handle array case if needed
        for (const broker of metadata.brokers as any[]) {
          brokers.set(broker.id, {
            host: broker.host,
            port: broker.port,
          });
        }
      }
    }

    const topics = new Map<string, any>();

    // Extract topic information
    // metadata.topics is a Map<string, ClusterTopicMetadata>
    if (metadata.topics) {
      if (metadata.topics instanceof Map) {
        const topicMetadata = metadata.topics.get(topic);
        if (topicMetadata) {
          const partitions =
            topicMetadata.partitions?.map((partition: any) => ({
              leader: partition.leader ?? -1,
              leaderEpoch: partition.leaderEpoch ?? 0,
              replicas: partition.replicas ?? [],
            })) ?? [];

          topics.set(topic, {
            id: topic,
            partitions,
            partitionsCount: partitions.length,
            lastUpdate: now,
          });
        }
      } else if (Array.isArray(metadata.topics)) {
        // Handle array case if needed
        for (const topicMetadata of metadata.topics as any[]) {
          if (topicMetadata.name === topic) {
            const partitions =
              topicMetadata.partitions?.map((partition: any) => ({
                leader: partition.leader ?? -1,
                leaderEpoch: partition.leaderEpoch ?? 0,
                replicas: partition.replicas ?? [],
              })) ?? [];

            topics.set(topic, {
              id: topic,
              partitions,
              partitionsCount: partitions.length,
              lastUpdate: now,
            });
            break;
          }
        }
      }
    }

    return {
      id: `metadata-${this.id}-${topic}-${now}`,
      brokers,
      topics,
      lastUpdate: now,
    };
  }

  public async queryMessages(args: {
    topic: string;
    offset?: string;
    limit?: string;
    partition?: number;
    avroDecode?: boolean;
  }): Promise<Message[]> {
    const { topic, offset, limit, partition, avroDecode } = args;
    if (!this.#consumer) {
      throw new Error("Connector is not connected");
    }

    const numericLimit = Number(limit);
    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      throw new Error(`Invalid limit: ${limit}`);
    }

    const normalizedOffset = offset?.toLowerCase?.() ?? "latest";

    // Get the latest offsets (high water marks) for the topic early, as we need them for "latest" mode
    let latestOffsets: Map<string, bigint[]> | null = null;
    const targetPartition = partition ?? 0;

    // For "latest" mode, we need to get offsets for all partitions if partition is undefined
    let partitionsToQuery: number[] = [];
    if (partition !== undefined) {
      partitionsToQuery = [partition];
    } else if (
      normalizedOffset === "latest" ||
      normalizedOffset === "earliest"
    ) {
      // For "latest" or "earliest" with all partitions, we need to get all partition info
      try {
        const metadata = await this.getTopicMetadataByTopic(topic);
        const topicData =
          metadata.topics instanceof Map
            ? metadata.topics.get(topic)
            : (metadata.topics as Record<string, any>)[topic];
        const partitionsCount = topicData?.partitionsCount ?? 1;
        partitionsToQuery = Array.from(
          { length: partitionsCount },
          (_, i) => i
        );
      } catch (error) {
        console.warn(
          `Failed to get topic metadata for ${topic}, defaulting to partition 0:`,
          error
        );
        partitionsToQuery = [0];
      }
    } else {
      partitionsToQuery = [targetPartition];
    }

    try {
      const [offsetsResult, offsetsError] = await safeAsync(() =>
        this.#consumer!.listOffsets({
          topics: [topic],
          partitions: { [topic]: partitionsToQuery },
        })
      );
      if (!offsetsError && offsetsResult) {
        latestOffsets = offsetsResult;
        console.log(`Latest offsets for ${topic}:`, latestOffsets);
      }
    } catch (error) {
      console.warn(
        "Failed to get latest offsets, will rely on limit only:",
        error
      );
    }

    let mode: MessagesStreamModeValue | undefined = undefined;
    let offsets: TopicWithPartitionAndOffset[] | undefined;

    if (normalizedOffset === "earliest") {
      // For "earliest", explicitly set offset to 0 to ensure we start from the beginning
      // This is more reliable than using MessagesStreamModes.EARLIEST which may be affected
      // by consumer group offsets or other factors
      mode = "manual";

      if (partition !== undefined) {
        // Specific partition: set offset 0 for that partition
        offsets = [
          {
            topic,
            offset: 0n,
            partition,
          },
        ];
      } else {
        // All partitions: use the partitions we discovered
        offsets = partitionsToQuery.map((p) => ({
          topic,
          offset: 0n,
          partition: p,
        }));
      }
    } else if (normalizedOffset === "latest") {
      // For "latest", we want to read the most recent N messages
      // Calculate starting offset as max(0, latestOffset - limit) for each partition
      mode = "manual";

      if (partition !== undefined) {
        // Specific partition: calculate starting offset
        const latestOffset = latestOffsets?.get(topic)?.[partition] ?? 0n;
        // Latest offset is exclusive (next offset to be written), so last message is at latestOffset - 1
        // We want to read from (latestOffset - limit) but not less than 0
        // If latestOffset is 0, there are no messages, so we can't read anything
        let startOffset = 0n;
        if (latestOffset > 0n) {
          if (latestOffset > BigInt(numericLimit)) {
            startOffset = latestOffset - BigInt(numericLimit);
          } else {
            // Fewer messages than limit, start from beginning
            startOffset = 0n;
          }
        }

        console.log(
          `Latest mode: partition ${partition}, latestOffset: ${latestOffset}, startOffset: ${startOffset}, limit: ${numericLimit}`
        );

        offsets = [
          {
            topic,
            offset: startOffset,
            partition,
          },
        ];
      } else {
        // All partitions: calculate starting offset for each
        offsets = partitionsToQuery
          .map((p) => {
            const latestOffset = latestOffsets?.get(topic)?.[p] ?? 0n;
            let startOffset = 0n;
            if (latestOffset > 0n) {
              if (latestOffset > BigInt(numericLimit)) {
                startOffset = latestOffset - BigInt(numericLimit);
              } else {
                startOffset = 0n;
              }
            }
            return {
              topic,
              offset: startOffset,
              partition: p,
            };
          })
          .filter((offset) => {
            // Filter out partitions with no messages (latestOffset = 0)
            const latestOffset =
              latestOffsets?.get(topic)?.[offset.partition] ?? 0n;
            return latestOffset > 0n;
          });

        console.log(
          `Latest mode: all partitions, calculated offsets:`,
          offsets
        );
      }
    } else if (normalizedOffset === "committed") {
      // Use committed mode for committed offset
      mode = MessagesStreamModes.COMMITTED;
    } else {
      // Treat as explicit offset (manual mode)
      let parsedOffset: bigint;
      try {
        parsedOffset = BigInt(offset ?? BigInt(0));
      } catch {
        throw new Error(
          `Invalid offset: ${offset}. Use "earliest", "latest", "committed" or a numeric offset.`
        );
      }

      mode = "manual";
      offsets = [
        {
          topic,
          offset: parsedOffset,
          partition: partition ?? 0,
        },
      ];
    }

    // Get the latest offset for the target partition
    // Latest offset is exclusive (next offset to be written), so last message is at latestOffset - 1
    const latestOffset = latestOffsets?.get(topic)?.[targetPartition] ?? null;
    console.log(
      `Latest offset for ${topic} partition ${targetPartition}:`,
      latestOffset,
      latestOffset !== null
        ? `(last message at offset ${latestOffset - 1n})`
        : ""
    );

    // Create the consumer stream
    // Set maxFetches to limit how many fetch operations the stream performs
    // This helps the stream stop after collecting messages instead of waiting indefinitely
    const maxFetches = Math.ceil(numericLimit / 10) || 1; // Rough estimate: ~10 messages per fetch

    console.log(`Consuming with mode: ${mode}, offsets:`, offsets);

    // If we're using manual mode but have no valid offsets, return empty array
    if (mode === "manual" && (!offsets || offsets.length === 0)) {
      console.warn(
        "Manual mode requested but no valid offsets found, returning empty array"
      );
      return [];
    }

    const consumeOptions: any = {
      topics: [topic],
      mode,
      maxFetches,
      deserializers: {
        key: noopDeserializer,
        value: noopDeserializer,
      },
    };

    if (offsets && offsets.length > 0) {
      consumeOptions.offsets = offsets;
      console.log(
        `Using manual offsets:`,
        JSON.stringify(offsets, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    }

    const [stream, streamError] = await safeAsync(() =>
      this.#consumer!.consume(consumeOptions)
    );

    if (streamError) {
      console.error("Error creating consumer stream:", streamError);
      throw streamError;
    }

    if (!stream) {
      throw new Error("Failed to create consumer stream");
    }

    console.log(
      "Consumer stream created successfully, starting to read messages..."
    );
    console.log(
      `Stream details: mode=${mode}, hasOffsets=${!!offsets && offsets.length > 0}`
    );

    const messages: Array<{
      topic: string;
      partition: number;
      offset: bigint;
      key: unknown;
      value: unknown;
      timestamp: bigint;
      headers: Record<string, unknown>;
    }> = [];

    let streamClosed = false;
    let shouldBreak = false;
    let messageCount = 0;
    const startTime = Date.now();
    const timeout = 30000; // 30 second timeout

    try {
      console.log("Entering message consumption loop...");
      for await (const message of stream!) {
        messageCount++;
        const elapsed = Date.now() - startTime;
        console.log(
          `Received message ${messageCount} after ${elapsed}ms: partition=${message.partition}, offset=${message.offset}`
        );
        console.dir(message, { depth: null });

        // Check for timeout
        if (elapsed > timeout) {
          console.warn(`Timeout reached after ${elapsed}ms, breaking`);
          shouldBreak = true;
          break;
        }

        if (partition !== undefined && message.partition !== partition) {
          console.log(
            `Skipping message from partition ${message.partition} (requested: ${partition})`
          );
          continue;
        }

        // NOTE: Avro decoding should be handled by deserializers/config.
        // If avroDecode === true, ensure your Consumer is configured with
        // an Avro deserializer for `value`.
        const headersObj: Record<string, unknown> = {};
        if (message.headers instanceof Map) {
          for (const [k, v] of message.headers.entries()) {
            headersObj[k.toString()] = v.toString();
          }
        } else if (message.headers) {
          Object.assign(headersObj, message.headers as any);
        }

        messages.push({
          topic: message.topic,
          partition: message.partition,
          offset: message.offset,
          key: message.key,
          value: message.value,
          timestamp: message.timestamp,
          headers: headersObj,
        });

        console.log(
          `Collected ${messages.length} messages, current offset: ${message.offset}, latest: ${latestOffset}`
        );

        // Check if we've reached the limit
        if (messages.length >= numericLimit) {
          console.log(`Reached limit of ${numericLimit} messages, breaking`);
          shouldBreak = true;
          // Close stream immediately to stop it from waiting for more messages
          try {
            await stream!.close();
            streamClosed = true;
            console.log("Stream closed after reaching limit");
          } catch (closeError) {
            console.error("Error closing stream:", closeError);
          }
          break;
        }

        // Check if we've reached the latest offset (if we have it)
        // The latest offset is exclusive (it's the next offset to be written)
        // So the last available message is at latestOffset - 1
        // We stop when current offset >= latestOffset - 1 (i.e., we've read the last message)
        if (
          latestOffset !== null &&
          message.partition === targetPartition &&
          message.offset >= latestOffset - 1n
        ) {
          console.log(
            `Reached last available message at offset ${message.offset} (latest: ${latestOffset}), breaking`
          );
          shouldBreak = true;
          // Close stream immediately to stop it from waiting for more messages
          try {
            await stream!.close();
            streamClosed = true;
            console.log("Stream closed after reaching latest offset");
          } catch (closeError) {
            console.error("Error closing stream:", closeError);
          }
          break;
        }
      }
      console.log(
        `Finished consuming stream, collected ${messages.length} messages`
      );
    } catch (error) {
      console.error("Error consuming stream:", error);
      throw error;
    } finally {
      // Always close the stream
      if (!streamClosed) {
        console.log("Closing stream...");
        try {
          await stream!.close();
          streamClosed = true;
          console.log("Stream closed");
        } catch (closeError) {
          console.error("Error closing stream:", closeError);
        }
      }
    }

    if (shouldBreak && messages.length === 0) {
      console.warn(
        "Stream broke but no messages collected - this might indicate an issue"
      );
    }

    console.log(
      `Returning ${messages.length} messages from queryMessages (mode: ${mode}, requested limit: ${numericLimit})`
    );
    if (messages.length === 0) {
      console.warn(
        `No messages returned! Mode: ${mode}, Offsets: ${JSON.stringify(
          offsets,
          (key, value) => (typeof value === "bigint" ? value.toString() : value)
        )}, Latest offsets: ${
          latestOffsets
            ? JSON.stringify(
                Array.from(latestOffsets.entries()),
                (key, value) =>
                  typeof value === "bigint" ? value.toString() : value
              )
            : "null"
        }`
      );
    }
    console.dir(messages, { depth: null });
    return messages as any;
  }
}
