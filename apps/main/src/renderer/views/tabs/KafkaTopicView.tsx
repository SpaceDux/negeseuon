import type { ConnectorConfiguration } from "@negeseuon/schemas";
import TopicTopBar from "@renderer/features/kafka/components/TopicTopBar";
import TopicTabs from "@renderer/features/kafka/components/TopicTabs";

interface KafkaTopicViewContext {
  connection: ConnectorConfiguration;
  topic: string;
}

interface KafkaTopicViewProps {
  context: KafkaTopicViewContext;
}

export function KafkaTopicView({ context }: KafkaTopicViewProps) {
  const { connection, topic } = context;

  return (
    <div
      key={`kafka-${connection.id}-${topic}`}
      className="flex flex-col h-full bg-background"
    >
      <TopicTopBar topic={topic} connection={connection} />
      <TopicTabs topic={topic} connection={connection} />
    </div>
  );
}
