import { TabsContent } from "@renderer/libs/shadcn/components/ui/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import { ConnectorConfiguration } from "@negeseuon/schemas";

type Props = {
  topic: string;
  connection: ConnectorConfiguration;
};

export default function Settings(_props: Props) {
  return (
    <TabsContent
      value="settings"
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center text-muted-foreground">
        <SettingsIcon className="size-12 mx-auto mb-4 opacity-50" />
        <p>Settings view coming soon</p>
      </div>
    </TabsContent>
  );
}
