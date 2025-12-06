import { useState } from "react";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Badge } from "@renderer/libs/shadcn/components/ui/badge";
import { Input } from "@renderer/libs/shadcn/components/ui/input";
import { Label } from "@renderer/libs/shadcn/components/ui/label";
import { Checkbox } from "@renderer/libs/shadcn/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/libs/shadcn/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@renderer/libs/shadcn/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@renderer/libs/shadcn/components/ui/collapsible";
import { Separator } from "@renderer/libs/shadcn/components/ui/separator";
import {
  RefreshCw,
  Send,
  List,
  BarChart3,
  Settings,
  Play,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Code,
} from "lucide-react";
import type { ConnectorConfiguration } from "@negeseuon/schemas";
import { useConnectionManager } from "@renderer/features/connections/context";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import TopicTopBar from "@renderer/features/kafka/components/TopicTopBar";
import TopicTabs from "@renderer/features/kafka/components/TopicTabs";

interface KafkaTopicViewContext {
  connection: ConnectorConfiguration;
  topic: string;
}

interface KafkaTopicViewProps {
  context: KafkaTopicViewContext;
}

interface KafkaMessage {
  offset: number;
  partition: number;
  key: string;
  timestamp: string;
  payload: string;
  size: number;
  headers: Record<string, string>;
}

export function KafkaTopicView({ context }: KafkaTopicViewProps) {
  const { connection, topic } = context;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Bar */}
      <TopicTopBar topic={topic} connection={connection} />

      <TopicTabs topic={topic} connection={connection} />
    </div>
  );
}
