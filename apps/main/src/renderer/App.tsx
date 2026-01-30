import { StrictMode } from "react";
import "@renderer/globals.css";
import { Base } from "@renderer/libs/components/Base";
import { Home } from "@renderer/views/Home";
import { TabProvider, useTabs } from "@renderer/libs/hooks/useTabs";
import { useRegisterTabTypes } from "@renderer/libs/hooks/registerTabTypes";
import { Toaster } from "@renderer/libs/shadcn/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@renderer/libs/ThemeContext";
import { ConnectionManagerProvider } from "@renderer/features/connections/context";
import { TopicMetadataProvider } from "@renderer/features/kafka/context";

function AppContent() {
  const { tabs, activeTabId, getTabRenderer } = useTabs();
  useRegisterTabTypes();
  const hasTabs = tabs.length > 0;
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const renderActiveView = () => {
    if (!activeTab) {
      return <Home />;
    }

    const Renderer = getTabRenderer(activeTab);
    if (!Renderer) {
      return <Home />;
    }

    return <Renderer context={activeTab.context} />;
  };

  return <Base>{hasTabs ? renderActiveView() : <Home />}</Base>;
}

function App() {
  const queryClient = new QueryClient();
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ConnectionManagerProvider>
            <TopicMetadataProvider>
              <TabProvider>
                <AppContent />
                <Toaster />
              </TabProvider>
            </TopicMetadataProvider>
          </ConnectionManagerProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
