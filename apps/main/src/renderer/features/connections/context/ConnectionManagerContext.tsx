import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnections } from "../hooks/useConnections";
import type { ConnectorConfiguration } from "@negeseuon/schemas";

interface ConnectionManagerContextValue {
  /**
   * Check if a connection is connected by its ID
   * @param id The connection ID
   * @returns true if connected, false otherwise
   */
  isConnected: (id: number | undefined) => boolean;
  /**
   * Get a connection by its ID
   * @param id The connection ID
   * @returns The connection configuration or undefined
   */
  getConnection: (id: number | undefined) => ConnectorConfiguration | undefined;
  /**
   * Get all connections
   * @returns Array of all connections
   */
  getAllConnections: () => ConnectorConfiguration[];
  /**
   * Refresh the connections list
   */
  refreshConnections: () => Promise<void>;
  /**
   * Whether connections are currently being fetched
   */
  isLoading: boolean;
}

const ConnectionManagerContext = createContext<
  ConnectionManagerContextValue | undefined
>(undefined);

interface ConnectionManagerProviderProps {
  children: ReactNode;
}

export function ConnectionManagerProvider({
  children,
}: ConnectionManagerProviderProps) {
  const { listConnections } = useConnections();
  const queryClient = useQueryClient();

  const {
    data: connections = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["list-connections"],
    queryFn: listConnections,
  });

  const connectionMap = useMemo(() => {
    const map = new Map<number, ConnectorConfiguration>();
    connections.forEach((conn) => {
      if (conn.id !== undefined) {
        map.set(conn.id, conn);
      }
    });
    return map;
  }, [connections]);

  const isConnected = (id: number | undefined): boolean => {
    if (id === undefined) {
      return false;
    }
    const connection = connectionMap.get(id);
    return connection?.connected ?? false;
  };

  const getConnection = (
    id: number | undefined
  ): ConnectorConfiguration | undefined => {
    if (id === undefined) {
      return undefined;
    }
    return connectionMap.get(id);
  };

  const getAllConnections = (): ConnectorConfiguration[] => {
    return connections;
  };

  const refreshConnections = async (): Promise<void> => {
    await refetch();
    // Also invalidate to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ["list-connections"] });
  };

  const value: ConnectionManagerContextValue = useMemo(
    () => ({
      isConnected,
      getConnection,
      getAllConnections,
      refreshConnections,
      isLoading,
    }),
    [connectionMap, connections, isLoading, refetch, queryClient]
  );

  return (
    <ConnectionManagerContext.Provider value={value}>
      {children}
    </ConnectionManagerContext.Provider>
  );
}

/**
 * Hook to access the connection manager context
 * @throws Error if used outside of ConnectionManagerProvider
 */
export function useConnectionManager(): ConnectionManagerContextValue {
  const context = useContext(ConnectionManagerContext);
  if (context === undefined) {
    throw new Error(
      "useConnectionManager must be used within a ConnectionManagerProvider"
    );
  }
  return context;
}
