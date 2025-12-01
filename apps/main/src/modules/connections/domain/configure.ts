import {
  ConnectorConfiguration,
  ConnectorConfigurationList,
  ConnectorType,
} from "@negeseuon/schemas";
import { ConnectionRepository, ConnectionRow } from "../repository/connection";

export interface UpsertConnectionResult {
  connection: ConnectionRow;
  isNew: boolean;
}

/**
 * Domain service for managing connections
 * Handles business logic for creating and updating connections
 */
export class ConfigureConnection {
  constructor(private readonly repository: ConnectionRepository) {}

  /**
   * Upsert a connection (create if new, update if exists)
   * @param connection The connection configuration
   * @returns The result with the connection and whether it was newly created
   */
  public async upsertConnection(
    connection: ConnectorConfiguration
  ): Promise<UpsertConnectionResult> {
    if (connection.id) {
      // Check if connection exists
      const existing = await this.repository.getConnectionById(connection.id);
      if (existing) {
        // Update existing connection
        const updated = await this.repository.updateConnection(
          connection.id,
          connection
        );
        return {
          connection: updated,
          isNew: false,
        };
      }
    }

    // Create new connection
    const created = await this.repository.createConnection(connection);
    return {
      connection: created,
      isNew: true,
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
