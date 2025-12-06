import { useTRPCClient } from "@renderer/renderer";

export default function useMessages() {
  const { client } = useTRPCClient();

  const queryMessages = async ({
    connectionId,
    topic,
    offset,
    limit,
    partition,
    avroDecode,
  }: {
    connectionId: number;
    topic: string;
    offset: string;
    limit: string;
    partition: number | "all";
    avroDecode: boolean;
  }) => {
    return client.connectors.queryMessages.query({
      connectionId,
      topic,
      offset,
      limit,
      partition: partition === "all" ? undefined : partition,
      avroDecode,
    });
  };

  return { queryMessages };
}
