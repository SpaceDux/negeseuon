import { useTRPCClient } from "@renderer/libs/hooks/useTRPCClient";

export function useConnections() {
  const { client } = useTRPCClient();

  const listConnections = async () => {
    return await client.connections.list.query();
  };
  return { listConnections };
}
