import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Input } from "@renderer/libs/shadcn/components/ui/input";
import { Label } from "@renderer/libs/shadcn/components/ui/label";
import { Checkbox } from "@renderer/libs/shadcn/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/libs/shadcn/components/ui/select";
import { TabsContent } from "@renderer/libs/shadcn/components/ui/tabs";
import { Code, Download, Filter, Play } from "lucide-react";
import { useState } from "react";
import { ConnectorConfiguration } from "@negeseuon/schemas";
import Message from "../Message";
import { KafkaMessage } from "@renderer/libs/types/KafkaMessage";
import SelectedMessage from "../SelectedMessage";

type Props = {
  topic: string;
  connection: ConnectorConfiguration;
};

export default function Messages(_props: Props) {
  const [offset, setOffset] = useState<string>("latest");
  const [limit, setLimit] = useState<string>("100");
  const [partition, setPartition] = useState<string>("all");
  const [avroDecode, setAvroDecode] = useState<boolean>(false);

  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [filteredMessages, setFilteredMessages] = useState<number>(0);

  const [messages, setMessages] = useState<any[]>([
    {
      offset: 1247,
      partition: 0,
      key: "key1",
      payload: "payload1",
      timestamp: "2021-01-01 12:00:00",
      size: 100,
      headers: {},
    },
    {
      offset: 1248,
      partition: 0,
      key: "key2",
      payload: "payload2",
      timestamp: "2021-01-01 12:00:01",
      size: 100,
      headers: {},
    },
  ]);
  const [selectedMessage, setSelectedMessage] = useState<KafkaMessage | null>(
    null
  );

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
            Start Consumer
          </Button>

          <div className="flex items-center gap-2">
            <Label htmlFor="offset" className="text-sm whitespace-nowrap">
              Offset:
            </Label>
            <Select value={offset} onValueChange={setOffset}>
              <SelectTrigger id="offset" size="sm" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="earliest">Earliest</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="limit" className="text-sm whitespace-nowrap">
              Limit:
            </Label>
            <Input
              id="limit"
              type="text"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-[80px] h-8"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="partition" className="text-sm whitespace-nowrap">
              Partition:
            </Label>
            <Select value={partition} onValueChange={setPartition}>
              <SelectTrigger id="partition" size="sm" className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="avro-decode"
              checked={avroDecode}
              onCheckedChange={(checked: boolean) => setAvroDecode(checked)}
            />
            <Label htmlFor="avro-decode" className="text-sm cursor-pointer">
              Avro Decode
            </Label>
          </div>

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
              {totalMessages.toLocaleString()} messages • Filtered:{" "}
              {filteredMessages.toLocaleString()}
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
            {messages.map((message) => {
              return (
                <Message
                  onClick={() => setSelectedMessage?.(message)}
                  key={message.offset}
                  message={message}
                />
              );
            })}
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
