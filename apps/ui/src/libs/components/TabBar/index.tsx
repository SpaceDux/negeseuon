import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/libs/shadcn/components/ui/button";
import { cn } from "@/libs/shadcn/lib/utils";
import { useTabs, type Tab } from "@/libs/hooks/useTabs";

interface TabBarProps {
  className?: string;
}

export function TabBar({ className }: TabBarProps) {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    closeOtherTabs,
    reorderTabs,
  } = useTabs();
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (tabs.length === 0) {
    return null;
  }

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
  };

  const handleCloseTab = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    closeTab(tab.id);
  };

  const handleCloseOtherTabs = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    closeOtherTabs(tab.id);
  };

  const handleDragStart = (e: React.DragEvent, tab: Tab, index: number) => {
    setDraggedTabId(tab.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    // Add a slight delay to allow the drag to start
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = "0.5";
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
    setDraggedTabId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (
      dragIndex !== dropIndex &&
      dragIndex !== undefined &&
      !isNaN(dragIndex)
    ) {
      reorderTabs(dragIndex, dropIndex);
    }

    setDraggedTabId(null);
    setDragOverIndex(null);
  };

  return (
    <div
      className={cn(
        "flex h-11 items-end gap-0 border-b border-border bg-muted/40 overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        const isDragging = draggedTabId === tab.id;
        const isDragOver = dragOverIndex === index && draggedTabId !== tab.id;

        return (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleTabClick(tab)}
            className={cn(
              "group relative flex h-full min-w-[140px] max-w-[240px] items-center gap-2 px-4 py-2 text-sm transition-colors border-r border-border/50",
              isActive
                ? "bg-background text-foreground border-b-2 border-b-primary"
                : "bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              isDragging && "opacity-50 cursor-grabbing",
              !isDragging && "cursor-move",
              isDragOver && "border-l-2 border-l-primary"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium leading-tight">
                {tab.type === "kafka"
                  ? tab.context.topicName
                  : tab.context.connectionName || "New Connection"}
              </div>
              <div className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
                {tab.type === "kafka"
                  ? tab.context.connectionName
                  : tab.context.connectionId
                    ? "Edit Connection"
                    : "Add Connection"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => handleCloseTab(e, tab)}
              onDragStart={(e) => e.stopPropagation()}
              draggable={false}
              className={cn(
                "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rounded-sm hover:bg-muted-foreground/20 cursor-pointer",
                isActive && "opacity-100"
              )}
              onContextMenu={(e) => {
                e.preventDefault();
                handleCloseOtherTabs(e, tab);
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
