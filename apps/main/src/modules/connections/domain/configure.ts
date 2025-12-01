import {
  ConnectorConfiguration,
  ConnectorConfigurationList,
  ConnectorType,
} from "@negeseuon/schemas";
import { ConnectionRepository, ConnectionRow } from "../repository/connection";
import { ConnectorFactory } from "@/modules/connectors/domain/factory";
import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";

export interface UpsertConnectionResult {
  connection: ConnectionRow;
  isNew: boolean;
}

/**
 * Domain service for managing connections
 * Handles business logic for creating and updating connections
 */
export class ConfigureConnection {
  constructor(
    private readonly repository: ConnectionRepository,
    private readonly orchestrator: ConnectorOrchestrator
  ) {}

  /**
   * Upsert a connection (create if new, update if exists)
   * Creates connector instance using Factory and persists it in the orchestrator
   * @param connection The connection configuration
   * @returns The result with the connection and whether it was newly created
   */
  public async upsertConnection(
    connection: ConnectorConfiguration
  ): Promise<UpsertConnectionResult> {
    let connectionRow: ConnectionRow;
    let isNew: boolean;

    if (connection.id) {
      // Check if connection exists
      const existing = await this.repository.getConnectionById(connection.id);
      if (existing) {
        // Update existing connection
        connectionRow = await this.repository.updateConnection(
          connection.id,
          connection
        );
        isNew = false;

        // Remove old connector from orchestrator if it exists
        try {
          this.orchestrator.removeConnector(connection.id);
        } catch {
          // Ignore if connector doesn't exist in orchestrator
        }
      } else {
        // Create new connection (id was provided but doesn't exist)
        connectionRow = await this.repository.createConnection(connection);
        isNew = true;
      }
    } else {
      // Create new connection
      connectionRow = await this.repository.createConnection(connection);
      isNew = true;
    }

    // Validate connector type is supported
    if (!ConnectorFactory.isSupported(connectionRow.type as ConnectorType)) {
      throw new Error(`Unsupported connector type: ${connectionRow.type}`);
    }

    // Create connector instance using Factory
    const connector = ConnectorFactory.create({
      id: connectionRow.id!,
      name: connectionRow.name,
      description: connectionRow.description,
      type: connectionRow.type as ConnectorType,
      config: JSON.parse(connectionRow.config),
    });

    // Persist connector in orchestrator for future use
    this.orchestrator.addConnector(connector);

    return {
      connection: connectionRow,
      isNew,
    };
  }

  /**
   * List all connections
   * @returns The list of connections
   */
  public async listConnections(): Promise<ConnectorConfigurationList> {
    const connections = await this.repository.getAllConnections();
    return connections.map(
      (connection): ConnectorConfiguration => ({
        id: connection.id,
        name: connection.name,
        description: connection.description,
        type: connection.type as ConnectorType,
        config: JSON.parse(connection.config),
        connected: Boolean(connection.connected),
      })
    );
  }
}
