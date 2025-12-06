import { ConnectorConfiguration } from "@negeseuon/schemas";
import { useConnectionManager } from "@renderer/features/connections/context";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Badge } from "@renderer/libs/shadcn/components/ui/badge";
import { RefreshCw, Send } from "lucide-react";

type Props = {
    topic: string;
    connection: ConnectorConfiguration;
}

export default function TopicTopBar(props: Props) {
    const { topic, connection } = props;
    const {isConnected} = useConnectionManager();
    const isConnectedToConnection = isConnected(connection.id);

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{topic}</h1>
          {isConnectedToConnection && (
            <>
              <Badge variant="default" className="bg-green-600 text-white">
                Connected
              </Badge>
              <Badge variant="outline">Kafka</Badge>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="default" size="sm">
            <Send className="size-4 mr-2" />
            Publish
          </Button>
        </div>
    </div>
  );
}