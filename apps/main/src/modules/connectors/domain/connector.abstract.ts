/**
 * Abstract class for connectors
 */
export abstract class Connector<TConfig extends Record<string, unknown>> {
  #isConnected: boolean = false;

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
   */
  public isConnected(): boolean {
    return this.#isConnected;
  }
}
