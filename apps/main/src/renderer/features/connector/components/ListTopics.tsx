import { ConnectorConfiguration } from "@negeseuon/schemas";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { useTabs } from "@renderer/libs/hooks/useTabs";
import { useQuery } from "@tanstack/react-query";
import { useConnector } from "../hooks/useConnector";
import { Skeleton } from "@renderer/libs/shadcn/components/ui/skeleton";

type Props = {
  connection: ConnectorConfiguration;
};

export const ListTopics = ({ connection }: Props) => {
  const { openTab } = useTabs();
  const { listTopics } = useConnector();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["list-topics", connection.id],
    queryFn: () => listTopics(connection.id!),
    enabled: connection.connected && !!connection.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  if (!connection.connected) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        Connect to view topics
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-1 px-3 py-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-3 py-2 text-sm text-destructive">
        <div>Error loading topics: {error?.message || "Unknown error"}</div>
        {error instanceof Error && error.stack && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">Stack trace</summary>
            <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        No topics found
      </div>
    );
  }

  return (
    <CollapsibleContent>
      <div className="relative pl-9 pr-3 pb-2 space-y-1">
        {/* Connection line */}
        <div className="absolute left-6 top-0 bottom-2 w-px bg-sidebar-border" />
        {data.map((topic) => (
          <div
            key={topic}
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
              <span className="text-muted-foreground">{topic}</span>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleContent>
  );
};
