import { useTRPCClient } from "@renderer/renderer";

export default function useTopic() {
  const { client } = useTRPCClient();

  const getTopicMetadata = async (connectionId: number, topic: string) => {
    return client.connectors.topics.metadata.query({ connectionId, topic });
  };

  return { getTopicMetadata };
}
