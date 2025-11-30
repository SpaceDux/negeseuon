import { useTabs } from "@/libs/hooks/useTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/libs/shadcn/components/ui/card";
import { Button } from "@/libs/shadcn/components/ui/button";
import { Input } from "@/libs/shadcn/components/ui/input";
import { Label } from "@/libs/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/libs/shadcn/components/ui/select";

export function ConnectionConfigView() {
  const { tabs, activeTabId } = useTabs();
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab || activeTab.type !== "connection_config") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No configuration selected</p>
        </div>
      </div>
    );
  }

  const { context } = activeTab;
  const isEditing = !!context.connectionId;
  const connection = context.connection;

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Connection" : "Add Connection"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing
            ? `Configure connection: ${context.connectionName || "Unknown"}`
            : "Create a new connection to Kafka or other messaging platforms"}
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
            <CardDescription>
              Configure the connection settings for your messaging platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connection-name">Connection Name</Label>
              <Input
                id="connection-name"
                placeholder="My Kafka Cluster"
                defaultValue={connection?.name || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection-type">Connection Type</Label>
              <Select defaultValue={connection?.type || "kafka"}>
                <SelectTrigger id="connection-type">
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kafka">Kafka</SelectItem>
                  <SelectItem value="rabbitmq">RabbitMQ</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="localhost"
                  defaultValue={connection?.host || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="9092"
                  defaultValue={connection?.port || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Configure authentication settings (if required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-mechanism">SASL Mechanism</Label>
              <Select defaultValue="PLAIN">
                <SelectTrigger id="auth-mechanism">
                  <SelectValue placeholder="Select mechanism" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLAIN">PLAIN</SelectItem>
                  <SelectItem value="SCRAM-SHA-256">SCRAM-SHA-256</SelectItem>
                  <SelectItem value="SCRAM-SHA-512">SCRAM-SHA-512</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button>
            {isEditing ? "Update Connection" : "Create Connection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
