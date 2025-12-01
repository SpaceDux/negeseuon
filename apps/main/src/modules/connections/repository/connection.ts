import { Knex } from "knex";
import { ConnectorConfiguration } from "@negeseuon/schemas";

export interface ConnectionRow {
  id?: number;
  name: string;
  description: string;
  type: string;
  config: string; // JSON string
  connected: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ConnectionRepository {
  constructor(private readonly knex: Knex) {}

  /**
   * Create a new connection in the database
   * @param connection The connection configuration
   * @returns The created connection with its ID
   */
  public async createConnection(
    connection: ConnectorConfiguration
  ): Promise<ConnectionRow> {
    const connectionRow: Omit<
      ConnectionRow,
      "id" | "created_at" | "updated_at"
    > = {
      name: connection.name,
      description: connection.description,
      type: connection.type,
      config: JSON.stringify(connection.config),
      connected: connection.connected,
    };

    const [id] = await this.knex("connections").insert(connectionRow);

    const created = await this.knex("connections")
      .where({ id })
      .first<ConnectionRow>();

    if (!created) {
      throw new Error("Failed to retrieve created connection");
    }

    return created;
  }

  public async setConnected(id: number, connected: boolean): Promise<void> {
    await this.knex("connections").where({ id }).update({ connected });
  }

  /**
   * Update an existing connection in the database
   * @param id The connection ID
   * @param connection The connection configuration
   * @returns The updated connection
   */
  public async updateConnection(
    id: number,
    connection: ConnectorConfiguration
  ): Promise<ConnectionRow> {
    const updateData: Omit<ConnectionRow, "id" | "created_at"> = {
      name: connection.name,
      description: connection.description,
      type: connection.type,
      config: JSON.stringify(connection.config),
      connected: connection.connected,
      updated_at: new Date(),
    };

    const updated = await this.knex("connections")
      .where({ id })
      .update(updateData)
      .then(() =>
        this.knex("connections").where({ id }).first<ConnectionRow>()
      );

    if (!updated) {
      throw new Error("Failed to update connection or connection not found");
    }

    return updated;
  }

  /**
   * Upsert a connection (create if doesn't exist, update if it does)
   * @param connection The connection configuration (id is optional)
   * @returns The created or updated connection
   */
  public async upsertConnection(
    connection: ConnectorConfiguration
  ): Promise<ConnectionRow> {
    if (connection.id) {
      // Check if connection exists
      const existing = await this.getConnectionById(connection.id);
      if (existing) {
        return this.updateConnection(connection.id, connection);
      }
    }

    // Create new connection (id will be ignored if provided but doesn't exist)
    return this.createConnection(connection);
  }

  /**
   * Get all connections
   * @returns Array of all connections
   */
  public async getAllConnections(): Promise<ConnectionRow[]> {
    return await this.knex("connections")
      .select("*")
      .orderBy("created_at", "asc");
  }

  /**
   * Get a connection by ID
   * @param id The connection ID
   * @returns The connection or undefined if not found
   */
  public async getConnectionById(
    id: number
  ): Promise<ConnectionRow | undefined> {
    return this.knex("connections").where({ id }).first<ConnectionRow>();
  }

  /**
   * Delete a connection by ID
   * @param id The connection ID
   */
  public async deleteConnection(id: number): Promise<void> {
    await this.knex("connections").where({ id }).delete();
  }
}
