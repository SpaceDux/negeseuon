import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { TabsContent } from "@renderer/libs/shadcn/components/ui/tabs";
import { Code, Download, Filter, Play } from "lucide-react";
import { useState } from "react";
import { ConnectorConfiguration } from "@negeseuon/schemas";
import Message from "../Message";
import { KafkaMessage } from "@renderer/libs/types/KafkaMessage";
import FilterMessages from "../FilterMessages";
import { useQuery } from "@tanstack/react-query";
import useMessages from "../../hooks/useMessages";
import { Skeleton } from "@renderer/libs/shadcn/components/ui/skeleton";
import SelectedMessage from "../SelectedMessage";

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
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <TabsContent value="messages" className="flex-1 flex flex-col mt-0">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4 flex-wrap">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
            <div className="flex-1" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <Skeleton className="h-4 w-32 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 text-sm">
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-24 rounded-md" />
                        <Skeleton className="h-6 w-16 rounded-md" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-3 w-full max-w-md rounded-md" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Skeleton className="h-3 w-20 rounded-md" />
                      <Skeleton className="h-4 w-4 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-70 border-l border-border flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <Skeleton className="h-5 w-40 rounded-md" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <Skeleton className="h-3 w-16 rounded-md mb-1" />
                <Skeleton className="h-4 w-24 rounded-md mt-1" />
              </div>
              <div className="h-px bg-border" />
              <div>
                <Skeleton className="h-3 w-20 rounded-md mb-1" />
                <Skeleton className="h-4 w-8 rounded-md mt-1" />
              </div>
              <div className="h-px bg-border" />
              <div>
                <Skeleton className="h-3 w-12 rounded-md mb-1" />
                <Skeleton className="h-4 w-32 rounded-md mt-1" />
              </div>
              <div className="h-px bg-border" />
              <div>
                <Skeleton className="h-3 w-24 rounded-md mb-1" />
                <Skeleton className="h-4 w-40 rounded-md mt-1" />
              </div>
              <div className="h-px bg-border" />
              <div>
                <Skeleton className="h-3 w-12 rounded-md mb-1" />
                <Skeleton className="h-4 w-20 rounded-md mt-1" />
              </div>
              <div className="h-px bg-border" />
              <div>
                <Skeleton className="h-3 w-20 rounded-md mb-2 block" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-5 w-28 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    );
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

      <div className="flex-1 flex min-h-0 items-start">
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
                    key={`${message.partition}-${message.offset}-${topic}`}
                    onClick={() => setSelectedMessage(message)}
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
