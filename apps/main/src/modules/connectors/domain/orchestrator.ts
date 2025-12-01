import { Connector } from "./connector.abstract";
import { ConnectorFactory } from "./factory";
import { ConnectorType } from "@negeseuon/schemas";
import {
  ConnectionRepository,
  ConnectionRow,
} from "@/modules/connections/repository/connection";

export class ConnectorOrchestrator {
  private connectors: Record<number, Connector<any>> = {};

  constructor() {}

  /**
   * Add a connector to the orchestrator
   */
  public addConnector(connector: Connector<any>): Connector<any> {
    this.connectors[connector.id] = connector;
    return connector;
  }

  /**
   * Get a connector from the orchestrator
   * @returns The connector if found, undefined otherwise
   */
  public getConnector(id: number): Connector<any> | undefined {
    return this.connectors[id];
  }

  /**
   * Remove a connector from the orchestrator
   */
  public removeConnector(id: number): void {
    delete this.connectors[id];
  }

  /**
   * Load a connection from the database and create a connector instance
   * Uses the Factory to create the connector and adds it to the orchestrator
   * @param connectionRow The connection row from the database
   * @returns The created connector instance
   */
  public loadConnectionFromDatabase(
    connectionRow: ConnectionRow
  ): Connector<any> {
    if (!connectionRow.id) {
      throw new Error("Connection row must have an ID");
    }

    // Validate connector type is supported
    if (!ConnectorFactory.isSupported(connectionRow.type as ConnectorType)) {
      throw new Error(`Unsupported connector type: ${connectionRow.type}`);
    }

    // Parse the config
    const config = JSON.parse(connectionRow.config);

    // Create connector using Factory
    const connector = ConnectorFactory.create({
      id: connectionRow.id,
      name: connectionRow.name,
      description: connectionRow.description,
      type: connectionRow.type as ConnectorType,
      config,
    });

    // Add to orchestrator
    this.addConnector(connector);

    return connector;
  }

  /**
   * Load all connections from the database
   * @param repository The connection repository
   * @returns Array of loaded connector instances
   */
  public async loadAllConnectionsFromDatabase(
    repository: ConnectionRepository
  ): Promise<Connector<any>[]> {
    const connections = await repository.getAllConnections();
    return connections.map((connection) =>
      this.loadConnectionFromDatabase(connection)
    );
  }

  /**
   * Get all connectors currently in the orchestrator
   */
  public getAllConnectors(): Connector<any>[] {
    return Object.values(this.connectors);
  }

  /**
   * Check if a connector exists in the orchestrator
   */
  public hasConnector(id: number): boolean {
    return id in this.connectors;
  }
}
