import { useTRPCClient } from "@renderer/libs/hooks/useTRPCClient";

export function useConnector() {
  const { client } = useTRPCClient();

  const connect = async (connectionId: number) => {
    return await client.connectors.connect.mutate({ connectionId });
  };

  const disconnect = async (connectionId: number) => {
    return await client.connectors.disconnect.mutate({ connectionId });
  };
  return { connect, disconnect };
}
