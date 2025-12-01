import { Connector } from "./connector.abstract";
import { KafkaConnector } from "./kafka";
import { ConnectorType, KafkaConfiguration } from "@negeseuon/schemas";

/**
 * Map of connector types to their configuration types
 * Extend this type to add new connector types:
 *
 * @example
 * ```typescript
 * export type ConnectorConfigMap = {
 *   kafka: KafkaConfiguration;
 *   rabbitmq: RabbitMQConfiguration;
 * };
 * ```
 */
export type ConnectorConfigMap = {
  kafka: KafkaConfiguration;
  // Add more connector configurations here as needed
  // rabbitmq: RabbitMQConfiguration;
};

export interface ConnectorFactoryOptions<T extends ConnectorType> {
  id: number;
  name: string;
  description: string;
  type: T;
  config: ConnectorConfigMap[keyof ConnectorConfigMap];
}

type ConnectorCreator<T extends keyof ConnectorConfigMap> = (options: {
  id: number;
  name: string;
  description: string;
  config: ConnectorConfigMap[T];
}) => Connector<ConnectorConfigMap[T]>;

/**
 * Factory for creating connector instances
 *
 * This factory uses a registry pattern to support multiple connector types.
 * To add a new connector type:
 * 1. Create a new connector class extending Connector<TConfig>
 * 2. Register it using ConnectorFactory.register()
 *
 * @example
 * ```typescript
 * ConnectorFactory.register('rabbitmq', (options) => {
 *   return new RabbitMQConnector(
 *     options.id,
 *     options.name,
 *     options.description,
 *     options.config as RabbitMQConfiguration
 *   );
 * });
 * ```
 */
export class ConnectorFactory {
  private static readonly connectorCreators: Partial<
    Record<keyof ConnectorConfigMap, ConnectorCreator<keyof ConnectorConfigMap>>
  > = {
    kafka: ({ id, name, description, config }) =>
      new KafkaConnector(id, name, description, config as KafkaConfiguration),
  };

  /**
   * Create a connector instance based on type
   * @param options The connector creation options
   * @returns A new connector instance
   * @throws Error if the connector type is not supported
   */
  public static create<
    T extends keyof ConnectorConfigMap = keyof ConnectorConfigMap,
  >(options: ConnectorFactoryOptions<T>): Connector<ConnectorConfigMap[T]> {
    const creator = this.connectorCreators[options.type];
    if (!creator) {
      throw new Error(
        `Unsupported connector type: ${options.type}. Available types: ${Object.keys(this.connectorCreators).join(", ")}`
      );
    }
    return creator({
      id: options.id,
      name: options.name,
      description: options.description,
      config: options.config,
    }) as Connector<ConnectorConfigMap[T]>;
  }

  /**
   * Register a new connector type at runtime
   *
   * This allows for dynamic registration of connector types.
   * Useful for plugins or conditional connector support.
   *
   * @param type The connector type string (must match a key in ConnectorConfigMap)
   * @param creator The creator function that instantiates the connector
   *
   * @example
   * ```typescript
   * ConnectorFactory.register('rabbitmq', (options) => {
   *   return new RabbitMQConnector(
   *     options.id,
   *     options.name,
   *     options.description,
   *     options.config as RabbitMQConfiguration
   *   );
   * });
   * ```
   */
  public static register<T extends keyof ConnectorConfigMap>(
    type: T,
    creator: ConnectorCreator<T>
  ): void {
    this.connectorCreators[type] = creator as unknown as ConnectorCreator<
      keyof ConnectorConfigMap
    >;
  }

  /**
   * Check if a connector type is supported
   * @param type The connector type to check
   * @returns True if the type is supported
   */
  public static isSupported(type: ConnectorType): type is ConnectorType {
    return type in this.connectorCreators;
  }

  /**
   * Get all supported connector types
   * @returns Array of supported connector type strings
   */
  public static getSupportedTypes(): string[] {
    return Object.keys(this.connectorCreators);
  }
}
