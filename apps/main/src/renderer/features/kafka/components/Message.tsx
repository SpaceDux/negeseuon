import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@renderer/libs/shadcn/components/ui/collapsible";
import { KafkaMessage } from "@renderer/libs/types/KafkaMessage";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { useState } from "react";

type Props = {
  onClick: () => void;
  message: KafkaMessage;
};

export default function Message(props: Props) {
  const { message, onClick } = props;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const formatPayload = (payload: string) => {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  };

  return (
    <div
      className={cn(
        "border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
        isExpanded && "bg-muted"
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full" onClick={onClick}>
          <div className="flex items-start justify-between px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  offset:{" "}
                  <span className="text-foreground">{message.offset}</span>
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  partition:{" "}
                  <span className="text-foreground">{message.partition}</span>
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  key: <span className="text-foreground">{message.key}</span>
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {!isExpanded && (
                  <span className="font-mono">
                    {formatPayload(message.payload).substring(0, 80)}
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
}
