import { useTRPCClient } from "@renderer/libs/hooks/useTRPCClient";

export function useConnector() {
  const { client } = useTRPCClient();

  const connect = async (connectionId: number) => {
    return await client.connectors.connect.mutate({ connectionId });
  };

  const disconnect = async (connectionId: number) => {
    return await client.connectors.disconnect.mutate({ connectionId });
  };

  const listTopics = async (connectionId: number) => {
    return await client.connectors.topics.list.query({ connectionId });
  };

  return { connect, disconnect, listTopics };
}
