import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@renderer/libs/shadcn/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@renderer/libs/shadcn/components/ui/card";
import { Button } from "@renderer/libs/shadcn/components/ui/button";
import { Input } from "@renderer/libs/shadcn/components/ui/input";
import { Textarea } from "@renderer/libs/shadcn/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/libs/shadcn/components/ui/select";
import { Spinner } from "@renderer/libs/shadcn/components/ui/spinner";
import type { ConnectorConfiguration, KafkaConfiguration } from "@negeseuon/schemas";
import { useConnections } from "../hooks/useConnections";
import { useMutation } from "@tanstack/react-query";
import { useTestConnection } from "../hooks/useTestConnection";
import { useConnectionManager } from "../context";

interface ConnectionFormProps {
  initialData?: ConnectorConfiguration;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Form values use string for bootstrapBrokers (comma-separated input)
interface FormValues {
  id?: number;
  name: string;
  description: string;
  type: "kafka" | "rabbitmq";
  connected: boolean;
  config: {
    bootstrapBrokers: string; // comma-separated in form
    timeout?: number;
    sasl?: {
      mechanism: "PLAIN" | "SCRAM-SHA-512" | "SCRAM-SHA-256" | "OAUTHBEARER";
      username?: string;
      password?: string;
      token?: string;
    };
  };
}

// Convert form values to the schema-expected format
function formValuesToConfig(values: FormValues): ConnectorConfiguration {
  const brokers = values.config.bootstrapBrokers
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  return {
    id: values.id,
    name: values.name,
    description: values.description,
    type: values.type,
    connected: values.connected,
    config: {
      bootstrapBrokers: brokers,
      timeout: values.config.timeout,
      sasl: values.config.sasl?.mechanism ? values.config.sasl : undefined,
    },
  };
}

// Convert schema format to form values
function configToFormValues(config?: ConnectorConfiguration): FormValues {
  if (!config) {
    return {
      name: "",
      description: "",
      type: "kafka",
      connected: false,
      config: {
        bootstrapBrokers: "",
        timeout: undefined,
        sasl: undefined,
      },
    };
  }

  const kafkaConfig = config.config as KafkaConfiguration;
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    type: config.type,
    connected: config.connected,
    config: {
      bootstrapBrokers: kafkaConfig.bootstrapBrokers.join(", "),
      timeout: kafkaConfig.timeout,
      sasl: kafkaConfig.sasl,
    },
  };
}

export function ConnectionForm({
  initialData,
  onSuccess,
  onCancel,
}: ConnectionFormProps) {
  const { upsertConnection } = useConnections();
  const { testConnection } = useTestConnection();
  const { refreshConnections } = useConnectionManager();

  const form = useForm<FormValues>({
    defaultValues: configToFormValues(initialData),
  });

  const saslMechanism = form.watch("config.sasl.mechanism");

  const { mutate: mutateUpsertConnection, isPending: isUpserting } = useMutation({
    mutationFn: (values: FormValues) => upsertConnection(formValuesToConfig(values)),
    onSuccess: async (value) => {
      if (value.success) {
        toast.success(value.message);
        await refreshConnections();
        onSuccess?.();
      } else {
        toast.error(value.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to upsert connection", { description: error.message });
    },
  });

  const { mutate: mutateTestConnection, isPending: isTesting } = useMutation({
    mutationFn: (values: FormValues) => {
      const config = formValuesToConfig(values);
      return testConnection(config);
    },
    onSuccess: (value) => {
      if (value.success) {
        toast.success("Connection test successful", { description: value.message });
      } else {
        toast.error("Connection test failed", { description: value.message });
      }
    },
    onError: (error) => {
      toast.error("Failed to test connection", { description: error.message });
    },
  });

  const handleTest = (values: FormValues) => {
    mutateTestConnection(values);
  };

  const onSubmit = (values: FormValues) => {
    mutateUpsertConnection(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
            <CardDescription>
              Configure the basic connection information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Connection name is required",
                minLength: {
                  value: 1,
                  message: "Connection name must be at least 1 character",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Kafka Cluster" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{
                required: "Description is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Production Kafka cluster for event streaming"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of this connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kafka Configuration</CardTitle>
            <CardDescription>
              Configure the Kafka broker connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="config.bootstrapBrokers"
              rules={{
                required: "Bootstrap brokers are required",
                validate: (value) => {
                  const brokers = value
                    .split(",")
                    .map((b) => b.trim())
                    .filter(Boolean);
                  if (brokers.length === 0) {
                    return "At least one broker is required";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bootstrap Brokers</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="localhost:9092, broker2:9092"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of Kafka broker addresses (host:port)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config.timeout"
              rules={{
                validate: (value) => {
                  if (value !== undefined && (isNaN(value as number) || value as number <= 0)) {
                    return "Timeout must be a positive number";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      value={field.value as number | undefined}
                    />
                  </FormControl>
                  <FormDescription>
                    Connection timeout in seconds (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication (SASL)</CardTitle>
            <CardDescription>
              Configure SASL authentication if required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="config.sasl.mechanism"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SASL Mechanism</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === "none") {
                        form.setValue("config.sasl", undefined);
                      } else {
                        field.onChange(value);
                      }
                    }}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SASL mechanism" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="PLAIN">PLAIN</SelectItem>
                      <SelectItem value="SCRAM-SHA-256">
                        SCRAM-SHA-256
                      </SelectItem>
                      <SelectItem value="SCRAM-SHA-512">
                        SCRAM-SHA-512
                      </SelectItem>
                      <SelectItem value="OAUTHBEARER">OAUTHBEARER</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the SASL authentication mechanism
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {saslMechanism === "OAUTHBEARER" && (
              <FormField
                control={form.control}
                name="config.sasl.token"
                rules={{
                  required:
                    saslMechanism === "OAUTHBEARER"
                      ? "OAuth token is required"
                      : false,
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OAuth Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter OAuth token"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      OAuth bearer token for authentication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {saslMechanism && saslMechanism !== "OAUTHBEARER" && (
              <>
                <FormField
                  control={form.control}
                  name="config.sasl.username"
                  rules={{
                    required: "Username is required",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        SASL username for authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="config.sasl.password"
                  rules={{
                    required: "Password is required",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        SASL password for authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isUpserting || isTesting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(handleTest)}
            disabled={isUpserting || isTesting}
          >
            {isTesting ? (
              <>
                <Spinner className="mr-2" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <Button type="submit" disabled={isUpserting || isTesting}>
            {isUpserting ? (
              <>
                <Spinner className="mr-2" />
                {initialData?.id ? "Updating..." : "Creating..."}
              </>
            ) : initialData?.id ? (
              "Update Connection"
            ) : (
              "Create Connection"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
