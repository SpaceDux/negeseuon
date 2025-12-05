import { ConnectorConfiguration } from "@negeseuon/schemas";
import { useTRPCClient } from "@renderer/libs/hooks/useTRPCClient";

export function useConnections() {
  const { client } = useTRPCClient();

  const listConnections = async () => {
    return client.connections.list.query();
  };

  const upsertConnection = async (connection: ConnectorConfiguration) => {
    return client.connections.upsert.mutate(connection);
  };

  return { listConnections, upsertConnection};
}
