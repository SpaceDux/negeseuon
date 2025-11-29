import { Connector } from "./connector.abstract";

export class ConnectorOrchestrator {
  private connectors: Record<string, Connector<any>> = {};

  constructor() {}

  public addConnector(connector: Connector<any>) {
    this.connectors[connector.key] = connector;
  }

  public getConnector(key: string): Connector<any> | undefined {
    return this.connectors[key];
  }

  public getConnectors(): Connector<any>[] {
    return Object.values(this.connectors);
  }
}
