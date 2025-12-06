import { ConnectorConfiguration } from "@negeseuon/schemas";
import { useConnectionManager } from "@renderer/features/connections/context";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Badge } from "@renderer/libs/shadcn/components/ui/badge";
import { RefreshCw, Send } from "lucide-react";
import { Skeleton } from "@renderer/libs/shadcn/components/ui/skeleton";
import useTopicMetadata from "../hooks/useTopicMetadata";
import { useTopicMetadataContext } from "../context";

type Props = {
  topic: string;
  connection: ConnectorConfiguration;
};

export default function TopicTopBar(props: Props) {
  const { topic, connection } = props;
  const { isConnected } = useConnectionManager();
  const { refreshTopicMetadata } = useTopicMetadataContext();
  const isConnectedToConnection = isConnected(connection.id);

  const {
    data: topicMetadata,
    isLoading: isLoadingTopicMetadata,
    isError: isErrorTopicMetadata,
  } = useTopicMetadata(connection, topic);

  if (isLoadingTopicMetadata) {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (isErrorTopicMetadata && !isLoadingTopicMetadata) {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="text-sm text-destructive">
          Error loading topic metadata
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">{topic}</h1>
        {isConnectedToConnection && (
          <>
            <Badge variant="default" className="bg-green-600 text-white">
              Connected
            </Badge>
          </>
        )}

        {(() => {
          // Handle both Map and object types (Valibot maps serialize to objects in JSON)
          const topics = topicMetadata?.topics;
          if (!topics) return null;

          const topicData =
            topics instanceof Map
              ? topics.get(topic)
              : (topics as Record<string, { partitionsCount: number }>)[topic];

          return topicData?.partitionsCount != null ? (
            <Badge variant="outline">
              {topicData.partitionsCount} partitions
            </Badge>
          ) : null;
        })()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => refreshTopicMetadata(connection.id, topic)}
          disabled={isLoadingTopicMetadata}
        >
          <RefreshCw
            className={`size-4 ${isLoadingTopicMetadata ? "animate-spin" : ""}`}
          />
        </Button>
        <Button variant="default" size="sm">
          <Send className="size-4 mr-2" />
          Publish
        </Button>
      </div>
    </div>
  );
}
