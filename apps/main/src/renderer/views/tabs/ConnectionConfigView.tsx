import { useTabs } from "@renderer/libs/hooks/useTabs";
import { ConnectionForm } from "@renderer/features/connections/components/ConnectionForm";
import type { ConnectorConfiguration } from "@negeseuon/schemas";

interface ConnectionConfigViewContext {
  connection?: ConnectorConfiguration;
}

interface ConnectionConfigViewProps {
  context: ConnectionConfigViewContext;
}

export function ConnectionConfigView({ context }: ConnectionConfigViewProps) {
  const { closeTab, activeTabId } = useTabs();
  const initialData = context.connection;

  const handleSuccess = () => {
    // Close the tab after successful creation/update
    if (!activeTabId) {
      return;
    }
    
    closeTab(activeTabId);
  };

  const handleCancel = () => {
    if (!activeTabId) {
      return;
    }
    
    closeTab(activeTabId);
  };

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {initialData?.id ? "Edit Connection" : "Add Connection"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {initialData?.id
            ? `Configure connection: ${initialData.name || "Unknown"}`
            : "Create a new connection to Kafka or other messaging platforms"}
        </p>
      </div>

      <div className="max-w-2xl">
        <ConnectionForm
          initialData={initialData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
