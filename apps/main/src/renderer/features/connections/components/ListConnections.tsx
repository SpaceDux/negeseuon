import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@renderer/libs/shadcn/components/ui/collapsible";
import { useConnectionManager } from "../context";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { ChevronDown, ChevronRight, Layers, Settings } from "lucide-react";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { Skeleton } from "@renderer/libs/shadcn/components/ui/skeleton";
import { useTabs } from "@renderer/libs/hooks/useTabs";
import { ConnectorConfiguration } from "@negeseuon/schemas";
import { ConnectButton } from "@renderer/features/connector/components/ConnectButton";
import { useMemo, createRef, useState } from "react";
import { ListTopics } from "@renderer/features/kafka/components/ListTopics";

export function ListConnections() {
  const { getAllConnections, isLoading } = useConnectionManager();
  const { openTab } = useTabs();
  const [expandedConnections, setExpandedConnections] = useState<Set<number>>(
    new Set()
  );

  const data = getAllConnections();

  const buttonRefs = useMemo(() => {
    if (!data)
      return new Map<number, React.RefObject<HTMLButtonElement | null>>();
    const refs = new Map<number, React.RefObject<HTMLButtonElement | null>>();
    data.forEach((connection) => {
      if (connection.id) {
        refs.set(connection.id, createRef<HTMLButtonElement>());
      }
    });
    return refs;
  }, [data]);

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

  if (!data || data.length === 0) {
    return <div>No connections found</div>;
  }

  const toggleConnection = (connection: ConnectorConfiguration) => {
    if (!connection.id) {
      return;
    }
    if (!connection.connected) {
      return;
    }

    setExpandedConnections((prev) => {
      const next = new Set(prev);
      if (next.has(connection.id!)) {
        next.delete(connection.id!);
      } else {
        next.add(connection.id!);
      }
      return next;
    });
  };

  const handleDoubleClick = (connection: ConnectorConfiguration) => {
    if (!connection.id || connection.connected) {
      return;
    }

    const ref = buttonRefs.get(connection.id);
    ref?.current?.click();
  };

  const getConnectionIcon = (
    type: "kafka" | "rabbitmq",
    isConnected: boolean
  ) => {
    switch (type) {
      case "kafka":
        return isConnected ? (
          <Layers className="size-4 text-green-600" />
        ) : (
          <Layers className="size-4 text-muted-foreground" />
        );
      case "rabbitmq":
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
        const isConnected = connection.connected ?? false;
        const isExpanded = expandedConnections.has(connection.id!);

        return (
          <Collapsible
            key={connection.id}
            open={isExpanded}
            onOpenChange={(open) => {
              if (open !== isExpanded) {
                toggleConnection(connection);
              }
            }}
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
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleDoubleClick(connection);
                  }}
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
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ConnectButton
                        connection={connection}
                        buttonRef={
                          connection.id
                            ? buttonRefs.get(connection.id)
                            : undefined
                        }
                      />
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
              {isExpanded && <ListTopics connection={connection} />}
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
