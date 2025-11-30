import { useState } from "react";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Separator } from "@renderer/libs/shadcn/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@renderer/libs/shadcn/components/ui/collapsible";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Layers,
  MessageSquare,
  Power,
  Settings,
} from "lucide-react";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { useTabs } from "@renderer/libs/hooks/useTabs";
import { ListConnections } from "@renderer/features/connections/components/ListConnections";
import { AddConnection } from "@renderer/features/connections/components/AddConnection";

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { openTab } = useTabs();

  const handleAddConnection = () => {
    openTab("connection_config", {});
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
        <AddConnection />
      </div>

      <Separator />

      <ListConnections />
    </div>
  );
}
