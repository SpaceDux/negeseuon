import { Connector } from "./connector.abstract";

export class ConnectorOrchestrator {
  private connectors: Record<number, Connector<any>> = {};

  constructor() {}

  public addConnector(connector: Connector<any>) {
    this.connectors[connector.id] = connector;
  }

  public getConnector(id: number): Connector<any> | undefined {
    return this.connectors[id];
  }

  public getConnectors(): Connector<any>[] {
    return Object.values(this.connectors);
  }
}
