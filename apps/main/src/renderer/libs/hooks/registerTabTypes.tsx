import { useTabs } from "./useTabs";
import { KafkaTopicView } from "@renderer/views/tabs/KafkaTopicView";
import { ConnectionConfigView } from "@renderer/views/tabs/ConnectionConfigView";
import type { ConnectorConfiguration } from "@negeseuon/schemas";
import { useEffect } from "react";

interface KafkaTabContext {
  connection: ConnectorConfiguration;
  topic: string;
}

interface ConnectionConfigTabContext {
  connection?: ConnectorConfiguration;
}

export function useRegisterTabTypes() {
  const { registerTabType } = useTabs();

  useEffect(() => {
    // Register Kafka tab type
    registerTabType<KafkaTabContext>("kafka", {
      generateId: (context) => {
        const topicName = typeof context.topic === "string" 
          ? context.topic 
          : (context.topic as any)?.name || "";
        return `kafka-${context.connection.id}-${topicName}`;
      },
      getMetadata: (context) => {
        const topicName = typeof context.topic === "string" 
          ? context.topic 
          : (context.topic as any)?.name || "";
        const connectionName = context.connection.name || "Unknown Connection";
        return {
          title: topicName,
          subtitle: connectionName,
        };
      },
      component: KafkaTopicView,
    });

    // Register Connection Config tab type
    registerTabType<ConnectionConfigTabContext>("connection_config", {
      generateId: (context) => {
        if (context.connection?.id) {
          return `config-${context.connection.id}`;
        }
        return `config-new-${Date.now()}`;
      },
      getMetadata: (context) => {
        if (context.connection?.id) {
          return {
            title: context.connection.name || "Edit Connection",
            subtitle: "Connection Configuration",
          };
        }
        return {
          title: "New Connection",
          subtitle: "Connection Configuration",
        };
      },
      component: ConnectionConfigView,
    });
  }, [registerTabType]);
}

