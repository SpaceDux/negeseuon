import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { TabsContent } from "@renderer/libs/shadcn/components/ui/tabs";
import { Code, Download, Filter, Play } from "lucide-react";
import { useState } from "react";
import { ConnectorConfiguration } from "@negeseuon/schemas";
import Message from "../Message";
import { KafkaMessage } from "@renderer/libs/types/KafkaMessage";
import SelectedMessage from "../SelectedMessage";
import FilterMessages from "../FilterMessages";
import { useQuery } from "@tanstack/react-query";
import useMessages from "../../hooks/useMessages";

type Props = {
  topic: string;
  connection: ConnectorConfiguration;
};

export default function Messages(props: Props) {
  const { topic, connection } = props;
  const { queryMessages } = useMessages();
  const [offset, setOffset] = useState<string>("earliest");
  const [limit, setLimit] = useState<string>("100");
  const [avroDecode, setAvroDecode] = useState<boolean>(false);
  const [partition, setPartition] = useState<number | "all">("all");

  const [selectedMessage, setSelectedMessage] = useState<KafkaMessage | null>(
    null
  );

  const { data, isLoading, isError, error } = useQuery<KafkaMessage[]>({
    queryKey: [
      "messages",
      connection.id,
      topic,
      offset,
      limit,
      partition,
      avroDecode,
    ],
    queryFn: async (): Promise<KafkaMessage[]> => {
      try {
        const result = await queryMessages({
          connectionId: connection.id!,
          topic,
          offset,
          limit,
          partition,
          avroDecode,
        });
        const messages = (result ?? []) as KafkaMessage[];
        return messages;
      } catch (err) {
        throw err;
      }
    },
    enabled: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message ?? "Unknown error"}</div>;
  }

  return (
    <TabsContent value="messages" className="flex-1 flex flex-col mt-0">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="default"
            size="sm"
            className="bg-black hover:bg-black/90"
          >
            <Play className="size-4 mr-2" />
            Consume
          </Button>

          <FilterMessages
            connection={connection}
            topic={topic}
            onChange={(
              offset: string,
              limit: string,
              partition: "all" | number,
              avroDecode: boolean
            ) => {
              setOffset(offset);
              setLimit(limit);
              setPartition(partition);
              setAvroDecode(avroDecode);
            }}
          />

          <div className="flex-1" />

          <Button variant="outline" size="sm">
            <Code className="size-4 mr-2" />
            Query Builder
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Message List */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="text-sm text-muted-foreground">
              {(data as KafkaMessage[])?.length?.toLocaleString() ?? 0} messages
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm">
                <Download className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <Filter className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {data && data.length > 0 ? (
              data.map((message) => {
                return (
                  <Message
                    onClick={() => setSelectedMessage?.(message)}
                    key={`${message.partition}-${message.offset}`}
                    message={message}
                  />
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages found
              </div>
            )}
          </div>
        </div>

        <SelectedMessage
          message={selectedMessage}
          isOpen={selectedMessage !== null}
        />
      </div>
    </TabsContent>
  );
}
