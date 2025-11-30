import { useState } from "react";
import { Button } from "@/libs/shadcn/components/ui/button";
import { Separator } from "@/libs/shadcn/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/libs/shadcn/components/ui/collapsible";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Layers,
  MessageSquare,
  Power,
  Settings,
} from "lucide-react";
import { cn } from "@/libs/shadcn/lib/utils";
import { useTabs } from "@/libs/hooks/useTabs";

export interface Topic {
  id: string;
  name: string;
}

export interface Connection {
  id: string;
  name: string;
  type: "kafka" | "rabbitmq" | "redis" | "other";
  host: string;
  port: number;
  topics?: Topic[];
  connected?: boolean;
}

export interface SidebarProps {
  className?: string;
  onConnectionSelect?: (connection: Connection) => void;
  onAddConnection?: () => void;
  onDisconnect?: (connection: Connection) => void;
  onModifyConnection?: (connection: Connection) => void;
}

export function Sidebar({
  className,
  onConnectionSelect,
  onAddConnection,
  onDisconnect,
  onModifyConnection,
}: SidebarProps) {
  const { openTab } = useTabs();
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "dummy-kafka-1",
      name: "Kafka Cluster",
      type: "kafka",
      host: "localhost",
      port: 9092,
      connected: true,
      topics: [
        { id: "topic-1", name: "user-events" },
        { id: "topic-2", name: "order-processing" },
        { id: "topic-3", name: "notifications" },
      ],
    },
  ]);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(
    new Set(["dummy-kafka-1"])
  );

  const handleAddConnection = () => {
    if (onAddConnection) {
      onAddConnection();
    } else {
      // Open config tab for new connection
      openTab("connection_config", {});
    }
  };

  const handleDisconnect = (connection: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDisconnect) {
      onDisconnect(connection);
    } else {
      // Default behavior: toggle connection status
      setConnections(
        connections.map((conn) =>
          conn.id === connection.id ? { ...conn, connected: false } : conn
        )
      );
    }
  };

  const handleModifyConnection = (
    connection: Connection,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (onModifyConnection) {
      onModifyConnection(connection);
    } else {
      // Open config tab for editing connection
      openTab("connection_config", {
        id: connection.id,
        connectionId: connection.id,
        connectionName: connection.name,
        connection,
      });
    }
  };

  const toggleConnection = (connectionId: string) => {
    setExpandedConnections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId);
      } else {
        newSet.add(connectionId);
      }
      return newSet;
    });
  };

  const getConnectionIcon = (type: Connection["type"]) => {
    switch (type) {
      case "kafka":
        return <Layers className="size-4 text-green-600" />;
      case "rabbitmq":
        return <MessageSquare className="size-4 text-purple-600" />;
      default:
        return <Layers className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col border-r bg-sidebar text-sidebar-foreground select-none",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Negeseuon</h1>
      </div>

      {/* Add Connection Button */}
      <div className="p-4">
        <Button
          onClick={handleAddConnection}
          className="w-full"
          variant="default"
        >
          <Plus className="size-4" />
          Add Connection
        </Button>
      </div>

      <Separator />

      {/* Connections List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Connections
        </div>
        {connections.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No connections configured
            <br />
            <span className="text-xs">
              Click "Add Connection" to get started
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            {connections.map((connection) => {
              const isExpanded = expandedConnections.has(connection.id);
              const hasTopics =
                connection.topics && connection.topics.length > 0;

              return (
                <Collapsible
                  key={connection.id}
                  open={isExpanded}
                  onOpenChange={() => toggleConnection(connection.id)}
                >
                  <div
                    className={cn(
                      "group rounded-md border transition-all duration-200 relative",
                      isExpanded
                        ? "border-sidebar-border bg-sidebar-accent shadow-sm"
                        : "border-transparent hover:border-border hover:bg-accent/50"
                    )}
                  >
                    {isExpanded && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary rounded-l-md" />
                    )}
                    <CollapsibleTrigger asChild>
                      <div
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2",
                          isExpanded && "bg-sidebar-accent/50"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getConnectionIcon(connection.type)}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate">
                              {connection.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono truncate">
                              {connection.host}:{connection.port}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasTopics &&
                            (isExpanded ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            ))}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => handleDisconnect(connection, e)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              title={
                                connection.connected ? "Disconnect" : "Connect"
                              }
                            >
                              <Power className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) =>
                                handleModifyConnection(connection, e)
                              }
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              title="Modify Connection"
                            >
                              <Settings className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    {hasTopics && (
                      <CollapsibleContent>
                        <div className="relative pl-9 pr-3 pb-2 space-y-1">
                          {/* Connection line */}
                          <div className="absolute left-6 top-0 bottom-2 w-px bg-sidebar-border" />
                          {connection.topics!.map((topic) => (
                            <div
                              key={topic.id}
                              className="relative flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/70 cursor-pointer text-sm transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTab("kafka", { connection, topic });
                              }}
                            >
                              {/* Horizontal connector line */}
                              <div className="absolute left-0 top-1/2 w-3 h-px bg-sidebar-border -translate-x-full" />
                              <div className="flex items-center gap-2">
                                <div className="relative shrink-0 w-2.5 h-3">
                                  <div className="absolute top-0 left-0 h-1.5 w-1.5 border border-muted-foreground/60 rounded-[2px]" />
                                  <div className="absolute top-0.5 left-0.5 h-1.5 w-1.5 border border-muted-foreground/60 rounded-[2px]" />
                                  <div className="absolute top-1 left-1 h-1.5 w-1.5 border border-muted-foreground/60 rounded-[2px]" />
                                </div>
                                <span className="text-muted-foreground">
                                  {topic.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    )}
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
