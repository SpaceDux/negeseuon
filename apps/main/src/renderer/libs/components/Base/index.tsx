import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { Sidebar, type SidebarProps } from "@renderer/libs/components/Sidebar";
import { TabBar } from "@renderer/libs/components/TabBar";

interface BaseProps {
  sidebarProps?: SidebarProps;
  children: ReactNode;
  defaultSidebarWidth?: number;
  minSidebarWidth?: number;
  maxSidebarWidth?: number;
  className?: string;
}

export function Base({
  sidebarProps,
  children,
  defaultSidebarWidth = 256,
  minSidebarWidth = 200,
  maxSidebarWidth = 500,
  className,
}: BaseProps) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      const clampedWidth = Math.max(
        minSidebarWidth,
        Math.min(maxSidebarWidth, newWidth)
      );
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minSidebarWidth, maxSidebarWidth]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  return (
    <div className={cn("flex h-screen w-screen overflow-hidden", className)}>
      <div
        ref={sidebarRef}
        className="relative flex-shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar {...sidebarProps} className="h-full" />
        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors z-10",
            "hover:bg-sidebar-primary/50",
            isResizing && "bg-sidebar-primary"
          )}
          style={{
            touchAction: "none",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TabBar />
        <main className="flex-1 overflow-auto min-w-0">{children}</main>
      </div>
    </div>
  );
}
