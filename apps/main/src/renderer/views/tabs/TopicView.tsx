import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@renderer/libs/shadcn/components/ui/card";
import type { ConnectorConfiguration } from "@negeseuon/schemas";

interface TopicViewContext {
  connection: ConnectorConfiguration;
  topic: string;
}

interface TopicViewProps {
  context: TopicViewContext;
}

export function TopicView({ context }: TopicViewProps) {
  const { connection, topic } = context;
  const topicName = typeof topic === "string" ? topic : (topic as any)?.name || "";
  const connectionName = connection.name || "";

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{topicName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {connectionName} • {connection.config.bootstrapBrokers.join(", ")}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Topic Information</CardTitle>
            <CardDescription>
              Details about the selected Kafka topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Topic Name
                </p>
                <p className="text-sm font-mono mt-1">{topicName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Connection
                </p>
                <p className="text-sm mt-1">{connectionName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Endpoint
                </p>
                <p className="text-sm font-mono mt-1">
                  {connection.config.bootstrapBrokers.join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              View and interact with messages in this topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Message viewer coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
