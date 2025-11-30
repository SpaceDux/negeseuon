import { useTabs } from "@/libs/hooks/useTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/libs/shadcn/components/ui/card";

export function TopicView() {
  const { tabs, activeTabId } = useTabs();
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No topic selected</p>
          <p className="text-sm mt-2">
            Click on a topic in the sidebar to open it
          </p>
        </div>
      </div>
    );
  }

  // Only render if it's a kafka tab
  if (activeTab.type !== "kafka") {
    return null;
  }

  const { context } = activeTab;

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{context.topicName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {context.connectionName} • {context.connection.host}:
          {context.connection.port}
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
                <p className="text-sm font-mono mt-1">{context.topicName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Connection
                </p>
                <p className="text-sm mt-1">{context.connectionName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Endpoint
                </p>
                <p className="text-sm font-mono mt-1">
                  {context.connection.host}:{context.connection.port}
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
