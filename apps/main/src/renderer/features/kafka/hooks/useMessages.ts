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
    try {
      const queryPromise = await client.connectors.queryMessages.query({
        connectionId,
        topic,
        offset,
        limit,
        partition: partition === "all" ? undefined : partition,
        avroDecode,
      });

      const messages = (queryPromise ?? []) as any[];
      return messages;
    } catch (error) {
      throw error;
    }
  };

  return { queryMessages };
}
