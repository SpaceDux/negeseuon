import { useQuery } from "@tanstack/react-query";
import useTopic from "./useTopic";
import type { ConnectorConfiguration } from "@negeseuon/schemas";

/**
 * Hook to fetch and share topic metadata across multiple components/tabs
 * All components using the same connectionId and topic will share the same cached data
 *
 * @param connection The connection configuration
 * @param topic The topic name
 * @returns React Query result with topic metadata
 */
export default function useTopicMetadata(
  connection: ConnectorConfiguration | undefined,
  topic: string
) {
  const { getTopicMetadata } = useTopic();

  return useQuery({
    queryKey: ["topic-metadata", connection?.id, topic],
    queryFn: () => {
      if (!connection?.id) {
        throw new Error("Connection ID is required");
      }
      return getTopicMetadata(connection.id, topic);
    },
    enabled: connection?.connected && !!connection?.id && !!topic,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
