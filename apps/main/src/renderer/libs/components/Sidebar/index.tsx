import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Separator } from "@renderer/libs/shadcn/components/ui/separator";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { useTheme } from "@renderer/libs/ThemeContext";
import { ListConnections } from "@renderer/features/connections/components/ListConnections";
import { AddConnection } from "@renderer/features/connections/components/AddConnection";

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col border-r bg-sidebar text-sidebar-foreground select-none",
        className
      )}
    >
      {/* Scrollable content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Logo Section */}
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <h1 className="text-xl font-bold">Negeseuon</h1>
        </div>

        {/* Add Connection Button */}
        <div className="shrink-0 p-4">
          <AddConnection />
        </div>

        <Separator className="shrink-0" />

        <ListConnections />
      </div>

      {/* Dark mode toggle at bottom */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <>
              <SunIcon className="h-4 w-4" />
              Light mode
            </>
          ) : (
            <>
              <MoonIcon className="h-4 w-4" />
              Dark mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
