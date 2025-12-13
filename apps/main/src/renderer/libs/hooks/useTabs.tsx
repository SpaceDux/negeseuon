import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type ComponentType,
} from "react";

export interface TabMetadata {
  title: string;
  subtitle?: string;
}

export interface Tab<T = unknown> {
  id: string;
  type: string;
  context: T;
  metadata: TabMetadata;
}

export interface TabTypeDefinition<T = unknown> {
  generateId: (context: T) => string;
  getMetadata: (context: T) => TabMetadata;
  component: ComponentType<{ context: T }>;
}

type TabRegistry = Map<string, TabTypeDefinition<unknown>>;

interface TabContextValue {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: <T>(type: string, context: T) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  registerTabType: <T>(type: string, definition: TabTypeDefinition<T>) => void;
  getTabRenderer: (tab: Tab) => ComponentType<{ context: unknown }> | null;
  getTabState: <T>(tabId: string, key: string) => T | undefined;
  setTabState: <T>(tabId: string, key: string, value: T) => void;
}

const TabContext = createContext<TabContextValue | undefined>(undefined);

// Global registry for tab types
const tabRegistry: TabRegistry = new Map();

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tabState, setTabStateMap] = useState<
    Map<string, Map<string, unknown>>
  >(new Map());

  const registerTabType = useCallback(
    <T,>(type: string, definition: TabTypeDefinition<T>) => {
      tabRegistry.set(type, definition as TabTypeDefinition<unknown>);
    },
    []
  );

  const openTab = useCallback(<T,>(type: string, context: T) => {
    const definition = tabRegistry.get(type);
    if (!definition) {
      console.warn(`Tab type "${type}" is not registered`);
      return;
    }

    const tabId = definition.generateId(context);
    const metadata = definition.getMetadata(context);

    setTabs((prevTabs) => {
      // Check if tab already exists
      const existingTab = prevTabs.find((tab) => tab.id === tabId);
      if (existingTab) {
        setActiveTabId(tabId);
        return prevTabs;
      }

      // Create new tab
      const newTab: Tab<T> = {
        id: tabId,
        type,
        context,
        metadata,
      };

      setActiveTabId(tabId);
      return [...prevTabs, newTab];
    });
  }, []);

  const getTabRenderer = useCallback((tab: Tab) => {
    const definition = tabRegistry.get(tab.type);
    return definition?.component || null;
  }, []);

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

      // Clean up tab state when tab is closed
      setTabStateMap((prevState) => {
        const newState = new Map(prevState);
        newState.delete(tabId);
        return newState;
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

  const getTabState = useCallback(
    <T,>(tabId: string, key: string): T | undefined => {
      const tabStateMap = tabState.get(tabId);
      if (!tabStateMap) {
        return undefined;
      }
      return tabStateMap.get(key) as T | undefined;
    },
    [tabState]
  );

  const setTabState = useCallback(
    <T,>(tabId: string, key: string, value: T) => {
      setTabStateMap((prevState) => {
        const newState = new Map(prevState);
        const tabStateMap = newState.get(tabId) || new Map();
        tabStateMap.set(key, value);
        newState.set(tabId, tabStateMap);
        return newState;
      });
    },
    []
  );

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
        registerTabType,
        getTabRenderer,
        getTabState,
        setTabState,
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
