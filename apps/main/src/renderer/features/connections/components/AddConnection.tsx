import { useTabs } from "@renderer/libs/hooks/useTabs";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Plus } from "lucide-react";

export function AddConnection() {
  const { openTab } = useTabs();

  const handleAddConnection = () => {
    openTab("connection_config", {});
  };

  return (
    <div>
      <Button
        onClick={handleAddConnection}
        className="w-full"
        variant="default"
      >
        <Plus className="size-4" />
        Add Connection
      </Button>
    </div>
  );
}
