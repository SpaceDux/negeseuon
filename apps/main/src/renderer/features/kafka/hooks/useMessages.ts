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
    console.log("=== useMessages.queryMessages called ===", {
      connectionId,
      topic,
      offset,
      limit,
      partition,
      avroDecode,
    });
    try {
      console.log("=== About to call tRPC query ===", {
        connectionId,
        topic,
        offset,
        limit,
        partition: partition === "all" ? undefined : partition,
        avroDecode,
      });
      const queryPromise = client.connectors.queryMessages.query({
        connectionId,
        topic,
        offset,
        limit,
        partition: partition === "all" ? undefined : partition,
        avroDecode,
      });
      console.log("=== Query promise created ===");

      // Add timeout to detect hanging queries
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Query timeout after 30 seconds")),
          30000
        );
      });

      const result = await Promise.race([queryPromise, timeoutPromise]);
      const messages = (result ?? []) as any[];
      console.log("=== useMessages.queryMessages result ===", messages.length);
      return messages;
    } catch (error) {
      console.error("=== useMessages.queryMessages error ===", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      throw error;
    }
  };

  return { queryMessages };
}
