import { useTRPCClient } from "@renderer/libs/hooks/useTRPCClient";

export default function useTopics() {
  const { client } = useTRPCClient();

  const listTopics = async (connectionId: number) => {
    return client.connectors.topics.list.query({ connectionId });
  };

  return { listTopics };
}
