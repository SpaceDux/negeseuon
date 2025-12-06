import { createContext, useContext, useMemo, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { KafkaTopicMetadata } from "@negeseuon/schemas";

interface TopicMetadataContextValue {
  /**
   * Get topic metadata for a specific connection and topic from cache
   * @param connectionId The connection ID
   * @param topic The topic name
   * @returns The topic metadata or undefined if not in cache
   */
  getTopicMetadata: (
    connectionId: number | undefined,
    topic: string
  ) => KafkaTopicMetadata | undefined;
  /**
   * Refresh topic metadata for a specific connection and topic
   * @param connectionId The connection ID
   * @param topic The topic name
   */
  refreshTopicMetadata: (
    connectionId: number | undefined,
    topic: string
  ) => Promise<void>;
}

const TopicMetadataContext = createContext<
  TopicMetadataContextValue | undefined
>(undefined);

interface TopicMetadataProviderProps {
  children: ReactNode;
}

export function TopicMetadataProvider({
  children,
}: TopicMetadataProviderProps) {
  const queryClient = useQueryClient();

  const getTopicMetadata = (
    connectionId: number | undefined,
    topic: string
  ): KafkaTopicMetadata | undefined => {
    if (!connectionId) return undefined;
    const queryKey = ["topic-metadata", connectionId, topic];
    return queryClient.getQueryData<KafkaTopicMetadata>(queryKey);
  };

  const refreshTopicMetadata = async (
    connectionId: number | undefined,
    topic: string
  ): Promise<void> => {
    if (!connectionId) return;
    const queryKey = ["topic-metadata", connectionId, topic];
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey });
  };

  const value: TopicMetadataContextValue = useMemo(
    () => ({
      getTopicMetadata,
      refreshTopicMetadata,
    }),
    [queryClient]
  );

  return (
    <TopicMetadataContext.Provider value={value}>
      {children}
    </TopicMetadataContext.Provider>
  );
}

/**
 * Hook to access the topic metadata context
 * @throws Error if used outside of TopicMetadataProvider
 */
export function useTopicMetadataContext(): TopicMetadataContextValue {
  const context = useContext(TopicMetadataContext);
  if (context === undefined) {
    throw new Error(
      "useTopicMetadataContext must be used within a TopicMetadataProvider"
    );
  }
  return context;
}
