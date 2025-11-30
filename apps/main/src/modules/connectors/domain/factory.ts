import { Connector } from "./connector.abstract";
import { KafkaConnector } from "./kafka";
import { ConnectorType, KafkaConfiguration } from "@negeseuon/schemas";

export type ConnectorConfigMap = {
  kafka: KafkaConfiguration;
};

export interface ConnectorFactoryOptions<T extends ConnectorType> {
  id: number;
  name: string;
  description: string;
  type: T;
  config: ConnectorConfigMap[keyof ConnectorConfigMap];
}

/**
 * Factory for creating connector instances
 */
export class ConnectorFactory {
  private static readonly connectorCreators: Partial<
    Record<
      keyof ConnectorConfigMap,
      (options: {
        id: number;
        name: string;
        description: string;
        config: ConnectorConfigMap[keyof ConnectorConfigMap];
      }) => Connector<ConnectorConfigMap[keyof ConnectorConfigMap]>
    >
  > = {
    kafka: ({ id, name, description, config }) =>
      new KafkaConnector(id, name, description, config as KafkaConfiguration),
  };

  /**
   * Create a connector instance based on type
   * @param options The connector creation options
   * @returns A new connector instance
   */
  public static create<
    T extends keyof ConnectorConfigMap = keyof ConnectorConfigMap,
  >(options: ConnectorFactoryOptions<T>): Connector<ConnectorConfigMap[T]> {
    const creator = this.connectorCreators[options.type];
    if (!creator) {
      throw new Error(`Unsupported connector type: ${options.type}`);
    }
    return creator({
      id: options.id,
      name: options.name,
      description: options.description,
      config: options.config,
    }) as Connector<ConnectorConfigMap[T]>;
  }

  /**
   * Register a new connector type
   * @param type The connector type string
   * @param creator The creator function
   */
  public static register<T extends ConnectorType>(
    type: T,
    creator: (options: {
      id: number;
      name: string;
      description: string;
      config: ConnectorConfigMap[keyof ConnectorConfigMap];
    }) => Connector<ConnectorConfigMap[keyof ConnectorConfigMap]>
  ): void {
    this.connectorCreators[type] = creator as any;
  }

  /**
   * Check if a connector type is supported
   * @param type The connector type to check
   * @returns True if the type is supported
   */
  public static isSupported(type: ConnectorType): type is ConnectorType {
    return type in this.connectorCreators;
  }
}
