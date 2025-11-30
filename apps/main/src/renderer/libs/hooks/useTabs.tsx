import { ConnectorConfiguration } from "@negeseuon/schemas";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface KafkaTabContext {
  id: string;
  connection: ConnectorConfiguration;
  topic: any; // TODO: Fix this
}

export interface ConnectionConfigTabContext {
  id?: string; // undefined for new connections
  connectionName?: string;
  connection?: ConnectorConfiguration; // full connection object if editing
}

export type TabType = "kafka" | "connection_config";

export type Tab =
  | {
      type: "kafka";
      id: string;
      context: KafkaTabContext;
    }
  | {
      type: "connection_config";
      id: string;
      context: ConnectionConfigTabContext;
    };

interface TabContextValue {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: {
    (
      type: "kafka",
      context: { connection: ConnectorConfiguration; topic: any }
    ): void;
    (type: "connection_config", context: ConnectionConfigTabContext): void;
  };
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

const TabContext = createContext<TabContextValue | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = useCallback(
    (
      type: TabType,
      context:
        | { connection: ConnectorConfiguration; topic: any }
        | ConnectionConfigTabContext
    ) => {
      if (type === "kafka") {
        const kafkaContext = context as {
          connection: ConnectorConfiguration;
          topic: any;
        };
        const { connection, topic } = kafkaContext;
        const tabId = `kafka-${connection.id}-${topic.id}`;

        setTabs((prevTabs) => {
          // Check if tab already exists
          const existingTab = prevTabs.find((tab) => tab.id === tabId);
          if (existingTab) {
            setActiveTabId(tabId);
            return prevTabs;
          }

          // Create new tab
          const newTab: Tab = {
            type: "kafka",
            id: tabId,
            context: {
              id: tabId,
              connection,
              topic,
            },
          };

          setActiveTabId(tabId);
          return [...prevTabs, newTab];
        });
      } else if (type === "connection_config") {
        const configContext = context as ConnectionConfigTabContext;
        // Generate tab ID - use connection ID if editing, or generate new one for new connections
        const tabId =
          configContext.connection && configContext.connection.id
            ? `config-${configContext.connection.id}`
            : `config-new-${Date.now()}`;

        setTabs((prevTabs) => {
          // Check if tab already exists (for editing existing connections)
          if (configContext.connection && configContext.connection.id) {
            const existingTab = prevTabs.find((tab) => tab.id === tabId);
            if (existingTab) {
              setActiveTabId(tabId);
              return prevTabs;
            }
          }

          // Create new tab
          const newTab: Tab = {
            type: "connection_config",
            id: tabId,
            context: configContext,
          };

          setActiveTabId(tabId);
          return [...prevTabs, newTab];
        });
      }
    },
    []
  ) as TabContextValue["openTab"];

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

        // If we closed the active tab, switch to another tab
        if (activeTabId === tabId) {
          if (newTabs.length > 0) {
            // Switch to the tab that was before the closed one, or the last tab
            const closedIndex = prevTabs.findIndex((tab) => tab.id === tabId);
            const newActiveIndex = Math.min(closedIndex, newTabs.length - 1);
            setActiveTabId(newTabs[newActiveIndex]?.id || null);
          } else {
            setActiveTabId(null);
          }
        }

        return newTabs;
      });
    },
    [activeTabId]
  );

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id === tabId));
    setActiveTabId(tabId);
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prevTabs) => {
      const newTabs = [...prevTabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return newTabs;
    });
  }, []);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        openTab,
        closeTab,
        setActiveTab,
        closeAllTabs,
        closeOtherTabs,
        reorderTabs,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTabs must be used within a TabProvider");
  }
  return context;
}
