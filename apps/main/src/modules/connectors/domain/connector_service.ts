import { ConnectionRepository } from "@/modules/connections/repository/connection";
import { ConnectorOrchestrator } from "./orchestrator";
import { BooleanResponse, KafkaTopicMetadata } from "@negeseuon/schemas";
import { supports } from "./connector.abstract";
import { safeAsync } from "@negeseuon/utils";
import { Message } from "@platformatic/kafka";

type Dependencies = {
  repository: ConnectionRepository;
  orchestrator: ConnectorOrchestrator;
};

export class ConnectorService {
  constructor(private readonly dependencies: Dependencies) {}

  public async connect(connectionId: number): Promise<BooleanResponse> {
    let connector = this.dependencies.orchestrator.getConnector(connectionId);

    // If connector doesn't exist in orchestrator, try to load it from database
    if (!connector) {
      const connectionRow =
        await this.dependencies.repository.getConnectionById(connectionId);
      if (!connectionRow) {
        return {
          success: false,
          message: `Connection with ID ${connectionId} not found`,
        };
      }
      connector =
        this.dependencies.orchestrator.loadConnectionFromDatabase(
          connectionRow
        );
    }

    const [_, error] = await safeAsync(() => connector!.connect());
    if (error) {
      console.error(error);
      await this.dependencies.repository.setConnected(connectionId, false);
      return {
        success: false,
        message: `Failed to connect to connection ${connector.name}: ${error.message}`,
      };
    }

    await this.dependencies.repository.setConnected(connectionId, true);
    return {
      success: true,
      message: `Connected to connection ${connector.name} successfully`,
    };
  }

  public async disconnect(connectionId: number): Promise<BooleanResponse> {
    let connector = this.dependencies.orchestrator.getConnector(connectionId);

    // If connector doesn't exist in orchestrator, try to load it from database
    if (!connector) {
      const connectionRow =
        await this.dependencies.repository.getConnectionById(connectionId);
      if (!connectionRow) {
        await this.dependencies.repository.setConnected(connectionId, false);
        return {
          success: true,
          message: `Connection with ID ${connectionId} not found`,
        };
      }
      connector =
        this.dependencies.orchestrator.loadConnectionFromDatabase(
          connectionRow
        );
    }

    // Only disconnect if the connector is actually connected
    if (connector.isConnected()) {
      const [_, error] = await safeAsync(() => connector!.disconnect());
      if (error) {
        console.error(error);
        await this.dependencies.repository.setConnected(connectionId, false);
        return {
          success: false,
          message: `Failed to disconnect from connection ${connectionId}: ${error.message}`,
        };
      }

      await this.dependencies.repository.setConnected(connectionId, false);
      return {
        success: true,
        message: `Disconnected from connection ${connector.name} successfully`,
      };
    }

    await this.dependencies.repository.setConnected(connectionId, false);
    return {
      success: true,
      message: `Disconnected from connection ${connector.name} successfully`,
    };
  }

  /**
   * Disconnect all connectors
   */
  public async disconnectAll(): Promise<BooleanResponse> {
    let connectors = this.dependencies.orchestrator.getAllConnectors();
    for (const connector of connectors) {
      await this.disconnect(connector.id);
    }

    return {
      success: true,
      message: `Disconnected from all connections successfully`,
    };
  }

  /**
   * List topics/queues/exchanges for a connector (broker-agnostic)
   * Works with any connector that implements the listTopics operation
   */
  public async listTopics(connectionId: number): Promise<string[]> {
    const connector = this.dependencies.orchestrator.getConnector(connectionId);
    if (!connector) {
      throw new Error(`Connector with ID ${connectionId} not found`);
    }

    if (!connector.isConnected()) {
      await this.connect(connectionId);
      return this.listTopics(connectionId);
    }

    if (!supports(connector, "listTopics")) {
      throw new Error(
        `Connector type ${connector.getType()} does not support listTopics operation`
      );
    }

    return connector.listTopics();
  }

  /**
   * Publish a message to a topic/queue/exchange (broker-agnostic)
   * Works with any connector that implements the publish operation
   */
  public async publish(
    connectionId: number,
    topic: string,
    message: unknown
  ): Promise<BooleanResponse> {
    const connector = this.dependencies.orchestrator.getConnector(connectionId);
    if (!connector) {
      throw new Error(`Connector with ID ${connectionId} not found`);
    }

    if (!connector.isConnected()) {
      throw new Error(`Connector with ID ${connectionId} is not connected`);
    }

    if (!supports(connector, "publish")) {
      throw new Error(
        `Connector type ${connector.getType()} does not support publish operation`
      );
    }

    await connector.publish(topic, message);
    return {
      success: true,
      message: `Message published to ${topic} successfully`,
    };
  }

  /**
   * Get the metadata of a topic
   */
  public async getTopicMetadata(
    connectionId: number,
    topic: string
  ): Promise<KafkaTopicMetadata | null> {
    const connector = this.dependencies.orchestrator.getConnector(connectionId);
    if (!connector) {
      throw new Error(`Connector with ID ${connectionId} not found`);
    }

    if (!connector.isConnected()) {
      throw new Error(`Connector with ID ${connectionId} is not connected`);
    }

    if (!supports(connector, "getTopicMetadataByTopic")) {
      throw new Error(
        `Connector type ${connector.getType()} does not support getTopicMetadata operation`
      );
    }

    return connector.getTopicMetadataByTopic(topic);
  }

  public async queryMessages({
    connectionId,
    topic,
    offset,
    limit,
    partition,
    schemaRegistryDecode,
  }: {
    connectionId: number;
    topic: string;
    offset: string;
    limit: string;
    partition: number | null;
    schemaRegistryDecode: boolean;
  }): Promise<Message[]> {
    const connector = this.dependencies.orchestrator.getConnector(connectionId);
    if (!connector) {
      throw new Error(`Connector with ID ${connectionId} not found`);
    }

    if (!connector.isConnected()) {
      throw new Error(`Connector with ID ${connectionId} is not connected`);
    }

    if (!supports(connector, "queryMessages")) {
      throw new Error(
        `Connector type ${connector.getType()} does not support queryMessages operation`
      );
    }

    return connector.queryMessages({
      ...(partition ? { partition } : {}),
      topic,
      offset,
      limit,
      schemaRegistryDecode,
    });
  }
  /**
   * Get connector type for a connection
   */
  public getConnectorType(connectionId: number): string {
    const connector = this.dependencies.orchestrator.getConnector(connectionId);
    if (!connector) {
      throw new Error(`Connector with ID ${connectionId} not found`);
    }
    return connector.getType();
  }
}
