import { StrictMode } from "react";
import "@/globals.css";
import { Base } from "@/libs/components/Base";
import { type Connection } from "@/libs/components/Sidebar";
import { Home } from "@/views/Home";
import { TopicView } from "@/views/tabs/TopicView";
import { ConnectionConfigView } from "@/views/tabs/ConnectionConfigView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TabProvider, useTabs } from "@/libs/hooks/useTabs";

function AppContent() {
  const { tabs, activeTabId, openTab } = useTabs();
  const hasTabs = tabs.length > 0;
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleConnectionSelect = (connection: Connection) => {
    console.log("Selected connection:", connection);
    // TODO: Implement connection selection logic
  };

  const handleAddConnection = () => {
    openTab("connection_config", {});
  };

  const handleDisconnect = (connection: Connection) => {
    console.log("Disconnect connection:", connection);
    // TODO: Implement disconnect logic
  };

  const handleModifyConnection = (connection: Connection) => {
    console.log("Modify connection:", connection);
    // TODO: Implement modify connection dialog/modal
  };

  const renderActiveView = () => {
    if (!activeTab) {
      return <Home />;
    }

    switch (activeTab.type) {
      case "kafka":
        return <TopicView />;
      case "connection_config":
        return <ConnectionConfigView />;
      default:
        return <Home />;
    }
  };

  return (
    <Base
      sidebarProps={{
        onConnectionSelect: handleConnectionSelect,
        onAddConnection: handleAddConnection,
        onDisconnect: handleDisconnect,
        onModifyConnection: handleModifyConnection,
      }}
    >
      {hasTabs ? renderActiveView() : <Home />}
    </Base>
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TabProvider>
          <AppContent />
        </TabProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
