import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Power } from "lucide-react";
import { useConnector } from "../hooks/useConnector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@renderer/libs/shadcn/lib/utils";
import { ConnectorConfiguration } from "@negeseuon/schemas";
import { Spinner } from "@renderer/libs/shadcn/components/ui/spinner";

type Props = {
  connection: ConnectorConfiguration;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
};

export function ConnectButton({ connection, buttonRef }: Props) {
  const { connect, disconnect } = useConnector();
  const queryClient = useQueryClient();

  const { mutate: mutateConnect, isPending: isConnecting } = useMutation({
    mutationFn: () => connect(connection.id!),
    onSuccess: (value) => {
      if (value.success) {
        queryClient.invalidateQueries({
          queryKey: ["list-connections"],
        });
        queryClient.invalidateQueries({
          queryKey: ["list-topics", connection.id],
        });
        toast.success(value.message);
      } else {
        toast.error(value.message);
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to connect to connection");
      }
    },
  });

  const { mutate: mutateDisconnect, isPending: isDisconnecting } = useMutation({
    mutationFn: () => disconnect(connection.id!),
    onSuccess: () => {
      toast.success("Disconnected from connection");
      queryClient.invalidateQueries({ queryKey: ["list-connections"] });
      queryClient.invalidateQueries({
        queryKey: ["list-topics", connection.id],
      });
    },
    onError: () => {
      toast.error("Failed to disconnect from connection");
    },
  });

  const handleToggleConnection = () => {
    if (isConnecting || isDisconnecting) {
      return;
    }

    if (connection.connected) {
      mutateDisconnect();
    } else {
      mutateConnect();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={(e) => {
        e.stopPropagation();
        handleToggleConnection();
      }}
      className="h-6 w-6 text-muted-foreground hover:text-destructive"
      title={connection.connected ? "Disconnect" : "Connect"}
      ref={buttonRef}
    >
      {isConnecting || isDisconnecting ? (
        <Spinner />
      ) : (
        <Power
          className={cn(
            "size-3",
            connection.connected ? "text-green-600" : "text-red-600"
          )}
        />
      )}
    </Button>
  );
}
