import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@renderer/libs/shadcn/components/ui/collapsible";
import { Separator } from "@renderer/libs/shadcn/components/ui/separator";
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
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { Badge } from "@renderer/libs/shadcn/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Code,
  Download,
  Filter,
  Play,
} from "lucide-react";
import { useState } from "react";
import { ConnectorConfiguration } from "@negeseuon/schemas";

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
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(
    new Set([1247])
  );

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
  };

  const toggleMessageExpanded = (offset: number) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(offset)) {
        newSet.delete(offset);
      } else {
        newSet.add(offset);
      }
      return newSet;
    });
  };

  const formatPayload = (payload: string) => {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  };

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
              const isExpanded = expandedMessages.has(message.offset);
              const isSelected = selectedMessage?.offset === message.offset;

              return (
                <div
                  key={message.offset}
                  className={cn(
                    "border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => handleMessageClick(message)}
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleMessageExpanded(message.offset)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-start justify-between px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">
                              offset:{" "}
                              <span className="text-foreground">
                                {message.offset}
                              </span>
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              partition:{" "}
                              <span className="text-foreground">
                                {message.partition}
                              </span>
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              key:{" "}
                              <span className="text-foreground">
                                {message.key}
                              </span>
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {!isExpanded && (
                              <span className="font-mono">
                                {formatPayload(message.payload).substring(
                                  0,
                                  80
                                )}
                                ...
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {message.timestamp}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-3">
                        <div className="text-xs font-semibold mb-2 text-muted-foreground">
                          MESSAGE PAYLOAD:
                        </div>
                        <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto">
                          {formatPayload(message.payload)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Properties Panel */}
        {selectedMessage && (
          <div className="w-80 border-l border-border flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Message Properties</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Offset</Label>
                <div className="text-sm font-mono mt-1">
                  {selectedMessage.offset}
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">
                  Partition
                </Label>
                <div className="text-sm font-mono mt-1">
                  {selectedMessage.partition}
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Key</Label>
                <div className="text-sm font-mono mt-1">
                  {selectedMessage.key}
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">
                  Timestamp
                </Label>
                <div className="text-sm mt-1">{selectedMessage.timestamp}</div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Size</Label>
                <div className="text-sm mt-1">{selectedMessage.size} bytes</div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Headers
                </Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedMessage.headers).map(
                    ([key, value]) => (
                      <Badge
                        key={key}
                        variant="outline"
                        className="text-xs font-mono bg-muted"
                      >
                        {key}: {value as string}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}
