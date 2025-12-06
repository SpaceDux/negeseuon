import { Badge } from "@renderer/libs/shadcn/components/ui/badge";
import { Label } from "@renderer/libs/shadcn/components/ui/label";
import { Separator } from "@renderer/libs/shadcn/components/ui/separator";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { KafkaMessage } from "@renderer/libs/types/KafkaMessage";

type Props = {
  message: KafkaMessage | null;
  isOpen: boolean;
};

export default function SelectedMessage(props: Props) {
  const { message, isOpen } = props;

  return (
    <div
      className={cn(
        "w-70 border-l border-border flex flex-col",
        isOpen ? "block" : "hidden"
      )}
    >
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Message Properties</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Offset</Label>
          <div className="text-sm font-mono mt-1">{message?.offset}</div>
        </div>
        <Separator />
        <div>
          <Label className="text-xs text-muted-foreground">Partition</Label>
          <div className="text-sm font-mono mt-1">{message?.partition}</div>
        </div>
        <Separator />
        <div>
          <Label className="text-xs text-muted-foreground">Key</Label>
          <div className="text-sm font-mono mt-1">
            {message?.key.toString()}
          </div>
        </div>
        <Separator />
        <div>
          <Label className="text-xs text-muted-foreground">Timestamp</Label>
          <div className="text-sm mt-1">{message?.timestamp}</div>
        </div>
        <Separator />
        <div>
          <Label className="text-xs text-muted-foreground">Size</Label>
          <div className="text-sm mt-1">{message?.size} bytes</div>
        </div>
        <Separator />
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Headers
          </Label>
          <div className="flex flex-wrap gap-2">
            {message?.headers &&
              Object.entries(message.headers).map(([key, value]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="text-xs font-mono bg-muted"
                >
                  {key}: {value as string}
                </Badge>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
