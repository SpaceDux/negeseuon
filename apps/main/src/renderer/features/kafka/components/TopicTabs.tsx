import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@renderer/libs/shadcn/components/ui/tabs";
import { List, Settings } from "lucide-react";
import MessagesTab from "./tabs/Messages";
import { useEffect, useState } from "react";
import SettingsTab from "./tabs/Settings";
import { ConnectorConfiguration } from "@negeseuon/schemas";
import { useTabs } from "@renderer/libs/hooks/useTabs";

type Props = {
  topic: string;
  connection: ConnectorConfiguration;
};

export default function TopicTabs({ topic, connection }: Props) {
  const { activeTabId, setTabState, getTabState } = useTabs();
  const [activeTab, setActiveTab] = useState<string>("messages");

  useEffect(() => {
    if (activeTabId) {
      setTabState(activeTabId, "activeTab", activeTab);
    }

    return () => {
      if (
        activeTabId &&
        getTabState(activeTabId, "activeTab") &&
        activeTab !== getTabState(activeTabId, "activeTab")
      ) {
        setActiveTab(getTabState(activeTabId, "activeTab") as string);
      }
    };
  }, [activeTabId, activeTab, setTabState]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex-1 flex flex-col"
    >
      <div className="px-6 pt-4">
        <TabsList>
          <TabsTrigger value="messages">
            <List className="size-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="size-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <MessagesTab topic={topic} connection={connection} />
      <SettingsTab topic={topic} connection={connection} />
    </Tabs>
  );
}
