import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@renderer/libs/shadcn/components/ui/collapsible";
import { useConnections } from "../hooks/useConnections";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Power,
  Settings,
} from "lucide-react";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { Skeleton } from "@renderer/libs/shadcn/components/ui/skeleton";
import { useTabs } from "@renderer/libs/hooks/useTabs";
import { ConnectorConfiguration } from "@negeseuon/schemas";
import { useState } from "react";

export function ListConnections() {
  const { listConnections } = useConnections();
  const { openTab } = useTabs();
  const { isLoading, data, isError, error } = useQuery({
    queryKey: ["list-connections"],
    queryFn: listConnections,
    enabled: true,
  });
  const [topics, _] = useState<any[]>([]); // TODO: Fix this

  if (isLoading) {
    // Skeleton loading
    return (
      <div className="space-y-1">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const expandedConnections = new Set<number>();

  const toggleConnection = (connectionId: number) => {
    expandedConnections.add(connectionId);
    expandedConnections.delete(connectionId);
  };

  const getConnectionIcon = (type: "kafka", isConnected: boolean) => {
    switch (type) {
      case "kafka":
        return isConnected ? (
          <Layers className="size-4 text-green-600" />
        ) : (
          <Layers className="size-4 text-muted-foreground" />
        );
      default:
        return <Layers className="size-4 text-red-600" />;
    }
  };

  const TopicItem = ({
    connection,
    topic,
  }: {
    connection: ConnectorConfiguration;
    topic: any; // TODO: Fix this
  }) => {
    return (
      <CollapsibleContent>
        <div className="relative pl-9 pr-3 pb-2 space-y-1">
          {/* Connection line */}
          <div className="absolute left-6 top-0 bottom-2 w-px bg-sidebar-border" />
          <div
            key={topic.id}
            className="relative flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/70 cursor-pointer text-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              openTab("kafka", {
                connection,
                topic,
              });
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
              <span className="text-muted-foreground">{topic.name}</span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    );
  };

  return (
    <div className="space-y-1 pr-2 pl-2 pt-2">
      {data.map((connection) => {
        const isConnected = connection.connected;
        const isExpanded = expandedConnections.has(connection.id!);
        const hasTopics = false;

        return (
          <Collapsible
            key={connection.id}
            open={isExpanded}
            onOpenChange={() => toggleConnection(connection.id!)}
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
                    {getConnectionIcon(connection.type, isConnected)}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {connection.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        {connection.config.bootstrapBrokers.join(", ")}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isConnected) {
                            // TODO: Implement disconnect
                          } else {
                            // TODO: Implement connect
                          }
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        title={isConnected ? "Disconnect" : "Connect"}
                      >
                        <Power className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTab("connection_config", {
                            connection,
                          });
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        title="Modify Connection"
                      >
                        <Settings className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              {isExpanded &&
                topics.length > 0 &&
                topics.map((topic) => (
                  <TopicItem
                    key={topic.id}
                    connection={connection}
                    topic={topic}
                  />
                ))}
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
