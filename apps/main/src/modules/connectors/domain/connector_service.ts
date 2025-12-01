import { ConnectionRepository } from "@/modules/connections/repository/connection";
import { ConnectorOrchestrator } from "./orchestrator";
import { BooleanResponse } from "@negeseuon/schemas";
import { supports } from "./connector.abstract";

type Dependencies = {
  repository: ConnectionRepository;
  orchestrator: ConnectorOrchestrator;
};

export class ConnectorService {
  constructor(private readonly dependencies: Dependencies) {}

  public async connect(connectionId: number): Promise<BooleanResponse> {
    const connector = this.dependencies.orchestrator.getConnector(connectionId);
    if (!connector) {
      throw new Error(`Connector with ID ${connectionId} not found`);
    }

    await connector.connect();
    await this.dependencies.repository.setConnected(connectionId, true);
    return {
      success: true,
      message: `Connected to connection ${connectionId} successfully`,
    };
  }

  public async disconnect(connectionId: number): Promise<BooleanResponse> {
    const connector = this.dependencies.orchestrator.getConnector(connectionId);
    if (!connector) {
      throw new Error(`Connector with ID ${connectionId} not found`);
    }

    await connector.disconnect();
    await this.dependencies.repository.setConnected(connectionId, false);

    return {
      success: true,
      message: `Disconnected from connection ${connectionId} successfully`,
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
      throw new Error(`Connector with ID ${connectionId} is not connected`);
    }

    if (!supports(connector, "listTopics")) {
      throw new Error(
        `Connector type ${connector.getType()} does not support listTopics operation`
      );
    }

    return await connector.listTopics();
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
