import { BrokerOperations } from "./broker_operations.interface";

/**
 * Abstract class for connectors
 *
 * Subclasses should implement BrokerOperations methods as needed.
 * Not all connectors need to support all operations.
 */
export abstract class Connector<TConfig extends Record<string, unknown>> {
  /**
   * Protected connection state - subclasses can use this or manage their own state
   */
  protected _isConnected: boolean = false;

  constructor(
    readonly id: number,
    readonly name: string,
    readonly description: string,
    readonly config: TConfig
  ) {}

  /**
   * Connect to the connector
   */
  public abstract connect(): Promise<void>;

  /**
   * Disconnect from the connector
   */
  public abstract disconnect(): Promise<void>;

  /**
   * Whether the connector is connected
   * Subclasses can override this if they manage their own connection state
   */
  public isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Get the connector type
   */
  public abstract getType(): string;

  // BrokerOperations interface methods - override in subclasses as needed
  // These are optional and can be implemented by subclasses that support them
  // TypeScript will check for these methods at runtime using type guards
}

/**
 * Type guard to check if a connector supports BrokerOperations
 */
export function supportsBrokerOperations(
  connector: Connector<any>
): connector is Connector<any> & BrokerOperations {
  return (
    typeof (connector as any).listTopics === "function" ||
    typeof (connector as any).publish === "function" ||
    typeof (connector as any).subscribe === "function"
  );
}

/**
 * Type guard to check if a connector supports a specific broker operation
 */
export function supports<T extends keyof BrokerOperations>(
  connector: Connector<any>,
  operation: T
): connector is Connector<any> & Required<Pick<BrokerOperations, T>> {
  return typeof (connector as any)[operation] === "function";
}
